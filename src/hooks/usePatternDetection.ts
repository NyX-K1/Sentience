import { useMemo } from 'react';
import { MoodEntry } from '../types/mood';
import { groupEntriesByDate } from '../utils/trendCalculations';

export type InsightTier = 'nudge' | 'concern' | 'crisis' | 'positive';

export interface MoodInsight {
    id: string;
    tier: InsightTier;
    title: string;
    description: string;
    actionableAdvice?: string;
}

const CRISIS_KEYWORDS = [
    'suicide', 'kill myself', 'give up', 'hopeless',
    'die', 'end it all', 'worthless', 'can\'t go on',
    'not want to live'
];

export function usePatternDetection(entries: MoodEntry[]): MoodInsight[] {
    return useMemo(() => {
        const insights: MoodInsight[] = [];
        if (!entries || entries.length === 0) return insights;

        const grouped = groupEntriesByDate(entries);
        const sortedDates = Object.keys(grouped).sort(); // oldest to newest

        let consecutiveNegativeDays = 0;
        let consecutiveHighArousalNegativeDays = 0;

        // 1. Check for recent crisis keywords
        const recentEntries = [...entries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
        let crisisDetected = false;

        for (const entry of recentEntries) {
            const notes = entry.freeNote?.toLowerCase() || '';
            const triggers = (entry.triggers || []).concat(entry.customTriggers || []).join(' ').toLowerCase();
            const combinedText = `${notes} ${triggers}`;

            if (CRISIS_KEYWORDS.some(kw => combinedText.includes(kw))) {
                crisisDetected = true;
                break;
            }
        }

        if (crisisDetected) {
            insights.push({
                id: 'crisis-keyword',
                tier: 'crisis',
                title: 'Immediate Support Available',
                description: 'We noticed some difficult thoughts in your recent logs. You don\'t have to carry this alone. Professional, confidential help is available right now.',
            });
        }

        // 2. Analyze Temporal Patterns (Consecutive Days)
        // We look at the most recent 14 days of logged data
        const recentDates = sortedDates.slice(-14);

        for (const date of recentDates) {
            const dayEntries = grouped[date];
            const avgValence = dayEntries.reduce((s, e) => s + e.compositeValence, 0) / dayEntries.length;
            const avgArousal = dayEntries.reduce((s, e) => s + e.compositeArousal, 0) / dayEntries.length;

            if (avgValence <= -0.2) {
                consecutiveNegativeDays++;
                if (avgArousal >= 0.3) {
                    consecutiveHighArousalNegativeDays++;
                } else {
                    consecutiveHighArousalNegativeDays = 0;
                }
            } else {
                consecutiveNegativeDays = 0;
                consecutiveHighArousalNegativeDays = 0;
            }
        }

        // 3. Generate Insights based on temporal counts
        if (consecutiveNegativeDays >= 3 && consecutiveNegativeDays < 5) {
            insights.push({
                id: 'pattern-nudge-neg',
                tier: 'nudge',
                title: 'A Heavy Few Days',
                description: 'You\'ve logged predominantly difficult emotions for the last few days. It\'s okay to feel this way, but remember to be gentle with yourself.',
                actionableAdvice: 'Consider stepping back from high-demand tasks today or engaging in a grounding exercise from the Discover tab.'
            });
        }

        if (consecutiveNegativeDays >= 5 && !crisisDetected) {
            insights.push({
                id: 'pattern-concern-neg',
                tier: 'concern',
                title: 'Persistent Distressed State',
                description: `You've been experiencing extended negative valence. When the weather inside stays stormy for this long, reaching out can act as an umbrella.`,
                actionableAdvice: 'We strongly recommend talking to someone you trust, or exploring our Guided Breakthroughs to unpack this prolonged state.'
            });
        }

        if (consecutiveHighArousalNegativeDays >= 3 && !crisisDetected) {
            insights.push({
                id: 'pattern-concern-agitated',
                tier: 'concern',
                title: 'High Burnout Risk',
                description: 'You are logging states of high agitation (e.g., severe anxiety, anger) consistently. This taxes your nervous system heavily.',
                actionableAdvice: 'Focus strictly on physiological down-regulation today: deep slow breathing, cold water exposure, or quiet rest.'
            });
        }

        // 4. Look for positives (to keep things balanced)
        if (recentDates.length >= 3) {
            const last3Days = recentDates.slice(-3);
            let allLast3Positive = true;
            last3Days.forEach(date => {
                const dayAvg = grouped[date].reduce((s, e) => s + e.compositeValence, 0) / grouped[date].length;
                if (dayAvg <= 0.1) allLast3Positive = false;
            });

            if (allLast3Positive) {
                insights.push({
                    id: 'pattern-positive-streak',
                    tier: 'positive',
                    title: 'Momentum Building',
                    description: 'You\'ve had a solid streak of uplifting or peaceful days recently.',
                    actionableAdvice: 'Notice what is going right. What habits or environments are supporting this? Try to anchor them.'
                });
            }
        }

        // Ensure crisis always comes first, then concern, nudge, positive
        const tierWeights = { 'crisis': 0, 'concern': 1, 'nudge': 2, 'positive': 3 };
        return insights.sort((a, b) => tierWeights[a.tier] - tierWeights[b.tier]);

    }, [entries]);
}
