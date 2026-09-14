import { MoodEntry, EmotionFamily } from '../types/mood';
import { FAMILY_COLORS } from '../components/EmotionWheel';

export function groupEntriesByDate(entries: MoodEntry[]) {
    const grouped: Record<string, MoodEntry[]> = {};

    entries.forEach(entry => {
        // Extract YYYY-MM-DD
        const dateKey = new Date(entry.timestamp).toISOString().split('T')[0];
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(entry);
    });

    return grouped;
}

export function calculateDailyAverages(entries: MoodEntry[]) {
    const grouped = groupEntriesByDate(entries);

    return Object.keys(grouped).sort().map(date => {
        const dayEntries = grouped[date];
        const avgValence = dayEntries.reduce((sum, e) => sum + e.compositeValence, 0) / dayEntries.length;
        const avgArousal = dayEntries.reduce((sum, e) => sum + e.compositeArousal, 0) / dayEntries.length;

        return {
            date,
            valence: avgValence,
            arousal: avgArousal,
            count: dayEntries.length
        };
    });
}

export function calculateFamilyDistribution(entries: MoodEntry[]) {
    const distribution: Record<EmotionFamily, number> = {
        'Joy': 0, 'Trust': 0, 'Fear': 0, 'Surprise': 0,
        'Sadness': 0, 'Disgust': 0, 'Anger': 0, 'Anticipation': 0, 'Complex': 0
    };

    entries.forEach(entry => {
        if (distribution[entry.dominantFamily] !== undefined) {
            distribution[entry.dominantFamily]++;
        }
    });

    return Object.entries(distribution)
        .filter(([_, count]) => count > 0)
        .map(([family, count]) => ({
            name: family,
            value: count,
            fill: extractColor(FAMILY_COLORS[family as EmotionFamily])
        }))
        .sort((a, b) => b.value - a.value);
}

// Utility to grab a solid hex from our Tailwind gradient strings for Recharts
function extractColor(twGradient: string): string {
    if (!twGradient) return '#475569'; // slate-600 default

    // Quick heuristic: map tailwind color names to rough hexes for the charts
    // In a real app we'd compute this or have a dict.
    if (twGradient.includes('yellow') || twGradient.includes('amber')) return '#eab308';
    if (twGradient.includes('emerald') || twGradient.includes('green')) return '#10b981';
    if (twGradient.includes('violet') || twGradient.includes('fuchsia')) return '#8b5cf6';
    if (twGradient.includes('cyan') || twGradient.includes('sky')) return '#0ea5e9';
    if (twGradient.includes('blue') || twGradient.includes('indigo')) return '#3b82f6';
    if (twGradient.includes('lime') || twGradient.includes('olive')) return '#84cc16';
    if (twGradient.includes('red') || twGradient.includes('rose')) return '#f43f5e';
    if (twGradient.includes('orange')) return '#f97316';

    return '#94a3b8'; // slate-400
}

export function extractTriggerCorrelations(entries: MoodEntry[]) {
    const triggerMap: Record<string, { sumValence: number, count: number }> = {};

    entries.forEach(entry => {
        const allTriggers = [...(entry.triggers || []), ...(entry.customTriggers || [])];
        allTriggers.forEach(t => {
            if (!triggerMap[t]) triggerMap[t] = { sumValence: 0, count: 0 };
            triggerMap[t].sumValence += entry.compositeValence;
            triggerMap[t].count++;
        });
    });

    return Object.entries(triggerMap)
        .map(([trigger, data]) => ({
            trigger,
            avgValence: data.sumValence / data.count,
            count: data.count
        }))
        .filter(t => t.count > 1) // Only show recurring triggers
        .sort((a, b) => a.avgValence - b.avgValence); // Sort Negative to Positive
}
