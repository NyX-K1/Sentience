import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, ArrowRight, ArrowLeft, Plus, X, Lightbulb, ThumbsUp, ThumbsDown } from 'lucide-react';
import AICompanion from './AICompanion';

const FOR_PROMPTS = [
    "What facts support this thought?",
    "Has something like this happened before?",
    "Would others agree this is true?"
];

const AGAINST_PROMPTS = [
    "What facts contradict this thought?",
    "Have there been exceptions to this?",
    "What would a supportive friend say?",
    "Am I ignoring anything positive?",
    "Is this based on feelings or facts?"
];

interface EvidenceScaleProps {
    evidenceFor: string[];
    evidenceAgainst: string[];
    automaticThought?: string;
    onUpdate: (data: { evidenceFor?: string[]; evidenceAgainst?: string[] }) => void;
    onContinue: () => void;
    onBack: () => void;
}

export default function EvidenceScale({ evidenceFor, evidenceAgainst, automaticThought, onUpdate, onContinue, onBack }: EvidenceScaleProps) {
    const [forInput, setForInput] = useState('');
    const [againstInput, setAgainstInput] = useState('');
    const [activeTab, setActiveTab] = useState<'for' | 'against'>('for');

    const addFor = () => {
        if (forInput.trim()) {
            onUpdate({ evidenceFor: [...evidenceFor, forInput.trim()] });
            setForInput('');
        }
    };

    const addAgainst = () => {
        if (againstInput.trim()) {
            onUpdate({ evidenceAgainst: [...evidenceAgainst, againstInput.trim()] });
            setAgainstInput('');
        }
    };

    const removeFor = (i: number) => onUpdate({ evidenceFor: evidenceFor.filter((_, idx) => idx !== i) });
    const removeAgainst = (i: number) => onUpdate({ evidenceAgainst: evidenceAgainst.filter((_, idx) => idx !== i) });

    const totalFor = evidenceFor.length;
    const totalAgainst = evidenceAgainst.length;
    const total = totalFor + totalAgainst;

    // The bar ratio: 0 = all for, 1 = all against, 0.5 = balanced
    const ratio = total === 0 ? 0.5 : totalAgainst / total;

    const canContinue = totalFor > 0 || totalAgainst > 0;

    const getSummary = () => {
        if (total === 0) return null;
        if (totalFor > totalAgainst + 1)
            return "The evidence leans toward the thought — but let's explore if there's a more balanced perspective.";
        if (totalAgainst > totalFor + 1)
            return "The evidence doesn't fully support your original thought. A more balanced view might be more accurate.";
        if (totalFor > 0 && totalAgainst === 0)
            return "You've found evidence for the thought. Try looking for even one piece of evidence against it.";
        return "The evidence is mixed — the reality is more nuanced than the thought suggests.";
    };

    const hints = activeTab === 'for' ? FOR_PROMPTS : AGAINST_PROMPTS;
    const currentInput = activeTab === 'for' ? forInput : againstInput;
    const setCurrentInput = activeTab === 'for' ? setForInput : setAgainstInput;
    const addCurrent = activeTab === 'for' ? addFor : addAgainst;

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-teal-500/20 rounded-xl">
                            <Scale className="text-teal-400" size={22} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Weigh the Evidence</h2>
                    </div>
                    <p className="text-white/50 text-sm mb-8 ml-[52px]">
                        Be a detective: gather facts that support AND contradict your thought.
                    </p>

                    {/* ─── Evidence Bar ─── */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between text-xs font-bold mb-2">
                            <span className="text-rose-400 flex items-center gap-1.5">
                                <ThumbsDown size={12} /> Supports thought ({totalFor})
                            </span>
                            <span className="text-teal-400 flex items-center gap-1.5">
                                Contradicts thought ({totalAgainst}) <ThumbsUp size={12} />
                            </span>
                        </div>

                        {/* Balance Bar */}
                        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
                            {total === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/20 font-medium">
                                    Add evidence below to fill this bar
                                </div>
                            ) : (
                                <>
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-l-full"
                                        initial={{ width: '50%' }}
                                        animate={{ width: `${(1 - ratio) * 100}%` }}
                                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                                    />
                                    <motion.div
                                        className="absolute right-0 top-0 h-full bg-gradient-to-l from-teal-500 to-teal-400 rounded-r-full"
                                        initial={{ width: '50%' }}
                                        animate={{ width: `${ratio * 100}%` }}
                                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* ─── Tab Selector ─── */}
                    <div className="flex gap-2 mb-5">
                        <button
                            onClick={() => setActiveTab('for')}
                            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${activeTab === 'for'
                                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 ring-1 ring-rose-500/20'
                                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/[.07]'
                                }`}
                        >
                            <ThumbsDown size={16} /> Evidence FOR
                            {totalFor > 0 && <span className="ml-1 px-2 py-0.5 rounded-full bg-rose-500/30 text-[10px]">{totalFor}</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('against')}
                            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${activeTab === 'against'
                                ? 'bg-teal-500/20 border-teal-500/40 text-teal-300 ring-1 ring-teal-500/20'
                                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/[.07]'
                                }`}
                        >
                            <ThumbsUp size={16} /> Evidence AGAINST
                            {totalAgainst > 0 && <span className="ml-1 px-2 py-0.5 rounded-full bg-teal-500/30 text-[10px]">{totalAgainst}</span>}
                        </button>
                    </div>

                    {/* ─── AI Evidence Helper ─── */}
                    {automaticThought && (
                        <div className="mb-5">
                            <AICompanion
                                accentColor="teal"
                                buttonLabel="AI: Generate counter-evidence"
                                systemPrompt={`You are a CBT therapist AI. The user has an automatic thought and needs help finding evidence AGAINST it (counter-evidence).
Generate 3-4 specific, realistic counter-evidence statements that challenge their thought. These should not be empty reassurances but grounded, fact-based alternatives.
Return ONLY raw JSON:
{
  "observation": "A brief empathetic observation about the thought pattern (1-2 sentences, specific to their thought)",
  "suggestions": ["counter-evidence statement 1", "counter-evidence statement 2", "counter-evidence statement 3"]
}
Be specific and personal to their situation. Avoid generic advice.`}
                                userContext={`My automatic thought is: "${automaticThought}"\nEvidence I've already found FOR the thought: ${evidenceFor.length > 0 ? evidenceFor.join('; ') : 'None yet'}\nEvidence I've already found AGAINST the thought: ${evidenceAgainst.length > 0 ? evidenceAgainst.join('; ') : 'None yet'}`}
                                onUseSuggestion={(suggestion) => {
                                    onUpdate({ evidenceAgainst: [...evidenceAgainst, suggestion] });
                                    setActiveTab('against');
                                }}
                            />
                        </div>
                    )}

                    {/* ─── Active Input Section ─── */}
                    <div className="mb-6">
                        <div className={`rounded-2xl border p-5 ${activeTab === 'for'
                            ? 'bg-rose-500/5 border-rose-500/20'
                            : 'bg-teal-500/5 border-teal-500/20'
                            }`}>
                            {/* Hint Chips */}
                            <p className="text-xs text-white/30 mb-3 flex items-center gap-1.5">
                                <Lightbulb size={10} /> Tap a prompt to get started, or write your own:
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {hints.map(hint => (
                                    <button
                                        key={hint}
                                        onClick={() => setCurrentInput(hint)}
                                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${activeTab === 'for'
                                            ? 'text-rose-300/70 bg-rose-500/10 border-rose-500/15 hover:bg-rose-500/20 hover:text-rose-300'
                                            : 'text-teal-300/70 bg-teal-500/10 border-teal-500/15 hover:bg-teal-500/20 hover:text-teal-300'
                                            }`}
                                    >
                                        {hint}
                                    </button>
                                ))}
                            </div>

                            {/* Text Input */}
                            <div className="flex gap-2">
                                <textarea
                                    value={currentInput}
                                    onChange={e => setCurrentInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addCurrent(); } }}
                                    placeholder={activeTab === 'for' ? "Type evidence that supports the thought..." : "Type evidence that contradicts the thought..."}
                                    className={`flex-1 px-4 py-3 rounded-xl focus:outline-none text-sm text-white placeholder:text-white/20 resize-none h-20 ${activeTab === 'for'
                                        ? 'bg-rose-500/10 border-2 border-rose-500/20 focus:border-rose-500/40'
                                        : 'bg-teal-500/10 border-2 border-teal-500/20 focus:border-teal-500/40'
                                        }`}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={addCurrent}
                                    disabled={!currentInput.trim()}
                                    className={`px-5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed ${activeTab === 'for'
                                        ? 'bg-rose-500/30 text-rose-200 hover:bg-rose-500/40'
                                        : 'bg-teal-500/30 text-teal-200 hover:bg-teal-500/40'
                                        }`}
                                >
                                    <Plus size={16} /> Add
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* ─── Evidence Lists ─── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* FOR list */}
                        <div>
                            <p className="text-xs font-bold text-rose-400/60 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-400" /> Supports ({totalFor})
                            </p>
                            <div className="space-y-1.5 min-h-[40px]">
                                {totalFor === 0 ? (
                                    <p className="text-xs text-white/15 italic py-2">No evidence added yet</p>
                                ) : (
                                    <AnimatePresence>
                                        {evidenceFor.map((item, i) => (
                                            <motion.div
                                                key={`for-${i}-${item.substring(0, 10)}`}
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex items-start gap-2 bg-rose-500/10 rounded-xl px-3 py-2 border border-rose-500/15 group"
                                            >
                                                <span className="text-rose-400/50 text-xs font-bold mt-0.5">{i + 1}</span>
                                                <p className="text-sm text-white/70 flex-1">{item}</p>
                                                <button onClick={() => removeFor(i)} className="text-white/20 hover:text-rose-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-all">
                                                    <X size={12} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>

                        {/* AGAINST list */}
                        <div>
                            <p className="text-xs font-bold text-teal-400/60 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-teal-400" /> Contradicts ({totalAgainst})
                            </p>
                            <div className="space-y-1.5 min-h-[40px]">
                                {totalAgainst === 0 ? (
                                    <p className="text-xs text-white/15 italic py-2">No evidence added yet</p>
                                ) : (
                                    <AnimatePresence>
                                        {evidenceAgainst.map((item, i) => (
                                            <motion.div
                                                key={`against-${i}-${item.substring(0, 10)}`}
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex items-start gap-2 bg-teal-500/10 rounded-xl px-3 py-2 border border-teal-500/15 group"
                                            >
                                                <span className="text-teal-400/50 text-xs font-bold mt-0.5">{i + 1}</span>
                                                <p className="text-sm text-white/70 flex-1">{item}</p>
                                                <button onClick={() => removeAgainst(i)} className="text-white/20 hover:text-teal-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-all">
                                                    <X size={12} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── Summary ─── */}
                    {getSummary() && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6"
                        >
                            <p className="text-sm text-white/60 italic text-center leading-relaxed">
                                💡 {getSummary()}
                            </p>
                        </motion.div>
                    )}

                    {/* ─── Navigation ─── */}
                    <div className="flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onBack}
                            className="px-6 py-4 bg-white/5 border border-white/10 text-white/70 font-medium rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                            <ArrowLeft size={16} /> Back
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={!canContinue}
                            onClick={onContinue}
                            className={`flex-1 px-8 py-4 font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 ${canContinue
                                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-teal-500/20 hover:shadow-teal-500/30'
                                : 'bg-white/5 text-white/20 cursor-not-allowed shadow-none'
                                }`}
                        >
                            {canContinue ? (
                                <>Continue <ArrowRight size={18} /></>
                            ) : (
                                <>Add at least one piece of evidence to continue</>
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
