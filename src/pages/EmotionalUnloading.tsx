import { useState, useRef, useEffect } from "react";
import { EmotionalHero } from "@/components/ui/emotional-hero";
import { Link } from "react-router-dom";
import { ArrowLeft, Flame, Mic, Sparkles, Wand2, RefreshCw, Home } from "lucide-react"; // Removed 'Brain'
import { motion, AnimatePresence } from "framer-motion";
import { CelestialSphere } from "@/components/ui/celestial-sphere";
import Groq from "groq-sdk";
import { cn } from "@/lib/utils";

const VentingTools = () => {
    const [thought, setThought] = useState("");
    const [isBurning, setIsBurning] = useState(false);
    const [isReframing, setIsReframing] = useState(false);
    const [reframedThought, setReframedThought] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [statusMsg, setStatusMsg] = useState(""); // UI Feedback
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    setThought(prev => prev + (prev ? ' ' : '') + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech Error:", event.error);
                setIsRecording(false);
                setStatusMsg("Microphone error: " + event.error);
            };

            recognitionRef.current.onend = () => {
                if (isRecording) {
                    // If it stops unexpectedly, restart usage or just stop state?
                    // Usually for voice dump we might want it to stay on until toggled.
                    // But if it stops, let's sync state.
                    setIsRecording(false);
                }
            };
        } else {
            setStatusMsg("Voice not supported in this browser.");
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            setStatusMsg("Recording stopped.");
        } else {
            if (!recognitionRef.current) {
                alert("Speech recognition not supported in this browser.");
                return;
            }
            recognitionRef.current.start();
            setIsRecording(true);
            setStatusMsg("Listening...");
        }
    };

    const handleBurn = () => {
        if (!thought.trim()) return;
        setIsBurning(true);
        setStatusMsg("Releasing...");
        setTimeout(() => {
            setThought("");
            setIsBurning(false);
            setReframedThought("");
            setStatusMsg("");
        }, 1500);
    };

    const handleReframe = async () => {
        if (!thought.trim()) return;

        setStatusMsg("Consulting Sentience...");
        let apiKey = localStorage.getItem('groq_api_key') || import.meta.env.VITE_GROQ_API_KEY;

        if (!apiKey) {
            const input = prompt("Enter Groq API Key (saved locally):");
            if (input) {
                localStorage.setItem('groq_api_key', input);
                apiKey = input;
            } else {
                setStatusMsg("API Key required for AI.");
                return;
            }
        }

        setIsReframing(true);
        try {
            const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
            const completion = await groq.chat.completions.create({
                messages: [{
                    role: "user",
                    content: `You are a CBT therapist. Rewrite this negative thought into a constructive, balanced perspective. Validate the feeling, then pivot to a growth mindset. Keep it brief (2-3 sentences). Thought: "${thought}"`
                }],
                model: "llama-3.3-70b-versatile",
            });
            const result = completion.choices[0]?.message?.content;
            if (result) {
                setReframedThought(result);
                setStatusMsg("Perspective shifted.");
            } else {
                throw new Error("Empty response");
            }
        } catch (error: any) {
            console.error("Reframe Error:", error);
            setStatusMsg(`Error: ${error.message || "Failed to connect"}`);
            // If 401, maybe clear key
            if (error.message?.includes("401")) {
                localStorage.removeItem('groq_api_key');
                setStatusMsg("Invalid API Key. Try again.");
            }
        } finally {
            setIsReframing(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-6 py-24 md:py-32 relative z-20">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
                {/* Burn Overlay */}
                <AnimatePresence>
                    {isBurning && (
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
                            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            className="absolute inset-0 z-50 bg-orange-900/30 flex items-center justify-center pointer-events-none"
                        >
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1.2, opacity: 1 }}
                                className="text-orange-400 font-bold text-5xl tracking-[0.2em] uppercase mix-blend-plus-lighter drop-shadow-[0_0_15px_rgba(251,146,60,0.5)]"
                            >
                                Release
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-light text-white mb-2">The Venting Room</h2>
                    <p className="text-white/40">Safe space. What goes here, stays here.</p>
                </div>

                <div className="relative group">
                    <AnimatePresence mode="wait">
                        {!isBurning ? (
                            <motion.textarea
                                key="input"
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0, filter: "blur(10px)" }}
                                value={thought}
                                onChange={(e) => setThought(e.target.value)}
                                placeholder="What is weighing on your mind? Let it all out..."
                                className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 text-lg text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none leading-relaxed selection:bg-orange-500/30 transition-all z-10 relative"
                            />
                        ) : (
                            <div key="cleared" className="h-64 w-full flex items-center justify-center text-white/20 italic border border-transparent">
                                The thought has been dissolved.
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Voice Dump Overlay */}
                    <AnimatePresence>
                        {isRecording && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="absolute inset-x-0 top-0 bottom-0 z-40 bg-black/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)]"
                            >
                                <div className="flex items-center gap-1.5 mb-6 h-16">
                                    {[...Array(15)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                height: [12, Math.random() * 60 + 20, 12],
                                                backgroundColor: ["#818cf8", "#c084fc", "#818cf8"]
                                            }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 0.4 + Math.random() * 0.3,
                                                ease: "easeInOut"
                                            }}
                                            className="w-2 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.5)]"
                                        />
                                    ))}
                                </div>
                                <p className="text-indigo-300 font-mono text-sm uppercase tracking-widest animate-pulse">Recording Active</p>
                                <p className="text-white/30 text-xs mt-2">(Voice-to-Text Active)</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Status Message */}
                <div className="h-6 mt-2 flex justify-center">
                    {statusMsg && (
                        <motion.span
                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "text-xs font-medium px-3 py-1 rounded-full border",
                                statusMsg.includes("Error") || statusMsg.includes("required") ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                            )}
                        >
                            {statusMsg}
                        </motion.span>
                    )}
                </div>

                {/* Actions Toolbar */}
                <div className="mt-6 flex flex-col md:flex-row gap-4 justify-between items-center relative z-20">
                    <button
                        onClick={toggleRecording}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-full border transition-all font-medium min-w-[160px] justify-center",
                            isRecording
                                ? "bg-rose-500/20 border-rose-500/50 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                                : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                        )}
                    >
                        {isRecording ? (
                            <>
                                <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping mr-1" />
                                Stop
                            </>
                        ) : (
                            <>
                                <Mic size={18} /> Voice Dump
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={handleReframe}
                            disabled={!thought.trim() || isReframing}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        >
                            {isReframing ? <RefreshCw size={18} className="animate-spin" /> : <Wand2 size={18} />}
                            <span>Reframe</span>
                        </button>

                        <button
                            onClick={handleBurn}
                            disabled={!thought.trim() || isBurning}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold shadow-lg shadow-orange-900/40 hover:shadow-orange-700/60 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed group"
                        >
                            <Flame size={18} className="group-hover:animate-pulse" />
                            <span>Burn</span>
                        </button>
                    </div>
                </div>

                {/* AI Reframe Result */}
                <AnimatePresence>
                    {reframedThought && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/20 border border-indigo-500/30 rounded-2xl p-6 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Sparkles size={64} />
                            </div>
                            <div className="flex items-center gap-2 mb-3 text-indigo-300">
                                <Sparkles size={18} />
                                <h3 className="font-bold uppercase tracking-widest text-xs">New Perspective</h3>
                            </div>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-xl md:text-2xl text-indigo-100 leading-relaxed font-light italic">
                                    "{reframedThought}"
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default function EmotionalUnloading() {
    return (
        <div className="relative min-h-screen bg-black">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0">
                <CelestialSphere
                    hue={260} // Deep Purple/Blue for "Unloading" vibe
                    speed={0.2}
                    zoom={1.2}
                    particleSize={3.0}
                    className="w-full h-full"
                />
            </div>

            {/* Back Button Overlay */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="fixed top-6 left-6 z-[60] flex gap-3"
            >
                <Link
                    to="/sentience"
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
                    title="Back to Sentience"
                >
                    <ArrowLeft size={16} />
                    <span className="text-sm font-medium">Back</span>
                </Link>
                <Link
                    to="/"
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
                    title="Return to Home"
                >
                    <Home size={16} />
                    <span className="text-sm font-medium">Home</span>
                </Link>
            </motion.div>

            <div className="relative z-10 w-full">
                <EmotionalHero>
                    <VentingTools />
                </EmotionalHero>
            </div>
        </div>
    );
}
