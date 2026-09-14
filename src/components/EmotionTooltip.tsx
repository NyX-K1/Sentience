import { motion } from 'framer-motion';
import { EmotionDef } from '../types/mood';
import { useEmotionInsights } from '../hooks/useEmotionInsights';

interface EmotionTooltipProps {
    emotion: EmotionDef | null;
}

export default function EmotionTooltip({ emotion }: EmotionTooltipProps) {
    const { data: insights, loading } = useEmotionInsights(emotion?.id);

    if (!emotion) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`
                fixed bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-sm 
                bg-zinc-900/90 backdrop-blur-xl border border-white/10 
                rounded-3xl shadow-2xl
                p-5 z-50 pointer-events-none text-left
            `}
        >
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h4 className="text-xl font-semibold tracking-wide text-white" style={{ color: emotion.colorHex }}>{emotion.label}</h4>
                    <span className="text-[10px] uppercase tracking-widest text-white/40">{emotion.family} Family</span>
                </div>
            </div>

            {loading ? (
                <div className="py-4 flex flex-col items-center justify-center space-y-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                    <span className="text-xs text-white/50 tracking-widest uppercase animate-pulse">Deepening Insight...</span>
                </div>
            ) : insights ? (
                <>
                    <p className="text-sm text-white/80 leading-relaxed mb-4">
                        {insights.definition}
                    </p>

                    <div className="space-y-3">
                        {insights.example && (
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Example context</span>
                                <span className="text-sm text-white/90 leading-snug">"{insights.example}"</span>
                            </div>
                        )}

                        {insights.bodySignals && insights.bodySignals.length > 0 && (
                            <div>
                                <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-2">Physical Signals</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {insights.bodySignals.map((signal: string, idx: number) => (
                                        <span key={idx} className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-md border border-white/5">
                                            {signal}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {insights.otherAttributes && (
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5 mt-3">
                                <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Other Attributes</span>
                                <div className="text-sm text-white/90">
                                    {insights.otherAttributes.split(' | ').map((attr: string, i: number) => (
                                        <div key={i} className="mb-1 leading-snug">{attr}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : null}
        </motion.div>
    );
}
