import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface ThoughtTrapStepProps {
    automaticThought: string;
    initialBelief: number;
    onUpdate: (data: { automaticThought?: string; initialBelief?: number }) => void;
    onContinue: () => void;
    onBack: () => void;
}

const BELIEF_LABELS = [
    { max: 20, text: 'A whisper in the back of your mind' },
    { max: 40, text: "It's there, nudging you" },
    { max: 60, text: "It's got a grip on you" },
    { max: 80, text: 'It feels very real' },
    { max: 100, text: 'It feels like absolute truth' }
];

export default function ThoughtTrapStep({ automaticThought, initialBelief, onUpdate, onContinue, onBack }: ThoughtTrapStepProps) {
    const beliefLabel = BELIEF_LABELS.find(l => initialBelief <= l.max)?.text || BELIEF_LABELS[4].text;

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-rose-500/20 rounded-xl">
                            <MessageCircle className="text-rose-400" size={22} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">What thought popped into your head?</h2>
                    </div>
                    <p className="text-white/50 text-sm mb-8 ml-[52px]">
                        The first, raw, automatic thought. Don't filter it. What did your mind tell you?
                    </p>

                    {/* Thought textarea */}
                    <div className="relative mb-8">
                        <textarea
                            value={automaticThought}
                            onChange={(e) => {
                                if (e.target.value.length <= 500) {
                                    onUpdate({ automaticThought: e.target.value });
                                }
                            }}
                            placeholder="e.g., She's ignoring me because my work isn't good enough..."
                            className="w-full h-28 px-5 py-4 bg-rose-500/5 border-2 border-rose-500/20 rounded-2xl focus:border-rose-500/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none text-white placeholder:text-white/25 text-base transition-all"
                            aria-label="Automatic thought"
                        />
                        <span className="absolute bottom-3 right-4 text-xs text-white/30 font-mono">
                            {automaticThought.length}/500
                        </span>
                    </div>

                    {/* Belief Slider */}
                    <div className="mb-8">
                        <label className="block text-white/70 font-medium mb-4 text-sm">
                            How strongly do you believe this thought right now?
                        </label>

                        <div className="relative mb-3">
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={initialBelief}
                                onChange={(e) => onUpdate({ initialBelief: Number(e.target.value) })}
                                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(244,63,94,${initialBelief / 100}) ${initialBelief}%, rgba(255,255,255,0.05) ${initialBelief}%)`
                                }}
                                aria-label="Belief intensity"
                            />
                            <div
                                className="absolute -top-8 text-sm font-bold text-rose-300 transition-all pointer-events-none"
                                style={{ left: `calc(${initialBelief}% - 16px)` }}
                            >
                                {initialBelief}%
                            </div>
                        </div>

                        <div className="flex justify-between text-xs text-white/30 mb-3">
                            <span>Don't really believe it</span>
                            <span>Absolutely certain</span>
                        </div>

                        <motion.p
                            key={beliefLabel}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center text-sm text-rose-300/70 italic"
                        >
                            "{beliefLabel}"
                        </motion.p>
                    </div>

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
                            disabled={automaticThought.trim().length < 10}
                            onClick={onContinue}
                            className="flex-1 px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-3"
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
