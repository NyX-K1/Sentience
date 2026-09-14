import { CognitiveDistortion } from '../types/reframer';

export const COGNITIVE_DISTORTIONS: CognitiveDistortion[] = [
    {
        id: 'all-or-nothing',
        name: 'All-or-Nothing Thinking',
        hook: "If it's not perfect, it's a disaster.",
        icon: '⚫',
        definition: "You see things in absolute extremes — black or white, success or failure, always or never. There's no middle ground, no gray area, no spectrum.",
        examples: [
            "I failed the test, I'm a complete idiot.",
            "If I can't do it perfectly, there's no point trying.",
            "She didn't text back — she must hate me."
        ],
        realityCheck: "Is there a middle ground between the two extremes I'm imagining?",
        visualMetaphor: "Like a light switch with no dimmer — but real life is full of dimmer switches.",
        colorAccent: '#6366f1',
        oppositeSkill: 'Spectrum Thinking — placing things on a continuum'
    },
    {
        id: 'overgeneralization',
        name: 'Overgeneralization',
        hook: 'One bad thing means everything is bad forever.',
        icon: '🔄',
        definition: "You take a single negative event and turn it into a never-ending pattern. Words like 'always', 'never', 'everyone', 'nothing' show up a lot.",
        examples: [
            "I always mess things up.",
            "Nobody ever listens to me.",
            "This kind of thing always happens to me."
        ],
        realityCheck: "Is this truly ALWAYS/NEVER, or am I taking one instance and making it a rule?",
        visualMetaphor: "Like seeing one rainy day and concluding the sun will never shine again.",
        colorAccent: '#8b5cf6',
        oppositeSkill: 'Specific Thinking — keeping events contained to their context'
    },
    {
        id: 'mental-filter',
        name: 'Mental Filter',
        hook: 'Zooming in on the one bad thing, ignoring everything else.',
        icon: '🔍',
        definition: "You fixate on a single negative detail and dwell on it so much that it darkens your entire view. The positive things become invisible.",
        examples: [
            "I got great feedback but one small criticism — the whole presentation was terrible.",
            "The party was fun but I said one awkward thing, so the night was ruined.",
            "99 things went right but I can only think about the 1 that didn't."
        ],
        realityCheck: "What am I filtering OUT? What would someone else notice about this situation?",
        visualMetaphor: "Like wearing sunglasses that only let through dark light.",
        colorAccent: '#a78bfa',
        oppositeSkill: 'Full Spectrum View — deliberately noticing the positive alongside the negative'
    },
    {
        id: 'disqualifying-positive',
        name: 'Disqualifying the Positive',
        hook: "Good things don't count.",
        icon: '❌',
        definition: "When something positive happens, you dismiss it: 'That doesn't count', 'They're just being nice', 'Anyone could do that'. You transform neutral or positive experiences into negative ones.",
        examples: [
            "She complimented me but she was probably just being polite.",
            "I got the job but they were probably desperate.",
            "That success doesn't count — it was easy."
        ],
        realityCheck: "If a friend told me this good thing happened to them, would I dismiss it too?",
        visualMetaphor: "Like receiving gifts and throwing them away unopened.",
        colorAccent: '#c084fc',
        oppositeSkill: "Positive Accounting — giving positive events their fair weight"
    },
    {
        id: 'mind-reading',
        name: 'Mind Reading',
        hook: "I know exactly what they're thinking (and it's bad).",
        icon: '🧠',
        definition: "You assume you know what other people are thinking — and it's almost always negative. Without any evidence, you're certain they're judging, disliking, or dismissing you.",
        examples: [
            "She looked at me weird — she thinks I'm incompetent.",
            "He didn't laugh at my joke — he thinks I'm boring.",
            "They're all thinking about how I messed up."
        ],
        realityCheck: "Do I actually have evidence for what they're thinking, or am I projecting my fears onto them?",
        visualMetaphor: "Like writing a script for other people and getting upset at lines you wrote for them.",
        colorAccent: '#e879f9',
        oppositeSkill: 'Perspective Checking — asking instead of assuming'
    },
    {
        id: 'fortune-telling',
        name: 'Fortune Telling',
        hook: 'I already know this will end badly.',
        icon: '🔮',
        definition: "You predict the future — and it's always negative. You treat your predictions as certain facts and act accordingly, often creating self-fulfilling prophecies.",
        examples: [
            "This presentation is going to be a disaster.",
            "I'll definitely get rejected if I apply.",
            "Things will never get better."
        ],
        realityCheck: "How many times have I predicted the worst and been wrong? Am I confusing a possibility with a certainty?",
        visualMetaphor: "Like reading from a crystal ball that only shows worst-case scenarios.",
        colorAccent: '#f472b6',
        oppositeSkill: "Possibility Thinking — considering multiple outcomes, not just the worst"
    },
    {
        id: 'catastrophizing',
        name: 'Catastrophizing',
        hook: 'Making mountains out of molehills.',
        icon: '🔭',
        definition: "You blow things out of proportion. A small mistake becomes a catastrophe. A minor setback becomes the end of the world. You imagine the absolute worst-case scenario and treat it as the most likely outcome.",
        examples: [
            "I made a typo in the email — they'll think I'm unprofessional and I'll get fired.",
            "My heart is racing — I must be having a heart attack.",
            "We had one argument — the relationship is over."
        ],
        realityCheck: "Am I blowing this up? On a scale of 1-10, how bad is this really? How will I see this in a year?",
        visualMetaphor: "Like looking through a magnifying glass at a scratch and seeing a canyon.",
        colorAccent: '#fb7185',
        oppositeSkill: "Right-Sizing — seeing things at their actual scale"
    },
    {
        id: 'minimization',
        name: 'Minimization',
        hook: "My strengths and successes are tiny and don't matter.",
        icon: '🔬',
        definition: "The opposite of magnification but for positive things — you shrink your achievements, strengths, and good qualities until they seem insignificant. Meanwhile, you magnify your flaws.",
        examples: [
            "Sure I finished the project but it wasn't that hard.",
            "I'm not actually smart, I just got lucky.",
            "My contribution didn't really matter."
        ],
        realityCheck: "Am I giving myself the same credit I'd give a friend in this situation?",
        visualMetaphor: "Like looking at your achievements through the wrong end of a telescope.",
        colorAccent: '#f9a8d4',
        oppositeSkill: "Fair Self-Assessment — acknowledging strengths with the same energy you acknowledge weaknesses"
    },
    {
        id: 'emotional-reasoning',
        name: 'Emotional Reasoning',
        hook: 'I feel it, therefore it must be true.',
        icon: '🫀',
        definition: "You take your feelings as evidence of truth. If you feel stupid, you must BE stupid. If you feel hopeless, the situation must BE hopeless. Emotions become facts.",
        examples: [
            "I feel like a failure, so I must be one.",
            "I feel anxious about flying, so it must be dangerous.",
            "I feel unlovable, so nobody will ever love me."
        ],
        realityCheck: "Is this a FEELING or a FACT? Can feelings be inaccurate signals?",
        visualMetaphor: "Like checking the weather by looking at your mood instead of looking outside.",
        colorAccent: '#ef4444',
        oppositeSkill: "Feeling-Fact Separation — 'I feel X, but the facts show Y'"
    },
    {
        id: 'should-statements',
        name: 'Should Statements',
        hook: 'I should, I must, I have to, I ought to...',
        icon: '📏',
        definition: "You have a rigid set of rules about how you and others should behave. When reality doesn't match, you feel guilt (for yourself) or anger (at others). These 'shoulds' create constant pressure and disappointment.",
        examples: [
            "I should be further ahead in life by now.",
            "She should know what I need without me telling her.",
            "I shouldn't feel this way."
        ],
        realityCheck: "Says who? Is this a preference I'm treating as a law? What if I replaced 'should' with 'I'd prefer'?",
        visualMetaphor: "Like carrying a rulebook for the universe — and being angry that the universe didn't read it.",
        colorAccent: '#f97316',
        oppositeSkill: "Flexible Preference — 'I'd like' instead of 'I must'"
    },
    {
        id: 'labeling',
        name: 'Labeling',
        hook: "I'm not someone who made a mistake — I AM the mistake.",
        icon: '🏷️',
        definition: "Instead of describing a specific behavior or event, you attach a global, fixed label to yourself or others. You go from 'I made an error' to 'I'm an idiot'.",
        examples: [
            "I'm such a loser.",
            "He's a terrible person.",
            "I'm broken."
        ],
        realityCheck: "Am I confusing a behavior with an identity? Would I label a friend this harshly for the same thing?",
        visualMetaphor: "Like slapping a permanent sticker on a person based on a single moment.",
        colorAccent: '#eab308',
        oppositeSkill: "Behavioral Description — describing what happened, not who someone IS"
    },
    {
        id: 'personalization',
        name: 'Personalization',
        hook: "Everything is my fault.",
        icon: '🎯',
        definition: "You take excessive personal responsibility for things that aren't entirely (or at all) in your control. When something goes wrong, you automatically assume it's because of you.",
        examples: [
            "My friend seems upset — I must have done something wrong.",
            "The project failed — it's all my fault.",
            "My child is struggling in school — I'm a terrible parent."
        ],
        realityCheck: "What other factors contributed? Am I taking responsibility for things outside my control?",
        visualMetaphor: "Like standing in a rainstorm and apologizing for the weather.",
        colorAccent: '#22c55e',
        oppositeSkill: "Contribution Analysis — honestly assessing your actual share of responsibility"
    },
    {
        id: 'blame',
        name: 'Blame',
        hook: "It's entirely their fault, not mine.",
        icon: '👉',
        definition: "The opposite of personalization — you hold other people entirely responsible for your pain and refuse to acknowledge any role you might play. You feel powerless because the cause is always external.",
        examples: [
            "My life is miserable because of my parents.",
            "I'm only angry because they provoked me.",
            "If they hadn't done X, I'd be fine."
        ],
        realityCheck: "Even if they contributed, is there anything in MY power to change? Am I giving away my agency?",
        visualMetaphor: "Like being in the driver's seat but insisting someone else is steering.",
        colorAccent: '#14b8a6',
        oppositeSkill: "Ownership + Agency — acknowledging what IS in your control"
    },
    {
        id: 'fallacy-of-fairness',
        name: 'Fallacy of Fairness',
        hook: "This isn't fair, and that means it's wrong.",
        icon: '⚖️',
        definition: "You measure every situation against your personal standard of fairness. When life doesn't match your fairness rules, you feel bitter and resentful. The problem: everyone's definition of 'fair' is different.",
        examples: [
            "I work harder than everyone else — it's not fair I don't get recognized.",
            "I do everything right and bad things still happen.",
            "They have it so much easier than me."
        ],
        realityCheck: "Is fairness a universal law or my personal expectation? Can I seek improvement without requiring perfect fairness first?",
        visualMetaphor: "Like expecting the ocean to be flat because waves aren't 'fair'.",
        colorAccent: '#06b6d4',
        oppositeSkill: "Acceptance + Advocacy — accepting unfairness exists while still working to improve things"
    },
    {
        id: 'fallacy-of-change',
        name: 'Fallacy of Change',
        hook: "If only they would change, I'd be happy.",
        icon: '🔧',
        definition: "You believe your happiness depends on other people changing their behavior. You pressure others to change to suit your needs, and feel frustrated or hopeless when they don't.",
        examples: [
            "If my partner would just be more affectionate, I'd be happy.",
            "If my boss would give me more autonomy, I'd enjoy work.",
            "Things will be fine once they change."
        ],
        realityCheck: "Can I find a source of well-being that doesn't depend entirely on someone else's behavior?",
        visualMetaphor: "Like handing someone else the remote control to your happiness.",
        colorAccent: '#3b82f6',
        oppositeSkill: "Internal Locus — focusing on what YOU can change"
    },
    {
        id: 'heavens-reward',
        name: "Heaven's Reward Fallacy",
        hook: 'All my sacrifice and effort will eventually be rewarded.',
        icon: '🏆',
        definition: "You expect that all your self-sacrifice, hard work, and 'being good' will eventually be rewarded — and you feel bitter and angry when the reward doesn't come. You keep score of your suffering.",
        examples: [
            "I've given everything to this company — they OWE me.",
            "I've been so patient — when is it MY turn?",
            "I've sacrificed everything for my family and no one appreciates it."
        ],
        realityCheck: "Am I doing this because I genuinely want to, or because I'm keeping a tab and expecting payback?",
        visualMetaphor: "Like depositing coins into a cosmic vending machine that doesn't actually exist.",
        colorAccent: '#a855f7',
        oppositeSkill: "Intrinsic Motivation — doing things for their own value, not for expected reward"
    }
];
