import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Wand2 } from 'lucide-react';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('groq_api_key') || '' : '');

export interface AIResponse {
    suggestions: string[];
    observation: string;
}

interface AICompanionProps {
    /** The system prompt describing what the AI should do */
    systemPrompt: string;
    /** The user context (situation + thought + other data) */
    userContext: string;
    /** Label for the trigger button */
    buttonLabel?: string;
    /** Color theme */
    accentColor?: 'violet' | 'teal' | 'emerald' | 'amber';
    /** Callback when user picks a suggestion */
    onUseSuggestion?: (suggestion: string) => void;
    /** Optional: render custom items */
    renderSuggestion?: (suggestion: string, index: number) => React.ReactNode;
}

const ACCENT_STYLES = {
    violet: { bg: 'bg-violet-500', bgLight: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-300', ring: 'ring-violet-500/20' },
    teal: { bg: 'bg-teal-500', bgLight: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-300', ring: 'ring-teal-500/20' },
    emerald: { bg: 'bg-emerald-500', bgLight: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300', ring: 'ring-emerald-500/20' },
    amber: { bg: 'bg-amber-500', bgLight: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', ring: 'ring-amber-500/20' },
};

export default function AICompanion({
    systemPrompt,
    userContext,
    buttonLabel = 'Ask AI for help',
    accentColor = 'violet',
    onUseSuggestion,
    renderSuggestion,
}: AICompanionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AIResponse | null>(null);
    const [error, setError] = useState('');

    const style = ACCENT_STYLES[accentColor];

    const fetchAI = async () => {
        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    response_format: { type: 'json_object' },
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userContext },
                    ],
                }),
            });

            const data = await resp.json();
            const content = data.choices?.[0]?.message?.content || '{}';
            const parsed = JSON.parse(content) as AIResponse;
            setResult(parsed);
        } catch (err: any) {
            setError('AI is unavailable right now. Try again in a moment.');
            console.error('AI Companion error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        if (!result && !isLoading) fetchAI();
    };

    return (
        <>
            {/* Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleOpen}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${style.bgLight} ${style.border} ${style.text} hover:brightness-125`}
            >
                <Wand2 size={14} />
                {buttonLabel}
            </motion.button>

            {/* Slide-up Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: 20, height: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`mt-4 overflow-hidden rounded-2xl border ${style.border} ${style.bgLight} backdrop-blur-md`}
                    >
                        <div className="p-5">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg ${style.bgLight}`}>
                                        <Sparkles size={14} className={style.text} />
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-widest ${style.text}`}>
                                        AI Companion
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {result && (
                                        <button
                                            onClick={() => { setResult(null); fetchAI(); }}
                                            className="text-[10px] text-white/30 hover:text-white/50 transition-colors px-2 py-1 rounded-lg bg-white/5"
                                        >
                                            Regenerate
                                        </button>
                                    )}
                                    <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/60 transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Loading State */}
                            {isLoading && (
                                <div className="flex items-center gap-3 py-6 justify-center">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                    >
                                        <Sparkles size={18} className={style.text} />
                                    </motion.div>
                                    <span className="text-sm text-white/40">Thinking about your situation...</span>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <p className="text-sm text-rose-400 text-center py-4">{error}</p>
                            )}

                            {/* Results */}
                            {result && (
                                <div className="space-y-4">
                                    {/* Observation */}
                                    {result.observation && (
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <p className="text-xs text-white/30 uppercase tracking-widest mb-1.5 font-medium">Observation</p>
                                            <p className="text-sm text-white/70 leading-relaxed">{result.observation}</p>
                                        </div>
                                    )}

                                    {/* Suggestions */}
                                    {result.suggestions?.length > 0 && (
                                        <div>
                                            <p className="text-xs text-white/30 uppercase tracking-widest mb-2 font-medium">Suggestions</p>
                                            <div className="space-y-2">
                                                {result.suggestions.map((s, i) => (
                                                    renderSuggestion ? renderSuggestion(s, i) : (
                                                        <motion.button
                                                            key={i}
                                                            whileHover={{ scale: 1.01 }}
                                                            whileTap={{ scale: 0.99 }}
                                                            onClick={() => onUseSuggestion?.(s)}
                                                            className={`w-full text-left p-3 rounded-xl border transition-all hover:bg-white/5 ${style.border} bg-white/[.02]`}
                                                        >
                                                            <p className="text-sm text-white/70">{s}</p>
                                                            {onUseSuggestion && (
                                                                <p className={`text-[10px] mt-1.5 ${style.text} opacity-60`}>Tap to use →</p>
                                                            )}
                                                        </motion.button>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
