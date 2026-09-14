import { motion } from 'framer-motion';
import { TrendingDown, ArrowRight, ArrowLeft, Heart, X } from 'lucide-react';
import { emotions as allEmotions } from '../../data/emotions';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { EmotionFamily } from '../../types/mood';

const FAMILIES: { family: EmotionFamily; icon: string }[] = [
    { family: 'Joy', icon: '😊' },
    { family: 'Trust', icon: '🤝' },
    { family: 'Fear', icon: '😰' },
    { family: 'Surprise', icon: '😲' },
    { family: 'Sadness', icon: '😢' },
    { family: 'Disgust', icon: '🤢' },
    { family: 'Anger', icon: '😤' },
    { family: 'Anticipation', icon: '⏳' },
];

interface ShiftStepProps {
    automaticThought: string;
    selectedReframe: string;
    initialBelief: number;
    finalBelief: number;
    initialEmotions: { emotionId: string; intensity: number }[];
    finalEmotions: { emotionId: string; intensity: number }[];
    onUpdate: (data: {
        finalBelief?: number;
        finalEmotions?: { emotionId: string; intensity: number }[];
    }) => void;
    onContinue: () => void;
    onBack: () => void;
}

export default function ShiftStep({
    automaticThought,
    selectedReframe,
    initialBelief,
    finalBelief,
    initialEmotions,
    finalEmotions,
    onUpdate,
    onContinue,
    onBack
}: ShiftStepProps) {
    const [showEmotionPicker, setShowEmotionPicker] = useState(false);
    const [expandedFamily, setExpandedFamily] = useState<EmotionFamily | null>(null);

    const beliefShift = initialBelief - finalBelief;
    const shiftDirection = beliefShift > 0 ? 'down' : beliefShift < 0 ? 'up' : 'same';

    const getShiftMessage = () => {
        if (beliefShift >= 30) return "🌟 Significant shift! The evidence clearly changed your perspective.";
        if (beliefShift >= 15) return "💪 Good work — you're seeing this situation differently now.";
        if (beliefShift >= 5) return "📊 Even a small shift shows your thinking is more flexible.";
        if (beliefShift > 0) return "Every degree of change matters. Flexibility grows with practice.";
        if (beliefShift === 0) return "No shift yet — that's okay. The goal isn't to stop believing something, but to hold the belief more lightly.";
        return "Your belief went up — that can happen. Notice it without judgment.";
    };

    const toggleFinalEmotion = (emotionId: string) => {
        const existing = finalEmotions.find(e => e.emotionId === emotionId);
        if (existing) {
            onUpdate({ finalEmotions: finalEmotions.filter(e => e.emotionId !== emotionId) });
        } else {
            onUpdate({ finalEmotions: [...finalEmotions, { emotionId, intensity: 5 }] });
        }
    };

    const updateFinalIntensity = (emotionId: string, intensity: number) => {
        onUpdate({
            finalEmotions: finalEmotions.map(e =>
                e.emotionId === emotionId ? { ...e, intensity } : e
            )
        });
    };

    const getEmotionLabel = (id: string) => allEmotions.find(e => e.id === id)?.label || id;

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-sky-500/20 rounded-xl">
                            <TrendingDown className="text-sky-400" size={22} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Measuring the shift</h2>
                    </div>
                    <p className="text-white/50 text-sm mb-8 ml-[52px]">
                        Let's see how this exercise has changed your perspective. Re-rate your belief in the original thought.
                    </p>

                    {/* Before / After Comparison */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                            <p className="text-[10px] text-rose-400/60 uppercase tracking-widest mb-2 font-medium">Before</p>
                            <p className="text-white/60 text-xs italic mb-2 line-clamp-2">"{automaticThought}"</p>
                            <p className="text-rose-400 text-lg font-bold">{initialBelief}% belief</p>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                            <p className="text-[10px] text-emerald-400/60 uppercase tracking-widest mb-2 font-medium">After</p>
                            <p className="text-white/60 text-xs italic mb-2 line-clamp-2">"{selectedReframe}"</p>
                            <p className="text-emerald-400 text-lg font-bold">{finalBelief}% belief</p>
                        </div>
                    </div>

                    {/* Re-rate Belief Slider */}
                    <div className="mb-6">
                        <label className="block text-white/70 text-sm font-medium mb-4">
                            How strongly do you believe the <span className="text-rose-400">original thought</span> now?
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={finalBelief}
                            onChange={(e) => onUpdate({ finalBelief: Number(e.target.value) })}
                            className="w-full h-3 rounded-full appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(90deg, rgba(16,185,129,0.3) 0%, rgba(16,185,129,0.3) ${finalBelief}%, rgba(255,255,255,0.05) ${finalBelief}%)`
                            }}
                        />
                        <div className="flex justify-between text-xs text-white/30 mt-2">
                            <span>Don't believe it at all</span>
                            <span>Completely believe it</span>
                        </div>
                    </div>

                    {/* Shift Indicator */}
                    <motion.div
                        key={beliefShift}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`rounded-2xl p-4 mb-8 border ${shiftDirection === 'down' ? 'bg-emerald-500/10 border-emerald-500/20' :
                                shiftDirection === 'same' ? 'bg-white/5 border-white/10' :
                                    'bg-amber-500/10 border-amber-500/20'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{shiftDirection === 'down' ? '📉' : shiftDirection === 'same' ? '➡️' : '📈'}</span>
                            <div>
                                <p className={`text-sm font-bold ${shiftDirection === 'down' ? 'text-emerald-300' :
                                        shiftDirection === 'same' ? 'text-white/60' : 'text-amber-300'
                                    }`}>
                                    Belief shift: {beliefShift > 0 ? '-' : beliefShift < 0 ? '+' : ''}{Math.abs(beliefShift)}%
                                </p>
                                <p className="text-xs text-white/50 mt-1">{getShiftMessage()}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Emotion Re-check */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Heart size={16} className="text-pink-400" />
                                <p className="text-sm text-white/70 font-medium">Emotional re-check</p>
                            </div>
                            <button
                                onClick={() => setShowEmotionPicker(!showEmotionPicker)}
                                className="text-xs text-pink-400/60 hover:text-pink-400 transition-colors"
                            >
                                {showEmotionPicker ? 'Hide picker' : '+ Add emotions'}
                            </button>
                        </div>

                        {/* Initial Emotions */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className="text-[10px] text-white/30 uppercase tracking-widest self-center mr-1">Before:</span>
                            {initialEmotions.map(e => (
                                <span key={e.emotionId} className="px-2 py-1 bg-rose-500/10 border border-rose-500/15 rounded-lg text-xs text-rose-300/70">
                                    {getEmotionLabel(e.emotionId)} ({e.intensity})
                                </span>
                            ))}
                        </div>

                        {/* Emotion Picker */}
                        <AnimatePresence>
                            {showEmotionPicker && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-3">
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {FAMILIES.map(({ family, icon }) => (
                                            <button key={family} onClick={() => setExpandedFamily(expandedFamily === family ? null : family)} className={`px-2 py-1 rounded-lg text-xs border ${expandedFamily === family ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'} text-white/60`}>
                                                {icon} {family}
                                            </button>
                                        ))}
                                    </div>
                                    {expandedFamily && (
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 max-h-32 overflow-y-auto">
                                            <div className="flex flex-wrap gap-1.5">
                                                {allEmotions.filter(e => e.family === expandedFamily).slice(0, 20).map(em => {
                                                    const isSelected = finalEmotions.some(e => e.emotionId === em.id);
                                                    return (
                                                        <button key={em.id} onClick={() => toggleFinalEmotion(em.id)} className={`px-2 py-1 rounded-full text-[11px] ${isSelected ? 'bg-white text-black font-bold' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}>
                                                            {em.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Final Emotions with Intensity */}
                        {finalEmotions.length > 0 && (
                            <div className="space-y-2">
                                <span className="text-[10px] text-white/30 uppercase tracking-widest">After:</span>
                                {finalEmotions.map(e => (
                                    <div key={e.emotionId} className="flex items-center gap-3 bg-emerald-500/10 rounded-xl px-3 py-2 border border-emerald-500/15">
                                        <span className="text-xs text-white/70 min-w-[80px]">{getEmotionLabel(e.emotionId)}</span>
                                        <input type="range" min={1} max={10} value={e.intensity} onChange={(ev) => updateFinalIntensity(e.emotionId, Number(ev.target.value))} className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-emerald-500" />
                                        <span className="text-xs text-emerald-400 font-bold min-w-[28px] text-right">{e.intensity}</span>
                                        <button onClick={() => toggleFinalEmotion(e.emotionId)} className="text-white/20 hover:text-white/50"><X size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onBack} className="px-6 py-4 bg-white/5 border border-white/10 text-white/70 font-medium rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2">
                            <ArrowLeft size={16} /> Back
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onContinue} className="flex-1 px-8 py-4 bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-3">
                            Continue <ArrowRight size={18} />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
