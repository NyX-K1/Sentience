import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface SituationStepProps {
    situation: string;
    contextTags: string[];
    onUpdate: (data: { situation?: string; contextTags?: string[] }) => void;
    onContinue: () => void;
}

export default function SituationStep({ situation, onUpdate, onContinue }: SituationStepProps) {
    const [charCount, setCharCount] = useState(situation.length);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
                    {/* Step indicator */}
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] text-white/20 uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full">Step 1</span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-light text-white tracking-wide mb-2">What happened?</h2>
                    <p className="text-white/35 text-sm mb-8 leading-relaxed">
                        Describe the situation that triggered your distress. Stick to facts — what would a camera have recorded?
                    </p>

                    {/* Textarea */}
                    <div className="relative mb-8">
                        <textarea
                            value={situation}
                            onChange={(e) => {
                                if (e.target.value.length <= 1000) {
                                    onUpdate({ situation: e.target.value });
                                    setCharCount(e.target.value.length);
                                }
                            }}
                            placeholder="e.g., My manager didn't respond to my email for two days..."
                            className="w-full h-36 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-white/25 focus:outline-none focus:bg-white/8 resize-none text-white placeholder:text-white/20 text-base transition-all leading-relaxed"
                            aria-label="Situation description"
                        />
                        <span className="absolute bottom-3 right-4 text-[10px] text-white/20 font-mono">
                            {charCount}/1000
                        </span>
                    </div>

                    {/* Continue */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={situation.trim().length < 20}
                        onClick={onContinue}
                        className="w-full px-8 py-4 bg-white text-black font-medium rounded-full disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-[0_0_30px_rgba(255,255,255,0.08)] flex items-center justify-center gap-3 text-sm uppercase tracking-widest hover:bg-zinc-100"
                    >
                        Continue
                        <ArrowRight size={16} />
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
