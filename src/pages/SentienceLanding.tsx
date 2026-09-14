import { useState, useEffect, useRef } from "react";
import Lenis from '@studio-freight/lenis';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import { motion } from "framer-motion";
import Prism from "@/components/Prism";
import CardNav from "@/components/CardNav";
import FallingText from "@/components/FallingText";
import ScrollytellingStory from "@/components/ScrollytellingStory";
import PinRotateCards from "@/components/PinRotateCards";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";

// Quotes
const quotes = [
    {
        quote: "The mind is its own place, and in it can make a heaven of hell, a hell of heaven.",
        speaker: "John Milton",
        context: "From Paradise Lost (1667)",
        link: "https://poets.org/poem/paradise-lost-book-i-lines-242-270"
    },
    {
        quote: "Between stimulus and response there is a space. In that space is our power to choose our response.",
        speaker: "Viktor Frankl",
        context: "Austrian psychiatrist & Holocaust survivor",
        link: "https://www.viktorfrankl.org/biography.html"
    },
    {
        quote: "The wound is the place where the Light enters you.",
        speaker: "Rumi",
        context: "13th-century Persian poet",
        link: "https://poets.org/poet/jalal-al-din-rumi"
    },
    {
        quote: "No tree, it is said, can grow to heaven unless its roots reach down to hell.",
        speaker: "Carl Jung",
        context: "Aion: Researches into the Phenomenology of the Self",
        link: "https://carljungdepthpsychologysite.blog/2020/02/09/carl-jung-on-the-tree-of-life-and-the-roots-in-hell/"
    },
    {
        quote: "We don't see things as they are, we see them as we are.",
        speaker: "Anaïs Nin",
        context: "French-Cuban American diarist",
        link: "https://anaisninblog.skybluepress.com/2012/10/we-dont-see-things-as-they-are-we-see-them-as-we-are/"
    }
];

// Staggered word animation
function StaggerWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
    return (
        <span className={className}>
            {text.split(' ').map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.8, delay: delay + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block mr-[0.25em]"
                >
                    {word}
                </motion.span>
            ))}
        </span>
    );
}

export default function SentienceLanding() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showStory, setShowStory] = useState<boolean | null>(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio('/ambient-drone.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
        return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
    }, []);

    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (isAudioPlaying) { audioRef.current.pause(); } else { audioRef.current.play().catch(() => { }); }
        setIsAudioPlaying(!isAudioPlaying);
    };

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8,
            touchMultiplier: 2,
            infinite: false,
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
        return () => { lenis.destroy(); };
    }, []);

    const [randomQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

    const handleStoryChoice = (choice: boolean) => {
        setShowStory(choice);
        setTimeout(() => { window.scrollBy({ top: 500, behavior: 'smooth' }); }, 300);
    };

    const navItems = [
        {
            label: "CBT Studio",
            bgColor: "#2e1065",
            textColor: "#e9d5ff",
            links: [
                { label: "Mood Tracker", ariaLabel: "View Mood Tracker", href: "/mood-tracker" },
                { label: "Thought Reframer", ariaLabel: "Reframe Negative Thoughts", href: "/thought-reframer" }
            ]
        },
        {
            label: "Smart Journal",
            bgColor: "#1e1b4b",
            textColor: "#c7d2fe",
            links: [
                { label: "Write Smart Journal", ariaLabel: "Open Smart Journal", href: "/smart-journalling" },
                { label: "Past Entries (Diary)", ariaLabel: "View Past Entries", href: "/diary" }
            ]
        },
        {
            label: "Mood Trends",
            bgColor: "#0c4a6e",
            textColor: "#bae6fd",
            links: [
                { label: "Data Export", ariaLabel: "View Data Export", href: "/data-export" },
                { label: "User Analytics", ariaLabel: "View User Analytics", href: "/user-analytics" }
            ]
        }
    ];

    return (
        <div className="min-h-screen w-full bg-black text-white overflow-x-hidden selection:bg-cyan-500/30 font-sans relative">

            {/* Prism Background Shader */}
            <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
                <Prism
                    animationType="rotate"
                    timeScale={0.5}
                    height={3.5}
                    baseWidth={5.5}
                    scale={3.6}
                    hueShift={0}
                    colorFrequency={1}
                    noise={0}
                    glow={1}
                />
            </div>

            {/* Ambient Light Orbs — slow-moving gradients */}
            <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ x: [0, 100, -50, 0], y: [0, -80, 60, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[10%] left-[15%] w-[600px] h-[600px] rounded-full bg-cyan-500/[0.03] blur-[150px]"
                />
                <motion.div
                    animate={{ x: [0, -80, 40, 0], y: [0, 60, -100, 0] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[15%] right-[10%] w-[500px] h-[500px] rounded-full bg-violet-500/[0.04] blur-[130px]"
                />
                <motion.div
                    animate={{ x: [0, 50, -30, 0], y: [0, -40, 80, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[45%] left-[50%] w-[400px] h-[400px] rounded-full bg-indigo-500/[0.02] blur-[120px] -translate-x-1/2"
                />
            </div>

            <CardNav
                items={navItems}
                menuColor="#050505"
                buttonBgColor="#ffffff"
                buttonTextColor="#000000"
                ease="circ.out"
                isOpen={isMenuOpen}
                onOpenChange={setIsMenuOpen}
            />

            {/* ═══ HERO ═══ */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pointer-events-none">

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-white"
                            style={{ width: Math.random() > 0.7 ? 2 : 1, height: Math.random() > 0.7 ? 2 : 1 }}
                            initial={{
                                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                                opacity: Math.random() * 0.4 + 0.1
                            }}
                            animate={{
                                y: [null, Math.random() * -300 - 100],
                                x: [null, Math.random() * 120 - 60],
                                opacity: [null, 0]
                            }}
                            transition={{
                                duration: Math.random() * 12 + 10,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="text-center relative max-w-5xl mx-auto pointer-events-auto flex flex-col items-center"
                >
                    {/* Overline */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="mb-8"
                    >
                        <span className="text-[10px] uppercase tracking-[0.6em] text-white/15 font-light">
                            Emotional Intelligence Platform
                        </span>
                    </motion.div>

                    {/* Main Title */}
                    <motion.h1
                        initial={{ opacity: 0, letterSpacing: "0.6em" }}
                        animate={{ opacity: 1, letterSpacing: "0.25em" }}
                        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        className="text-5xl md:text-7xl lg:text-[7.5rem] font-extralight uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 tracking-[0.25em] mix-blend-plus-lighter leading-none mb-6"
                    >
                        Sentience
                    </motion.h1>

                    {/* Animated rule */}
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "100px", opacity: 1 }}
                        transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
                        className="h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent mb-8"
                    />

                    {/* Staggered word tagline */}
                    <div className="mb-12">
                        <StaggerWords
                            text="Map your mind. Understand your emotions. Transform your thoughts."
                            className="text-sm md:text-base font-extralight tracking-[0.15em] text-white/25 leading-relaxed"
                            delay={1.5}
                        />
                    </div>

                    {/* CTA */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 2.5, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setIsMenuOpen(true)}
                        className="group relative px-12 py-4 rounded-full overflow-hidden border border-white/8 bg-white/[0.03] backdrop-blur-sm text-[10px] font-medium uppercase tracking-[0.3em] transition-all duration-500 hover:border-white/20 hover:bg-white/[0.06]"
                    >
                        <span className="relative z-10 text-white/50 group-hover:text-white/80 transition-colors duration-500">
                            Begin Journey
                        </span>
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
                        {/* Shimmer sweep */}
                        <motion.div
                            className="absolute inset-0 -z-5 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
                        />
                    </motion.button>

                    {/* Subtle "Scroll" text */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3.5, duration: 1.5 }}
                        className="mt-16 text-[9px] uppercase tracking-[0.5em] text-white/10 font-light"
                    >
                        Scroll to explore
                    </motion.p>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30 pointer-events-none"
                >
                    <div className="w-[1px] h-20 bg-white/8 relative overflow-hidden">
                        <motion.div
                            className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent"
                            animate={{ y: ["-100%", "300%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                </motion.div>
            </main>

            {/* ═══ PHILOSOPHY SECTION ═══ */}
            <div className="relative w-full py-40 flex items-center justify-center bg-gradient-to-b from-transparent to-black/60">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-150px" }}
                    transition={{ duration: 1.5 }}
                    className="max-w-4xl mx-auto px-6 text-center"
                >
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.2 }}
                        className="text-[10px] uppercase tracking-[0.5em] text-cyan-400/25 mb-12 font-light"
                    >
                        Our Philosophy
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.4 }}
                        className="text-xl md:text-3xl lg:text-4xl font-extralight text-white/40 leading-[2] tracking-wide"
                    >
                        We believe emotions are not problems to solve,
                        <br className="hidden md:block" />
                        but <span className="text-white/70">signals to understand</span>.
                    </motion.p>

                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "60px" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.8 }}
                        className="h-[1px] bg-white/10 mx-auto my-12"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 1 }}
                        className="flex justify-center gap-16 md:gap-24"
                    >
                        {[
                            { value: '951', label: 'Emotions Mapped' },
                            { value: '16', label: 'Cognitive Patterns' },
                            { value: '8', label: 'CBT Steps' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 1.2 + i * 0.15 }}
                                className="text-center"
                            >
                                <p className="text-2xl md:text-3xl font-extralight text-white/60 tracking-wider">{stat.value}</p>
                                <p className="text-[9px] uppercase tracking-[0.3em] text-white/15 mt-2 font-light">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* ═══ QUOTE SECTION ═══ */}
            <div className="relative w-full min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-black/60 via-black/90 to-black py-32">
                {/* Decorative side lines */}
                <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: "200px" }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                    className="absolute left-[8%] top-1/2 -translate-y-1/2 w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent hidden lg:block"
                />
                <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: "200px" }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, delay: 0.7, ease: "easeOut" }}
                    className="absolute right-[8%] top-1/2 -translate-y-1/2 w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent hidden lg:block"
                />

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center"
                >
                    <motion.p
                        initial={{ opacity: 0, scale: 0.97 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
                        className="text-2xl md:text-4xl lg:text-5xl font-extralight text-neutral-300/80 leading-relaxed mb-16 italic drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                    >
                        "{randomQuote.quote}"
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="flex flex-col items-center gap-8"
                    >
                        <div className="h-24 w-[500px] max-w-full relative cursor-pointer" title="Hover me">
                            <FallingText
                                text={randomQuote.speaker}
                                highlightWords={randomQuote.speaker.split(" ")}
                                highlightClass="text-cyan-400/80 font-light tracking-[0.3em] uppercase drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                                trigger="hover"
                                backgroundColor="transparent"
                                wireframes={false}
                                gravity={0.5}
                                fontSize="2.5rem"
                                mouseConstraintStiffness={0.9}
                            />
                        </div>

                        <div className="text-neutral-600 text-xs tracking-[0.3em] uppercase flex flex-col items-center gap-6">
                            <span className="text-neutral-500/60 font-light">{randomQuote.context}</span>
                            <a
                                href={randomQuote.link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-white/20 hover:text-white/50 transition-all duration-500 border border-white/8 rounded-full px-6 py-3 hover:border-white/15 hover:bg-white/[0.03] text-[10px] tracking-[0.3em]"
                            >
                                Read More <ArrowRight className="w-3 h-3" />
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* ═══ STORY PROMPT ═══ */}
            <div className="relative w-full py-40 flex flex-col items-center justify-center bg-black z-10">
                {/* Decorative horizontal line */}
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "120px" }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16"
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2 }}
                    className="text-center"
                >
                    <p className="text-[10px] uppercase tracking-[0.5em] text-white/10 mb-6 font-light">The Architect & The Shadow</p>
                    <h3 className="text-2xl md:text-4xl text-white/60 font-extralight mb-4 tracking-[0.1em]">
                        Would you like to hear a story?
                    </h3>
                    <p className="text-xs text-white/15 mb-12 font-light tracking-wide max-w-md mx-auto">
                        A scrollytelling experience about the parts of ourselves we try to hide.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => handleStoryChoice(true)}
                            className={`px-10 py-3.5 rounded-full border transition-all duration-500 uppercase tracking-[0.3em] text-[10px] font-medium ${showStory === true
                                ? 'border-cyan-400/40 bg-cyan-400/10 text-white/80 shadow-[0_0_30px_rgba(34,211,238,0.1)]'
                                : 'border-white/8 text-white/25 hover:border-white/15 hover:text-white/40 hover:bg-white/[0.03]'
                                }`}
                        >
                            Enter
                        </button>
                        <button
                            onClick={() => handleStoryChoice(false)}
                            className={`px-10 py-3.5 rounded-full border transition-all duration-500 uppercase tracking-[0.3em] text-[10px] font-medium ${showStory === false
                                ? 'border-white/15 bg-white/5 text-white/50'
                                : 'border-white/5 text-white/15 hover:border-white/10 hover:text-white/25'
                                }`}
                        >
                            Skip
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Scrollytelling + Cards */}
            {showStory === true && <ScrollytellingStory />}
            {showStory !== null && <PinRotateCards />}

            {/* ═══ FOOTER ═══ */}
            <footer className="relative w-full py-20 bg-black border-t border-white/[0.03] z-10">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="text-[10px] uppercase tracking-[0.5em] text-white/10 font-light mb-4"
                    >
                        Built for those who dare to feel
                    </motion.p>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-white/[0.05] font-light">
                        Sentience — Emotional Intelligence Platform
                    </p>
                </div>
            </footer>

            {/* Audio */}
            <button
                onClick={toggleAudio}
                className="fixed bottom-8 right-8 z-50 p-3.5 rounded-full bg-black/40 backdrop-blur-md border border-white/[0.06] text-white/30 hover:text-white/60 hover:border-white/15 transition-all duration-500 hover:scale-110 active:scale-95"
            >
                {isAudioPlaying ? <Volume2 size={18} className="text-cyan-400/70 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" /> : <VolumeX size={18} />}
            </button>
        </div>
    );
}
