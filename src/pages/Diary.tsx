import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, BookOpen, Loader2, CalendarDays, Brain, Sparkles, ChevronDown, Home, MessageSquare } from 'lucide-react';
import NeuralBackground from '../components/ui/flow-field-background';

type JournalEntry = {
    id: string;
    created_at: string;
    raw_text: string;
    sentiment: string;
    detected_emotions: string[];
    core_insight: string;
};

type ConversationMessage = {
    id: string;
    role: 'user' | 'assistant';
    message: string;
    created_at: string;
};

export default function Diary() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Record<string, ConversationMessage[]>>({});

    useEffect(() => {
        if (!user) return;
        fetchEntries();
    }, [user]);

    const fetchEntries = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('journal_entries')
                .select('*, journal_emotions(emotion_label)')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            const mappedData = (data || []).map(entry => ({
                ...entry,
                detected_emotions: entry.journal_emotions?.map((e: any) => e.emotion_label) || []
            }));
            
            setEntries(mappedData);
        } catch (error) {
            console.error('Error fetching diary entries:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExpand = async (id: string) => {
        const isExpanding = expandedId !== id;
        setExpandedId(prev => (prev === id ? null : id));

        if (isExpanding && !conversations[id]) {
            try {
                const { data, error } = await supabase
                    .from('journal_conversations')
                    .select('*')
                    .eq('journal_id', id)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                const loadedConversations = data || [];

                setConversations(prev => ({ ...prev, [id]: loadedConversations }));
            } catch (err) {
                console.error("Failed to fetch conversations", err);
            }
        }
    };

    const getSentimentColor = (sentiment: string) => {
        if (!sentiment) return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        const s = sentiment.toLowerCase();
        if (s.includes('positive') || s.includes('joy') || s.includes('calm') || s.includes('hope'))
            return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        if (s.includes('negative') || s.includes('sad') || s.includes('angry') || s.includes('anxi'))
            return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-violet-950 text-white relative flex flex-col items-center">
            {/* Shader bg */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
                <NeuralBackground color="#8b5cf6" particleCount={100} speed={0.15} trailOpacity={0.05} />
            </div>

            {/* Header */}
            <div className="relative z-10 w-full max-w-4xl px-4 pt-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Link to="/smart-journalling" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <ArrowLeft size={16} />
                        <span className="text-sm">Back to Journal</span>
                    </Link>
                    <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10" title="Return to Home">
                        <Home size={16} />
                        <span className="text-sm">Home</span>
                    </Link>
                </div>
                <div className="flex items-center gap-2 text-white/50 text-sm font-light tracking-wide bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                    <BookOpen size={16} className="text-violet-400" />
                    <span>{entries.length} Entries</span>
                </div>
            </div>

            <main className="relative z-10 w-full max-w-3xl px-4 py-16 flex flex-col flex-1">

                {/* Title */}
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-extralight tracking-wide items-center gap-3">
                        Personal <span className="font-semibold text-violet-400">Diary</span>
                    </h1>
                    <p className="text-white/40 mt-3 font-light tracking-wide text-sm md:text-base">
                        A secure archive of your thoughts, reflections, and Sentience insights.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center min-h-[400px]">
                        <Loader2 className="animate-spin text-violet-400" size={40} />
                    </div>
                ) : entries.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center bg-black/20 backdrop-blur-sm border border-white/5 rounded-3xl p-8">
                        <BookOpen size={48} className="text-white/10 mb-4" />
                        <h3 className="text-xl font-light text-white/60 mb-2">No entries yet</h3>
                        <p className="text-white/30 text-sm max-w-sm mb-6">Your diary is waiting for your thoughts. Start writing in the Smart Journal to populate this archive.</p>
                        <Link to="/smart-journalling" className="px-6 py-2.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500 hover:text-white transition-all duration-300 text-sm font-medium tracking-wide">
                            Write your first entry
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 relative">
                        {/* Vertical timeline line */}
                        <div className="absolute left-[23px] md:left-[27px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-violet-500/50 via-white/10 to-transparent z-0"></div>

                        {entries.map((entry, index) => {
                            const dateObj = new Date(entry.created_at);
                            const day = dateObj.toLocaleDateString('en-US', { day: 'numeric' });
                            const monthYear = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                            const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                            const isExpanded = expandedId === entry.id;

                            return (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    className="relative pl-16 md:pl-20 z-10"
                                >
                                    {/* Timeline Node */}
                                    <div className="absolute left-[-2px] md:left-[2px] top-6 w-12 h-12 rounded-full bg-black border border-white/20 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20">
                                        <span className="text-base font-bold text-white/80 leading-none">{day}</span>
                                        <span className="text-[9px] uppercase tracking-wider text-white/40 mt-0.5">{monthYear.split(' ')[0]}</span>
                                    </div>

                                    {/* Entry Card */}
                                    <div
                                        className={`bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer ${isExpanded ? 'shadow-[0_0_40px_rgba(139,92,246,0.1)] border-violet-500/30' : 'hover:border-white/20 hover:bg-black/50'}`}
                                        onClick={() => toggleExpand(entry.id)}
                                    >
                                        <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="flex items-center gap-1.5 text-xs text-white/40 uppercase tracking-widest font-medium">
                                                        <CalendarDays size={12} /> {time}
                                                    </span>
                                                    {entry.sentiment && (
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider border ${getSentimentColor(entry.sentiment)}`}>
                                                            {entry.sentiment}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-white/80 font-serif leading-relaxed text-sm md:text-base ${isExpanded ? 'hidden' : 'line-clamp-2'}`}>
                                                    {entry.raw_text}
                                                </p>
                                            </div>
                                            <div className="shrink-0 flex items-center justify-between md:justify-end md:w-24">
                                                <div className="flex -space-x-2 md:hidden">
                                                    {/* Mobile tags snippet */}
                                                    {entry.detected_emotions?.slice(0, 2).map((em, i) => (
                                                        <div key={i} className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px]" title={em}>{em.charAt(0).toUpperCase()}</div>
                                                    ))}
                                                </div>
                                                <motion.div
                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${isExpanded ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' : 'bg-white/5 text-white/40 border-white/10'}`}
                                                >
                                                    <ChevronDown size={16} />
                                                </motion.div>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                                    className="border-t border-white/5 bg-white/[0.02]"
                                                >
                                                    <div className="p-5 md:p-6 flex flex-col gap-6">

                                                        <div className="bg-white/5 rounded-xl p-5 border border-white/10 relative">
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-violet-500 rounded-l-xl opacity-50"></div>
                                                            <p className="text-white/90 font-serif leading-relaxed text-base whitespace-pre-wrap">
                                                                {entry.raw_text}
                                                            </p>
                                                        </div>

                                                        {entry.detected_emotions && entry.detected_emotions.length > 0 && (
                                                            <div>
                                                                <h4 className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-semibold mb-3 flex items-center gap-2">
                                                                    <Brain size={12} /> Detected Emotions
                                                                </h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {entry.detected_emotions.map((emotion, i) => (
                                                                        <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-light text-white/70">
                                                                            {emotion}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {entry.core_insight && (
                                                            <div className="bg-violet-500/5 rounded-xl border border-violet-500/10 p-4">
                                                                <h4 className="text-[10px] text-violet-400/60 uppercase tracking-[0.2em] font-semibold mb-2 flex items-center gap-2">
                                                                    <Sparkles size={12} className="text-violet-400" /> Core Insight
                                                                </h4>
                                                                <p className="text-sm font-light text-white/80 italic leading-relaxed">
                                                                    "{entry.core_insight}"
                                                                </p>
                                                            </div>
                                                        )}

                                                        {conversations[entry.id] && conversations[entry.id].length > 0 && (
                                                            <div className="mt-2 border-t border-white/5 pt-6">
                                                                <h4 className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-semibold mb-4 flex items-center gap-2">
                                                                    <MessageSquare size={12} /> Conversation History
                                                                </h4>
                                                                <div className="flex flex-col gap-3">
                                                                    {conversations[entry.id].map(msg => (
                                                                        <div key={msg.id} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                                                                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'assistant'
                                                                                ? 'bg-violet-500/10 text-violet-100 border border-violet-500/20 rounded-tl-sm'
                                                                                : 'bg-white/10 text-white border border-white/10 rounded-tr-sm'
                                                                                }`}>
                                                                                <p className="whitespace-pre-wrap">{msg.message}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
