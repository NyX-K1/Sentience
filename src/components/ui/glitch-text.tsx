
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHRASES = [
    "Inner Universe",
    "Emotional Landscape",
    "Subconscious Blueprint",
    "Neural Frequency",
    "Uncharted Mind",
];

export default function GlitchText() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % PHRASES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative block w-full h-[1.2em] md:h-[1.5em] lg:h-[1.5em] text-center">
            <AnimatePresence mode="wait">
                <Banner key={index} text={PHRASES[index]} />
            </AnimatePresence>
        </div>
    );
}

const Banner = ({ text }: { text: string }) => {
    return (
        <motion.span
            className="absolute inset-0 flex items-center justify-center font-mono font-bold tracking-[0.1em] uppercase whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
                textShadow: "0 0 20px rgba(255, 255, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.2)"
            }}
        >
            {/* Main Text */}
            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-b from-white via-neutral-200 to-neutral-500">
                {text}
            </span>

            {/* Glitch Layer 1 - Cyan Horizontal Slice */}
            <GlitchLayer text={text} color="#00f0ff" delay={0} />

            {/* Glitch Layer 2 - Violet Horizontal Slice */}
            <GlitchLayer text={text} color="#8b5cf6" delay={0.05} />

            {/* Glitch Layer 3 - Random Noise */}
            <GlitchLayer text={text} color="#ffffff" delay={0.1} />
        </motion.span>
    );
};

const GlitchLayer = ({ text, color, delay }: { text: string, color: string, delay: number }) => {
    return (
        <motion.span
            className="absolute inset-0 z-0 opacity-70 select-none pointer-events-none"
            style={{ color: color }}
            initial={{ clipPath: "inset(50% 0 50% 0)", x: 0 }}
            animate={{
                clipPath: [
                    "inset(10% 0 80% 0)",
                    "inset(40% 0 20% 0)",
                    "inset(80% 0 5% 0)",
                    "inset(50% 0 50% 0)"
                ],
                x: [-5, 5, -2, 0],
                opacity: [0, 1, 0]
            }}
            transition={{
                duration: 0.4,
                delay: delay,
                times: [0, 0.4, 0.8, 1],
                ease: "easeInOut"
            }}
        >
            {text}
        </motion.span>
    )
}
