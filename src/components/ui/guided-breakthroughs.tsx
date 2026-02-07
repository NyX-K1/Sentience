import React, { useState } from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';

interface GuidedBreakthroughsProps {
    onClose: () => void;
}

const GuidedBreakthroughs: React.FC<GuidedBreakthroughsProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [responses, setResponses] = useState<string[]>([]);
    const [showCompletion, setShowCompletion] = useState(false);

    const therapySteps = [
        {
            question: "What's on your mind today?",
            placeholder: "Share what's bothering you...",
        },
        {
            question: "How does this situation make you feel?",
            placeholder: "Describe your emotions...",
        },
        {
            question: "What thoughts are running through your mind?",
            placeholder: "Write down your thoughts...",
        },
        {
            question: "What evidence supports or challenges these thoughts?",
            placeholder: "Consider alternative perspectives...",
        },
    ];

    const handleNext = () => {
        if (userInput.trim()) {
            const newResponses = [...responses, userInput];
            setResponses(newResponses);
            setUserInput('');

            // Check if this is the last step
            if (currentStep === therapySteps.length - 1) {
                // Complete: Show completion screen
                setShowCompletion(true);
            } else {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleNext();
        }
    };

    // Positive quotes for completion
    const positiveQuotes = [
        "You are stronger than you know, braver than you believe, and more resilient than you can imagine.",
        "Every challenge you face is an opportunity to grow into the person you're meant to be.",
        "Your feelings are valid, and you have the power to navigate through them with grace.",
        "Remember: You've survived 100% of your difficult days. You're doing better than you think.",
        "The fact that you're here, seeking growth, shows incredible courage and self-awareness.",
        "Be gentle with yourself. Healing is not linear, but every step forward counts."
    ];

    // Generate empathetic response based on emotional keywords
    const generateResponse = () => {
        const emotionText = responses[1]?.toLowerCase() || '';

        let response = "Thank you for sharing your thoughts and feelings with me. ";

        // Detect emotional state
        if (emotionText.includes('anxious') || emotionText.includes('worried') || emotionText.includes('stress')) {
            response += "I understand that anxiety can feel overwhelming. What you're experiencing is completely valid. Remember that these feelings are temporary, and you have the strength to work through them.";
        } else if (emotionText.includes('sad') || emotionText.includes('depressed') || emotionText.includes('down')) {
            response += "I hear the sadness in your words, and I want you to know that it's okay to feel this way. Your emotions matter, and acknowledging them is the first step toward healing.";
        } else if (emotionText.includes('angry') || emotionText.includes('frustrated') || emotionText.includes('mad')) {
            response += "Your frustration is understandable. Anger often signals that something matters deeply to you. By exploring these feelings, you're taking an important step toward clarity and peace.";
        } else if (emotionText.includes('confused') || emotionText.includes('lost') || emotionText.includes('uncertain')) {
            response += "Feeling uncertain can be challenging, but it also means you're open to finding a new path forward. Trust that clarity will come as you continue to reflect and process.";
        } else {
            response += "I recognize the complexity of what you're going through. Your willingness to explore these thoughts and emotions shows tremendous courage and self-awareness.";
        }

        return response;
    };

    // If showing completion screen, render it
    if (showCompletion) {
        const randomQuote = positiveQuotes[Math.floor(Math.random() * positiveQuotes.length)];

        return (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="relative max-w-2xl w-full bg-gradient-to-br from-emerald-900/40 via-teal-900/40 to-cyan-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/80 hover:text-white"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>

                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 border border-emerald-400/30">
                            <Sparkles size={32} className="text-emerald-300" />
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Breakthrough Complete</h2>
                        <p className="text-white/60 text-sm uppercase tracking-wider">Your journey to clarity</p>
                    </div>

                    {/* Empathetic Response */}
                    <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-emerald-300 mb-3">Reflection</h3>
                        <p className="text-white/90 leading-relaxed">
                            {generateResponse()}
                        </p>
                    </div>

                    {/* Positive Quote */}
                    <div className="mb-8 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/30 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-400" />
                        <div className="pl-4">
                            <p className="text-white/90 text-lg leading-relaxed italic mb-3">
                                "{randomQuote}"
                            </p>
                            <p className="text-emerald-300 text-sm font-medium">— A message for you</p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-emerald-500/20"
                    >
                        Continue Your Journey
                    </button>

                    {/* Bottom Decoration */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-500/10 to-transparent rounded-b-3xl -z-10" />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            {/* Floating Glass Container */}
            <div className="relative max-w-2xl w-full bg-gradient-to-br from-purple-900/40 to-violet-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/80 hover:text-white"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {/* Progress Indicator */}
                <div className="flex gap-2 mb-8">
                    {therapySteps.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${index <= currentStep
                                ? 'bg-gradient-to-r from-purple-400 to-violet-400'
                                : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Guided Breakthrough</h2>
                    <p className="text-white/60 text-sm uppercase tracking-wider">
                        Step {currentStep + 1} of {therapySteps.length}
                    </p>
                </div>

                {/* Question */}
                <div className="mb-6">
                    <h3 className="text-xl font-medium text-white/90 mb-4">
                        {therapySteps[currentStep].question}
                    </h3>
                </div>

                {/* Previous Responses */}
                {responses.length > 0 && (
                    <div className="mb-6 space-y-2 max-h-32 overflow-y-auto">
                        {responses.map((response, index) => (
                            <div
                                key={index}
                                className="text-sm text-white/50 bg-white/5 rounded-lg p-3 border border-white/5"
                            >
                                <span className="text-purple-300 font-medium">Step {index + 1}:</span> {response}
                            </div>
                        ))}
                    </div>
                )}

                {/* Input Field */}
                <div className="mb-6">
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={therapySteps[currentStep].placeholder}
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 resize-none"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    {currentStep > 0 && (
                        <button
                            onClick={() => setCurrentStep(currentStep - 1)}
                            className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-all"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={!userInput.trim()}
                        className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium hover:from-purple-600 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
                    >
                        {currentStep === therapySteps.length - 1 ? 'Complete & Generate Insights' : 'Next'}
                        <ArrowRight
                            size={18}
                            className="group-hover:translate-x-1 transition-transform"
                        />
                    </button>
                </div>

                {/* Bottom Decoration */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-500/10 to-transparent rounded-b-3xl -z-10" />
            </div>
        </div>
    );
};

export default GuidedBreakthroughs;
