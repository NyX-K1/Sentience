import { useMemo } from 'react';
import { MoodEntry } from '../types/mood';
import { emotions as allEmotions } from '../data/emotions';
import { TrendingUp, TrendingDown, Minus, Flame, Shield, Heart } from 'lucide-react';

interface WellbeingScoreProps {
    entries: MoodEntry[];
}

export default function WellbeingScore({ entries }: WellbeingScoreProps) {
    const analysis = useMemo(() => {
        if (entries.length === 0) return null;

        // Calculate overall valence balance
        const totalValence = entries.reduce((sum, e) => sum + e.compositeValence, 0);
        const avgValence = totalValence / entries.length;

        // Positive vs negative ratio
        const positive = entries.filter(e => e.compositeValence > 0.1).length;
        const negative = entries.filter(e => e.compositeValence < -0.1).length;
        const neutral = entries.length - positive - negative;

        // Emotional diversity — how many unique emotions used
        const uniqueEmotions = new Set(entries.flatMap(e => e.emotions.map(em => em.emotionId)));
        const diversityScore = Math.min(uniqueEmotions.size / 10, 1); // 0-1, 10+ emotions = max

        // Recent trend (last 7 vs prior 7)
        const sorted = [...entries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const recent = sorted.slice(0, Math.min(7, sorted.length));
        const prior = sorted.slice(7, Math.min(14, sorted.length));
        const recentAvg = recent.reduce((s, e) => s + e.compositeValence, 0) / recent.length;
        const priorAvg = prior.length > 0 ? prior.reduce((s, e) => s + e.compositeValence, 0) / prior.length : recentAvg;
        const trendDelta = recentAvg - priorAvg;

        // Logging streak — consecutive days with at least one entry
        const daySet = new Set(entries.map(e => new Date(e.timestamp).toISOString().split('T')[0]));
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.toISOString().split('T')[0];
            if (daySet.has(key)) streak++;
            else break;
        }

        // Composite wellbeing score: 0-100
        const valenceContribution = ((avgValence + 1) / 2) * 40; // max 40 points
        const diversityContribution = diversityScore * 25; // max 25 points
        const consistencyContribution = Math.min(streak / 7, 1) * 20; // max 20 points (7-day streak)
        const positivityRatio = entries.length > 0 ? (positive / entries.length) * 15 : 0; // max 15 points
        const score = Math.round(Math.max(0, Math.min(100, valenceContribution + diversityContribution + consistencyContribution + positivityRatio)));

        // Most frequent emotion
        const emotionCounts: Record<string, number> = {};
        entries.forEach(e => e.emotions.forEach(em => {
            emotionCounts[em.emotionId] = (emotionCounts[em.emotionId] || 0) + 1;
        }));
        const topEmotionId = Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)[0]?.[0];
        const topEmotion = allEmotions.find(e => e.id === topEmotionId);

        return {
            score,
            avgValence,
            positive,
            negative,
            neutral,
            uniqueEmotions: uniqueEmotions.size,
            diversityScore,
            trendDelta,
            streak,
            topEmotion,
            totalEntries: entries.length,
        };
    }, [entries]);

    if (!analysis) {
        return (
            <div className="w-full h-80 flex flex-col items-center justify-center border border-white/10 border-dashed rounded-3xl bg-black/40 backdrop-blur-xl p-6 text-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                    <Heart className="w-7 h-7 text-white/30" />
                </div>
                <h3 className="text-lg text-white/70 mb-2 font-medium">Wellbeing Score Locked</h3>
                <p className="text-white/40 text-sm tracking-widest uppercase max-w-xs">Log your first entry to begin tracking your emotional wellbeing.</p>
            </div>
        );
    }

    const { score, positive, negative, neutral, uniqueEmotions, trendDelta, streak, topEmotion, totalEntries } = analysis;

    // Score color
    const getScoreColor = (s: number) => {
        if (s >= 70) return 'text-emerald-400';
        if (s >= 45) return 'text-amber-400';
        return 'text-rose-400';
    };

    const getScoreGlow = (s: number) => {
        if (s >= 70) return 'shadow-[0_0_40px_rgba(52,211,153,0.2)]';
        if (s >= 45) return 'shadow-[0_0_40px_rgba(251,191,36,0.2)]';
        return 'shadow-[0_0_40px_rgba(244,63,94,0.2)]';
    };

    const getScoreLabel = (s: number) => {
        if (s >= 80) return 'Thriving';
        if (s >= 65) return 'Flourishing';
        if (s >= 50) return 'Balanced';
        if (s >= 35) return 'Navigating';
        return 'Struggling';
    };

    // Arc path for the score ring
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (score / 100) * circumference;

    return (
        <div className="w-full bg-black/40 backdrop-blur-xl border border-white/15 rounded-3xl p-6 relative shadow-2xl">
            <div className="mb-6">
                <h3 className="text-xl font-light tracking-wide">Emotional Wellbeing</h3>
                <span className="text-xs text-white/50 uppercase tracking-widest mt-1 block">Composite life score</span>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Score Circle */}
                <div className={`relative w-36 h-36 shrink-0 ${getScoreGlow(score)} rounded-full`}>
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                        <circle
                            cx="64" cy="64" r={radius}
                            fill="none"
                            stroke={score >= 70 ? '#34d399' : score >= 45 ? '#fbbf24' : '#f43f5e'}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">{getScoreLabel(score)}</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 flex-grow w-full">
                    {/* Trend */}
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                        {trendDelta > 0.05 ? (
                            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : trendDelta < -0.05 ? (
                            <TrendingDown className="w-5 h-5 text-rose-400 shrink-0" />
                        ) : (
                            <Minus className="w-5 h-5 text-white/40 shrink-0" />
                        )}
                        <div>
                            <span className="text-xs text-white/40 uppercase tracking-widest block">Trend</span>
                            <span className={`text-sm font-medium ${trendDelta > 0.05 ? 'text-emerald-400' : trendDelta < -0.05 ? 'text-rose-400' : 'text-white/60'}`}>
                                {trendDelta > 0.05 ? 'Improving' : trendDelta < -0.05 ? 'Declining' : 'Stable'}
                            </span>
                        </div>
                    </div>

                    {/* Streak */}
                    <div className="bg-white/5 border border-white/8 rounded-2xl p-3 flex items-center gap-3">
                        <Flame className={`w-5 h-5 shrink-0 ${streak >= 3 ? 'text-orange-400' : 'text-white/30'}`} />
                        <div>
                            <span className="text-xs text-white/40 uppercase tracking-widest block">Streak</span>
                            <span className="text-sm font-medium text-white/80">{streak} day{streak !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    {/* Emotional Range */}
                    <div className="bg-white/5 border border-white/8 rounded-2xl p-3 flex items-center gap-3">
                        <Shield className="w-5 h-5 text-violet-400 shrink-0" />
                        <div>
                            <span className="text-xs text-white/40 uppercase tracking-widest block">Range</span>
                            <span className="text-sm font-medium text-white/80">{uniqueEmotions} emotion{uniqueEmotions !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    {/* Balance Bar */}
                    <div className="bg-white/5 border border-white/8 rounded-2xl p-3">
                        <span className="text-xs text-white/40 uppercase tracking-widest block mb-2">Balance</span>
                        <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
                            {positive > 0 && <div className="bg-emerald-500 rounded-l-full" style={{ width: `${(positive / totalEntries) * 100}%` }} />}
                            {neutral > 0 && <div className="bg-slate-500" style={{ width: `${(neutral / totalEntries) * 100}%` }} />}
                            {negative > 0 && <div className="bg-rose-500 rounded-r-full" style={{ width: `${(negative / totalEntries) * 100}%` }} />}
                        </div>
                        <div className="flex justify-between mt-1.5 text-[9px] text-white/30">
                            <span>{positive}+</span>
                            <span>{negative}−</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top emotion callout */}
            {topEmotion && (
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-3">
                    <span className="text-xs text-white/30 uppercase tracking-widest">Most felt:</span>
                    <span className="text-sm text-white/70 font-medium">{topEmotion.label}</span>
                    <span className="text-[10px] text-white/20">({topEmotion.family})</span>
                </div>
            )}
        </div>
    );
}
