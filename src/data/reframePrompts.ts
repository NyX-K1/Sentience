export interface ReframePrompt {
    id: string;
    icon: string;
    text: string;
    starter: string;
}

export const REFRAME_PROMPTS: ReframePrompt[] = [
    {
        id: 'friend-advice',
        icon: '🗣️',
        text: 'What would I tell a close friend who had this thought?',
        starter: 'If my friend told me this, I would say...'
    },
    {
        id: 'evidence-based',
        icon: '⚖️',
        text: 'Based on the evidence, a more accurate thought might be...',
        starter: 'Looking at the evidence, a more balanced view is...'
    },
    {
        id: 'future-perspective',
        icon: '🔮',
        text: 'In 6 months, will I see this situation differently? How?',
        starter: 'In 6 months, I will probably see this as...'
    },
    {
        id: 'realistic-outcome',
        icon: '🔬',
        text: 'What\'s the most realistic outcome (not best, not worst)?',
        starter: 'The most realistic outcome is probably...'
    },
    {
        id: 'control-check',
        icon: '🧩',
        text: 'What part of this is in my control, and what isn\'t?',
        starter: 'What I can control is... What I can\'t control is...'
    }
];

export const COPING_SUGGESTIONS: Record<string, string> = {
    'all-or-nothing': "Try Spectrum Thinking — Can you place this on a scale of 0-100 instead of 0 or 100?",
    'overgeneralization': "Try Specific Thinking — Replace 'always' and 'never' with 'this time' or 'sometimes'.",
    'mental-filter': "Try Full Spectrum View — List 3 positive things alongside the negative one.",
    'disqualifying-positive': "Try Positive Accounting — Write down why this positive event genuinely matters.",
    'mind-reading': "Try Perspective Checking — Ask the person directly or consider 3 alternative explanations.",
    'fortune-telling': "Try Possibility Thinking — List 3 possible outcomes: worst, best, and most likely.",
    'catastrophizing': "Try Right-Sizing — Ask: how will I see this in 10 minutes? 10 months? 10 years?",
    'minimization': "Try Fair Self-Assessment — Give yourself the same credit you'd give your best friend.",
    'emotional-reasoning': "Try Feeling-Fact Separation — Write 'I feel X, but the facts show Y'.",
    'should-statements': "Try Flexible Preference — Replace one 'should' with 'I'd prefer' and notice how it feels.",
    'labeling': "Try Behavioral Description — Replace 'I am X' with 'I did X in this situation'.",
    'personalization': "Try Contribution Analysis — What percentage is truly your responsibility? What about other factors?",
    'blame': "Try Ownership + Agency — Even if they contributed, what's one thing in YOUR power to change?",
    'fallacy-of-fairness': "Try Acceptance + Advocacy — Accept unfairness exists while still working to improve things.",
    'fallacy-of-change': "Try Internal Locus — Focus on what YOU can change about your response to the situation.",
    'heavens-reward': "Try Intrinsic Motivation — Ask: would I do this even if no one ever noticed or thanked me?"
};

export const CONTEXT_TAGS = [
    'Work', 'Relationship', 'Family', 'Health', 'Social',
    'Finance', 'Self', 'Academic', 'Creative', 'Other'
];

export const CRISIS_KEYWORDS = [
    'suicidal', 'end it', 'self-harm', 'hurt myself', 'want to die',
    'no point', "can't go on", 'kill myself', 'not worth living', 'better off dead'
];
