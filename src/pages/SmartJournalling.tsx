
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Sparkles, TrendingUp, Calendar, BrainCircuit, Activity, Settings, X, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Groq from "groq-sdk";
import NeuralBackground from "@/components/ui/flow-field-background";
import { cn } from "@/lib/utils";

// --- Types ---

interface AIAnalysis {
    sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Anxious' | 'Hopeful';
    tags: string[];
    reflection: string;
    insight: string;
}

// Mock Data for Mood Chart (Last 7 Days)
const MOCK_MOOD_HISTORY = [
    { day: 'Mon', value: 6, sentiment: 'Neutral' },
    { day: 'Tue', value: 4, sentiment: 'Anxious' },
    { day: 'Wed', value: 7, sentiment: 'Hopeful' },
    { day: 'Thu', value: 5, sentiment: 'Neutral' },
    { day: 'Fri', value: 8, sentiment: 'Positive' },
    { day: 'Sat', value: 3, sentiment: 'Negative' },
    { day: 'Sun', value: 7, sentiment: 'Hopeful' },
];

const SENTIMENT_COLORS = {
    'Positive': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'Neutral': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'Negative': 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    'Anxious': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    'Hopeful': 'text-violet-400 bg-violet-400/10 border-violet-400/20',
};

const CHART_HEIGHT = 100;
const CHART_WIDTH = 300;

// --- Components ---

const MoodChart = () => {
    // Normalize values to chart height
    const points = MOCK_MOOD_HISTORY.map((d, i) => {
        const x = (i / (MOCK_MOOD_HISTORY.length - 1)) * CHART_WIDTH;
        const y = CHART_HEIGHT - (d.value / 10) * CHART_HEIGHT;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-cyan-400" />
                    <h3 className="text-sm font-medium text-white/80">Mood History</h3>
                </div>
                <span className="text-xs text-white/40">Last 7 Days</span>
            </div>

            <div className="relative h-[120px] w-full flex items-end justify-between gap-2">
                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>

                    {/* The Line */}
                    <motion.polyline
                        points={points}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {/* Data Points */}
                    {MOCK_MOOD_HISTORY.map((d, i) => {
                        const x = (i / (MOCK_MOOD_HISTORY.length - 1)) * CHART_WIDTH;
                        const y = CHART_HEIGHT - (d.value / 10) * CHART_HEIGHT;
                        return (
                            <motion.circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="4"
                                className="fill-white stroke-cyan-500 stroke-2"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 1 + i * 0.1, duration: 0.3 }}
                            />
                        );
                    })}
                </svg>

                {/* X-Axis Labels */}
                <div className="absolute -bottom-6 w-full flex justify-between px-1">
                    {MOCK_MOOD_HISTORY.map((d, i) => (
                        <span key={i} className="text-[10px] text-white/30 uppercase tracking-wider">{d.day}</span>
                    ))}
                </div>
            </div>
            <div className="h-4" /> {/* Spacer for labels */}
        </div>
    );
};

export default function SmartJournalling() {
    const [entry, setEntry] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [isSimulationMode, setIsSimulationMode] = useState(false);

    // Auto-fill Date/Time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [tempApiKey, setTempApiKey] = useState('');
    const [settingsError, setSettingsError] = useState('');

    // Load API Key on Mount
    useEffect(() => {
        const envKey = import.meta.env.VITE_GROQ_API_KEY;
        const storedKey = localStorage.getItem('groq_api_key');

        console.log("Environment Key Available:", !!envKey);
        console.log("Stored Key Available:", !!storedKey);

        if (storedKey) {
            setApiKey(storedKey);
            console.log("Using Stored API Key");
        } else if (envKey) {
            setApiKey(envKey);
            console.log("Using Environment API Key");
        }
    }, []);

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
        alert("API Key cleared. Reverting to environment variable if available.");
    };

    const handleAnalyze = async () => {
        if (!entry.trim()) return;

        // Check for API Key
        if (!apiKey) {
            setShowSettings(true);
            return;
        }

        setIsAnalyzing(true);
        setAnalysis(null);
        setShowSidebar(false);

        try {
            const groq = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });

            const prompt = `
                You are 'Sentience,' an empathetic mental health companion. Analyze the user's journal entry. 
                RETURN ONLY RAW JSON. Do not use Markdown formatting.
                
                Schema:
                {
                    "sentiment": "Positive" | "Neutral" | "Negative" | "Anxious" | "Hopeful",
                    "tags": ["string"],
                    "reflection": "string",
                    "insight": "string"
                }

                Entry: "${entry}"
            `;

            console.log("Analyzing with Groq (llama-3.3-70b-versatile)...");
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
            });

            const content = completion.choices[0]?.message?.content || "";
            console.log("Raw AI Response:", content);

            const data: AIAnalysis = JSON.parse(content);

            setAnalysis(data);
            setShowSidebar(true);
        } catch (error: any) {
            console.error("AI Analysis Failed:", error);

            let errorMessage = "Analysis failed. Please try again.";

            if (error.message.includes("401") || error.message.includes("403")) {
                errorMessage = "Invalid API Key. Please check your settings.";
                setShowSettings(true);
            } else if (error.message.includes("429")) {
                errorMessage = "Too many requests. Please wait a moment.";
            } else {
                errorMessage = `Analysis failed: ${error.message}`;
            }

            alert(errorMessage);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (

        <div className="h-screen w-full bg-[#0a0a0a] text-white overflow-hidden relative font-sans flex flex-col">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <NeuralBackground color="#4f46e5" trailOpacity={0.2} speed={0.5} />
            </div>

            {/* Navigation & Header */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex-none flex justify-between items-center">
                <Link to="/smart-journal" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    <span className="text-sm font-medium">Back to Journal</span>
                </Link>
                <div className="flex items-center gap-2">
                    <BrainCircuit size={20} className="text-indigo-400" />
                    <span className="text-sm font-bold tracking-widest uppercase text-white/80">Sentience AI</span>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                        title="API Settings"
                    >
                        <Settings size={18} />
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <main className="relative z-10 w-full max-w-7xl mx-auto px-6 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-6 overflow-y-auto">

                {/* Left: Writing Area */}
                <div className="lg:col-span-8 h-[60vh] lg:h-full flex flex-col">
                    {/* Header Info */}
                    <div className="mb-6 space-y-1">
                        <h1 className="text-4xl font-light text-white tracking-tight">Daily Reflection</h1>
                        <div className="flex items-center gap-4 text-white/40 text-sm">
                            <span className="flex items-center gap-1.5"><Calendar size={14} /> {dateStr}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span>{timeStr}</span>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="flex-1 relative group">
                        <textarea
                            value={entry}
                            onChange={(e) => setEntry(e.target.value)}
                            placeholder="What's weighing on your mind today? Let it flow..."
                            className="w-full h-full bg-white/5 hover:bg-white/[0.07] focus:bg-white/[0.07] border-0 rounded-3xl p-8 text-lg md:text-xl leading-relaxed text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none shadow-2xl backdrop-blur-sm"
                        />

                        {/* Save Button */}
                        <div className="absolute bottom-6 right-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !entry.trim()}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all shadow-lg",
                                    isAnalyzing
                                        ? "bg-indigo-500/20 text-indigo-300 cursor-wait"
                                        : "bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25"
                                )}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Sparkles size={16} className="animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Save & Reflect
                                    </>
                                )}
                            </motion.button>
                        </div>


                    </div>
                </div>

                {/* Right: Insight Sidebar (Analysis Results) */}
                <div className="lg:col-span-4 h-auto lg:h-full flex flex-col lg:min-h-0">
                    {/* Mood Tracker (Always Visible) */}
                    <MoodChart />

                    {/* Analysis Card */}
                    <AnimatePresence mode='wait'>
                        {showSidebar && analysis ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="flex-1 min-h-0 bg-gradient-to-br from-indigo-900/40 via-violet-900/20 to-transparent border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-6 overflow-y-auto custom-scrollbar pb-20"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <h2 className="text-xl font-light text-white">Analysis</h2>
                                    <div className="flex items-center gap-2">
                                        {isSimulationMode && (
                                            <span className="text-[10px] uppercase tracking-wider text-white/30 border border-white/10 px-2 py-0.5 rounded-full">
                                                Demo Mode
                                            </span>
                                        )}
                                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border", SENTIMENT_COLORS[analysis.sentiment])}>
                                            {analysis.sentiment}
                                        </span>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Key Themes</p>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.tags.map((tag, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-indigo-200 border border-white/5 transition-colors cursor-default">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Insight */}
                                <div className="bg-white/5 rounded-2xl p-4 border-l-2 border-indigo-400">
                                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Insight</p>
                                    <p className="text-sm text-white/80 italic leading-relaxed">
                                        "{analysis.insight}"
                                    </p>
                                </div>

                                {/* Reflection Question */}
                                <div className="flex-1 flex flex-col justify-center text-center p-4 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-2xl border border-indigo-500/20">
                                    <Sparkles size={24} className="text-indigo-400 mx-auto mb-4" />
                                    <h3 className="text-lg md:text-xl font-medium text-indigo-100 leading-snug">
                                        {analysis.reflection}
                                    </h3>
                                    <p className="text-xs text-white/40 mt-4 uppercase tracking-widest">Sentience Asks</p>
                                </div>

                                {/* Action Item */}
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-full mt-0.5">
                                        <TrendingUp size={16} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Try This</p>
                                        <p className="text-sm text-white/80">
                                            Take 5 minutes for deep box breathing before continuing your day.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/5 border border-white/5 rounded-3xl border-dashed">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <BrainCircuit size={32} className="text-white/20" />
                                </div>
                                <h3 className="text-lg font-medium text-white/60 mb-2">Ready to Reflect?</h3>
                                <p className="text-sm text-white/40 max-w-xs">
                                    Write your thoughts and let Sentience help you find clarity through AI analysis.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
            {/* Settings Modal */}
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
                            <h3 className="text-2xl font-light text-white">API Settings</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">Groq API Key</label>
                                <input
                                    type="text"
                                    value={tempApiKey}
                                    onChange={(e) => setTempApiKey(e.target.value)}
                                    placeholder="Enter your Groq API key..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                                />
                                <p className="text-xs text-white/30 mt-2">
                                    Your key is stored locally in your browser. Get one from Groq Console.
                                </p>
                            </div>

                            {settingsError && (
                                <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                                    <AlertTriangle size={16} />
                                    {settingsError}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleClearKey}
                                    className="px-4 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all font-medium border border-rose-500/20"
                                    title="Clear stored key to use environment variable"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveApiKey}
                                    className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/25 transition-all font-medium"
                                >
                                    Save Key
                                </button>
                            </div>

                            {apiKey && (
                                <div className="pt-4 border-t border-white/5 text-center">
                                    <span className="text-xs text-emerald-400 flex items-center justify-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        API Key is currently set
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
