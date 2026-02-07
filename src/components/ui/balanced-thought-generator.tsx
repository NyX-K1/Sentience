import React, { useState, useEffect } from 'react';
import { X, Settings, Lightbulb, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface BalancedThoughtGeneratorProps {
    onClose?: () => void;
    standalone?: boolean;
}

const BalancedThoughtGenerator: React.FC<BalancedThoughtGeneratorProps> = ({
    onClose,
    standalone = false
}) => {
    // State management
    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [tempApiKey, setTempApiKey] = useState('');

    // Form inputs
    const [negativeThought, setNegativeThought] = useState('');
    const [supportingEvidence, setSupportingEvidence] = useState('');
    const [challengingEvidence, setChallengingEvidence] = useState('');
    const [initialDistress, setInitialDistress] = useState(5);
    const [finalDistress, setFinalDistress] = useState(5);

    // Results
    const [balancedThought, setBalancedThought] = useState('');
    const [actionPlan, setActionPlan] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [showResults, setShowResults] = useState(false);

    // Load API key from localStorage on mount
    useEffect(() => {
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) {
            setApiKey(storedKey);
        }
    }, []);

    // Save API key to localStorage
    const handleSaveApiKey = () => {
        if (tempApiKey.trim()) {
            const trimmedKey = tempApiKey.trim();
            localStorage.setItem('gemini_api_key', trimmedKey);
            setApiKey(trimmedKey);
            setShowSettings(false);
            setError('');
            console.log('API Key saved successfully. Length:', trimmedKey.length);
        } else {
            setError('Please enter a valid API key');
        }
    };

    // Generate balanced thought using Gemini API
    const handleGenerateBreakthrough = async () => {
        // Validation
        if (!apiKey) {
            setError('Please configure your Gemini API key in settings');
            setShowSettings(true);
            return;
        }

        if (!negativeThought.trim() || !supportingEvidence.trim() || !challengingEvidence.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        setIsGenerating(true);
        setError('');

        console.log('Using API key (first 10 chars):', apiKey.substring(0, 10) + '...');
        console.log('Full API key length:', apiKey.length);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

            const prompt = `You are a CBT therapist. Your task is to generate a 'Balanced Thought' using strict logic.

User's Input:
- Negative Thought: "${negativeThought}"
- Evidence Supporting: "${supportingEvidence}"
- Evidence Challenging: "${challengingEvidence}"

Instructions:
1. Generate a Balanced Thought using this EXACT formula: "Even though [insert user's supporting evidence], the reality is [insert user's challenging evidence], therefore [insert a logical, balanced conclusion]."

2. After the balanced thought, suggest 3 small, concrete Action Steps to solve the problem. Format these as a numbered list.

Format your response EXACTLY like this:
BALANCED THOUGHT: [Your balanced thought here]

ACTION PLAN:
1. [First action step]
2. [Second action step]
3. [Third action step]`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse the response
            const balancedThoughtMatch = text.match(/BALANCED THOUGHT:\s*(.+?)(?=ACTION PLAN:|$)/s);
            const actionPlanMatch = text.match(/ACTION PLAN:\s*([\s\S]+)/);

            if (balancedThoughtMatch) {
                setBalancedThought(balancedThoughtMatch[1].trim());
            }

            if (actionPlanMatch) {
                const actions = actionPlanMatch[1]
                    .split('\n')
                    .filter(line => line.trim())
                    .map(line => line.replace(/^\d+\.\s*/, '').trim());
                setActionPlan(actions);
            }

            setShowResults(true);
            setError('');
        } catch (err: any) {
            console.error('Gemini API Error:', err);
            setError(err.message || 'Failed to generate balanced thought. Please check your API key.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Calculate improvement percentage
    const calculateImprovement = () => {
        if (initialDistress === 0) return 0;
        const improvement = ((initialDistress - finalDistress) / initialDistress) * 100;
        return Math.max(0, Math.round(improvement));
    };

    // Reset form
    const handleReset = () => {
        setNegativeThought('');
        setSupportingEvidence('');
        setChallengingEvidence('');
        setInitialDistress(5);
        setFinalDistress(5);
        setBalancedThought('');
        setActionPlan([]);
        setShowResults(false);
        setError('');
    };

    return (
        <div className={`${standalone ? 'min-h-screen' : 'fixed inset-0 z-[100]'} bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 overflow-y-auto`}>
            <div className="max-w-4xl mx-auto p-6 md:p-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Balanced Thought Generator</h1>
                        <p className="text-gray-600">Transform negative thoughts with evidence-based reasoning</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all text-gray-700 hover:text-blue-600"
                            aria-label="Settings"
                        >
                            <Settings size={20} />
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all text-gray-700 hover:text-red-600"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className={`mb-6 p-4 ${error.includes('Demo mode') || error.includes('demo mode') ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-red-50 border-red-200 text-red-700'} border rounded-2xl text-sm`}>
                        {error}
                    </div>
                )}

                {/* Input Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Lightbulb className="text-blue-500" size={28} />
                        <h2 className="text-2xl font-bold text-gray-800">The Evidence Phase</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Negative Thought */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                The Negative Thought
                            </label>
                            <textarea
                                value={negativeThought}
                                onChange={(e) => setNegativeThought(e.target.value)}
                                placeholder="e.g., I'm going to get fired..."
                                className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:outline-none resize-none text-gray-800 placeholder:text-gray-400"
                            />
                        </div>

                        {/* Supporting Evidence */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Evidence Supporting This Thought
                            </label>
                            <textarea
                                value={supportingEvidence}
                                onChange={(e) => setSupportingEvidence(e.target.value)}
                                placeholder="Why might this thought be true?"
                                className="w-full h-24 px-4 py-3 border-2 border-red-200 rounded-2xl focus:border-red-400 focus:outline-none resize-none text-gray-800 placeholder:text-gray-400"
                            />
                        </div>

                        {/* Challenging Evidence */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Evidence Challenging This Thought
                            </label>
                            <textarea
                                value={challengingEvidence}
                                onChange={(e) => setChallengingEvidence(e.target.value)}
                                placeholder="What facts contradict this thought?"
                                className="w-full h-24 px-4 py-3 border-2 border-green-200 rounded-2xl focus:border-green-400 focus:outline-none resize-none text-gray-800 placeholder:text-gray-400"
                            />
                        </div>

                        {/* Initial Distress Level */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-3">
                                Initial Distress Level: <span className="text-blue-600 font-bold">{initialDistress}/10</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                value={initialDistress}
                                onChange={(e) => setInitialDistress(Number(e.target.value))}
                                className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>No Distress</span>
                                <span>Extreme Distress</span>
                            </div>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={handleGenerateBreakthrough}
                            disabled={isGenerating}
                            className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Lightbulb size={20} />
                                    Generate Breakthrough
                                </>
                            )}
                        </button>
                        {showResults && (
                            <button
                                onClick={handleReset}
                                className="px-6 py-4 bg-gray-200 text-gray-700 font-medium rounded-2xl hover:bg-gray-300 transition-all"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                {showResults && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Balanced Thought Card */}
                        <div className="bg-gradient-to-br from-blue-100 to-teal-100 rounded-3xl shadow-xl p-8 border-2 border-blue-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <CheckCircle2 className="text-blue-600" size={24} />
                                Your Balanced Thought
                            </h3>
                            <p className="text-lg text-gray-800 leading-relaxed">
                                {balancedThought}
                            </p>
                        </div>

                        {/* Action Plan Card */}
                        {actionPlan.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-xl p-8">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Suggested Action Plan</h3>
                                <ul className="space-y-3">
                                    {actionPlan.map((action, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-500 text-white text-sm font-bold flex-shrink-0 mt-0.5">
                                                {index + 1}
                                            </span>
                                            <span className="text-gray-700 leading-relaxed">{action}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Re-rate Distress */}
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-3">
                                    Re-rate Your Distress Level: <span className="text-teal-600 font-bold">{finalDistress}/10</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={finalDistress}
                                    onChange={(e) => setFinalDistress(Number(e.target.value))}
                                    className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-teal-500"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>No Distress</span>
                                    <span>Extreme Distress</span>
                                </div>
                            </div>

                            {/* Improvement Percentage */}
                            <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border-2 border-green-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="text-green-600" size={28} />
                                        <div>
                                            <p className="text-sm text-gray-600">Improvement</p>
                                            <p className="text-3xl font-bold text-green-600">{calculateImprovement()}%</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Initial: {initialDistress}/10</p>
                                        <p className="text-sm text-gray-600">Current: {finalDistress}/10</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Modal */}
                {showSettings && (
                    <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-800">API Settings</h3>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Google Gemini API Key
                                </label>
                                <input
                                    type="text"
                                    value={tempApiKey}
                                    onChange={(e) => setTempApiKey(e.target.value)}
                                    placeholder="Enter your API key..."
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Your API key is stored locally in your browser and never sent to our servers.
                                </p>
                                {apiKey && (
                                    <p className="text-xs text-green-600 mt-2">
                                        ✓ Current key saved ({apiKey.length} characters)
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveApiKey}
                                    className="flex-1 px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all"
                                >
                                    Save Key
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BalancedThoughtGenerator;
