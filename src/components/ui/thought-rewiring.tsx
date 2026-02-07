import React, { useState, useEffect, useRef } from 'react';
import { X, Lightbulb, TrendingUp, Sparkles, Brain, ArrowRight, CheckCircle2, Loader2, Wind } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import BreathingTimer from './breathing-timer';
import ProgressiveMuscleRelaxation from './progressive-muscle-relaxation';

interface ThoughtRewiringProps {
    onClose: () => void;
}

const cognitiveDistortions = [
    'None',
    'Catastrophizing',
    'All-or-Nothing Thinking',
    'Mind Reading',
    'Emotional Reasoning',
    'Overgeneralization'
];

const ThoughtRewiring: React.FC<ThoughtRewiringProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [apiKey, setApiKey] = useState('');

    // Step 1 fields
    const [situation, setSituation] = useState('');
    const [automaticThought, setAutomaticThought] = useState('');
    const [distortion, setDistortion] = useState('None');
    const [initialDistress, setInitialDistress] = useState(5);

    // Step 2 fields
    const [evidenceFor, setEvidenceFor] = useState('');
    const [evidenceAgainst, setEvidenceAgainst] = useState('');
    const [isLoadingCounterEvidence, setIsLoadingCounterEvidence] = useState(false);

    // Step 3 fields
    const [balancedThought, setBalancedThought] = useState('');
    const [isGeneratingBalanced, setIsGeneratingBalanced] = useState(false);

    // Step 4 fields
    const [finalDistress, setFinalDistress] = useState(5);
    const [showToast, setShowToast] = useState(false);

    // Relaxation features
    const [showPreCalming, setShowPreCalming] = useState(false);
    const [showMidBreak, setShowMidBreak] = useState(false);
    const [showPMR, setShowPMR] = useState(false);
    const [pmrDuration, setPmrDuration] = useState<'5min' | '15min'>('5min');
    const [hasShownPreCalming, setHasShownPreCalming] = useState(false);
    const lastInteractionTime = useRef<number>(Date.now());

    // Load API key
    useEffect(() => {
        const stored = localStorage.getItem('gemini_api_key');
        if (stored) setApiKey(stored);
    }, []);

    // Calculate improvement
    const improvement = initialDistress > 0
        ? Math.max(0, Math.round(((initialDistress - finalDistress) / initialDistress) * 100))
        : 0;

    // AI: Generate counter-evidence
    const handleAskAICounterEvidence = async () => {
        if (!situation.trim() || !automaticThought.trim()) {
            return;
        }

        setIsLoadingCounterEvidence(true);

        // Demo mode fallback
        if (!apiKey) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const demoCounterEvidence = `• This could be a routine meeting about upcoming projects\n• No prior warnings or negative feedback have been given\n• Regular check-ins are normal in professional settings`;
            setEvidenceAgainst(evidenceAgainst + (evidenceAgainst ? '\n\n' : '') + demoCounterEvidence);
            setIsLoadingCounterEvidence(false);
            return;
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

            const prompt = `You are a CBT therapist helping a user challenge negative thoughts.

Situation: "${situation}"
Automatic Thought: "${automaticThought}"

Generate 3 logical, alternative explanations that challenge this negative thought. Focus on realistic, evidence-based possibilities. Format as bullet points starting with "•".`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            setEvidenceAgainst(evidenceAgainst + (evidenceAgainst ? '\n\n' : '') + text);
        } catch (err) {
            // Fallback to demo mode on error
            const demoCounterEvidence = `• This could be a routine meeting about upcoming projects\n• No prior warnings or negative feedback have been given\n• Regular check-ins are normal in professional settings`;
            setEvidenceAgainst(evidenceAgainst + (evidenceAgainst ? '\n\n' : '') + demoCounterEvidence);
        } finally {
            setIsLoadingCounterEvidence(false);
        }
    };

    // AI: Generate balanced thought
    const handleGenerateBalancedThought = async () => {
        setIsGeneratingBalanced(true);

        // Demo mode
        if (!apiKey || !evidenceFor.trim() || !evidenceAgainst.trim()) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const demo = `Even though ${evidenceFor.toLowerCase().substring(0, 50)}..., the reality is ${evidenceAgainst.toLowerCase().substring(0, 50)}..., therefore a more balanced perspective acknowledges both concerns and countering evidence.`;
            setBalancedThought(demo);
            setIsGeneratingBalanced(false);
            setCurrentStep(4);
            return;
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

            const prompt = `Generate a balanced thought using CBT principles.

Evidence FOR the negative thought:
${evidenceFor}

Evidence AGAINST the negative thought:
${evidenceAgainst}

Use this EXACT formula: "Even though [evidence for], the reality is [evidence against], therefore [balanced conclusion]."

Be concise and specific. Return only the balanced thought, nothing else.`;

            const result = await model.generateContent(prompt);
            setBalancedThought(result.response.text().trim());
            setCurrentStep(4);
        } catch (err) {
            const demo = `Even though ${evidenceFor.substring(0, 50)}..., the reality is ${evidenceAgainst.substring(0, 50)}..., therefore a more balanced perspective acknowledges both concerns and evidence.`;
            setBalancedThought(demo);
            setCurrentStep(4);
        } finally {
            setIsGeneratingBalanced(false);
        }
    };

    // Show toast when improvement detected
    useEffect(() => {
        if (currentStep === 4 && finalDistress < initialDistress) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        }
    }, [finalDistress, currentStep, initialDistress]);

    // Track user interactions for mid-session break detection
    const updateInteractionTime = () => {
        lastInteractionTime.current = Date.now();
    };

    // Inactivity detection for mid-session break
    useEffect(() => {
        if (currentStep >= 1 && currentStep <= 3 && !showMidBreak) {
            const checkInactivity = setInterval(() => {
                const inactiveTime = Date.now() - lastInteractionTime.current;
                // Show break prompt after 2 minutes of inactivity
                if (inactiveTime > 120000 && !showMidBreak) {
                    setShowMidBreak(true);
                }
            }, 30000); // Check every 30 seconds

            return () => clearInterval(checkInactivity);
        }
    }, [currentStep, showMidBreak]);

    // Render relaxation overlays
    if (showPreCalming) {
        return (
            <BreathingTimer
                pattern="2-4-6"
                duration={2}
                onClose={() => {
                    setShowPreCalming(false);
                    setHasShownPreCalming(true);
                }}
                onComplete={() => {
                    setShowPreCalming(false);
                    setHasShownPreCalming(true);
                }}
            />
        );
    }

    if (showMidBreak) {
        return (
            <BreathingTimer
                pattern="4-4-4-4"
                duration={1}
                onClose={() => {
                    setShowMidBreak(false);
                    updateInteractionTime();
                }}
                onComplete={() => {
                    setShowMidBreak(false);
                    updateInteractionTime();
                }}
            />
        );
    }

    if (showPMR) {
        return (
            <ProgressiveMuscleRelaxation
                duration={pmrDuration}
                onClose={() => setShowPMR(false)}
                onComplete={() => setShowPMR(false)}
            />
        );
    }

    return (
        <div
            className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-y-auto"
            onClick={updateInteractionTime}
            onKeyDown={updateInteractionTime}
        >
            <div className="max-w-6xl mx-auto p-6 md:p-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Thoughts and Exercises</h1>
                        <p className="text-purple-200">Transform negative thinking patterns with AI assistance and relaxation techniques</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-full bg-white/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all text-white hover:text-red-400"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className={`flex-1 h-2 rounded-full transition-all ${step <= currentStep ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>

                {/* Pre-Writing Calming Prompt */}
                {currentStep === 1 && !hasShownPreCalming && (
                    <div className="mb-6 bg-blue-500/10 border-2 border-blue-400/30 rounded-3xl p-6 animate-in fade-in slide-in-from-top duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-full">
                                <Wind className="text-blue-400" size={32} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1">Feeling overwhelmed?</h3>
                                <p className="text-blue-200">Start with a 2-minute breathing exercise to calm your mind</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPreCalming(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
                                >
                                    Start Breathing
                                </button>
                                <button
                                    onClick={() => setHasShownPreCalming(true)}
                                    className="px-6 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
                                >
                                    Skip
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 1: Situation & Emotion */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Brain className="text-purple-400" size={28} />
                                <h2 className="text-2xl font-bold text-white">Step 1: The Situation & Emotion</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-purple-200 font-medium mb-2">
                                        The Situation (The Trigger)
                                    </label>
                                    <textarea
                                        value={situation}
                                        onChange={(e) => setSituation(e.target.value)}
                                        placeholder="My boss emailed asking for a meeting at 4 PM..."
                                        className="w-full h-24 px-4 py-3 bg-white/10 border-2 border-white/20 rounded-2xl focus:border-purple-400 focus:outline-none resize-none text-white placeholder:text-white/40"
                                    />
                                </div>

                                <div>
                                    <label className="block text-purple-200 font-medium mb-2">
                                        Automatic Thought (The Interpretation)
                                    </label>
                                    <textarea
                                        value={automaticThought}
                                        onChange={(e) => setAutomaticThought(e.target.value)}
                                        placeholder="I made a mistake. I'm going to get fired..."
                                        className="w-full h-24 px-4 py-3 bg-red-500/10 border-2 border-red-400/30 rounded-2xl focus:border-red-400 focus:outline-none resize-none text-white placeholder:text-white/40"
                                    />
                                </div>

                                <div>
                                    <label className="block text-purple-200 font-medium mb-2">
                                        Identify the Cognitive Distortion
                                    </label>
                                    <select
                                        value={distortion}
                                        onChange={(e) => setDistortion(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-2xl focus:border-purple-400 focus:outline-none text-white"
                                    >
                                        {cognitiveDistortions.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-purple-200 font-medium mb-3">
                                        Initial Distress Level: <span className="text-purple-400 font-bold">{initialDistress}/10</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        value={initialDistress}
                                        onChange={(e) => setInitialDistress(Number(e.target.value))}
                                        className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
                                    />
                                    <div className="flex justify-between text-xs text-purple-300 mt-1">
                                        <span>No Distress</span>
                                        <span>Extreme Distress</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setCurrentStep(2)}
                                disabled={!situation.trim() || !automaticThought.trim()}
                                className="mt-8 w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                            >
                                Continue to Evidence
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: The Evidence Trial */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Lightbulb className="text-blue-400" size={28} />
                                <h2 className="text-2xl font-bold text-white">Step 2: The Evidence Trial</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Evidence FOR */}
                                <div>
                                    <label className="block text-purple-200 font-medium mb-2 flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-red-400"></span>
                                        Evidence FOR this thought
                                    </label>
                                    <textarea
                                        value={evidenceFor}
                                        onChange={(e) => setEvidenceFor(e.target.value)}
                                        placeholder="List facts that support your automatic thought..."
                                        className="w-full h-48 px-4 py-3 bg-red-500/10 border-2 border-red-400/30 rounded-2xl focus:border-red-400 focus:outline-none resize-none text-white placeholder:text-white/40"
                                    />
                                </div>

                                {/* Evidence AGAINST */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-purple-200 font-medium flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-green-400"></span>
                                            Evidence AGAINST this thought
                                        </label>
                                        <button
                                            onClick={handleAskAICounterEvidence}
                                            disabled={isLoadingCounterEvidence}
                                            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium rounded-full hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 transition-all flex items-center gap-2"
                                        >
                                            <Sparkles size={14} />
                                            {isLoadingCounterEvidence ? 'Asking AI...' : 'Ask AI'}
                                        </button>
                                    </div>
                                    <textarea
                                        value={evidenceAgainst}
                                        onChange={(e) => setEvidenceAgainst(e.target.value)}
                                        placeholder="List facts that contradict your automatic thought..."
                                        className="w-full h-48 px-4 py-3 bg-green-500/10 border-2 border-green-400/30 rounded-2xl focus:border-green-400 focus:outline-none resize-none text-white placeholder:text-white/40"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="px-6 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setCurrentStep(3)}
                                    disabled={!evidenceFor.trim() || !evidenceAgainst.trim()}
                                    className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                                >
                                    Generate Balanced Thought
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: The Re-wire */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Brain className="text-green-400" size={28} />
                                <h2 className="text-2xl font-bold text-white">Step 3: The Re-wire (Balanced Thought)</h2>
                            </div>

                            {!balancedThought ? (
                                <div className="text-center py-12">
                                    <p className="text-purple-200 mb-6">Ready to generate your balanced thought using AI</p>
                                    <button
                                        onClick={handleGenerateBalancedThought}
                                        disabled={isGeneratingBalanced}
                                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-2xl hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 mx-auto"
                                    >
                                        {isGeneratingBalanced ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={20} />
                                                Generate Balanced Thought
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl p-8 border-2 border-green-400/30 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle2 className="text-green-400" size={24} />
                                        <h3 className="text-xl font-bold text-white">Your Balanced Thought</h3>
                                    </div>
                                    <p className="text-lg text-white leading-relaxed">{balancedThought}</p>
                                </div>
                            )}

                            {balancedThought && (
                                <button
                                    onClick={() => setCurrentStep(4)}
                                    className="mt-8 w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                                >
                                    Check Your Progress
                                    <ArrowRight size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 4: Neuroplasticity Check */}
                {currentStep === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <TrendingUp className="text-purple-400" size={28} />
                                <h2 className="text-2xl font-bold text-white">Step 4: Neuroplasticity Check</h2>
                            </div>

                            <div className="mb-8">
                                <label className="block text-purple-200 font-medium mb-3">
                                    Re-rate Your Distress Level: <span className="text-teal-400 font-bold">{finalDistress}/10</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={finalDistress}
                                    onChange={(e) => setFinalDistress(Number(e.target.value))}
                                    className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-teal-500"
                                />
                                <div className="flex justify-between text-xs text-purple-300 mt-1">
                                    <span>No Distress</span>
                                    <span>Extreme Distress</span>
                                </div>
                            </div>

                            {/* Visual Comparison */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                                <h3 className="font-bold text-white mb-4">Progress Visualization</h3>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm text-purple-200 mb-2">
                                            <span>Initial Distress</span>
                                            <span className="font-bold">{initialDistress}/10</span>
                                        </div>
                                        <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                                                style={{ width: `${(initialDistress / 10) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm text-purple-200 mb-2">
                                            <span>Current Distress</span>
                                            <span className="font-bold">{finalDistress}/10</span>
                                        </div>
                                        <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-500"
                                                style={{ width: `${(finalDistress / 10) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-green-500/10 rounded-xl border-2 border-green-400/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp className="text-green-400" size={24} />
                                            <div>
                                                <p className="text-sm text-purple-200">Improvement</p>
                                                <p className="text-2xl font-bold text-green-400">{improvement}%</p>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm text-purple-200">
                                            <p>Reduction: {initialDistress - finalDistress} points</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Post-session wind-down */}
                            <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 border-2 border-green-400/30 rounded-2xl p-6 mb-6">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                    <Wind className="text-green-400" size={24} />
                                    Wind Down: Let's Settle Your Nervous System
                                </h3>
                                <p className="text-green-100 mb-4">
                                    Complete your session with a guided Progressive Muscle Relaxation exercise
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setPmrDuration('5min');
                                            setShowPMR(true);
                                        }}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-teal-600 transition-all shadow-lg"
                                    >
                                        5-Minute Quick Relax
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPmrDuration('15min');
                                            setShowPMR(true);
                                        }}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-teal-600 transition-all shadow-lg"
                                    >
                                        15-Minute Deep Rest
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full px-8 py-4 bg-white/10 border-2 border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all"
                            >
                                Skip & Complete Session
                            </button>
                        </div>
                    </div>
                )}

                {/* Motivational Toast */}
                {showToast && improvement > 0 && (
                    <div className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-w-md">
                        <div className="flex items-start gap-3">
                            <Brain className="flex-shrink-0 mt-0.5" size={24} />
                            <div>
                                <p className="font-bold mb-1">Great job! 🎉</p>
                                <p className="text-sm">You are physically strengthening your neural pathways for resilience. Keep practicing!</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThoughtRewiring;
