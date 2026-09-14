import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, CartesianGrid, Legend, LineChart, Line,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, Cell
} from 'recharts';
import { ArrowLeft, Loader2, Sparkles, TrendingUp, CalendarDays, Home, Brain, BookOpen, Activity, Heart } from 'lucide-react';
import NeuralBackground from '../components/ui/flow-field-background';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('groq_api_key') || '' : '');

type TimeRange = '7d' | '30d' | '90d';

const PIE_COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6', '#f97316'];

export default function UserAnalytics() {
    const { user } = useAuth();
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [isLoading, setIsLoading] = useState(true);

    // Data States
    const [moodData, setMoodData] = useState<any[]>([]);
    const [cbtData, setCbtData] = useState<any[]>([]);
    const [journalEmotions, setJournalEmotions] = useState<any[]>([]);

    // New data states
    const [totalMoodLogs, setTotalMoodLogs] = useState(0);
    const [totalJournalEntries, setTotalJournalEntries] = useState(0);
    const [totalCbtSessions, setTotalCbtSessions] = useState(0);
    const [avgBeliefShift, setAvgBeliefShift] = useState(0);
    const [familyDistribution, setFamilyDistribution] = useState<any[]>([]);
    const [distortionFrequency, setDistortionFrequency] = useState<any[]>([]);
    const [moodScoreTrend, setMoodScoreTrend] = useState<any[]>([]);
    const [journalHeatmap, setJournalHeatmap] = useState<Record<string, number>>({});
    const [sentimentBreakdown, setSentimentBreakdown] = useState<Record<string, number>>({});

    // AI Insight State
    const [aiInsight, setAiInsight] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        fetchDashboardData();
    }, [user, timeRange]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setIsAiLoading(true);
        setAiInsight('');

        try {
            const today = new Date();
            const pastDate = new Date();
            if (timeRange === '7d') pastDate.setDate(today.getDate() - 7);
            if (timeRange === '30d') pastDate.setDate(today.getDate() - 30);
            if (timeRange === '90d') pastDate.setDate(today.getDate() - 90);

            const pastDateString = pastDate.toISOString();

            // 1. Fetch Mood Logs (full)
            const { data: moods } = await supabase
                .from('mood_logs')
                .select('*')
                .eq('user_id', user!.id)
                .gte('created_at', pastDateString)
                .order('created_at', { ascending: true });

            const formattedMoods = (moods || []).map(m => ({
                date: new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                valence: m.valence,
                arousal: m.arousal
            }));
            setMoodData(formattedMoods);
            setTotalMoodLogs(moods?.length || 0);

            // Dominant family distribution
            const familyCounts: Record<string, number> = {};
            moods?.forEach(m => {
                if (m.dominant_family) {
                    familyCounts[m.dominant_family] = (familyCounts[m.dominant_family] || 0) + 1;
                }
            });
            const familyData = Object.entries(familyCounts)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);
            setFamilyDistribution(familyData);

            // 2. Fetch CBT Reframing Sessions (full)
            const { data: reframes } = await supabase
                .from('thought_reframing_sessions')
                .select('*, trs_distortions(distortion_id)')
                .eq('user_id', user!.id)
                .gte('created_at', pastDateString)
                .order('created_at', { ascending: true });

            const formattedCBT = (reframes || []).map((r, i) => ({
                name: `Session ${i + 1}`,
                date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                initialBelief: r.initial_belief,
                finalBelief: r.final_belief
            }));
            setCbtData(formattedCBT);
            setTotalCbtSessions(reframes?.length || 0);

            // Avg belief shift
            if (reframes && reframes.length > 0) {
                const totalShift = reframes.reduce((acc, r) => acc + Math.max(0, (r.initial_belief || 0) - (r.final_belief || 0)), 0);
                setAvgBeliefShift(Math.round(totalShift / reframes.length));
            } else {
                setAvgBeliefShift(0);
            }


            const distCounts: Record<string, number> = {};
            reframes?.forEach(r => {
                if (r.trs_distortions && Array.isArray(r.trs_distortions)) {
                    r.trs_distortions.forEach((d: any) => {
                        const distName = d.distortion_id;
                        distCounts[distName] = (distCounts[distName] || 0) + 1;
                    });
                }
            });
            const distData = Object.entries(distCounts)
                .map(([name, count]) => ({ name: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 6);
            setDistortionFrequency(distData);

            // 3. Fetch Journal Entries (full)
            const { data: journals } = await supabase
                .from('journal_entries')
                .select('*, journal_emotions(emotion_label)')
                .eq('user_id', user!.id)
                .gte('created_at', pastDateString)
                .order('created_at', { ascending: true });

            setTotalJournalEntries(journals?.length || 0);

            const emotionCounts: Record<string, number> = {};
            journals?.forEach(j => {
                if (j.journal_emotions && Array.isArray(j.journal_emotions)) {
                    j.journal_emotions.forEach((em: any) => {
                        const label = em.emotion_label;
                        emotionCounts[label] = (emotionCounts[label] || 0) + 1;
                    });
                }
            });
            const radarData = Object.entries(emotionCounts)
                .map(([emotion, count]) => ({ emotion, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 6);
            setJournalEmotions(radarData);

            // Mood score trend
            const moodScores = (journals || [])
                .filter(j => j.mood_score != null)
                .map(j => ({
                    date: new Date(j.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    score: j.mood_score
                }));
            setMoodScoreTrend(moodScores);

            // Journal heatmap (entries per day)
            const heatmap: Record<string, number> = {};
            journals?.forEach(j => {
                const day = new Date(j.created_at).toISOString().split('T')[0];
                heatmap[day] = (heatmap[day] || 0) + 1;
            });
            setJournalHeatmap(heatmap);

            // Sentiment breakdown
            const sentiments: Record<string, number> = {};
            journals?.forEach(j => {
                if (j.sentiment) {
                    sentiments[j.sentiment] = (sentiments[j.sentiment] || 0) + 1;
                }
            });
            setSentimentBreakdown(sentiments);

            // Generate AI Insight with richer data
            generateAiInsight(formattedMoods, formattedCBT, radarData, distData, sentiments, moodScores, familyData);

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateAiInsight = async (moods: any[], cbt: any[], emotions: any[], distortions: any[], sentiments: Record<string, number>, moodScores: any[], families: any[]) => {
        try {
            const avgValence = moods.length ? (moods.reduce((sum, m) => sum + m.valence, 0) / moods.length).toFixed(2) : 'N/A';
            const avgShift = cbt.length ? (cbt.reduce((sum, c) => sum + (c.initialBelief - c.finalBelief), 0) / cbt.length).toFixed(1) : 'N/A';
            const topEmotion = emotions.length ? emotions[0].emotion : 'N/A';
            const topDistortion = distortions.length ? distortions[0].name : 'N/A';
            const predominantSentiment = Object.entries(sentiments).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
            const avgMoodScore = moodScores.length ? (moodScores.reduce((s, m) => s + m.score, 0) / moodScores.length).toFixed(1) : 'N/A';
            const topFamily = families.length ? families[0].name : 'N/A';

            const summaryStats = {
                timeframe: timeRange,
                averageMoodValence: avgValence,
                averageCBTBeliefReduction: avgShift,
                mostFrequentJournalEmotion: topEmotion,
                mostFrequentDistortion: topDistortion,
                predominantJournalSentiment: predominantSentiment,
                averageJournalMoodScore: avgMoodScore,
                dominantEmotionFamily: topFamily,
                totalMoodLogs: moods.length,
                totalReframingSessions: cbt.length,
                totalJournalEntries: moodScores.length,
                sentimentDistribution: sentiments
            };

            const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an empathetic, encouraging AI assistant in a mental health app called Sentience. Look at this user's comprehensive data summary covering their mood tracking, journaling, and cognitive behavioral therapy work. Provide a 3-sentence, highly personalized insight. First sentence: a meaningful observation about patterns in their data. Second sentence: a specific strength or positive trend you notice. Third sentence: one gentle, actionable suggestion. Keep the tone warm, insightful, and uplifting. Do not sound clinical. Do not use bullet points.`
                        },
                        { role: 'user', content: JSON.stringify(summaryStats) }
                    ],
                    max_tokens: 250
                })
            });

            const data = await resp.json();
            const reply = data.choices?.[0]?.message?.content || "You're making taking time for yourself a priority, and that matters. Keep observing your thoughts with gentleness.";
            setAiInsight(reply);
        } catch (error) {
            console.error('Error fetching AI insight:', error);
            setAiInsight("You're making taking time for yourself a priority, and that matters. Keep observing your thoughts with gentleness.");
        } finally {
            setIsAiLoading(false);
        }
    };

    // Generate heatmap cells for the last N days
    const heatmapCells = useMemo(() => {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const cells: { date: string; count: number; label: string }[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            cells.push({ date: key, count: journalHeatmap[key] || 0, label });
        }
        return cells;
    }, [journalHeatmap, timeRange]);

    const maxHeatmapCount = Math.max(1, ...heatmapCells.map(c => c.count));

    const sentimentPieData = useMemo(() => {
        return Object.entries(sentimentBreakdown).map(([name, value]) => ({ name, value }));
    }, [sentimentBreakdown]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-violet-950 text-white relative flex flex-col items-center">
            {/* Shader bg */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
                <NeuralBackground color="#10b981" particleCount={150} speed={0.2} trailOpacity={0.05} />
            </div>

            {/* Header */}
            <div className="relative z-10 w-full max-w-7xl px-4 pt-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Link to="/sentience" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <ArrowLeft size={16} />
                        <span className="text-sm">Back</span>
                    </Link>
                    <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10" title="Return to Home">
                        <Home size={16} />
                        <span className="text-sm">Home</span>
                    </Link>
                </div>
                <div className="flex bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md">
                    {(['7d', '30d', '90d'] as TimeRange[]).map((tr) => (
                        <button
                            key={tr}
                            onClick={() => setTimeRange(tr)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all duration-300 ${timeRange === tr ? 'bg-white/20 text-white shadow-lg' : 'text-white/40 hover:text-white/70'
                                }`}
                        >
                            {tr}
                        </button>
                    ))}
                </div>
            </div>

            <main className="relative z-10 w-full max-w-7xl px-4 py-12 flex flex-col gap-8 flex-1">

                {/* Title */}
                <div>
                    <h1 className="text-4xl md:text-5xl font-extralight tracking-wide items-center gap-3">
                        <TrendingUp className="inline-block mb-2 text-emerald-400" size={32} /> User <span className="font-semibold text-emerald-400">Analytics</span>
                    </h1>
                    <p className="text-white/40 mt-2 font-light tracking-wide uppercase text-sm flex items-center gap-2">
                        <CalendarDays size={14} />
                        {timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                    </p>
                </div>

                {/* AI Insights Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={timeRange}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        className="p-6 md:p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-emerald-400/20 shadow-[0_0_40px_rgba(16,185,129,0.05)] flex items-start gap-4 md:gap-6"
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-400/10 flex items-center justify-center shrink-0 border border-emerald-400/20">
                            <Sparkles className="text-emerald-400" size={20} />
                        </div>
                        <div className="flex-1 mt-1">
                            <span className="text-[10px] text-emerald-400/60 uppercase tracking-[0.2em] font-medium mb-1 block">Sentience Insight</span>
                            {isAiLoading ? (
                                <div className="animate-pulse space-y-2 mt-2">
                                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                                    <div className="h-4 bg-white/10 rounded w-2/3"></div>
                                </div>
                            ) : (
                                <p className="text-base md:text-lg font-light text-white/90 leading-relaxed italic border-l-2 border-emerald-400/30 pl-4 py-1">
                                    "{aiInsight}"
                                </p>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center min-h-[400px]">
                        <Loader2 className="animate-spin text-emerald-400" size={40} />
                    </div>
                ) : (
                    <>
                        {/* At-a-Glance Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Mood Logs', value: totalMoodLogs, icon: Heart, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20' },
                                { label: 'Journal Entries', value: totalJournalEntries, icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
                                { label: 'CBT Sessions', value: totalCbtSessions, icon: Brain, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
                                { label: 'Avg Belief Shift', value: `${avgBeliefShift}%`, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className={`bg-black/30 backdrop-blur-md rounded-2xl border ${stat.border} p-5 flex flex-col items-center text-center gap-3 shadow-xl`}
                                >
                                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                        <stat.icon size={20} className={stat.color} />
                                    </div>
                                    <span className="text-3xl font-semibold text-white/90">{stat.value}</span>
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">{stat.label}</span>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Core Affect Area Chart */}
                            <div className="bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl">
                                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/50 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                                    Core Affect Trends (Mood)
                                </h3>
                                <div className="h-[280px] w-full">
                                    {moodData.length === 0 ? (
                                        <div className="w-full h-full flex items-center justify-center text-white/20 text-sm font-light italic">Not enough mood data for this period.</div>
                                    ) : (
                                        <ResponsiveContainer>
                                            <AreaChart data={moodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorValence" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorArousal" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} domain={[-1, 1]} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#000000cc', borderColor: '#ffffff20', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                                                    itemStyle={{ color: '#fff', fontSize: '13px' }}
                                                />
                                                <Area type="monotone" dataKey="valence" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorValence)" />
                                                <Area type="monotone" dataKey="arousal" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorArousal)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* CBT Reframing Bar Chart */}
                            <div className="bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl">
                                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/50 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                                    Thought Reframing Efficacy
                                </h3>
                                <div className="h-[280px] w-full">
                                    {cbtData.length === 0 ? (
                                        <div className="w-full h-full flex items-center justify-center text-white/20 text-sm font-light italic">No CBT sessions logged for this period.</div>
                                    ) : (
                                        <ResponsiveContainer>
                                            <BarChart data={cbtData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                                <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                                                <Tooltip
                                                    cursor={{ fill: '#ffffff05' }}
                                                    contentStyle={{ backgroundColor: '#000000cc', borderColor: '#ffffff20', borderRadius: '12px' }}
                                                />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                                <Bar dataKey="initialBelief" name="Initial Belief Severity" fill="#ffffff20" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="finalBelief" name="Belief After Reframing" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Mood Score Trend (from journal entries) */}
                            <div className="bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl">
                                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/50 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    Journal Mood Score Trend
                                </h3>
                                <div className="h-[280px] w-full">
                                    {moodScoreTrend.length === 0 ? (
                                        <div className="w-full h-full flex items-center justify-center text-white/20 text-sm font-light italic">No journal mood scores for this period.</div>
                                    ) : (
                                        <ResponsiveContainer>
                                            <LineChart data={moodScoreTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#000000cc', borderColor: '#ffffff20', borderRadius: '12px' }}
                                                    itemStyle={{ color: '#10b981', fontSize: '13px' }}
                                                />
                                                <Line type="monotone" dataKey="score" name="Mood Score" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Dominant Family Distribution */}
                            <div className="bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl">
                                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/50 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                                    Emotion Family Distribution
                                </h3>
                                <div className="h-[280px] w-full">
                                    {familyDistribution.length === 0 ? (
                                        <div className="w-full h-full flex items-center justify-center text-white/20 text-sm font-light italic">No emotion family data for this period.</div>
                                    ) : (
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie
                                                    data={familyDistribution}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius="45%"
                                                    outerRadius="75%"
                                                    paddingAngle={3}
                                                    strokeWidth={0}
                                                >
                                                    {familyDistribution.map((_, i) => (
                                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#000000cc', borderColor: '#ffffff20', borderRadius: '12px' }}
                                                    itemStyle={{ color: '#fff', fontSize: '13px' }}
                                                />
                                                <Legend
                                                    layout="vertical"
                                                    align="right"
                                                    verticalAlign="middle"
                                                    iconType="circle"
                                                    iconSize={8}
                                                    wrapperStyle={{ fontSize: '12px', color: '#ffffff80' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Cognitive Distortion Frequency */}
                            <div className="bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl">
                                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/50 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                                    Top Cognitive Distortions
                                </h3>
                                <div className="h-[280px] w-full">
                                    {distortionFrequency.length === 0 ? (
                                        <div className="w-full h-full flex items-center justify-center text-white/20 text-sm font-light italic">No distortion data for this period.</div>
                                    ) : (
                                        <ResponsiveContainer>
                                            <BarChart data={distortionFrequency} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                                                <XAxis type="number" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                                                <YAxis type="category" dataKey="name" stroke="#ffffff60" fontSize={10} tickLine={false} axisLine={false} width={120} />
                                                <Tooltip
                                                    cursor={{ fill: '#ffffff05' }}
                                                    contentStyle={{ backgroundColor: '#000000cc', borderColor: '#ffffff20', borderRadius: '12px' }}
                                                />
                                                <Bar dataKey="count" name="Frequency" fill="#f43f5e" radius={[0, 6, 6, 0]} barSize={20} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Journal Sentiment Breakdown */}
                            <div className="bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl">
                                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/50 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                                    Journal Sentiment Breakdown
                                </h3>
                                <div className="h-[280px] w-full">
                                    {sentimentPieData.length === 0 ? (
                                        <div className="w-full h-full flex items-center justify-center text-white/20 text-sm font-light italic">No journal sentiment data for this period.</div>
                                    ) : (
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie
                                                    data={sentimentPieData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius="45%"
                                                    outerRadius="75%"
                                                    paddingAngle={3}
                                                    strokeWidth={0}
                                                >
                                                    {sentimentPieData.map((entry, i) => {
                                                        const colorMap: Record<string, string> = {
                                                            'Positive': '#10b981', 'Negative': '#f43f5e', 'Neutral': '#64748b',
                                                            'Anxious': '#f59e0b', 'Hopeful': '#8b5cf6'
                                                        };
                                                        return <Cell key={i} fill={colorMap[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />;
                                                    })}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#000000cc', borderColor: '#ffffff20', borderRadius: '12px' }}
                                                    itemStyle={{ color: '#fff', fontSize: '13px' }}
                                                />
                                                <Legend
                                                    layout="vertical"
                                                    align="right"
                                                    verticalAlign="middle"
                                                    iconType="circle"
                                                    iconSize={8}
                                                    wrapperStyle={{ fontSize: '12px', color: '#ffffff80' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Journal Emotion Radar */}
                            <div className="bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl">
                                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/50 mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                    Journal Emotion Constellation
                                </h3>
                                <p className="text-xs text-white/30 mb-4 ml-4">Frequency of emotions detected by AI in your Smart Journal entries.</p>
                                <div className="h-[280px] w-full">
                                    {journalEmotions.length < 3 ? (
                                        <div className="w-full h-full flex items-center justify-center text-white/20 text-sm font-light italic text-center px-4">
                                            Keep logging in your Smart Journal. We need at least 3 distinct emotions to map your constellation.
                                        </div>
                                    ) : (
                                        <ResponsiveContainer>
                                            <RadarChart data={journalEmotions} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                                                <PolarGrid stroke="#ffffff20" />
                                                <PolarAngleAxis dataKey="emotion" tick={{ fill: '#ffffff60', fontSize: 12 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#000000cc', borderColor: '#ffffff20', borderRadius: '12px' }}
                                                    itemStyle={{ color: '#fbbf24' }}
                                                />
                                                <Radar
                                                    name="Frequency"
                                                    dataKey="count"
                                                    stroke="#fbbf24"
                                                    strokeWidth={2}
                                                    fill="#fbbf24"
                                                    fillOpacity={0.2}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Journaling Activity Heatmap */}
                            <div className="bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl">
                                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/50 mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                                    Journaling Activity
                                </h3>
                                <p className="text-xs text-white/30 mb-4 ml-4">How often you wrote in your journal.</p>
                                <div className="flex flex-wrap gap-[3px] mt-2">
                                    {heatmapCells.map((cell) => {
                                        const intensity = cell.count / maxHeatmapCount;
                                        const bg = cell.count === 0
                                            ? 'bg-white/[0.04]'
                                            : intensity > 0.7 ? 'bg-teal-400' : intensity > 0.4 ? 'bg-teal-400/60' : 'bg-teal-400/30';
                                        return (
                                            <div
                                                key={cell.date}
                                                title={`${cell.label}: ${cell.count} ${cell.count === 1 ? 'entry' : 'entries'}`}
                                                className={`w-4 h-4 md:w-5 md:h-5 rounded-[3px] ${bg} transition-colors hover:ring-1 hover:ring-teal-400/50 cursor-default`}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-2 mt-4 text-[10px] text-white/30 justify-end">
                                    <span>Less</span>
                                    <div className="w-3 h-3 rounded-sm bg-white/[0.04]" />
                                    <div className="w-3 h-3 rounded-sm bg-teal-400/30" />
                                    <div className="w-3 h-3 rounded-sm bg-teal-400/60" />
                                    <div className="w-3 h-3 rounded-sm bg-teal-400" />
                                    <span>More</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
