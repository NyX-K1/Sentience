import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowRight, ArrowLeft, Sparkles, MessageSquare } from 'lucide-react';
import { REFRAME_PROMPTS, COPING_SUGGESTIONS } from '../../data/reframePrompts';
import { COGNITIVE_DISTORTIONS } from '../../data/distortions';
import AICompanion from './AICompanion';

interface ReframeStepProps {
    automaticThought: string;
    identifiedDistortions: string[];
    reframedThoughts: string[];
    selectedReframe: string;
    onUpdate: (data: {
        reframedThoughts?: string[];
        selectedReframe?: string;
    }) => void;
    onContinue: () => void;
    onBack: () => void;
}

export default function ReframeStep({
    automaticThought,
    identifiedDistortions,
    reframedThoughts,
    selectedReframe,
    onUpdate,
    onContinue,
    onBack
}: ReframeStepProps) {
    const [activePrompt, setActivePrompt] = useState<string | null>(null);
    const [reframeInput, setReframeInput] = useState('');

    const copingSuggestion = identifiedDistortions.length > 0
        ? COPING_SUGGESTIONS[identifiedDistortions[0]]
        : null;

    const addReframe = () => {
        if (reframeInput.trim()) {
            const updated = [...reframedThoughts, reframeInput.trim()];
            onUpdate({ reframedThoughts: updated });
            if (!selectedReframe) onUpdate({ reframedThoughts: updated, selectedReframe: reframeInput.trim() });
            setReframeInput('');
            setActivePrompt(null);
        }
    };

    const selectReframe = (thought: string) => {
        onUpdate({ selectedReframe: thought });
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-emerald-500/20 rounded-xl">
                            <RefreshCw className="text-emerald-400" size={22} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Reframe the thought</h2>
                    </div>
                    <p className="text-white/50 text-sm mb-6 ml-[52px]">
                        Using the evidence you gathered, craft a more balanced, accurate perspective.
                    </p>

                    {/* Original Thought */}
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-6">
                        <p className="text-xs text-rose-400/60 uppercase tracking-widest mb-1 font-medium">Original thought</p>
                        <p className="text-white/70 text-sm italic">"{automaticThought}"</p>
                    </div>

                    {/* Coping Suggestion */}
                    {copingSuggestion && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6"
                        >
                            <div className="flex items-start gap-2">
                                <Sparkles size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-emerald-400/60 uppercase tracking-widest mb-1 font-medium">Suggested counter-skill</p>
                                    <p className="text-sm text-emerald-200/80">{copingSuggestion}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Reframe Prompt Cards */}
                    <div className="mb-6">
                        <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-medium">Guided prompts</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {REFRAME_PROMPTS.map(prompt => (
                                <motion.button
                                    key={prompt.id}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => {
                                        setActivePrompt(activePrompt === prompt.id ? null : prompt.id);
                                        if (activePrompt !== prompt.id) setReframeInput(prompt.starter);
                                    }}
                                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${activePrompt === prompt.id
                                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                                        }`}
                                >
                                    <span className="mr-1">{prompt.icon}</span> {prompt.text}
                                </motion.button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="relative">
                                    <textarea
                                        value={reframeInput}
                                        onChange={(e) => setReframeInput(e.target.value)}
                                        placeholder="Write a more balanced version of the thought..."
                                        className="w-full h-28 px-5 py-4 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-2xl focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 resize-none text-white placeholder:text-white/25 text-sm transition-all"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={addReframe}
                                        disabled={!reframeInput.trim()}
                                        className="absolute bottom-3 right-3 px-4 py-2 bg-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold hover:bg-emerald-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                                    >
                                        <MessageSquare size={12} />
                                        Save
                                    </motion.button>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* AI Reframe Generator */}
                        <div className="mt-4">
                            <AICompanion
                                accentColor="emerald"
                                buttonLabel="AI: Generate reframes for me"
                                systemPrompt={`You are a CBT therapist AI. The user has an automatic thought and identified cognitive distortions. Generate 3 specific, balanced reframed thoughts.
Each reframe should:
- Directly address THIS specific thought (not generic)
- Acknowledge the kernel of truth while offering a more balanced view
- Be written in first person ("I...")
- Feel natural, not clinical

Return ONLY raw JSON:
{
  "observation": "A brief 1-2 sentence insight about why THIS thought is distorted (be specific)",
  "suggestions": ["reframed thought 1", "reframed thought 2", "reframed thought 3"]
}`}
                                userContext={`My automatic thought: "${automaticThought}"
Distortions identified: ${identifiedDistortions.map(id => COGNITIVE_DISTORTIONS.find(d => d.id === id)?.name || id).join(', ') || 'None'}
Reframes I already wrote: ${reframedThoughts.length > 0 ? reframedThoughts.join(' | ') : 'None yet'}`}
                                onUseSuggestion={(suggestion) => {
                                    const updated = [...reframedThoughts, suggestion];
                                    onUpdate({ reframedThoughts: updated, selectedReframe: suggestion });
                                }}
                            />
                        </div>
                    </div>

                    {/* Saved Reframes */}
                    {reframedThoughts.length > 0 && (
                        <div className="mb-8">
                            <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-medium">Your reframed thoughts (select your best)</p>
                            <div className="space-y-2">
                                {reframedThoughts.map((thought, i) => (
                                    <motion.button
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => selectReframe(thought)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${selectedReframe === thought
                                            ? 'bg-emerald-500/20 border-emerald-500/40 ring-2 ring-emerald-500/20'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <p className={`text-sm ${selectedReframe === thought ? 'text-emerald-200' : 'text-white/60'}`}>
                                            {thought}
                                        </p>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-3">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onBack} className="px-6 py-4 bg-white/5 border border-white/10 text-white/70 font-medium rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2">
                            <ArrowLeft size={16} /> Back
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={!selectedReframe} onClick={onContinue} className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3">
                            Continue <ArrowRight size={18} />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
