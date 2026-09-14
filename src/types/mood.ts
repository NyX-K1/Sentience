export type EmotionFamily = 'Joy' | 'Trust' | 'Fear' | 'Surprise' | 'Sadness' | 'Disgust' | 'Anger' | 'Anticipation' | 'Complex';

export interface EmotionDef {
    id: string;
    label: string;
    family: EmotionFamily;
    intensity: 1 | 2 | 3 | 4;
    valence: number;
    arousal: number;
    colorHex: string;
    quadrant: 'tense' | 'energized' | 'low' | 'calm';
    definition?: string;
    example?: string;
    bodySignals?: string[];
    cognitivePatterns?: string[];
    behavioralTendencies?: string[];
    healthyResponses?: string[];
    didYouKnow?: string;
    subFamily?: string;
    otherAttributes?: string;
}

export interface MoodEntry {
    id: string;
    userId: string;
    timestamp: string;
    timezone: string;
    emotions: {
        emotionId: string;
        intensity: number;
    }[];
    compositeValence: number;
    compositeArousal: number;
    dominantFamily: EmotionFamily;
    compoundDetected?: string;
    triggers: string[];
    customTriggers: string[];
    freeNote: string;
    linkedJournalId?: string;
    linkedCBTId?: string;
    source: 'manual' | 'notification' | 'journal-flow' | 'cbt-flow';
    createdAt: string;
    updatedAt: string;
}
