import { useMemo } from 'react';
import { MoodEntry } from '../types/mood';
import { groupEntriesByDate } from '../utils/trendCalculations';

interface EmotionHeatmapProps {
    entries: MoodEntry[];
}

export default function EmotionHeatmap({ entries }: EmotionHeatmapProps) {
    const data = useMemo(() => {
        const grouped = groupEntriesByDate(entries);
        const aggregated: Record<string, { valence: number, arousal: number, count: number }> = {};

        Object.keys(grouped).forEach(date => {
            const day = grouped[date];
            aggregated[date] = {
                valence: day.reduce((s, e) => s + e.compositeValence, 0) / day.length,
                arousal: day.reduce((s, e) => s + e.compositeArousal, 0) / day.length,
                count: day.length
            };
        });

        // Generate exactly 28 days back from today to fill a 4-week grid
        const heatmapData = [];
        const today = new Date();
        for (let i = 27; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            heatmapData.push({
                date: dateStr,
                stats: aggregated[dateStr] || null
            });
        }
        return heatmapData;
    }, [entries]);

    const getCellColor = (stats: { valence: number, count: number } | null) => {
        if (!stats || stats.count === 0) return 'bg-white/5 border-white/10'; // Empty

        // High positive
        if (stats.valence > 0.4) return 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
        // Mild positive
        if (stats.valence > 0.1) return 'bg-emerald-700 border-emerald-600';
        // Neutral
        if (stats.valence > -0.1) return 'bg-slate-600 border-slate-500';
        // Mild negative
        if (stats.valence > -0.4) return 'bg-rose-700 border-rose-600';
        // High negative
        return 'bg-rose-500 border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]';
    };

    return (
        <div className="w-full bg-black/40 backdrop-blur-xl border border-white/15 rounded-3xl p-6 relative shadow-2xl">
            <div className="mb-6">
                <h3 className="text-xl font-light tracking-wide">Consistency Map</h3>
                <span className="text-xs text-white/50 uppercase tracking-widest mt-1 block">Past 4 Weeks</span>
            </div>

            <div className="flex justify-center">
                <div className="grid grid-cols-7 gap-2 md:gap-3">
                    {/* Weekday Labels */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-[10px] text-white/30 uppercase tracking-widest text-center mb-1">
                            {day[0]}
                        </div>
                    ))}

                    {/* 28 Day Grid */}
                    {data.map((dayData) => (
                        <div
                            key={dayData.date}
                            title={`${dayData.date}: ${dayData.stats ? `${dayData.stats.count} logs (Avg V: ${dayData.stats.valence.toFixed(2)})` : 'No logs'}`}
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-md border transition-all hover:scale-110 cursor-pointer ${getCellColor(dayData.stats)}`}
                        />
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-8 flex items-center justify-between text-xs text-white/40 font-sans px-4">
                <span>Negative</span>
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-rose-500" />
                    <div className="w-3 h-3 rounded-sm bg-rose-700" />
                    <div className="w-3 h-3 rounded-sm bg-slate-600" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-700" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                </div>
                <span>Positive</span>
            </div>
        </div>
    );
}
