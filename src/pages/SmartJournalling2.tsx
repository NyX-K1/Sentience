import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ChevronRight,
    Loader2, Send, RotateCcw, MessageCircle, Home
} from 'lucide-react';
import { useMoodStore } from '../hooks/useMoodStore';
import { COGNITIVE_DISTORTIONS } from '../data/distortions';
import { emotions as EMOTION_DB } from '../data/emotions';
import DistortionIcon from '../components/thought-reframer/DistortionIcon';
import NeuralBackground from '../components/ui/flow-field-background';
import JournalStories from '../components/JournalStories';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// ─── Types ───
interface DeepAnalysis {
    sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Anxious' | 'Hopeful';
    moodScore: number;
    detectedEmotions: string[];
    cognitiveDistortions: string[];
    copingStrategies: string[];
    journalReflection: string;
    insight: string;
    thoughtReframerSuggested: boolean;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('groq_api_key') || '' : '');

const WRITING_PROMPTS = [
    "What's weighing on you right now?",
    "Describe a moment that stayed with you today.",
    "What would you say to a friend feeling this way?",
    "What are you grateful for, even in difficulty?",
    "What pattern do you keep noticing in yourself?",
    "What would letting go of this feel like?",
];

// ─── Component ───
interface ConvoMessage {
    role: 'user' | 'assistant';
    content: string;
}

export default function SmartJournalling2() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { entries } = useMoodStore();
    const [journalText, setJournalText] = useState('');
    const [currentJournalId, setCurrentJournalId] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<DeepAnalysis | null>(null);
    const [activePrompt, setActivePrompt] = useState<number | null>(null);
    const [view, setView] = useState<'write' | 'reflect'>('write');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Conversation follow-up state
    const [convoMessages, setConvoMessages] = useState<ConvoMessage[]>([]);
    const [convoInput, setConvoInput] = useState('');
    const [isConvoLoading, setIsConvoLoading] = useState(false);
    const convoInputRef = useRef<HTMLTextAreaElement>(null);
    const MAX_EXCHANGES = 3;
    const [writeMode, setWriteMode] = useState<'freewrite' | 'stories'>('freewrite');
    const [activeStoryTitle, setActiveStoryTitle] = useState<string | null>(null);

    // Date
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    // Recent mood summary
    const moodSummary = useMemo(() => {
        const recent = entries.slice(0, 5);
        if (recent.length === 0) return null;
        const avgValence = recent.reduce((s, e) => s + e.compositeValence, 0) / recent.length;
        const topEmotions = [...new Set(
            recent.flatMap(e => e.emotions.map(em => {
                const def = EMOTION_DB.find(d => d.id === em.emotionId);
                return def?.label || null;
            }).filter(Boolean))
        )].slice(0, 4) as string[];
        const dominantFamily = recent[0]?.dominantFamily || null;
        return { avgValence, topEmotions, dominantFamily };
    }, [entries]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.max(300, textareaRef.current.scrollHeight) + 'px';
        }
    }, [journalText]);

    const distortionIds = COGNITIVE_DISTORTIONS.map(d => d.id).join(', ');

    const handleAnalyze = async () => {
        if (!journalText.trim() || journalText.trim().length < 30) return;
        setIsAnalyzing(true);
        setAnalysis(null);

        try {
            // Build context for the AI
            let moodContext = '';
            if (moodSummary) {
                moodContext = `\nRecent mood context: User's recent emotional state has been ${moodSummary.avgValence > 0.3 ? 'positive' : moodSummary.avgValence < -0.3 ? 'challenging' : 'neutral'
                    }. Recent emotions include: ${moodSummary.topEmotions.join(', ')}.`;
            }

            const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'openai/gpt-oss-120b',
                    response_format: { type: 'json_object' },
                    messages: [
                        {
                            role: 'system',
                            content: `You are Sentience, a deeply empathetic AI companion for emotional wellness. Analyze a journal entry with clinical depth but warm language.${moodContext}
Return ONLY raw JSON:
{
  "sentiment": "Positive" | "Neutral" | "Negative" | "Anxious" | "Hopeful",
  "moodScore": number (1-10),
  "detectedEmotions": ["emotion label"] (2-5 emotions from entry),
  "cognitiveDistortions": ["distortion-id"] (from: ${distortionIds}. Only if clearly present.),
  "copingStrategies": ["string"] (3-4 specific, actionable, personal strategies),
  "journalReflection": "string" (one powerful follow-up question),
  "insight": "string" (2-3 sentence therapeutic insight, warm and specific to what they wrote),
  "thoughtReframerSuggested": boolean (true if distortions are significant)
}`
                        },
                        { role: 'user', content: journalText }
                    ]
                })
            });

            const data = await resp.json();
            const content = data.choices?.[0]?.message?.content || '{}';
            const parsed: DeepAnalysis = JSON.parse(content);
            setAnalysis(parsed);

            // Phase 1: Save to Supabase journal_entries
            if (user) {
                const { data: insertData, error } = await supabase
                    .from('journal_entries')
                    .insert([{
                        user_id: user.id,
                        content: journalText,
                        sentiment: parsed.sentiment,
                        mood_score: parsed.moodScore,
                        core_insight: parsed.insight || ''
                    }])
                    .select('id')
                    .single();

                if (error) {
                    console.error('Error saving journal entry:', error);
                } else if (insertData) {
                    setCurrentJournalId(insertData.id);

                    // Insert junction data
                    if (parsed.detectedEmotions && parsed.detectedEmotions.length > 0) {
                        await supabase.from('journal_emotions').insert(
                            parsed.detectedEmotions.map(em => ({ journal_id: insertData.id, emotion_label: em }))
                        );
                    }
                    if (parsed.cognitiveDistortions && parsed.cognitiveDistortions.length > 0) {
                        await supabase.from('journal_distortions').insert(
                            parsed.cognitiveDistortions.map(d => ({ journal_id: insertData.id, distortion_label: d }))
                        );
                    }
                    if (parsed.copingStrategies && parsed.copingStrategies.length > 0) {
                        await supabase.from('journal_coping_strategies').insert(
                            parsed.copingStrategies.map(s => ({ journal_id: insertData.id, strategy_text: s }))
                        );
                    }
                }
            }

            setView('reflect');
        } catch (err) {
            console.error('Analysis failed:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setJournalText('');
        setAnalysis(null);
        setCurrentJournalId(null);
        setView('write');
        setActivePrompt(null);
        setConvoMessages([]);
        setConvoInput('');
    };

    // Conversational follow-up handler
    const appendChatMessage = async (role: 'user' | 'assistant', message: string) => {
        if (!currentJournalId) return;

        try {
            const { error } = await supabase
                .from('journal_conversations')
                .insert([{
                    journal_id: currentJournalId,
                    role: role,
                    message: message
                }]);

            if (error) {
                console.error(`Error saving ${role} message:`, error);
            }
        } catch (err) {
            console.error(`Unexpected error saving ${role} message:`, err);
        }
    };

    const handleConvoSend = async () => {
        if (!convoInput.trim() || isConvoLoading || convoMessages.filter(m => m.role === 'user').length >= MAX_EXCHANGES) return;

        const userMsg: ConvoMessage = { role: 'user', content: convoInput.trim() };
        setConvoMessages(prev => [...prev, userMsg]);
        setConvoInput('');
        setIsConvoLoading(true);

        // Save user message to DB
        await appendChatMessage('user', userMsg.content);

        try {
            // Build conversation history for context
            const history = [
                {
                    role: 'system' as const,
                    content: `You are Sentience, a warm and insightful AI companion for emotional wellness. You are in a follow-up conversation after analyzing the user's journal entry.

Original journal entry: "${journalText.slice(0, 800)}"
Your initial analysis detected: ${analysis?.detectedEmotions?.join(', ') || 'various emotions'}.
Your initial insight was: "${analysis?.insight || ''}"
Your reflection question was: "${analysis?.journalReflection || ''}"

Continue the therapeutic conversation naturally. Be warm, specific, and gently guide the user toward self-understanding. Keep responses to 2-3 sentences. Ask a follow-up question when appropriate.`
                },
                ...convoMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
                { role: 'user' as const, content: userMsg.content }
            ];

            const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'openai/gpt-oss-120b',
                    messages: history,
                    max_tokens: 200,
                })
            });

            const data = await resp.json();
            const reply = data.choices?.[0]?.message?.content || 'I hear you. Could you tell me more about what that feels like?';
            setConvoMessages(prev => [...prev, { role: 'assistant', content: reply }]);

            // Save AI reply to DB
            await appendChatMessage('assistant', reply);

        } catch {
            const fallbackReply = 'I\'m here with you. Take your time — what feels most important right now?';
            setConvoMessages(prev => [...prev, { role: 'assistant', content: fallbackReply }]);
            await appendChatMessage('assistant', fallbackReply);
        } finally {
            setIsConvoLoading(false);
        }
    };

    const sentimentColor = (s?: string) => {
        switch (s) {
            case 'Positive': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Negative': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            case 'Anxious': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Hopeful': return 'text-violet-400 bg-violet-400/10 border-violet-400/20';
            default: return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-violet-950 text-white relative overflow-hidden">
            {/* Shader bg */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
                <NeuralBackground color="#7c3aed" particleCount={200} speed={0.3} trailOpacity={0.04} />
            </div>

            {/* Header */}
            <div className="relative z-10 max-w-3xl mx-auto px-4 pt-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Link to="/sentience" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10" title="Back to Sentience">
                        <ArrowLeft size={16} />
                        <span className="text-sm">Back</span>
                    </Link>
                    <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10" title="Return to Home">
                        <Home size={16} />
                        <span className="text-sm">Home</span>
                    </Link>
                </div>
                <span className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Smart Journal</span>
            </div>

            {/* Main Content */}
            <main className="relative z-10 max-w-3xl mx-auto px-4 pb-24">
                <AnimatePresence mode="wait">
                    {view === 'write' && (
                        <motion.div
                            key="write"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="pt-8"
                        >
                            {/* Date & Greeting */}
                            <div className="mb-8">
                                <p className="text-white/20 text-xs uppercase tracking-[0.2em] mb-2">{dateStr} · {timeStr}</p>
                                <h1 className="text-3xl md:text-4xl font-light tracking-wide">
                                    {now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'}
                                </h1>
                                {moodSummary && (
                                    <p className="text-white/30 text-sm mt-2">
                                        You've been feeling <span className={`${moodSummary.avgValence > 0.3 ? 'text-emerald-400/60' : moodSummary.avgValence < -0.3 ? 'text-rose-400/60' : 'text-white/40'}`}>
                                            {moodSummary.avgValence > 0.3 ? 'positive' : moodSummary.avgValence < -0.3 ? 'low' : 'balanced'}
                                        </span> lately
                                        {moodSummary.topEmotions.length > 0 && (
                                            <> · {moodSummary.topEmotions.slice(0, 2).join(', ')}</>
                                        )}
                                    </p>
                                )}
                            </div>

                            {/* Tab switcher: Freewrite / Stories */}
                            <div className="flex gap-1 mb-6 bg-white/[0.03] border border-white/8 rounded-full p-1 w-fit">
                                <button
                                    onClick={() => setWriteMode('freewrite')}
                                    className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-[0.25em] font-medium transition-all duration-300 ${writeMode === 'freewrite' ? 'bg-white/10 text-white/70' : 'text-white/20 hover:text-white/35'
                                        }`}
                                >
                                    Freewrite
                                </button>
                                <button
                                    onClick={() => setWriteMode('stories')}
                                    className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-[0.25em] font-medium transition-all duration-300 ${writeMode === 'stories' ? 'bg-white/10 text-white/70' : 'text-white/20 hover:text-white/35'
                                        }`}
                                >
                                    Story Templates
                                </button>
                            </div>

                            {/* Stories blur slider */}
                            {writeMode === 'stories' && (
                                <div className="mb-8">
                                    <JournalStories
                                        onSelectStory={(prompt, title) => {
                                            setJournalText(prev => {
                                                const trimmed = prev.trim();
                                                return trimmed ? `${trimmed}\n\n${prompt}\n` : `${prompt}\n`;
                                            });
                                            setActiveStoryTitle(title);
                                            setWriteMode('freewrite');
                                            setTimeout(() => textareaRef.current?.focus(), 100);
                                        }}
                                    />
                                </div>
                            )}

                            {/* Active story indicator */}
                            {activeStoryTitle && writeMode === 'freewrite' && (
                                <div className="mb-4 flex items-center gap-2">
                                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/15">Writing from:</span>
                                    <span className="text-[10px] text-white/35 font-light italic">{activeStoryTitle}</span>
                                    <button
                                        onClick={() => setActiveStoryTitle(null)}
                                        className="text-white/15 hover:text-white/30 text-[10px] ml-1"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}

                            {/* Writing Prompts — only in freewrite mode */}
                            {writeMode === 'freewrite' && (
                                <div className="mb-6">
                                    <span className="text-[10px] text-white/20 uppercase tracking-[0.2em] block mb-3">Need a starting point?</span>
                                    <div className="flex flex-wrap gap-2">
                                        {WRITING_PROMPTS.map((prompt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setActivePrompt(i);
                                                    setJournalText(prev => {
                                                        const trimmed = prev.trim();
                                                        return trimmed ? `${trimmed}\n\n${prompt}\n` : `${prompt}\n`;
                                                    });
                                                    textareaRef.current?.focus();
                                                }}
                                                className={`px-3 py-1.5 rounded-full text-xs border transition-all ${activePrompt === i
                                                    ? 'bg-white/10 border-white/20 text-white/70'
                                                    : 'bg-white/3 border-white/8 text-white/30 hover:bg-white/8 hover:text-white/50'
                                                    }`}
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Main Textarea — only in freewrite mode */}
                            {writeMode === 'freewrite' && (
                                <div className="relative">
                                    <textarea
                                        ref={textareaRef}
                                        value={journalText}
                                        onChange={e => setJournalText(e.target.value)}
                                        placeholder="Write freely. No judgment, no filter — just you and your thoughts..."
                                        className="w-full min-h-[300px] bg-black/20 backdrop-blur-xl border border-white/8 rounded-3xl p-8 text-base md:text-lg leading-relaxed text-white/85 placeholder:text-white/15 focus:outline-none focus:border-white/15 transition-all resize-none"
                                    />

                                    {/* Character count & button */}
                                    <div className="flex items-center justify-between mt-3 px-2">
                                        <span className="text-[10px] text-white/15 font-mono">
                                            {journalText.length > 0 ? `${journalText.length} characters` : ''}
                                        </span>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleAnalyze}
                                            disabled={isAnalyzing || journalText.trim().length < 30}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${isAnalyzing
                                                ? 'bg-white/10 text-white/40 cursor-wait'
                                                : journalText.trim().length < 30
                                                    ? 'bg-white/5 text-white/15 cursor-not-allowed'
                                                    : 'bg-white text-black hover:bg-zinc-100 shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                                                }`}
                                        >
                                            {isAnalyzing ? (
                                                <><Loader2 size={14} className="animate-spin" /> Reflecting...</>
                                            ) : (
                                                <><Send size={14} /> Reflect & Analyze</>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {view === 'reflect' && analysis && (
                        <motion.div
                            key="reflect"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="pt-8 space-y-5"
                        >
                            {/* Back to write */}
                            <div className="flex items-center justify-between">
                                <button onClick={() => setView('write')} className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                                    ← Back to entry
                                </button>
                                <button onClick={handleReset} className="text-xs text-white/20 hover:text-white/40 transition-colors flex items-center gap-1.5">
                                    <RotateCcw size={12} /> New Entry
                                </button>
                            </div>

                            {/* Sentiment + Score Header */}
                            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest border ${sentimentColor(analysis.sentiment)}`}>
                                        {analysis.sentiment}
                                    </span>
                                    <div className="text-right">
                                        <span className="text-3xl font-light text-white/80">{analysis.moodScore}</span>
                                        <span className="text-white/20 text-sm">/10</span>
                                    </div>
                                </div>

                                {/* Insight */}
                                <p className="text-sm text-white/60 leading-relaxed italic">"{analysis.insight}"</p>
                            </div>

                            {/* Detected Emotions */}
                            {analysis.detectedEmotions?.length > 0 && (
                                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                    <span className="text-[10px] text-white/25 uppercase tracking-[0.2em] block mb-3">Emotions Detected</span>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.detectedEmotions.map((em, i) => {
                                            const emotionDef = EMOTION_DB.find(e => e.label.toLowerCase() === em.toLowerCase());
                                            return (
                                                <span key={i} className="px-3 py-1.5 rounded-full text-sm border" style={{
                                                    backgroundColor: (emotionDef?.colorHex || '#6366f1') + '15',
                                                    borderColor: (emotionDef?.colorHex || '#6366f1') + '25',
                                                    color: emotionDef?.colorHex || '#a5b4fc'
                                                }}>
                                                    {em}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Cognitive Distortions */}
                            {analysis.cognitiveDistortions?.length > 0 && (
                                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                    <span className="text-[10px] text-white/25 uppercase tracking-[0.2em] block mb-3">Thought Patterns</span>
                                    <div className="space-y-2">
                                        {analysis.cognitiveDistortions.map(id => {
                                            const d = COGNITIVE_DISTORTIONS.find(cd => cd.id === id);
                                            if (!d) return null;
                                            return (
                                                <div key={id} className="p-3 rounded-xl border flex items-start gap-3" style={{
                                                    backgroundColor: d.colorAccent + '08',
                                                    borderColor: d.colorAccent + '20'
                                                }}>
                                                    <DistortionIcon distortionId={id} size={18} color={d.colorAccent} />
                                                    <div>
                                                        <p className="text-sm font-medium" style={{ color: d.colorAccent }}>{d.name}</p>
                                                        <p className="text-xs text-white/35 mt-0.5">{d.hook}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Reflection Question + Conversation */}
                            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                <div className="text-center mb-4">
                                    <span className="text-[10px] text-white/20 uppercase tracking-[0.2em] block mb-3">Sentience asks</span>
                                    <p className="text-lg font-light text-white/70 leading-relaxed">{analysis.journalReflection}</p>
                                </div>

                                {/* Conversation Thread */}
                                {convoMessages.length > 0 && (
                                    <div className="mt-5 pt-5 border-t border-white/8 space-y-3">
                                        {convoMessages.map((msg, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                    ? 'bg-white/10 text-white/70 rounded-br-sm'
                                                    : 'bg-white/5 border border-white/8 text-white/55 rounded-bl-sm'
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                            </motion.div>
                                        ))}
                                        {isConvoLoading && (
                                            <div className="flex justify-start">
                                                <div className="px-4 py-3 bg-white/5 border border-white/8 rounded-2xl rounded-bl-sm">
                                                    <Loader2 size={14} className="animate-spin text-white/30" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Follow-up Input */}
                                {convoMessages.filter(m => m.role === 'user').length < MAX_EXCHANGES && (
                                    <div className="mt-4 flex gap-2">
                                        <textarea
                                            ref={convoInputRef}
                                            value={convoInput}
                                            onChange={e => setConvoInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleConvoSend(); } }}
                                            placeholder={convoMessages.length === 0 ? 'Respond to this question...' : 'Continue the conversation...'}
                                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/20 resize-none min-h-[44px] max-h-[100px]"
                                            rows={1}
                                        />
                                        <button
                                            onClick={handleConvoSend}
                                            disabled={!convoInput.trim() || isConvoLoading}
                                            className="p-3 bg-white/10 border border-white/10 rounded-full hover:bg-white/15 transition-colors disabled:opacity-20 disabled:cursor-not-allowed shrink-0 self-end"
                                        >
                                            <Send size={14} className="text-white/60" />
                                        </button>
                                    </div>
                                )}

                                {convoMessages.filter(m => m.role === 'user').length >= MAX_EXCHANGES && (
                                    <p className="text-center text-[10px] text-white/20 mt-4 uppercase tracking-widest flex items-center justify-center gap-1.5">
                                        <MessageCircle size={10} /> Conversation complete · {MAX_EXCHANGES} exchanges
                                    </p>
                                )}
                            </div>

                            {/* Coping Strategies */}
                            {analysis.copingStrategies?.length > 0 && (
                                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                    <span className="text-[10px] text-white/25 uppercase tracking-[0.2em] block mb-4">Steps You Can Take</span>
                                    <div className="space-y-2">
                                        {analysis.copingStrategies.map((s, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 bg-white/3 border border-white/5 rounded-xl">
                                                <span className="text-white/15 text-xs font-mono mt-0.5 shrink-0 w-5">{i + 1}.</span>
                                                <p className="text-sm text-white/55 leading-relaxed">{s}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Thought Reframer Suggestion */}
                            {analysis.thoughtReframerSuggested && (
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => navigate('/thought-reframer')}
                                    className="w-full bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex items-center gap-4 hover:bg-black/40 transition-all text-left"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <ChevronRight size={16} className="text-white/40" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white/70">Try the Thought Reframer</p>
                                        <p className="text-xs text-white/30 mt-0.5">We noticed thought patterns worth exploring in a guided CBT exercise</p>
                                    </div>
                                </motion.button>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setView('write')}
                                    className="flex-1 py-3.5 bg-white text-black rounded-full text-sm font-medium uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                                >
                                    Continue Writing
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-3.5 bg-white/5 border border-white/10 text-white/40 rounded-full text-sm uppercase tracking-widest hover:bg-white/10 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
