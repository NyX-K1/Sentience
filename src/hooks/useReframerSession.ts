import { useState, useEffect, useCallback, useRef } from 'react';
import { ThoughtReframerSession } from '../types/reframer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const DRAFT_KEY = 'sentience_reframer_draft';

const createEmptySession = (): ThoughtReframerSession => ({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStep: 1,
    isComplete: false,
    situation: '',
    contextTags: [],
    automaticThought: '',
    initialBelief: 50,
    initialEmotions: [],
    identifiedDistortions: [],
    evidenceFor: [],
    evidenceAgainst: [],
    reframedThoughts: [],
    selectedReframe: '',
    finalBelief: 50,
    finalEmotions: [],
    beliefShift: 0,
    copingSuggestions: [],
    source: 'manual'
});

export const useReframerSession = () => {
    const { user } = useAuth();
    const [session, setSession] = useState<ThoughtReframerSession>(createEmptySession);
    const [hasDraft, setHasDraft] = useState(false);
    const startTime = useRef(Date.now());

    // Check for existing draft on mount
    useEffect(() => {
        try {
            const draft = localStorage.getItem(DRAFT_KEY);
            if (draft) {
                const parsed = JSON.parse(draft) as ThoughtReframerSession;
                if (!parsed.isComplete) {
                    setHasDraft(true);
                }
            }
        } catch { /* ignore */ }
    }, []);

    const resumeDraft = useCallback(() => {
        try {
            const draft = localStorage.getItem(DRAFT_KEY);
            if (draft) {
                setSession(JSON.parse(draft));
                setHasDraft(false);
            }
        } catch { /* ignore */ }
    }, []);

    const startFresh = useCallback(() => {
        const fresh = createEmptySession();
        setSession(fresh);
        setHasDraft(false);
        startTime.current = Date.now();
        localStorage.removeItem(DRAFT_KEY);
    }, []);

    // Auto-save draft on session changes
    useEffect(() => {
        if (session.situation || session.automaticThought) {
            const updated = { ...session, updatedAt: new Date().toISOString() };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
        }
    }, [session]);

    const updateSession = useCallback((updates: Partial<ThoughtReframerSession>) => {
        setSession(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
    }, []);

    const goToStep = useCallback((step: ThoughtReframerSession['currentStep']) => {
        setSession(prev => ({ ...prev, currentStep: step, updatedAt: new Date().toISOString() }));
    }, []);

    const completeSession = useCallback(async () => {
        const durationMinutes = Math.round((Date.now() - startTime.current) / 60000);
        const beliefShift = session.initialBelief - session.finalBelief;

        const completed: ThoughtReframerSession = {
            ...session,
            isComplete: true,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            beliefShift,
            durationMinutes
        };

        if (user) {
            try {
                const { data: sessionData, error } = await supabase
                    .from('thought_reframing_sessions')
                    .insert([{
                        user_id: user.id,
                        situation_description: session.situation,
                        situation_date: session.situationDate || new Date().toISOString(),
                        automatic_thought: session.automaticThought,
                        initial_belief: session.initialBelief,
                        final_belief: session.finalBelief,
                        belief_shift: beliefShift,
                        selected_reframe: session.selectedReframe,
                        takeaway: session.personalTakeaway || '',
                        duration_minutes: durationMinutes
                    }])
                    .select('id')
                    .single();

                if (error) {
                    console.error('Error saving reframing session to Supabase:', error);
                } else if (sessionData) {
                    // Insert Context Tags
                    if (session.contextTags.length > 0) {
                        await supabase.from('trs_context_tags').insert(session.contextTags.map(t => ({ session_id: sessionData.id, tag: t })));
                    }
                    // Insert Initial Emotions
                    if (session.initialEmotions.length > 0) {
                        await supabase.from('trs_emotions').insert(session.initialEmotions.map(e => ({ session_id: sessionData.id, emotion_id: e.emotionId, intensity: e.intensity, stage: 'initial' })));
                    }
                    // Insert Final Emotions
                    if (session.finalEmotions.length > 0) {
                        await supabase.from('trs_emotions').insert(session.finalEmotions.map(e => ({ session_id: sessionData.id, emotion_id: e.emotionId, intensity: e.intensity, stage: 'final' })));
                    }
                    // Insert Body Map Regions
                    if (session.bodyMapRegions && session.bodyMapRegions.length > 0) {
                        await supabase.from('trs_physical_sensations').insert(session.bodyMapRegions.map(r => ({ session_id: sessionData.id, region: r.region, sensation: r.sensation })));
                    }
                    // Insert Identified Distortions
                    if (session.identifiedDistortions.length > 0) {
                        await supabase.from('trs_distortions').insert(session.identifiedDistortions.map(d => ({ session_id: sessionData.id, distortion_id: d })));
                    }
                    // Insert Evidence For
                    if (session.evidenceFor.length > 0) {
                        await supabase.from('trs_evidence').insert(session.evidenceFor.map(e => ({ session_id: sessionData.id, evidence_text: e, type: 'supporting' })));
                    }
                    // Insert Evidence Against
                    if (session.evidenceAgainst.length > 0) {
                        await supabase.from('trs_evidence').insert(session.evidenceAgainst.map(e => ({ session_id: sessionData.id, evidence_text: e, type: 'against' })));
                    }
                    // Insert Reframed Thoughts (Alternatives)
                    if (session.reframedThoughts.length > 0) {
                        await supabase.from('trs_brainstormed_alternatives').insert(session.reframedThoughts.map(t => ({ session_id: sessionData.id, alternative_text: t })));
                    }
                    // Insert Coping Strategies
                    if (session.copingSuggestions.length > 0) {
                        await supabase.from('trs_coping_strategies').insert(session.copingSuggestions.map(s => ({ session_id: sessionData.id, strategy_text: s })));
                    }
                }

                if (error) {
                    console.error('Error saving reframing session to Supabase:', error);
                }
            } catch (err) {
                console.error('Unexpected error saving to Supabase:', err);
            }
        }

        // Save to history locally
        try {
            const historyKey = 'sentience_reframer_history';
            const existing = JSON.parse(localStorage.getItem(historyKey) || '[]') as ThoughtReframerSession[];
            existing.unshift(completed);
            localStorage.setItem(historyKey, JSON.stringify(existing));
            localStorage.removeItem(DRAFT_KEY);
        } catch { /* ignore */ }

        setSession(completed);
        return completed;
    }, [session, user]);

    return {
        session,
        hasDraft,
        resumeDraft,
        startFresh,
        updateSession,
        goToStep,
        completeSession
    };
};
