import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { CelestialSphere } from "@/components/ui/celestial-sphere";
import { useMoodData } from "@/hooks/useMoodData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import Groq from "groq-sdk";

const sphereConfig = [
    { hue: 200, speed: 0.8, zoom: 1.2, particleSize: 4.0 }, // Velocity: Fast blue
    { hue: 150, speed: 0.4, zoom: 1.5, particleSize: 3.0 }, // Clarity: Calm green/teal
    { hue: 30, speed: 0.3, zoom: 1.8, particleSize: 2.5 },  // Social: Warm orange
    { hue: 260, speed: 0.2, zoom: 1.0, particleSize: 5.0 }, // Cognitive: Deep purple
];

const COLORS = ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#60a5fa'];

export default function WeeklyReport() {
    const [currentIdx, setCurrentIdx] = useState(0);
    const { last7Days, consistencyScore, topEmotions } = useMoodData();
    const [aiSummary, setAiSummary] = useState("Analyzing your week...");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIdx((prev) => (prev + 1) % sphereConfig.length);
        }, 8000); // Slower cycle
        return () => clearInterval(interval);
    }, []);

    // Fallback: Generate a local summary based on data if AI fails
    const generateLocalSummary = () => {
        const top = topEmotions[0]?.name || "mixed emotions";
        const second = topEmotions[1]?.name;
        const consistency = Math.round((consistencyScore / 100) * 7);

        const intros = [
            "It looks like",
            "This week was characterized by",
            "You seem to be experiencing",
            "The data suggests"
        ];
        const intro = intros[Math.floor(Math.random() * intros.length)];

        let summary = `${intro} a mix of ${top.toLowerCase()}${second ? ` and ${second.toLowerCase()}` : ""} vibes.`;

        if (consistency >= 5) {
            summary += " You've been remarkably consistent with your logging!";
        } else if (consistency > 0) {
            summary += " You're building a good habit of tracking your mental state.";
        } else {
            summary += " Try to log a bit more often to get deeper insights.";
        }

        return summary;
    };

    // AI Analysis Trigger
    useEffect(() => {
        const generateSummary = async () => {
            const apiKey = localStorage.getItem('groq_api_key') || import.meta.env.VITE_GROQ_API_KEY;

            // If no key or no data, use local fallback immediately
            if (!apiKey || last7Days.length === 0) {
                if (last7Days.length > 0) {
                    setAiSummary(generateLocalSummary());
                } else {
                    setAiSummary("Start logging your moods to see your weekly vibe check.");
                }
                return;
            }

            setIsAnalyzing(true);
            try {
                const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
                const logsText = last7Days.map(l => `${l.day}: ${l.sentiment} (${l.value}/10) - Tags: ${l.tags.join(', ')}`).join('\n');

                const prompt = `
                    Analyze these 7 days of mood data. Summarize the user's week in one empathetic sentence.
                    Data:
                    ${logsText}
                `;

                const completion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.3-70b-versatile",
                });

                setAiSummary(completion.choices[0]?.message?.content || generateLocalSummary());
            } catch (err) {
                console.error("Groq Analysis Failed, using fallback:", err);
                // Graceful degradation: Use local summary instead of error message
                setAiSummary(generateLocalSummary());
            } finally {
                setIsAnalyzing(false);
            }
        };

        generateSummary();
    }, [last7Days, consistencyScore, topEmotions]);

    const activeConfig = sphereConfig[currentIdx] || sphereConfig[0];

    const consistencyData = [{ name: 'Consistency', value: consistencyScore }];

    return (
        <div className="relative w-full min-h-screen overflow-y-auto bg-black text-white font-sans selection:bg-indigo-500/30">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 transition-opacity duration-1000 opacity-60">
                <CelestialSphere
                    hue={activeConfig.hue}
                    speed={activeConfig.speed}
                    zoom={activeConfig.zoom}
                    particleSize={activeConfig.particleSize}
                    className="w-full h-full"
                />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link
                        to="/sentience"
                        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-sm font-medium">Back</span>
                    </Link>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                        <TrendingUp size={16} className="text-indigo-400" />
                        <span className="text-sm font-bold tracking-widest uppercase">Weekly Vibe Check</span>
                    </div>
                </div>

                {/* AI Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full p-8 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 backdrop-blur-xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-32 bg-indigo-500/30 blur-[100px] rounded-full group-hover:bg-indigo-500/40 transition-colors" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 text-indigo-200">
                            <Sparkles size={20} className={isAnalyzing ? "animate-spin" : ""} />
                            <h2 className="text-sm font-bold uppercase tracking-widest">AI Weekly Insight</h2>
                        </div>
                        <p className="text-2xl md:text-3xl font-light leading-relaxed text-white">
                            "{aiSummary}"
                        </p>
                    </div>
                </motion.div>

                {/* Grid Layout for Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Consistency Score */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center relative min-h-[300px]"
                    >
                        <h3 className="text-lg font-medium text-white/70 absolute top-6 left-6">Logging Consistency</h3>

                        <div className="w-full h-[200px] relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart
                                    innerRadius="70%"
                                    outerRadius="100%"
                                    barSize={20}
                                    data={consistencyData}
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                    <RadialBar
                                        background
                                        dataKey="value"
                                        cornerRadius={30} // Use cornerRadius instead of corner
                                        fill="#818cf8"
                                    />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-4xl font-bold text-indigo-400">{consistencyScore}%</span>
                                <span className="text-xs text-white/40 uppercase tracking-widest mt-1">Consistency</span>
                            </div>
                        </div>
                        <p className="text-sm text-center text-white/50 mt-4">
                            You logged {Math.round((consistencyScore / 100) * 7)} out of 7 days this week.
                            {consistencyScore > 80 ? " Keep it up!" : " Consistency is key."}
                        </p>
                    </motion.div>

                    {/* Top 3 Emotions */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md min-h-[300px] flex flex-col"
                    >
                        <h3 className="text-lg font-medium text-white/70 mb-6">Top Emotions</h3>
                        <div className="flex-1 w-full min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topEmotions} layout="vertical" margin={{ left: 0, right: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 14 }}
                                        width={80}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="count" radius={[0, 10, 10, 0]}>
                                        {topEmotions.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
