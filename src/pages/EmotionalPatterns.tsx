import { Link } from "react-router-dom";
import { ArrowLeft, Activity, Info, AlertTriangle, Wind, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CelestialSphere } from "@/components/ui/celestial-sphere";
import { useMoodData } from "@/hooks/useMoodData";
import { cn } from "@/lib/utils";

export default function EmotionalPatterns() {
    const { triggerMap, timeSlots, isSpiral } = useMoodData();

    // Helper to get color based on score (1-10)
    const getScoreColor = (score: number) => {
        if (score >= 7.5) return "bg-emerald-500 text-emerald-100 shadow-emerald-500/20";
        if (score >= 4.5) return "bg-indigo-500 text-indigo-100 shadow-indigo-500/20";
        return "bg-rose-500 text-rose-100 shadow-rose-500/20";
    };

    return (
        <div className="relative min-h-screen bg-black overflow-y-auto font-sans text-white">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 opacity-60">
                <CelestialSphere
                    hue={10} // Warm/Red for "Patterns/Heatmap" vibe
                    speed={0.3}
                    zoom={1.5}
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

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col gap-12">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Emotional Patterns</h1>
                    <p className="text-white/60 max-w-xl mx-auto">
                        Decoding the hidden rhythms of your life. See how your activities and time of day influence your inner state.
                    </p>
                </motion.div>

                {/* Spiral Detector Alert */}
                <AnimatePresence>
                    {isSpiral && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-rose-500/20 rounded-full">
                                    <AlertTriangle size={24} className="text-rose-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-rose-200 text-lg">We noticed it's been a tough few days.</h3>
                                    <p className="text-rose-200/60 text-sm">You've logged negative emotions consecutively. It's okay to not be okay.</p>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-medium transition-colors shadow-lg shadow-rose-900/20">
                                <Wind size={18} />
                                Take a 2-min Breather
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Trigger Map (Bubble Cloud) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <Activity size={24} className="text-indigo-400" />
                            <div>
                                <h2 className="text-xl font-bold">The Trigger Map</h2>
                                <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Activity Correlations</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-4 min-h-[250px] content-center">
                            {triggerMap.map((item, i) => {
                                const sizeClass = item.avgMood > 8 ? "text-2xl px-6 py-3" : item.avgMood < 4 ? "text-sm px-3 py-1.5 opacity-80" : "text-base px-4 py-2";
                                const colorClass = getScoreColor(item.avgMood);

                                return (
                                    <motion.div
                                        key={item.tag}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3 + i * 0.05, type: "spring" }}
                                        className={cn(
                                            "rounded-full font-medium cursor-help transition-transform hover:scale-105 shadow-lg border border-white/5 group relative",
                                            sizeClass,
                                            colorClass
                                        )}
                                    >
                                        #{item.tag}

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-neutral-900 border border-white/10 text-white text-xs p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 mx-auto">
                                            <p className="font-bold mb-1">When you tag #{item.tag}:</p>
                                            <p className="text-white/70">You usually feel <span className="text-indigo-300 font-semibold">{item.dominantSentiment}</span></p>
                                            <p className="text-white/40 mt-1">Avg Score: {item.avgMood}/10</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Time-of-Day Heatmap */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-1 rounded bg-orange-500/20">
                                <div className="w-4 h-4 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Chronotype</h2>
                                <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Mood by Time of Day</p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col gap-4 justify-center">
                            {Object.entries(timeSlots).map(([slot, data], i) => {
                                const avg = data.count > 0 ? data.total / data.count : 0;
                                const width = `${Math.max(avg * 10, 10)}%`;
                                const color = avg >= 7 ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : avg >= 4 ? "bg-indigo-500" : "bg-rose-500";

                                return (
                                    <div key={slot} className="relative group">
                                        <div className="flex justify-between items-end mb-2 px-1">
                                            <span className="text-sm font-medium text-white/80">{slot}</span>
                                            <span className="text-xs font-mono text-white/40">{avg.toFixed(1)}/10</span>
                                        </div>
                                        <div className="h-12 w-full bg-white/5 rounded-xl overflow-hidden border border-white/5 relative">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width }}
                                                transition={{ delay: 0.5 + i * 0.2, duration: 1, ease: "easeOut" }}
                                                className={cn("h-full absolute left-0 top-0", color)}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex gap-3 text-sm text-white/50 bg-black/20 p-4 rounded-xl">
                            <Info size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                            <p>
                                You seem to align best with <span className="text-white font-medium">Evenings</span>.
                                Consider scheduling high-stress tasks then.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
