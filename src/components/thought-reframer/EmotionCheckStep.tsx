import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { emotions as allEmotions } from '../../data/emotions';
import { EmotionFamily } from '../../types/mood';

const FAMILIES: { family: EmotionFamily; icon: string; color: string }[] = [
    { family: 'Joy', icon: '😊', color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30' },
    { family: 'Trust', icon: '🤝', color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30' },
    { family: 'Fear', icon: '😰', color: 'from-violet-500/20 to-fuchsia-500/20 border-violet-500/30' },
    { family: 'Surprise', icon: '😲', color: 'from-sky-500/20 to-cyan-500/20 border-sky-500/30' },
    { family: 'Sadness', icon: '😢', color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30' },
    { family: 'Disgust', icon: '🤢', color: 'from-lime-500/20 to-green-500/20 border-lime-500/30' },
    { family: 'Anger', icon: '😤', color: 'from-red-500/20 to-rose-500/20 border-red-500/30' },
    { family: 'Anticipation', icon: '⏳', color: 'from-orange-500/20 to-amber-500/20 border-orange-500/30' },
    { family: 'Complex', icon: '🌀', color: 'from-zinc-500/20 to-slate-500/20 border-zinc-500/30' },
];

interface EmotionCheckStepProps {
    initialEmotions: { emotionId: string; intensity: number }[];
    onUpdate: (data: { initialEmotions: { emotionId: string; intensity: number }[] }) => void;
    onContinue: () => void;
    onBack: () => void;
}

export default function EmotionCheckStep({ initialEmotions, onUpdate, onContinue, onBack }: EmotionCheckStepProps) {
    const [expandedFamily, setExpandedFamily] = useState<EmotionFamily | null>(null);

    const toggleEmotion = (emotionId: string) => {
        const existing = initialEmotions.find(e => e.emotionId === emotionId);
        if (existing) {
            onUpdate({ initialEmotions: initialEmotions.filter(e => e.emotionId !== emotionId) });
        } else {
            onUpdate({ initialEmotions: [...initialEmotions, { emotionId, intensity: 5 }] });
        }
    };

    const updateIntensity = (emotionId: string, intensity: number) => {
        onUpdate({
            initialEmotions: initialEmotions.map(e =>
                e.emotionId === emotionId ? { ...e, intensity } : e
            )
        });
    };

    const selectedEmotionDefs = initialEmotions.map(e => ({
        ...e,
        def: allEmotions.find(em => em.id === e.emotionId)
    })).filter(e => e.def);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-pink-500/20 rounded-xl">
                            <Heart className="text-pink-400" size={22} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">How does this thought make you feel?</h2>
                    </div>
                    <p className="text-white/50 text-sm mb-6 ml-[52px]">
                        Thoughts and feelings are deeply linked. What emotions come up when you believe this thought?
                    </p>

                    {/* Family Row */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {FAMILIES.map(({ family, icon, color }) => (
                            <motion.button
                                key={family}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setExpandedFamily(expandedFamily === family ? null : family)}
                                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all bg-gradient-to-br ${color} ${expandedFamily === family ? 'ring-2 ring-white/30' : ''
                                    }`}
                            >
                                <span className="mr-1">{icon}</span>
                                <span className="text-white/80">{family}</span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Expanded Family Emotions */}
                    <AnimatePresence mode="wait">
                        {expandedFamily && (
                            <motion.div
                                key={expandedFamily}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-h-48 overflow-y-auto">
                                    <div className="flex flex-wrap gap-2">
                                        {allEmotions
                                            .filter(e => e.family === expandedFamily)
                                            .slice(0, 30)
                                            .map(em => {
                                                const isSelected = initialEmotions.some(e => e.emotionId === em.id);
                                                return (
                                                    <motion.button
                                                        key={em.id}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => toggleEmotion(em.id)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isSelected
                                                                ? 'bg-white text-black'
                                                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                                                            }`}
                                                    >
                                                        {em.label}
                                                    </motion.button>
                                                );
                                            })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Selected Emotions with Intensity */}
                    {selectedEmotionDefs.length > 0 && (
                        <div className="mb-8">
                            <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-medium">Selected emotions</p>
                            <div className="flex flex-col gap-3">
                                {selectedEmotionDefs.map(({ emotionId, intensity, def }) => (
                                    <div key={emotionId} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                                        <span className="text-sm text-white font-medium min-w-[100px]">{def!.label}</span>
                                        <input
                                            type="range"
                                            min={1}
                                            max={10}
                                            value={intensity}
                                            onChange={(e) => updateIntensity(emotionId, Number(e.target.value))}
                                            className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-pink-500"
                                            aria-label={`${def!.label} intensity`}
                                        />
                                        <span className="text-sm text-pink-400 font-bold min-w-[32px] text-right">{intensity}/10</span>
                                        <button
                                            onClick={() => toggleEmotion(emotionId)}
                                            className="text-white/30 hover:text-white/60 transition-colors p-1"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onBack}
                            className="px-6 py-4 bg-white/5 border border-white/10 text-white/70 font-medium rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={initialEmotions.length === 0}
                            onClick={onContinue}
                            className="flex-1 px-8 py-4 bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white font-bold rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-500/20 flex items-center justify-center gap-3"
                        >
                            Continue
                            <ArrowRight size={18} />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
