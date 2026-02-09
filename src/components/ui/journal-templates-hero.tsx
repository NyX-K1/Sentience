
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { gsap } from "gsap";

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

interface FlipCardProps {
    total: number;
    phase: AnimationPhase;
    target: { x: number; y: number; rotation: number; scale: number; opacity: number };
    title: string;
    bgImage: string;
}

// --- FlipCard Component ---
const IMG_WIDTH = 100;
const IMG_HEIGHT = 140;

function FlipCard({
    target,
    title,
    bgImage,
}: FlipCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!cardRef.current) return;

        gsap.to(cardRef.current, {
            x: target.x,
            y: target.y,
            rotate: target.rotation,
            scale: target.scale,
            opacity: target.opacity,
            duration: 0.6,
            ease: "power2.out",
        });
    }, [target]);

    return (
        <div
            ref={cardRef}
            style={{
                position: "absolute",
                width: IMG_WIDTH,
                height: IMG_HEIGHT,
                transformStyle: "preserve-3d",
                perspective: "1000px",
            }}
            className="cursor-pointer group"
        >
            <motion.div
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                whileHover={{ rotateY: 180 }}
            >
                {/* Front Face */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg border border-cyan-500/30"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    {/* Background Image */}
                    <img
                        src={bgImage}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover brightness-110"
                    />
                    {/* Lighter gradient overlay for text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent" />
                    <div className="relative h-full w-full flex items-center justify-center p-3">
                        <p className="text-white text-center font-bold text-sm leading-relaxed tracking-wide group-hover:scale-105 transition-transform duration-300 [text-shadow:_0_2px_12px_rgb(0_0_0_/_90%)]">
                            {title}
                        </p>
                    </div>
                </div>

                {/* Back Face */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-black flex flex-col items-center justify-center p-4 border border-cyan-500/50"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Use</p>
                        <p className="text-xs font-medium text-white">Template</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// --- Main Hero Component ---
const TOTAL_IMAGES = 12;
const MAX_SCROLL = 3000;

// Positive Affirmations Templates with background images
const TEMPLATES = [
    { text: "I Am Enough", bg: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80" },
    { text: "I Choose Joy Today", bg: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80" },
    { text: "I Am Calm & Centered", bg: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80" },
    { text: "I Create My Reality", bg: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80" },
    { text: "I Achieve My Dreams", bg: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=400&q=80" },
    { text: "I Trust The Journey", bg: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80" },
    { text: "I Attract Abundance", bg: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&q=80" },
    { text: "I Deserve Happiness", bg: "https://images.unsplash.com/photo-1502139214982-d0ad755818d8?w=400&q=80" },
    { text: "I Am Powerful", bg: "https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=400&q=80" },
    { text: "I Am Present & Grateful", bg: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80" },
    { text: "I Embrace My Growth", bg: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&q=80" },
    { text: "I See Clearly Now", bg: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80" },
];

// Helper for linear interpolation
const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export default function JournalTemplatesHero() {
    const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Virtual scroll with GSAP smoothing
    const virtualScroll = useMotionValue(0);
    const scrollRef = useRef(0);
    const targetScrollRef = useRef(0);

    // --- Container Size ---
    useEffect(() => {
        if (!containerRef.current) return;

        const handleResize = (entries: ResizeObserverEntry[]) => {
            for (const entry of entries) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        };

        const observer = new ResizeObserver(handleResize);
        observer.observe(containerRef.current);

        setContainerSize({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight,
        });

        return () => observer.disconnect();
    }, []);

    // --- Smooth Virtual Scroll with GSAP ---
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            targetScrollRef.current = Math.min(Math.max(targetScrollRef.current + e.deltaY * 2, 0), MAX_SCROLL);
        };

        // Touch support
        let touchStartY = 0;
        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
        };
        const handleTouchMove = (e: TouchEvent) => {
            const touchY = e.touches[0].clientY;
            const deltaY = (touchStartY - touchY) * 2;
            touchStartY = touchY;
            targetScrollRef.current = Math.min(Math.max(targetScrollRef.current + deltaY, 0), MAX_SCROLL);
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        container.addEventListener("touchstart", handleTouchStart, { passive: false });
        container.addEventListener("touchmove", handleTouchMove, { passive: false });

        // GSAP smooth interpolation
        const ticker = gsap.ticker.add(() => {
            scrollRef.current = lerp(scrollRef.current, targetScrollRef.current, 0.1);
            virtualScroll.set(scrollRef.current);
        });

        return () => {
            container.removeEventListener("wheel", handleWheel);
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchmove", handleTouchMove);
            gsap.ticker.remove(ticker);
        };
    }, [virtualScroll]);

    // 1. Morph Progress: 0 (Circle) -> 1 (Bottom Arc)
    const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1]);
    const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });

    // 2. Scroll Rotation (Shuffling)
    const scrollRotate = useTransform(virtualScroll, [600, 3000], [0, 360]);
    const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });

    // --- Mouse Parallax ---
    const mouseX = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const normalizedX = (relativeX / rect.width) * 2 - 1;
            mouseX.set(normalizedX * 100);
        };
        container.addEventListener("mousemove", handleMouseMove);
        return () => container.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX]);

    // --- Intro Sequence ---
    useEffect(() => {
        const timer1 = setTimeout(() => setIntroPhase("line"), 500);
        const timer2 = setTimeout(() => setIntroPhase("circle"), 2500);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);

    // --- Random Scatter Positions ---
    const scatterPositions = useMemo(() => {
        return TEMPLATES.slice(0, TOTAL_IMAGES).map(() => ({
            x: (Math.random() - 0.5) * 1500,
            y: (Math.random() - 0.5) * 1000,
            rotation: (Math.random() - 0.5) * 180,
            scale: 0.6,
            opacity: 0,
        }));
    }, []);

    // --- Render Loop (Manual Calculation for Morph) ---
    const [morphValue, setMorphValue] = useState(0);
    const [rotateValue, setRotateValue] = useState(0);
    const [parallaxValue, setParallaxValue] = useState(0);

    useEffect(() => {
        const unsubscribeMorph = smoothMorph.on("change", setMorphValue);
        const unsubscribeRotate = smoothScrollRotate.on("change", setRotateValue);
        const unsubscribeParallax = smoothMouseX.on("change", setParallaxValue);
        return () => {
            unsubscribeMorph();
            unsubscribeRotate();
            unsubscribeParallax();
        };
    }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

    // --- Content Opacity ---
    const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);
    const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden text-white selection:bg-cyan-500/30">
            {/* Back Button Overlay */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="fixed top-6 left-6 z-[60]"
            >
                <Link
                    to="/sentience"
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
                >
                    <ArrowLeft size={16} />
                    <span className="text-sm font-medium">Back</span>
                </Link>
            </motion.div>

            {/* Container */}
            <div className="flex h-full w-full flex-col items-center justify-center perspective-1000">

                {/* Intro Text (Fades out) */}
                <div className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2">
                    <motion.h1
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={introPhase === "circle" && morphValue < 0.5 ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" } : { opacity: 0, filter: "blur(10px)" }}
                        transition={{ duration: 1 }}
                        className="text-2xl font-medium tracking-tight text-white md:text-5xl"
                    >
                        JOURNAL TEMPLATES
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={introPhase === "circle" && morphValue < 0.5 ? { opacity: 0.5 - morphValue } : { opacity: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="mt-4 text-xs font-bold tracking-[0.2em] text-cyan-500"
                    >
                        SCROLL TO EXPLORE
                    </motion.p>
                </div>

                {/* Arc Active Content (Fades in) */}
                <motion.div
                    style={{ opacity: contentOpacity, y: contentY }}
                    className="absolute top-[10%] z-10 flex flex-col items-center justify-center text-center pointer-events-none px-4"
                >
                    <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-4">
                        Select a Template
                    </h2>
                    <p className="text-sm md:text-base text-zinc-400 max-w-lg leading-relaxed">
                        Choose a structure for your thoughts. <br className="hidden md:block" />
                        Scroll to rotate through the collection.
                    </p>
                </motion.div>

                {/* Main Container */}
                <div className="relative flex items-center justify-center w-full h-full">
                    {TEMPLATES.slice(0, TOTAL_IMAGES).map((item, i) => {
                        let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

                        // 1. Intro Phases (Scatter -> Line)
                        if (introPhase === "scatter") {
                            target = scatterPositions[i];
                        } else if (introPhase === "line") {
                            const lineSpacing = 110;
                            const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
                            const lineX = i * lineSpacing - lineTotalWidth / 2;
                            target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
                        } else {
                            // 2. Circle Phase & Morph Logic

                            // Responsive Calculations
                            const isMobile = containerSize.width < 768;
                            const minDimension = Math.min(containerSize.width, containerSize.height);

                            // A. Calculate Circle Position
                            const circleRadius = Math.min(minDimension * 0.35, 300);

                            const circleAngle = (i / TOTAL_IMAGES) * 360;
                            const circleRad = (circleAngle * Math.PI) / 180;
                            const circlePos = {
                                x: Math.cos(circleRad) * circleRadius,
                                y: Math.sin(circleRad) * circleRadius,
                                rotation: circleAngle + 90,
                            };

                            // B. Calculate Bottom Arc Position
                            const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
                            const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);

                            const arcApexY = containerSize.height * (isMobile ? 0.35 : 0.25);
                            const arcCenterY = arcApexY + arcRadius;

                            const spreadAngle = isMobile ? 100 : 130;
                            const startAngle = -90 - (spreadAngle / 2);
                            const step = spreadAngle / (TOTAL_IMAGES - 1);

                            const scrollProgressVal = Math.min(Math.max(rotateValue / 360, 0), 1);

                            const maxRotation = spreadAngle * 0.8;
                            const boundedRotation = -scrollProgressVal * maxRotation;

                            const currentArcAngle = startAngle + (i * step) + boundedRotation;
                            const arcRad = (currentArcAngle * Math.PI) / 180;

                            const arcPos = {
                                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                                rotation: currentArcAngle + 90,
                                scale: isMobile ? 1.4 : 1.5,
                            };

                            // C. Interpolate (Morph)
                            target = {
                                x: lerp(circlePos.x, arcPos.x, morphValue),
                                y: lerp(circlePos.y, arcPos.y, morphValue),
                                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                                scale: lerp(1, arcPos.scale, morphValue),
                                opacity: 1 - Math.abs(currentArcAngle + 90) / 120,
                            };
                        }

                        if (target.opacity < 0) target.opacity = 0;

                        return (
                            <FlipCard
                                key={i}
                                title={item.text}
                                bgImage={item.bg}
                                total={TOTAL_IMAGES}
                                phase={introPhase}
                                target={target}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
