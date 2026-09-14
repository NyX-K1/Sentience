import { motion } from 'framer-motion';
import { Sparkles, RotateCcw, ArrowLeft, CheckCircle2, MapPin, Search, Wrench, Loader2 } from 'lucide-react';
import { COGNITIVE_DISTORTIONS } from '../../data/distortions';
import { COPING_SUGGESTIONS } from '../../data/reframePrompts';
import { emotions as allEmotions } from '../../data/emotions';
import DistortionIcon from './DistortionIcon';

interface TakeawayStepProps {
    situation: string;
    automaticThought: string;
    selectedReframe: string;
    initialBelief: number;
    finalBelief: number;
    identifiedDistortions: string[];
    initialEmotions: { emotionId: string; intensity: number }[];
    finalEmotions: { emotionId: string; intensity: number }[];
    personalTakeaway?: string;
    onUpdate: (data: { personalTakeaway?: string }) => void;
    onComplete: () => void;
    onBack: () => void;
    onStartNew: () => void;
    isSaving?: boolean;
}

export default function TakeawayStep({
    situation,
    automaticThought,
    selectedReframe,
    initialBelief,
    finalBelief,
    identifiedDistortions,
    initialEmotions,
    finalEmotions,
    personalTakeaway,
    onUpdate,
    onComplete,
    onBack,
    onStartNew,
    isSaving = false
}: TakeawayStepProps) {
    const beliefShift = initialBelief - finalBelief;
    const getEmotionLabel = (id: string) => allEmotions.find(e => e.id === id)?.label || id;

    const distortionNames = identifiedDistortions.map(id =>
        COGNITIVE_DISTORTIONS.find(d => d.id === id)?.name || id
    );

    const copingSkills = identifiedDistortions
        .map(id => COPING_SUGGESTIONS[id])
        .filter(Boolean);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                {/* Completion Header */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full mb-4 shadow-lg shadow-violet-500/30">
                        <Sparkles className="text-white" size={28} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Session Complete</h2>
                    <p className="text-white/40 text-sm">You've done meaningful cognitive work. Here's your summary.</p>
                </motion.div>

                {/* Summary Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl mb-6">
                    {/* Situation */}
                    <div className="mb-6">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-medium flex items-center gap-1.5"><MapPin size={10} className="text-white/20" /> Situation</p>
                        <p className="text-sm text-white/60">{situation}</p>
                    </div>

                    {/* Thought Transformation */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                            <p className="text-[10px] text-rose-400/50 uppercase tracking-widest mb-1">Original thought</p>
                            <p className="text-xs text-white/50 italic mb-2">"{automaticThought}"</p>
                            <p className="text-rose-400 font-bold">{initialBelief}%</p>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                            <p className="text-[10px] text-emerald-400/50 uppercase tracking-widest mb-1">Reframed thought</p>
                            <p className="text-xs text-white/50 italic mb-2">"{selectedReframe}"</p>
                            <p className="text-emerald-400 font-bold">{finalBelief}%</p>
                        </div>
                    </div>

                    {/* Belief Shift */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className={`rounded-2xl p-4 mb-6 ${beliefShift > 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 border border-white/10'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-white/60">Belief shift</span>
                            <span className={`text-xl font-bold ${beliefShift > 0 ? 'text-emerald-400' : 'text-white/40'}`}>
                                {beliefShift > 0 ? '-' : ''}{Math.abs(beliefShift)}%
                            </span>
                        </div>
                    </motion.div>

                    {/* Distortions */}
                    {distortionNames.length > 0 && (
                        <div className="mb-6">
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-medium flex items-center gap-1.5"><Search size={10} className="text-white/20" /> Distortions identified</p>
                            <div className="flex flex-wrap gap-2">
                                {identifiedDistortions.map(id => {
                                    const d = COGNITIVE_DISTORTIONS.find(cd => cd.id === id);
                                    return d ? (
                                        <span key={id} className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit" style={{ backgroundColor: d.colorAccent + '20', color: d.colorAccent }}>
                                            <DistortionIcon distortionId={d.id} size={12} color={d.colorAccent} /> {d.name}
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}

                    {/* Emotions */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Emotions before</p>
                            <div className="flex flex-wrap gap-1">
                                {initialEmotions.map(e => (
                                    <span key={e.emotionId} className="text-xs bg-white/5 rounded-lg px-2 py-1 text-white/40">{getEmotionLabel(e.emotionId)} ({e.intensity})</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Emotions after</p>
                            <div className="flex flex-wrap gap-1">
                                {finalEmotions.length > 0 ? finalEmotions.map(e => (
                                    <span key={e.emotionId} className="text-xs bg-emerald-500/10 rounded-lg px-2 py-1 text-emerald-300/60">{getEmotionLabel(e.emotionId)} ({e.intensity})</span>
                                )) : (
                                    <span className="text-xs text-white/20 italic">Not re-checked</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Coping Skills */}
                    {copingSkills.length > 0 && (
                        <div className="mb-6">
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-medium flex items-center gap-1.5"><Wrench size={10} className="text-white/20" /> Skills to practice</p>
                            {copingSkills.map((skill, i) => (
                                <p key={i} className="text-xs text-white/50 mb-1 pl-3 border-l-2 border-violet-500/30">{skill}</p>
                            ))}
                        </div>
                    )}

                    {/* Personal Takeaway */}
                    <div className="mb-6">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-medium flex items-center gap-1.5"><Sparkles size={10} className="text-white/20" /> Personal takeaway (optional)</p>
                        <textarea
                            value={personalTakeaway || ''}
                            onChange={(e) => onUpdate({ personalTakeaway: e.target.value })}
                            placeholder="What's the one thing you want to remember from this session?"
                            className="w-full h-20 px-4 py-3 bg-violet-500/5 border border-violet-500/20 rounded-xl focus:border-violet-500/40 focus:outline-none resize-none text-white text-sm placeholder:text-white/20"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <motion.button
                        whileHover={!isSaving ? { scale: 1.02 } : {}}
                        whileTap={!isSaving ? { scale: 0.98 } : {}}
                        onClick={onComplete}
                        disabled={isSaving}
                        className="w-full px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                        {isSaving ? 'Saving to Journal...' : 'Save & Complete Session'}
                    </motion.button>

                    <div className="flex gap-3">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onBack} className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white/50 font-medium rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                            <ArrowLeft size={14} /> Back
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onStartNew} className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white/50 font-medium rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> Start New
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
