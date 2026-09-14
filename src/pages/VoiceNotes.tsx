import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings, X, Flame, CloudRain, Moon, Zap, StopCircle, AlertTriangle, Loader2, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Groq from 'groq-sdk';
import AuroraBorealisShader from "@/components/ui/aurora-borealis-shader";
import { cn } from "@/lib/utils";

// --- Types ---
type MoodStatus = 'idle' | 'thinking' | 'playing';

interface MoodConfig {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    hoverColor: string;
    gradient: string;
}

// --- Constants ---
const MOODS: MoodConfig[] = [
    {
        id: 'burnout',
        label: 'Burnout',
        description: 'Exhausted & Giving Up',
        icon: Flame,
        color: 'text-orange-500',
        hoverColor: 'group-hover:text-orange-400',
        gradient: 'from-orange-500/20 to-red-500/5'
    },
    {
        id: 'anxiety',
        label: 'Anxiety',
        description: 'Overthinking & Panic',
        icon: CloudRain,
        color: 'text-cyan-400',
        hoverColor: 'group-hover:text-cyan-300',
        gradient: 'from-cyan-500/20 to-blue-500/5'
    },
    {
        id: 'loneliness',
        label: 'Loneliness',
        description: 'Feeling Isolated',
        icon: Moon,
        color: 'text-indigo-400',
        hoverColor: 'group-hover:text-indigo-300',
        gradient: 'from-indigo-500/20 to-violet-500/5'
    },
    {
        id: 'procrastination',
        label: 'Procrastination',
        description: "Can't Start",
        icon: Zap,
        color: 'text-yellow-400',
        hoverColor: 'group-hover:text-yellow-300',
        gradient: 'from-yellow-500/20 to-amber-500/5'
    },
];

const VisualizerBars = () => {
    return (
        <div className="flex items-center gap-1.5 h-16">
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="w-2 bg-cyan-400/80 rounded-full"
                    animate={{
                        height: ["20%", "100%", "20%"],
                    }}
                    transition={{
                        duration: 0.5 + Math.random() * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1,
                    }}
                />
            ))}
        </div>
    );
};

export default function VoiceNotes() {
    // State
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_GROQ_API_KEY || '');
    const [showSettings, setShowSettings] = useState(false);
    const [status, setStatus] = useState<MoodStatus>('idle');
    const [currentMood, setCurrentMood] = useState<MoodConfig | null>(null);
    const [generatedText, setGeneratedText] = useState('');

    // Settings State
    const [tempApiKey, setTempApiKey] = useState('');
    const [settingsError, setSettingsError] = useState('');

    // Refs
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Load API Key
    useEffect(() => {
        const envKey = import.meta.env.VITE_GROQ_API_KEY;
        const storedKey = localStorage.getItem('groq_api_key');

        if (storedKey) setApiKey(storedKey);
        else if (envKey) setApiKey(envKey);
    }, []);

    // Cleanup Audio on Unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // --- Handlers ---

    const handleSaveApiKey = () => {
        if (!tempApiKey.trim()) {
            setSettingsError("Please enter a valid API key");
            return;
        }
        const key = tempApiKey.trim();
        localStorage.setItem('groq_api_key', key);
        setApiKey(key);
        setShowSettings(false);
        setSettingsError('');
    };

    const handleClearKey = () => {
        localStorage.removeItem('groq_api_key');
        setApiKey(import.meta.env.VITE_GROQ_API_KEY || '');
        setTempApiKey('');
        setSettingsError('');
    };

    const stopPlayback = () => {
        window.speechSynthesis.cancel();
        setStatus('idle');
        setCurrentMood(null);
        setGeneratedText('');
    };

    const handleMoodClick = async (mood: MoodConfig) => {
        if (!apiKey) {
            setShowSettings(true);
            return;
        }

        setStatus('thinking');
        setCurrentMood(mood);

        try {
            // Use the state apiKey
            const groq = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });

            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a stoic philosopher and compassionate coach. The user is feeling ${mood.label}. Write a powerful, rhythmic, 3-sentence pep talk. Do not use emojis. Write for the ear (short sentences).`
                    },
                    { role: "user", content: `I feel ${mood.label.toLowerCase()}.` }
                ],
                model: "llama-3.3-70b-versatile",
            });

            const text = completion.choices[0]?.message?.content || "Stay strong. This too shall pass.";
            setGeneratedText(text);

            // Start Speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.85; // Slower/Serious
            utterance.pitch = 0.8; // Deeper/Calmer

            utterance.onend = () => {
                setStatus('idle');
                setCurrentMood(null);
            };

            utterance.onerror = (e) => {
                console.error("Speech Error:", e);
                setStatus('idle');
                alert("Speech synthesis failed.");
            };

            speechRef.current = utterance;
            setStatus('playing');
            window.speechSynthesis.speak(utterance);

        } catch (error: any) {
            console.error("Groq/Motivation Error:", error);
            setStatus('idle');
            setCurrentMood(null);

            if (error?.message?.includes('401')) {
                setSettingsError("Invalid API Key");
                setShowSettings(true);
            } else {
                alert(`Failed to generate motivation. Error: ${error?.message || "Unknown error"}`);
            }
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden text-white font-sans selection:bg-cyan-500/30">
            {/* Background Shader */}
            <AuroraBorealisShader />

            {/* Navigation */}
            <nav className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
                <div className="flex gap-4">
                    <Link
                        to="/sentience"
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                        title="Back to Sentience"
                    >
                        <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                            <ArrowLeft size={20} />
                        </div>
                    </Link>
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                        title="Return to Home"
                    >
                        <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                            <Home size={20} />
                        </div>
                    </Link>
                </div>

                <button
                    onClick={() => setShowSettings(true)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    title="API Settings"
                >
                    <Settings size={20} />
                </button>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4">

                <AnimatePresence mode="wait">
                    {status === 'idle' && (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-5xl"
                        >
                            <h1 className="text-4xl md:text-6xl font-light text-center mb-4 tracking-tight">
                                How are you <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">feeling?</span>
                            </h1>
                            <p className="text-center text-white/50 mb-12 max-w-xl mx-auto">
                                Select your current state to receive instant, stoic guidance.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
                                {MOODS.map((mood) => (
                                    <button
                                        key={mood.id}
                                        onClick={() => handleMoodClick(mood)}
                                        className={cn(
                                            "group relative overflow-hidden rounded-3xl p-8 text-left transition-all duration-300",
                                            "bg-black/20 backdrop-blur-md border border-white/10",
                                            "hover:border-white/20 hover:bg-black/30 hover:scale-[1.02]",
                                            "active:scale-[0.98]"
                                        )}
                                    >
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br ${mood.gradient} transition-opacity duration-500`} />

                                        <div className="relative z-10 flex items-start justify-between">
                                            <div>
                                                <mood.icon size={32} className={cn("mb-4 transition-colors", mood.color, mood.hoverColor)} />
                                                <h3 className="text-2xl font-semibold mb-1">{mood.label}</h3>
                                                <p className="text-sm text-white/40">{mood.description}</p>
                                            </div>
                                            <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                                <ArrowLeft size={20} className="rotate-180" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {status === 'thinking' && (
                        <motion.div
                            key="thinking"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                            className="flex flex-col items-center justify-center text-center"
                        >
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
                                <Loader2 size={64} className="text-cyan-400 animate-spin relative z-10" />
                            </div>
                            <h2 className="text-2xl font-light text-white/80 animate-pulse">Consulting the Void...</h2>
                        </motion.div>
                    )}

                    {status === 'playing' && currentMood && (
                        <motion.div
                            key="playing"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                            className="w-full max-w-2xl px-6"
                        >
                            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                                {/* Ambient Glow */}
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${currentMood.gradient.replace('to-', 'via-white/20 to-')}`} />

                                <div className="mb-8 flex justify-center">
                                    <VisualizerBars />
                                </div>

                                <h3 className="text-3xl md:text-4xl font-light leading-snug mb-8 text-white/90">
                                    "{generatedText}"
                                </h3>

                                <button
                                    onClick={stopPlayback}
                                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95 border border-white/5"
                                >
                                    <StopCircle size={20} className="text-rose-400" />
                                    <span className="font-medium tracking-wide">End Session</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1a1a1a] border border-white/10 rounded-3xl shadow-2xl p-8 max-w-md w-full relative"
                        >
                            <button
                                onClick={() => setShowSettings(false)}
                                className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-500/20 rounded-xl">
                                    <Settings size={24} className="text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-light text-white">Groq API Setup</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">API Key</label>
                                    <input
                                        type="password"
                                        value={tempApiKey}
                                        onChange={(e) => setTempApiKey(e.target.value)}
                                        placeholder="gsk_..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm"
                                    />
                                    <p className="text-xs text-white/30 mt-2">
                                        Required for generating motivation. Stored locally.
                                    </p>
                                </div>

                                {settingsError && (
                                    <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                                        <AlertTriangle size={16} />
                                        {settingsError}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleClearKey}
                                        className="px-4 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all font-medium text-sm"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={handleSaveApiKey}
                                        className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/25 transition-all font-medium"
                                    >
                                        Save & Continue
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
