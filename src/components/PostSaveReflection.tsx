import { motion, AnimatePresence } from 'framer-motion';
import { EmotionDef } from '../types/mood';
import { X, ArrowRight, Home } from 'lucide-react';
import { emotions as allEmotions } from '../data/emotions';
import { useEmotionInsights } from '../hooks/useEmotionInsights';
import { useNavigate } from 'react-router-dom';

interface PostSaveReflectionProps {
    emotionIds: string[];
    onClose: () => void;
    onContinue: () => void;
}

function ReflectionCard({ emotion }: { emotion: EmotionDef }) {
    const { data: insights, loading } = useEmotionInsights(emotion.id);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-2xl font-semibold mb-1" style={{ color: emotion.colorHex }}>{emotion.label}</h3>
                <span className="text-xs uppercase tracking-widest text-white/40">{emotion.family} Family</span>
            </div>

            {loading ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-3 bg-white/5 rounded-2xl border border-white/5">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                    <span className="text-xs text-white/50 tracking-widest uppercase animate-pulse">Deepening Insight...</span>
                </div>
            ) : insights ? (
                <>
                    <p className="text-white/80 leading-relaxed text-sm">
                        {insights.definition}
                    </p>

                    {insights.example && (
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Examples</h4>
                            <p className="text-sm text-white/90 italic leading-snug">"{insights.example}"</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {insights.bodySignals && insights.bodySignals.length > 0 && (
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-3">Physical Signs</h4>
                                <ul className="space-y-2">
                                    {insights.bodySignals.slice(0, 4).map((signal: string, i: number) => (
                                        <li key={i} className="flex items-start text-xs text-white/70 leading-snug">
                                            <span className="mr-2 text-white/20">•</span>
                                            <span>{signal}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {insights.otherAttributes && (
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-3">Deeper Context</h4>
                                <div className="space-y-2">
                                    {insights.otherAttributes.split(' | ').slice(0, 4).map((attr: string, i: number) => {
                                        const parts = attr.split(':');
                                        const key = parts[0];
                                        const val = parts.slice(1).join(':').trim();
                                        return (
                                            <div key={i} className="text-xs leading-snug">
                                                {val ? (
                                                    <>
                                                        <strong className="text-white/60">{key}:</strong>
                                                        <span className="text-white/80 ml-1">{val}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-white/80">{attr}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {insights.copingStrategies && insights.copingStrategies.length > 0 && (
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mt-4 shadow-inner">
                            <h4 className="text-[10px] uppercase tracking-widest text-emerald-400 mb-3">Steps to Deal With It</h4>
                            <ul className="space-y-3">
                                {insights.copingStrategies.map((step: string, i: number) => (
                                    <li key={i} className="flex items-start text-sm text-white/90 leading-snug p-2 bg-white/5 rounded-xl">
                                        <span className="mr-3 flex-shrink-0 text-emerald-400/80 font-mono text-xs w-5 h-5 flex items-center justify-center rounded-full bg-emerald-400/10">{i + 1}</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            ) : null}
        </div>
    );
}

export default function PostSaveReflection({ emotionIds, onClose, onContinue }: PostSaveReflectionProps) {
    const navigate = useNavigate();

    // Get full EmotionDef objects for the saved IDs
    const savedEmotions = emotionIds
        .map(id => allEmotions.find(e => e.id === id))
        .filter((e): e is EmotionDef => e !== undefined);

    if (savedEmotions.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
                <div className="absolute inset-0" onClick={onClose} />

                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <h2 className="text-xl font-light tracking-wide text-white">Emotional Reflection</h2>
                        <button onClick={onClose} className="p-2 -mr-2 text-white/40 hover:text-white rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Scrollable */}
                    <div className="p-6 overflow-y-auto space-y-12 flex-grow scrollbar-hide">
                        {savedEmotions.map(emotion => (
                            <ReflectionCard key={emotion.id} emotion={emotion} />
                        ))}
                    </div>

                    {/* Footer / CTA */}
                    <div className="p-6 border-t border-white/5 bg-zinc-900/50 backdrop-blur-md flex flex-col gap-3">
                        <button
                            onClick={onContinue}
                            className="w-full py-4 px-6 bg-white text-black hover:bg-white/90 rounded-full font-medium tracking-wide flex items-center justify-center transition-all group"
                        >
                            Continue to Trends
                            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-4 px-6 bg-transparent text-white/50 hover:text-white hover:bg-white/5 rounded-full font-medium tracking-wide flex items-center justify-center transition-all group"
                        >
                            <Home size={18} className="mr-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                            Return to Home
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
