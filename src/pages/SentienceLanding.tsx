
import { motion } from "framer-motion";
// @ts-ignore
import Hyperspeed from "@/components/Hyperspeed";
// @ts-ignore
import { hyperspeedPresets } from "@/components/HyperSpeedPresets";
import CardNav from "@/components/CardNav";
import GlitchText from "@/components/ui/glitch-text";
import HeroScrollVideo from "@/components/ui/scroll-animated-video";


export default function SentienceLanding() {
    const navItems = [
        {
            label: "CBT Studio",
            bgColor: "#2e1065", // Deep Violet
            textColor: "#e9d5ff",
            links: [
                { label: "Interactive Sessions", ariaLabel: "Start CBT Session" },
                { label: "Cognitive Reframing", ariaLabel: "Reframing Tools", href: "/cognitive-reframing" },
                { label: "Mind Info", ariaLabel: "View Mind Info", href: "/mind-info" }
            ]
        },
        {
            label: "Smart Journal",
            bgColor: "#1e1b4b", // Deep Indigo
            textColor: "#c7d2fe",
            links: [
                { label: "Smart Journal", ariaLabel: "Open Smart Journal", href: "/smart-journal" },
                { label: "Voice Notes", ariaLabel: "Record Voice Note" },
                { label: "Templates", ariaLabel: "View Templates", href: "/smart-journal" }
            ]
        },
        {
            label: "Mood Trends",
            bgColor: "#0c4a6e", // Deep Cyan
            textColor: "#bae6fd",
            links: [
                { label: "Weekly Report", ariaLabel: "View Weekly Report", href: "/weekly-report" },
                { label: "Emotional Patterns", ariaLabel: "View Emotional Patterns" },
                { label: "Emotional Unloading", ariaLabel: "View Emotional Unloading", href: "/emotional-unloading" }
            ]
        }
    ];

    return (
        <div className="min-h-screen w-full bg-black text-white overflow-x-hidden selection:bg-cyan-500/30 font-sans">

            {/* Hyperspeed Background Shader */}
            <div className="fixed inset-0 z-0 w-full h-full">
                <Hyperspeed effectOptions={hyperspeedPresets.five} />
            </div>

            {/* New Card Navigation */}
            <CardNav
                items={navItems}
                baseColor="transparent"
                menuColor="#050505"
                buttonBgColor="#ffffff"
                buttonTextColor="#000000"
                ease="circ.out"
            />

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-32 pb-20 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-center relative max-w-5xl mx-auto pointer-events-auto"
                >

                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 relative z-10 mix-blend-overlay">
                        <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white via-white/80 to-white/20 pb-4 filter drop-shadow-2xl">
                            Map Your
                        </span>

                        <span className="block mt-2 text-3xl md:text-5xl lg:text-6xl font-light text-neutral-300">
                            <GlitchText />
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-12 leading-relaxed drop-shadow-md">
                        Navigate the complexities of your mind with <span className="text-cyan-300 font-semibold">Sentience</span>.
                        Advanced analytics meets deep introspection in a sanctuary designed for your mental evolution.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(0,255,255,0.3)] hover:bg-white/20 transition-all"
                    >
                        BEGIN JOURNEY
                    </motion.button>
                </motion.div>
            </main>

            {/* Scrollytelling Section */}
            <div className="relative z-10 w-full bg-black">
                <HeroScrollVideo
                    title="Decode Your Psyche"
                    subtitle="Pattern Recognition"
                    meta="Sentience v1.0"
                    media="https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4" // Abstract neuron-like lines
                    mediaType="video"
                    scrollHeightVh={400} // Increased from default to keep it sticky longer
                    overlay={{
                        caption: "SYSTEM • SENTIENCE",
                        heading: "Visualizing The Subconscious",
                        paragraphs: [
                            "As you scroll, we decode the neural pathways of your thoughts.",
                            "This visualization represents the architecture of your emotions, mapping the unseen connections that define your experience."
                        ],
                    }}
                />
            </div>
        </div>
    );
}
