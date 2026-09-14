import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { emotions as allEmotions } from '../data/emotions';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const TRIGGER_CATEGORIES = [
    { label: 'Life Areas', triggers: ['Work', 'Relationships', 'Health', 'Finances', 'Family', 'Social Life', 'Self-Image'] },
    { label: 'Activities', triggers: ['Exercise', 'Creativity', 'Learning', 'Commuting', 'Screen Time', 'Cooking', 'Socializing'] },
    { label: 'Body & Mind', triggers: ['Sleep Quality', 'Energy Level', 'Physical Pain', 'Meditation', 'Appetite', 'Caffeine'] },
    { label: 'Events', triggers: ['Good News', 'Bad News', 'Conflict', 'Achievement', 'Loss', 'Surprise', 'Decision'] },
];

interface ContextPanelProps {
    selectedEmotionIds: string[];
    onSave: (data: {
        emotions: { emotion: string; intensity: number }[];
        valence: number;
        arousal: number;
        dominantFamily: string;
        triggers: string[];
        note: string;
    }) => Promise<void>;
    onBack: () => void;
}

export default function ContextPanel({ selectedEmotionIds, onSave, onBack }: ContextPanelProps) {
    const selectedEmotionsDefs = allEmotions.filter(e => selectedEmotionIds.includes(e.id));

    // 1. Emotions with Intensity (1-4)
    const [emotionIntensities, setEmotionIntensities] = useState<Record<string, number>>(
        selectedEmotionIds.reduce((acc, id) => ({ ...acc, [id]: 2 }), {})
    );

    // 2. Triggers
    const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
    const [customInput, setCustomInput] = useState('');
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    // 3. Notes
    const [note, setNote] = useState('');

    const [isSaving, setIsSaving] = useState(false);

    const handleIntensityChange = (id: string, val: number) => {
        setEmotionIntensities(prev => ({ ...prev, [id]: val }));
    };

    const toggleTrigger = (trigger: string) => {
        setSelectedTriggers(prev =>
            prev.includes(trigger) ? prev.filter(t => t !== trigger) : [...prev, trigger]
        );
    };

    const handleAddCustom = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && customInput.trim()) {
            const val = customInput.trim();
            if (!selectedTriggers.includes(val)) {
                setSelectedTriggers(prev => [...prev, val]);
            }
            setCustomInput('');
        }
    };

    const submitForm = async () => {
        setIsSaving(true);
        try {
            const emotionsData = selectedEmotionsDefs.map(e => ({
                emotion: e.id,
                intensity: emotionIntensities[e.id] || 2,
                family: e.family,
                valence: e.valence,
                arousal: e.arousal
            }));

            // Calculate weighted valence and arousal based on "science" properties
            let totalValence = 0;
            let totalArousal = 0;
            let weightSum = 0;
            const familyScores: Record<string, number> = {};

            emotionsData.forEach(ed => {
                totalValence += ed.valence * ed.intensity;
                totalArousal += ed.arousal * ed.intensity;
                weightSum += ed.intensity;

                if (!familyScores[ed.family]) {
                    familyScores[ed.family] = 0;
                }
                familyScores[ed.family] += ed.intensity;
            });

            const calculatedValence = weightSum > 0 ? totalValence / weightSum : 0;
            const calculatedArousal = weightSum > 0 ? totalArousal / weightSum : 0;

            // Find dominant family automatically
            let calculatedDominantFamily = 'Complex';
            let maxFamilyScore = 0;
            let isTie = false;

            for (const [family, score] of Object.entries(familyScores)) {
                if (score > maxFamilyScore) {
                    maxFamilyScore = score;
                    calculatedDominantFamily = family;
                    isTie = false;
                } else if (score === maxFamilyScore) {
                    isTie = true;
                }
            }

            if (isTie && Object.keys(familyScores).length > 1) {
                calculatedDominantFamily = 'Complex'; // If tied between multiple families
            } else if (Object.keys(familyScores).length === 0) {
                calculatedDominantFamily = 'Complex'; // Fallback
            }

            await onSave({
                emotions: emotionsData.map(e => ({ emotion: e.emotion, intensity: e.intensity })),
                valence: calculatedValence,
                arousal: calculatedArousal,
                dominantFamily: calculatedDominantFamily,
                triggers: selectedTriggers,
                note
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto flex flex-col items-center px-4 pt-14 pb-24 relative"
        >
            {/* Back button */}
            <button onClick={onBack} className="absolute top-0 left-4 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2 z-50">
                ← Back to Emotions
            </button>

            <h3 className="text-2xl md:text-3xl font-light mb-2 tracking-wide text-center">
                Refine Your Context
                <span className="block text-sm text-white/30 mt-2">Help us understand the nuances of what you feel</span>
            </h3>

            {/* 1. EMOTIONS & INTENSITY */}
            <div className="w-full max-w-xl mt-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] block mb-4 text-center">Emotion Intensity (1-4)</span>
                <div className="space-y-4">
                    {selectedEmotionsDefs.map(em => (
                        <div key={em.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-sm font-medium text-white/90">{em.label}</span>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => handleIntensityChange(em.id, level)}
                                        className={`w-8 h-8 rounded-full text-xs transition-colors flex items-center justify-center border ${emotionIntensities[em.id] === level
                                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-50'
                                            : 'bg-black/20 border-white/10 text-white/40 hover:border-white/30 hover:text-white'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. TRIGGERS */}
            <div className="w-full max-w-xl mt-5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] block mb-4 text-center">Identifying Triggers</span>

                {selectedTriggers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                        {selectedTriggers.map(t => (
                            <motion.button
                                key={t}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={() => toggleTrigger(t)}
                                className="px-3 py-1 bg-white text-black text-xs rounded-full font-medium flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,255,255,0.2)] hover:bg-zinc-200 transition-colors"
                            >
                                {t} <span className="text-black/40">✕</span>
                            </motion.button>
                        ))}
                    </div>
                )}

                <div className="space-y-2">
                    {TRIGGER_CATEGORIES.map(cat => {
                        const isExpanded = expandedCategory === cat.label;
                        const selectedInCat = cat.triggers.filter(t => selectedTriggers.includes(t)).length;

                        return (
                            <div key={cat.label} className="border border-white/8 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setExpandedCategory(isExpanded ? null : cat.label)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left"
                                >
                                    <span className="text-sm text-white/70">{cat.label}</span>
                                    <div className="flex items-center gap-2">
                                        {selectedInCat > 0 && (
                                            <span className="text-[10px] bg-white/15 text-white/60 px-2 py-0.5 rounded-full">{selectedInCat}</span>
                                        )}
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="flex flex-wrap gap-2 px-4 pb-4">
                                                {cat.triggers.map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => toggleTrigger(t)}
                                                        className={`px-3 py-1.5 rounded-full text-xs border transition-all ${selectedTriggers.includes(t)
                                                            ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                                                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/15 hover:text-white hover:border-white/25'
                                                            }`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-3">
                    <input
                        type="text"
                        placeholder="+ Add your own custom trigger (press Enter)"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={handleAddCustom}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-white/25 focus:bg-white/8 transition-all"
                    />
                </div>
            </div>

            {/* 3. FREE NOTE */}
            <div className="w-full max-w-xl mt-5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] block mb-3 text-center">Journaling Note</span>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write freely — what's on your mind?"
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/8 transition-all resize-none leading-relaxed"
                />
            </div>

            {/* ACTION BUTTONS */}
            <div className="w-full max-w-xl mt-6 flex flex-col sm:flex-row gap-3 justify-center relative">
                <button
                    onClick={submitForm}
                    disabled={isSaving}
                    className="flex-1 px-8 py-4 bg-white text-black font-semibold rounded-full text-sm hover:bg-zinc-200 transition-colors uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                    {isSaving ? 'Saving to Database...' : 'Save Mood'}
                </button>
            </div>
        </motion.div>
    );
}
