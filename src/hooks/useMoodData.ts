import { useState, useEffect, useMemo, useCallback } from 'react';

export type Sentiment = 'Positive' | 'Neutral' | 'Negative' | 'Anxious' | 'Hopeful';

export interface MoodLog {
    id: string;
    day: string; // e.g., "Mon", "Tue"
    value: number; // 1-10
    sentiment: Sentiment;
    tags: string[];
    timestamp: string; // JSON date string
    note?: string;
}

const STORAGE_KEY = 'sentience_mood_logs';

export const useMoodData = () => {
    const [logs, setLogs] = useState<MoodLog[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Sort by new to old
                setLogs(parsed.sort((a: MoodLog, b: MoodLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            } catch (e) {
                console.error("Failed to parse mood logs", e);
            }
        }
    }, []);

    const addLog = useCallback((log: Omit<MoodLog, 'id' | 'timestamp' | 'day'>) => {
        const newLog: MoodLog = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            day: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
            ...log
        };

        setLogs(prev => {
            const updated = [newLog, ...prev];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const analytics = useMemo(() => {
        // Last 7 days
        const last7Days = logs.filter(l => {
            const diffTime = Math.abs(new Date().getTime() - new Date(l.timestamp).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        });

        // Consistency Score (Days logged in last 7 days)
        const daysLogged = new Set(last7Days.map(l => new Date(l.timestamp).toDateString())).size;
        const consistencyScore = Math.round((daysLogged / 7) * 100);

        // Top 3 Emotions
        const emotionCounts: Record<string, number> = {};
        last7Days.forEach(l => {
            emotionCounts[l.sentiment] = (emotionCounts[l.sentiment] || 0) + 1;
        });
        const topEmotions = Object.entries(emotionCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name, count]) => ({ name, count }));

        // Trigger Map (Aggregated from all history)
        const tagMoods: Record<string, { total: number; count: number }> = {};
        logs.forEach(l => {
            l.tags?.forEach(t => {
                if (!tagMoods[t]) tagMoods[t] = { total: 0, count: 0 };
                tagMoods[t].total += l.value;
                tagMoods[t].count += 1;
            });
        });

        const triggerMap = Object.entries(tagMoods).map(([tag, data]) => {
            const avgMood = Math.round((data.total / data.count) * 10) / 10;
            return {
                tag,
                avgMood,
                dominantSentiment: avgMood > 7 ? 'Energized' : avgMood < 4 ? 'Anxious' : 'Neutral' as Sentiment
            };
        }).sort((a, b) => b.avgMood - a.avgMood).slice(0, 20); // Limit to top 20 tags

        // Time of Day Heatmap
        const timeSlots = { Morning: { total: 0, count: 0 }, Afternoon: { total: 0, count: 0 }, Evening: { total: 0, count: 0 } };
        logs.forEach(l => {
            const date = new Date(l.timestamp);
            const hour = date.getHours();
            if (hour >= 5 && hour < 12) {
                timeSlots.Morning.total += l.value;
                timeSlots.Morning.count++;
            } else if (hour >= 12 && hour < 17) {
                timeSlots.Afternoon.total += l.value;
                timeSlots.Afternoon.count++;
            } else {
                timeSlots.Evening.total += l.value;
                timeSlots.Evening.count++;
            }
        });

        // Spiral Detector (Last 3 logs)
        const recentLogs = logs.slice(0, 3);
        const isSpiral = recentLogs.length >= 3 && recentLogs.every(l => ['Negative', 'Anxious'].includes(l.sentiment));

        return {
            last7Days,
            consistencyScore,
            topEmotions,
            triggerMap,
            timeSlots,
            isSpiral
        };

    }, [logs]);

    return {
        logs,
        addLog,
        ...analytics
    };
};
