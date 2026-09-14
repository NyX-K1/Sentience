import { useMemo } from 'react';
import { MoodEntry } from '../types/mood';
import { emotions as allEmotions } from '../data/emotions';
import { Clock, Sun, Sunset, Moon, Sunrise } from 'lucide-react';

interface EmotionRhythmProps {
    entries: MoodEntry[];
}

type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

const TIME_SLOTS: { key: TimeSlot; label: string; range: string; icon: typeof Sun; hours: number[] }[] = [
    { key: 'morning', label: 'Morning', range: '6am–12pm', icon: Sunrise, hours: [6, 7, 8, 9, 10, 11] },
    { key: 'afternoon', label: 'Afternoon', range: '12pm–5pm', icon: Sun, hours: [12, 13, 14, 15, 16] },
    { key: 'evening', label: 'Evening', range: '5pm–9pm', icon: Sunset, hours: [17, 18, 19, 20] },
    { key: 'night', label: 'Night', range: '9pm–6am', icon: Moon, hours: [21, 22, 23, 0, 1, 2, 3, 4, 5] },
];

const VALENCE_COLORS = {
    positive: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    neutral: { bg: 'bg-slate-500/15', border: 'border-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-400' },
    negative: { bg: 'bg-rose-500/15', border: 'border-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400' },
};

export default function EmotionRhythm({ entries }: EmotionRhythmProps) {
    const rhythmData = useMemo(() => {
        if (entries.length === 0) return null;

        const slotData: Record<TimeSlot, { emotions: string[]; valenceSum: number; count: number; families: Record<string, number> }> = {
            morning: { emotions: [], valenceSum: 0, count: 0, families: {} },
            afternoon: { emotions: [], valenceSum: 0, count: 0, families: {} },
            evening: { emotions: [], valenceSum: 0, count: 0, families: {} },
            night: { emotions: [], valenceSum: 0, count: 0, families: {} },
        };

        entries.forEach(entry => {
            const hour = new Date(entry.timestamp).getHours();
            const slot = TIME_SLOTS.find(s => s.hours.includes(hour))?.key || 'night';

            slotData[slot].count++;
            slotData[slot].valenceSum += entry.compositeValence;
            entry.emotions.forEach(em => {
                slotData[slot].emotions.push(em.emotionId);
            });
            if (slotData[slot].families[entry.dominantFamily] === undefined) {
                slotData[slot].families[entry.dominantFamily] = 0;
            }
            slotData[slot].families[entry.dominantFamily]++;
        });

        return TIME_SLOTS.map(slot => {
            const data = slotData[slot.key];
            const avgValence = data.count > 0 ? data.valenceSum / data.count : 0;

            // Find top emotion for this time slot
            const emotionCounts: Record<string, number> = {};
            data.emotions.forEach(id => { emotionCounts[id] = (emotionCounts[id] || 0) + 1; });
            const topEmotionId = Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)[0]?.[0];
            const topEmotion = allEmotions.find(e => e.id === topEmotionId);

            // Top family
            const topFamily = Object.entries(data.families).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

            const valenceType = avgValence > 0.1 ? 'positive' : avgValence < -0.1 ? 'negative' : 'neutral';

            return {
                ...slot,
                count: data.count,
                avgValence,
                topEmotion,
                topFamily,
                valenceType: valenceType as keyof typeof VALENCE_COLORS,
                uniqueEmotions: new Set(data.emotions).size,
            };
        });
    }, [entries]);

    // Find overall insight
    const insight = useMemo(() => {
        if (!rhythmData) return null;
        const active = rhythmData.filter(s => s.count > 0);
        if (active.length < 2) return null;

        const best = active.reduce((a, b) => a.avgValence > b.avgValence ? a : b);
        const worst = active.reduce((a, b) => a.avgValence < b.avgValence ? a : b);

        if (best.avgValence > 0.1 && worst.avgValence < -0.1) {
            return `You tend to feel best in the ${best.label.toLowerCase()} and lowest in the ${worst.label.toLowerCase()}.`;
        }
        if (best.avgValence > 0.1) {
            return `Your ${best.label.toLowerCase()} hours are your emotional peak.`;
        }
        return null;
    }, [rhythmData]);

    if (!rhythmData) {
        return (
            <div className="w-full h-80 flex flex-col items-center justify-center border border-white/10 border-dashed rounded-3xl bg-black/40 backdrop-blur-xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                    <Clock className="w-7 h-7 text-white/30" />
                </div>
                <h3 className="text-lg text-white/70 mb-2 font-medium">Rhythm Unavailable</h3>
                <p className="text-white/40 text-sm tracking-widest uppercase max-w-xs">Log entries at different times of day to reveal your emotional rhythm.</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-black/40 backdrop-blur-xl border border-white/15 rounded-3xl p-6 relative shadow-2xl">
            <div className="mb-6">
                <h3 className="text-xl font-light tracking-wide">Emotional Rhythm</h3>
                <span className="text-xs text-white/50 uppercase tracking-widest mt-1 block">When your emotions shift</span>
            </div>

            {/* Time Slot Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {rhythmData.map(slot => {
                    const Icon = slot.icon;
                    const colors = VALENCE_COLORS[slot.valenceType];
                    const hasData = slot.count > 0;

                    return (
                        <div
                            key={slot.key}
                            className={`rounded-2xl border p-4 transition-all ${hasData
                                ? `${colors.bg} ${colors.border}`
                                : 'bg-white/3 border-white/5'
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-3">
                                <Icon className={`w-4 h-4 ${hasData ? colors.text : 'text-white/20'}`} />
                                <span className={`text-xs uppercase tracking-widest ${hasData ? 'text-white/70' : 'text-white/20'}`}>
                                    {slot.label}
                                </span>
                            </div>

                            {hasData ? (
                                <>
                                    {/* Valence bar */}
                                    <div className="mb-3">
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${slot.avgValence > 0 ? 'bg-emerald-400' : slot.avgValence < -0.1 ? 'bg-rose-400' : 'bg-slate-400'
                                                    }`}
                                                style={{ width: `${Math.abs(slot.avgValence) * 100}%`, marginLeft: slot.avgValence < 0 ? 'auto' : undefined }}
                                            />
                                        </div>
                                    </div>

                                    {/* Top emotion */}
                                    {slot.topEmotion && (
                                        <div className="mb-2">
                                            <span className="text-sm font-medium text-white/80 block leading-tight">{slot.topEmotion.label}</span>
                                            <span className="text-[10px] text-white/30 uppercase tracking-wider">{slot.topFamily}</span>
                                        </div>
                                    )}

                                    {/* Meta */}
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                        <span className="text-[10px] text-white/25">{slot.count} log{slot.count !== 1 ? 's' : ''}</span>
                                        <span className="text-[10px] text-white/25">{slot.uniqueEmotions} unique</span>
                                    </div>
                                </>
                            ) : (
                                <div className="py-4 text-center">
                                    <span className="text-[10px] text-white/15 uppercase tracking-widest">No data yet</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Insight callout */}
            {insight && (
                <div className="mt-5 pt-4 border-t border-white/5 flex items-start gap-2">
                    <span className="text-amber-400/60 text-sm mt-0.5">✦</span>
                    <p className="text-sm text-white/40 leading-relaxed">{insight}</p>
                </div>
            )}
        </div>
    );
}
