
// 'use client'
import React, { useRef, useEffect } from "react";
import {
    motion,
    useMotionTemplate,
    useScroll,
    useTransform,
} from "framer-motion";
import { Brain, ArrowRight, Heart, Cloud, Zap, Activity } from "lucide-react";

// Manual Lenis implementation to avoid import issues
import Lenis from "lenis";

export const EmotionalHero = () => {
    useEffect(() => {
        const lenis = new Lenis();
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        return () => {
            lenis.destroy();
        };
    }, []);

    return (
        <div className="bg-zinc-950 min-h-screen text-white selection:bg-cyan-500/30">
            <Nav />
            <Hero />
            <History />
        </div>
    );
};

const Nav = () => {
    return (
        <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 text-white mix-blend-difference">
            <div className="flex items-center gap-2">
                <Brain className="text-3xl text-cyan-400" />
                <span className="font-bold text-xl tracking-tighter">SENTIENCE</span>
            </div>
            <button
                onClick={() => {
                    document.getElementById("history-section")?.scrollIntoView({
                        behavior: "smooth",
                    });
                }}
                className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-cyan-400 transition-colors"
            >
                SESSION HISTORY <ArrowRight size={14} />
            </button>
        </nav>
    );
};

const SECTION_HEIGHT = 1500;

const Hero = () => {
    return (
        <div
            style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
            className="relative w-full"
        >
            <CenterImage />

            <ParallaxImages />

            <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-zinc-950/0 to-zinc-950" />
        </div>
    );
};

const CenterImage = () => {
    const { scrollY } = useScroll();

    const clip1 = useTransform(scrollY, [0, 1500], [25, 0]);
    const clip2 = useTransform(scrollY, [0, 1500], [75, 100]);

    const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

    const backgroundSize = useTransform(
        scrollY,
        [0, SECTION_HEIGHT + 500],
        ["170%", "100%"]
    );
    const opacity = useTransform(
        scrollY,
        [SECTION_HEIGHT, SECTION_HEIGHT + 500],
        [1, 0]
    );

    return (
        <motion.div
            className="sticky top-0 h-screen w-full"
            style={{
                clipPath,
                backgroundSize,
                opacity,
                // Abstract fluid/water image for calmness
                backgroundImage:
                    "url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        />
    );
};

const ParallaxImages = () => {
    return (
        <div className="mx-auto max-w-5xl px-4 pt-[200px]">
            <ParallaxImg
                src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2400&auto=format&fit=crop"
                alt="Calm Water"
                start={-200}
                end={200}
                className="w-1/3 rounded-lg opacity-80"
            />
            <ParallaxImg
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2673&auto=format&fit=crop"
                alt="Sky"
                start={200}
                end={-250}
                className="mx-auto w-2/3 rounded-lg opacity-80"
            />
            <ParallaxImg
                src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2670&auto=format&fit=crop"
                alt="Mountains"
                start={-200}
                end={200}
                className="ml-auto w-1/3 rounded-lg opacity-80"
            />
            <ParallaxImg
                src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2670&auto=format&fit=crop"
                alt="Nature"
                start={0}
                end={-500}
                className="ml-24 w-5/12 rounded-lg opacity-80"
            />
        </div>
    );
};

const ParallaxImg = ({ className, alt, src, start, end }: { className?: string, alt: string, src: string, start: number, end: number }) => {
    const ref = useRef(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: [`${start}px end`, `end ${end * -1}px`],
    });

    const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
    const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);

    const y = useTransform(scrollYProgress, [0, 1], [start, end]);
    const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;

    return (
        <motion.img
            src={src}
            alt={alt}
            className={className}
            ref={ref}
            style={{ transform, opacity }}
        />
    );
};

const History = () => {
    return (
        <section
            id="history-section"
            className="mx-auto max-w-5xl px-4 py-48 text-white"
        >
            <motion.div
                initial={{ y: 48, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ ease: "easeInOut", duration: 0.75 }}
                className="mb-20"
            >
                <h1 className="text-4xl font-black uppercase text-zinc-50 mb-2">
                    Unloading History
                </h1>
                <p className="text-zinc-500">Track your journey of emotional release.</p>
            </motion.div>

            <HistoryItem title="Anxiety Release" date="Today, 9:00 AM" mood="Calm" icon={<Cloud size={20} className="text-blue-400" />} />
            <HistoryItem title="Frustration Vent" date="Yesterday, 6:30 PM" mood="Relieved" icon={<Zap size={20} className="text-yellow-400" />} />
            <HistoryItem title="Deep Reflection" date="Feb 2nd" mood="Insightful" icon={<Brain size={20} className="text-purple-400" />} />
            <HistoryItem title="Gratitude Log" date="Jan 30th" mood="Happy" icon={<Heart size={20} className="text-pink-400" />} />
            <HistoryItem title="Stress Management" date="Jan 25th" mood="Stable" icon={<Activity size={20} className="text-green-400" />} />
        </section>
    );
};

const HistoryItem = ({ title, date, mood, icon }: { title: string, date: string, mood: string, icon: React.ReactNode }) => {
    return (
        <motion.div
            initial={{ y: 48, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ ease: "easeInOut", duration: 0.75 }}
            className="mb-9 flex items-center justify-between border-b border-zinc-800 px-3 pb-9 hover:bg-zinc-900/50 transition-colors rounded-lg p-4"
        >
            <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-900 rounded-full border border-zinc-800">
                    {icon}
                </div>
                <div>
                    <p className="mb-1.5 text-xl text-zinc-50 font-semibold">{title}</p>
                    <p className="text-sm uppercase text-zinc-500 font-mono">{date}</p>
                </div>
            </div>
            <div className="flex items-center gap-1.5 text-end text-sm uppercase text-zinc-400 font-mono bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                <p>{mood}</p>
            </div>
        </motion.div>
    );
};
