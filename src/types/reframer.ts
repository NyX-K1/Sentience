export interface CognitiveDistortion {
    id: string;
    name: string;
    hook: string;
    icon: string;
    definition: string;
    examples: string[];
    realityCheck: string;
    visualMetaphor: string;
    colorAccent: string;
    oppositeSkill: string;
}

export interface ThoughtReframerSession {
    id: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    currentStep: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    isComplete: boolean;

    // Step 1
    situation: string;
    contextTags: string[];
    situationDate?: string;

    // Step 2
    automaticThought: string;
    initialBelief: number;

    // Step 3
    initialEmotions: { emotionId: string; intensity: number }[];
    bodyMapRegions?: { region: string; sensation: string }[];

    // Step 4
    identifiedDistortions: string[];

    // Step 5
    evidenceFor: string[];
    evidenceAgainst: string[];

    // Step 6
    reframedThoughts: string[];
    selectedReframe: string;

    // Step 7
    finalBelief: number;
    finalEmotions: { emotionId: string; intensity: number }[];
    beliefShift: number;

    // Step 8
    personalTakeaway?: string;
    copingSuggestions: string[];

    // Meta
    durationMinutes?: number;
    source: 'manual' | 'mood-flow' | 'journal-flow';
}
