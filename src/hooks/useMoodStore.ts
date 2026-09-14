import { useState, useEffect, useCallback } from 'react';
import { MoodEntry } from '../types/mood';

const MOOD_STORAGE_KEY = 'sentience_mood_tracker_logs';

export const useMoodStore = () => {
    const [entries, setEntries] = useState<MoodEntry[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial Load
    useEffect(() => {
        try {
            const stored = localStorage.getItem(MOOD_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as MoodEntry[];
                // Sort descending by timestamp
                setEntries(parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            }
        } catch (e) {
            console.error("Failed to parse mood tracker logs", e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save entry
    const addEntry = useCallback((entry: Omit<MoodEntry, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const newEntry: MoodEntry = {
            id: crypto.randomUUID(),
            timestamp: now,
            createdAt: now,
            updatedAt: now,
            ...entry
        };

        setEntries(prev => {
            const updated = [newEntry, ...prev];
            try {
                localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(updated));
            } catch (e) {
                console.error("Failed to save mood entry", e);
            }
            return updated;
        });

        return newEntry.id;
    }, []);

    // Delete entry
    const deleteEntry = useCallback((id: string) => {
        setEntries(prev => {
            const updated = prev.filter(e => e.id !== id);
            localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    return {
        entries,
        isLoaded,
        addEntry,
        deleteEntry
    };
};
