import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ClinicalReportPDF, ClinicalReportProps } from '../components/ClinicalReportPDF';
import { ArrowLeft, Loader2, FileDown, CalendarDays, Home, ShieldCheck } from 'lucide-react';
import NeuralBackground from '../components/ui/flow-field-background';

type TimeRange = '30d' | '90d';

export default function DataExport() {
    const { user } = useAuth();
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState<ClinicalReportProps | null>(null);

    useEffect(() => {
        if (!user) return;
        generateReportData();
    }, [user, timeRange]);

    const generateReportData = async () => {
        setIsLoading(true);
        try {
            const today = new Date();
            const pastDate = new Date();
            if (timeRange === '30d') pastDate.setDate(today.getDate() - 30);
            if (timeRange === '90d') pastDate.setDate(today.getDate() - 90);

            const pastDateString = pastDate.toISOString();
            const periodDays = timeRange === '30d' ? 30 : 90;

            // ────── 1. Fetch Mood Logs (full) ──────
            const { data: moods } = await supabase
                .from('mood_logs')
                .select('*, mood_triggers(trigger_name)')
                .eq('user_id', user!.id)
                .gte('created_at', pastDateString)
                .order('created_at', { ascending: true });

            let avgValence = 0;
            let avgArousal = 0;
            const triggerCounts: Record<string, number> = {};
            const familyCounts: Record<string, number> = {};

            const moodTimeline = (moods || []).map(m => ({
                date: new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                valence: m.valence || 0,
                arousal: m.arousal || 0,
                dominantFamily: m.dominant_family || undefined,
                triggers: m.triggers || [],
                notes: m.notes || ''
            }));

            if (moods && moods.length > 0) {
                avgValence = moods.reduce((acc, m) => acc + (m.valence || 0), 0) / moods.length;
                avgArousal = moods.reduce((acc, m) => acc + (m.arousal || 0), 0) / moods.length;

                moods.forEach(m => {
                    if (m.mood_triggers && Array.isArray(m.mood_triggers)) {
                        m.mood_triggers.forEach((t: any) => {
                            const name = t.trigger_name;
                            triggerCounts[name] = (triggerCounts[name] || 0) + 1;
                        });
                    }
                    if (m.dominant_family) {
                        familyCounts[m.dominant_family] = (familyCounts[m.dominant_family] || 0) + 1;
                    }
                });
            }

            const topTriggers = Object.entries(triggerCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            const dominantFamilies = Object.entries(familyCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);

            // ────── 2. Fetch CBT Reframing Sessions (ALL columns) ──────
            const { data: reframes } = await supabase
                .from('thought_reframing_sessions')
                .select('*, trs_distortions(distortion_id)')
                .eq('user_id', user!.id)
                .gte('created_at', pastDateString)
                .order('created_at', { ascending: false });

            let avgBeliefShift = 0;
            let avgDuration = 0;
            const distortionCounts: Record<string, number> = {};
            const recentReframes: { thought: string; reframe: string }[] = [];

            const allSessions = (reframes || []).map(r => ({
                date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                situation: r.situation_description || '',
                thought: r.automatic_thought || '',
                distortions: r.cognitive_distortions || [],
                initialBelief: r.initial_belief || 0,
                finalBelief: r.final_belief || 0,
                reframe: r.selected_reframe || '',
                takeaway: r.takeaway || '',
                duration: r.duration_minutes || 0,
                initialEmotions: r.initial_emotions || [],
                finalEmotions: r.final_emotions || [],
            }));

            if (reframes && reframes.length > 0) {
                const totalShift = reframes.reduce((acc, r) => acc + Math.max(0, (r.initial_belief || 0) - (r.final_belief || 0)), 0);
                avgBeliefShift = totalShift / reframes.length;

                const durations = reframes.filter(r => r.duration_minutes).map(r => r.duration_minutes);
                avgDuration = durations.length > 0 ? durations.reduce((a: number, b: number) => a + b, 0) / durations.length : 0;

                reframes.forEach(r => {
                    if (r.trs_distortions && Array.isArray(r.trs_distortions)) {
                        r.trs_distortions.forEach((d: any) => {
                            const dId = d.distortion_id;
                            distortionCounts[dId] = (distortionCounts[dId] || 0) + 1;
                        });
                    }
                });

                for (const r of reframes) {
                    if (r.automatic_thought && r.selected_reframe) {
                        recentReframes.push({ thought: r.automatic_thought, reframe: r.selected_reframe });
                        if (recentReframes.length >= 3) break;
                    }
                }
            }

            const topDistortions = Object.entries(distortionCounts)
                .map(([name, count]) => ({ name: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            // ────── 3. Fetch Journal Entries (ALL columns) ──────
            const { data: journals } = await supabase
                .from('journal_entries')
                .select('*, journal_emotions(emotion_label), journal_distortions(distortion_label), journal_coping_strategies(strategy_text)')
                .eq('user_id', user!.id)
                .gte('created_at', pastDateString)
                .order('created_at', { ascending: false });

            const sentimentCounts: Record<string, number> = {};
            const journalEmotionCounts: Record<string, number> = {};
            const journalDistortionCounts: Record<string, number> = {};
            const copingCounts: Record<string, number> = {};
            const recentInsights: string[] = [];
            let totalMoodScore = 0;
            let moodScoreCount = 0;

            const allJournalEntries = (journals || []).map(j => {
                // Aggregate sentiment
                if (j.sentiment) {
                    sentimentCounts[j.sentiment] = (sentimentCounts[j.sentiment] || 0) + 1;
                }
                // Aggregate emotions
                if (j.journal_emotions && Array.isArray(j.journal_emotions)) {
                    j.journal_emotions.forEach((em: any) => {
                        const name = em.emotion_label;
                        journalEmotionCounts[name] = (journalEmotionCounts[name] || 0) + 1;
                    });
                }
                // Aggregate distortions
                if (j.journal_distortions && Array.isArray(j.journal_distortions)) {
                    j.journal_distortions.forEach((d: any) => {
                        const name = d.distortion_label;
                        journalDistortionCounts[name] = (journalDistortionCounts[name] || 0) + 1;
                    });
                }
                // Aggregate coping strategies
                if (j.journal_coping_strategies && Array.isArray(j.journal_coping_strategies)) {
                    j.journal_coping_strategies.forEach((c: any) => {
                        const name = c.strategy_text;
                        copingCounts[name] = (copingCounts[name] || 0) + 1;
                    });
                }
                // Core insights
                if (j.core_insight && recentInsights.length < 8) {
                    recentInsights.push(j.core_insight);
                }
                // Mood score
                if (j.mood_score != null) {
                    totalMoodScore += j.mood_score;
                    moodScoreCount++;
                }

                return {
                    date: new Date(j.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    sentiment: j.sentiment || 'N/A',
                    moodScore: j.mood_score || 0,
                    emotions: j.detected_emotions || [],
                    distortions: j.detected_distortions || [],
                    copingStrategies: j.coping_strategies || [],
                    insight: j.core_insight || '',
                    contentPreview: (j.content || j.raw_text || '').slice(0, 100),
                };
            });

            // Find predominant sentiment
            let predominantSentiment = 'N/A';
            let maxSentCount = 0;
            Object.entries(sentimentCounts).forEach(([sent, count]) => {
                if (count > maxSentCount) { maxSentCount = count; predominantSentiment = sent; }
            });

            const sentimentBreakdown = Object.entries(sentimentCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);

            const emotionFrequencies = Object.entries(journalEmotionCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);

            const distortionFrequencies = Object.entries(journalDistortionCounts)
                .map(([name, count]) => ({ name: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), count }))
                .sort((a, b) => b.count - a.count);

            const copingStrategies = Object.entries(copingCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);

            const avgMoodScore = moodScoreCount > 0 ? (totalMoodScore / moodScoreCount).toFixed(1) : 'N/A';

            // ────── 4. Fetch Journal Conversations ──────
            const journalIds = (journals || []).map(j => j.id);
            let conversationMessages: any[] = [];
            if (journalIds.length > 0) {
                const { data: convos } = await supabase
                    .from('journal_conversations')
                    .select('*')
                    .in('journal_id', journalIds)
                    .order('created_at', { ascending: true });
                conversationMessages = convos || [];
            }

            const totalConvoMessages = conversationMessages.length;
            const entriesWithConvos = new Set(conversationMessages.map(c => c.journal_id)).size;
            const avgPerEntry = entriesWithConvos > 0 ? (totalConvoMessages / entriesWithConvos).toFixed(1) : '0';

            // Build conversation samples (latest 3 journal entries that have conversations)
            const convosByJournal: Record<string, any[]> = {};
            conversationMessages.forEach(c => {
                if (!convosByJournal[c.journal_id]) convosByJournal[c.journal_id] = [];
                convosByJournal[c.journal_id].push(c);
            });

            const conversationSamples = Object.entries(convosByJournal)
                .slice(0, 3)
                .map(([journalId, msgs]) => {
                    const journal = (journals || []).find(j => j.id === journalId);
                    return {
                        journalDate: journal
                            ? new Date(journal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : 'Unknown',
                        messages: msgs.map(m => ({ role: m.role, text: m.message }))
                    };
                });

            // ────── 5. Cross-Feature Analysis ──────
            // Find common distortions between CBT and journal
            const cbtDistortionSet = new Set(Object.keys(distortionCounts));
            const journalDistortionSet = new Set(Object.keys(journalDistortionCounts));
            const commonDistortions = [...cbtDistortionSet].filter(d => journalDistortionSet.has(d))
                .map(d => d.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

            // Unique active days
            const allDates = new Set<string>();
            moods?.forEach(m => allDates.add(new Date(m.created_at).toISOString().split('T')[0]));
            journals?.forEach(j => allDates.add(new Date(j.created_at).toISOString().split('T')[0]));
            reframes?.forEach(r => allDates.add(new Date(r.created_at).toISOString().split('T')[0]));
            const activeDays = allDates.size;

            const totalDataPoints = (moods?.length || 0) + (journals?.length || 0) + (reframes?.length || 0) + totalConvoMessages;

            const engagementRate = ((activeDays / periodDays) * 100).toFixed(0);
            const engagementNote = `Over the ${periodDays}-day period, the user was active on ${activeDays} days (${engagementRate}% engagement rate). ` +
                `They logged ${moods?.length || 0} mood entries, wrote ${journals?.length || 0} journal entries, completed ${reframes?.length || 0} CBT sessions, ` +
                `and exchanged ${totalConvoMessages} conversational messages across ${entriesWithConvos} journal entries.`;

            // ────── Build final report ──────
            const dateRangeStr = `${pastDate.toLocaleDateString()} - ${today.toLocaleDateString()}`;

            setReportData({
                dateRange: dateRangeStr,
                generationDate: today.toLocaleDateString(),
                metrics: {
                    overview: {
                        totalDataPoints,
                        activeDays,
                        periodDays,
                    },
                    mood: {
                        totalLogs: moods?.length || 0,
                        avgValence: avgValence.toFixed(2),
                        avgArousal: avgArousal.toFixed(2),
                        topTriggers,
                        dominantFamilies,
                        timeline: moodTimeline,
                    },
                    cbt: {
                        totalSessions: reframes?.length || 0,
                        avgBeliefShift: avgBeliefShift.toFixed(1),
                        avgDuration: avgDuration.toFixed(0),
                        topDistortions,
                        recentReframes,
                        allSessions,
                    },
                    journal: {
                        totalEntries: journals?.length || 0,
                        avgMoodScore,
                        predominantSentiment,
                        sentimentBreakdown,
                        emotionFrequencies,
                        distortionFrequencies,
                        copingStrategies,
                        recentInsights,
                        allEntries: allJournalEntries,
                    },
                    conversations: {
                        totalMessages: totalConvoMessages,
                        avgPerEntry,
                        samples: conversationSamples,
                    },
                    crossFeature: {
                        commonDistortions,
                        engagementNote,
                    },
                }
            });

        } catch (error) {
            console.error('Error compiling clinical report:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-violet-950 text-white relative flex flex-col items-center">
            {/* Shader bg */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
                <NeuralBackground color="#10b981" particleCount={150} speed={0.2} trailOpacity={0.05} />
            </div>

            {/* Header */}
            <div className="relative z-10 w-full max-w-4xl px-4 pt-6 flex justify-between items-center">
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
            </div>

            <main className="relative z-10 w-full max-w-4xl px-4 py-16 flex flex-col flex-1">

                {/* Title */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-emerald-400/10 border border-emerald-400/20 mb-6 relative">
                        <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full"></div>
                        <ShieldCheck className="text-emerald-400 relative z-10" size={36} />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extralight tracking-wide mb-4">
                        Clinical <span className="font-semibold text-emerald-400">Data Export</span>
                    </h1>
                    <p className="text-white/50 font-light tracking-wide max-w-xl mx-auto leading-relaxed">
                        Generate a comprehensive, clinical-grade PDF summary of your mental wellbeing data.
                        This multi-page report covers mood tracking, journaling, CBT sessions, and therapeutic conversations — designed to be securely shared with therapists or practitioners.
                    </p>
                </div>

                {/* Report Preview Stats */}
                {reportData && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-xl mx-auto w-full"
                    >
                        {[
                            { label: 'Data Points', value: reportData.metrics.overview.totalDataPoints },
                            { label: 'Active Days', value: reportData.metrics.overview.activeDays },
                            { label: 'Mood Logs', value: reportData.metrics.mood.totalLogs },
                            { label: 'Journal Entries', value: reportData.metrics.journal.totalEntries },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                                <span className="text-lg font-semibold text-emerald-400">{stat.value}</span>
                                <span className="block text-[9px] uppercase tracking-[0.15em] text-white/40 mt-1">{stat.label}</span>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Configuration Card */}
                <div className="w-full max-w-xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">

                    {/* Glowing highlight */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-50"></div>

                    <div className="flex flex-col gap-8 items-center">
                        <div className="w-full">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-[0.15em] mb-4 block text-center">Select Time Range</label>
                            <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-full w-full">
                                {(['30d', '90d'] as TimeRange[]).map((tr) => (
                                    <button
                                        key={tr}
                                        onClick={() => setTimeRange(tr)}
                                        className={`flex-1 py-3 rounded-full text-sm font-medium uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${timeRange === tr ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/20' : 'text-white/40 hover:text-white/80'
                                            }`}
                                    >
                                        <CalendarDays size={16} className={timeRange === tr ? 'text-black/60' : ''} />
                                        {tr === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

                        {/* Report contents summary */}
                        <div className="w-full">
                            <span className="text-[10px] text-white/30 uppercase tracking-[0.15em] block mb-3 text-center">Report Includes</span>
                            <div className="grid grid-cols-2 gap-2 text-xs text-white/40">
                                {[
                                    'Executive Summary',
                                    'Affect & Triggers',
                                    'Cognitive Restructuring',
                                    'Journal Analysis',
                                    'Therapy Conversations',
                                    'Cross-Feature Patterns'
                                ].map((section, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 shrink-0" />
                                        {section}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

                        <div className="w-full text-center">
                            <AnimatePresence mode="wait">
                                {isLoading || !reportData ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="py-4 px-8 rounded-full border border-white/10 bg-white/5 inline-flex items-center justify-center min-w-[280px]"
                                    >
                                        <Loader2 className="animate-spin text-emerald-400 mr-3" size={20} />
                                        <span className="text-emerald-400/80 font-medium tracking-wide">Compiling Comprehensive Report...</span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="ready"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <PDFDownloadLink
                                            document={<ClinicalReportPDF {...reportData} />}
                                            fileName={`Sentience_Clinical_Report_${timeRange}_${new Date().toISOString().split('T')[0]}.pdf`}
                                            className="group relative px-8 py-4 rounded-full overflow-hidden border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400 hover:text-black transition-all duration-500 flex items-center justify-center gap-3 w-full sm:w-auto mx-auto shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] font-medium tracking-wide"
                                        >
                                            <FileDown size={20} className="transition-transform group-hover:-translate-y-0.5" />
                                            Download Clinical PDF ({reportData.metrics.overview.totalDataPoints} data points)
                                        </PDFDownloadLink>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <p className="text-[10px] text-white/30 uppercase tracking-[0.1em] mt-6 max-w-sm mx-auto">
                                The generated PDF contains personal health information. Handle with care.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
