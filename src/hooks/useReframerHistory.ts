import { useState, useEffect, useCallback } from 'react';
import { ThoughtReframerSession } from '../types/reframer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useReframerHistory = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<ThoughtReframerSession[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const refresh = useCallback(async () => {
        if (!user) {
            setSessions([]);
            setIsLoaded(true);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('thought_reframing_sessions')
                .select(`
                    *,
                    trs_context_tags(tag),
                    trs_emotions(*),
                    trs_physical_sensations(*),
                    trs_distortions(distortion_id),
                    trs_evidence(*),
                    trs_brainstormed_alternatives(alternative_text),
                    trs_coping_strategies(strategy_text)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching reframing sessions:', error);
                return;
            }

            if (data) {
                // Map the database rows back to the shape expected by the frontend
                const mappedSessions: ThoughtReframerSession[] = data.map(row => ({
                    id: row.id,
                    createdAt: row.created_at,
                    updatedAt: row.created_at,
                    currentStep: 8,
                    isComplete: true,
                    situation: row.situation_description || '',
                    situationDate: row.situation_date || undefined,
                    contextTags: row.trs_context_tags?.map((t: any) => t.tag) || [],
                    automaticThought: row.automatic_thought || '',
                    initialBelief: row.initial_belief || 50,
                    initialEmotions: row.trs_emotions?.filter((e: any) => e.stage === 'initial').map((e: any) => ({ emotionId: e.emotion_id, intensity: e.intensity })) || [],
                    bodyMapRegions: row.trs_physical_sensations?.map((s: any) => ({ region: s.region, sensation: s.sensation })) || [],
                    identifiedDistortions: row.trs_distortions?.map((d: any) => d.distortion_id) || [],
                    evidenceFor: row.trs_evidence?.filter((e: any) => e.type === 'supporting').map((e: any) => e.evidence_text) || [],
                    evidenceAgainst: row.trs_evidence?.filter((e: any) => e.type === 'against').map((e: any) => e.evidence_text) || [],
                    reframedThoughts: row.trs_brainstormed_alternatives?.map((a: any) => a.alternative_text) || [],
                    selectedReframe: row.selected_reframe || '',
                    finalBelief: row.final_belief || 50,
                    finalEmotions: row.trs_emotions?.filter((e: any) => e.stage === 'final').map((e: any) => ({ emotionId: e.emotion_id, intensity: e.intensity })) || [],
                    beliefShift: row.belief_shift || 0,
                    personalTakeaway: row.takeaway || undefined,
                    copingSuggestions: row.trs_coping_strategies?.map((c: any) => c.strategy_text) || [],
                    durationMinutes: row.duration_minutes || undefined,
                    source: 'manual'
                }));
                setSessions(mappedSessions);
            }
        } catch (err) {
            console.error('Unexpected error fetching sessions:', err);
        } finally {
            setIsLoaded(true);
        }
    }, [user]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const deleteSession = useCallback(async (id: string) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('thought_reframing_sessions')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) {
                console.error('Error deleting reframing session:', error);
                return;
            }

            setSessions(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error('Unexpected error deleting session:', err);
        }
    }, [user]);

    // Analytics
    const analytics = {
        totalSessions: sessions.length,
        averageBeliefShift: sessions.length > 0
            ? Math.round(sessions.reduce((sum, s) => sum + s.beliefShift, 0) / sessions.length)
            : 0,
        mostCommonDistortions: (() => {
            const counts: Record<string, number> = {};
            sessions.forEach(s => s.identifiedDistortions.forEach(d => {
                counts[d] = (counts[d] || 0) + 1;
            }));
            return Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([id, count]) => ({ id, count, percentage: Math.round(count / sessions.length * 100) }));
        })(),
        averageDuration: sessions.length > 0
            ? Math.round(sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / sessions.length)
            : 0,
        contextTagFrequency: (() => {
            const counts: Record<string, number> = {};
            sessions.forEach(s => s.contextTags.forEach(t => {
                counts[t] = (counts[t] || 0) + 1;
            }));
            return Object.entries(counts).sort((a, b) => b[1] - a[1]);
        })()
    };

    return { sessions, isLoaded, deleteSession, refresh, analytics };
};
