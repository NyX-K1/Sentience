import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { FadeText } from '@/components/ui/fade-text';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 40;
const FRAME_PREFIX = 'ezgif-frame-';

interface AnimState {
    frame: number;
    targetFrame: number;
}

const ScrollAnimationLanding: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lenisRef = useRef<Lenis | null>(null);
    const framesRef = useRef<HTMLImageElement[]>([]);
    const animStateRef = useRef<AnimState>({ frame: 0, targetFrame: 0 });

    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Preload frames
    useEffect(() => {
        let imagesLoaded = 0;
        const frames: HTMLImageElement[] = [];

        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            const frameNumber = i.toString().padStart(3, '0');
            img.src = `/frames/${FRAME_PREFIX}${frameNumber}.jpg`;

            img.onload = () => {
                imagesLoaded++;
                setLoadingProgress((imagesLoaded / FRAME_COUNT) * 100);

                if (imagesLoaded === FRAME_COUNT) {
                    setTimeout(() => setIsLoaded(true), 500);
                }
            };

            img.onerror = () => {
                console.error(`Failed to load frame ${frameNumber}`);
                imagesLoaded++;
                setLoadingProgress((imagesLoaded / FRAME_COUNT) * 100);
            };

            frames.push(img);
        }

        framesRef.current = frames;
    }, []);

    // Initialize canvas and scroll
    useEffect(() => {
        if (!isLoaded || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const updateCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        // Initialize Lenis smooth scroll
        const lenis = new Lenis({
            duration: 0.8,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            touchMultiplier: 2,
        });
        lenisRef.current = lenis;

        // Sync Lenis with GSAP
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        // Initialize ScrollTrigger
        ScrollTrigger.create({
            trigger: '.scroll-spacer',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.1,
            onUpdate: (self) => {
                animStateRef.current.targetFrame = self.progress * (FRAME_COUNT - 1);

                // Auto-redirect when reaching 95% progress
                if (self.progress >= 0.95) {
                    navigate('/sentience');
                }

                // Hide scroll prompt after initial scroll
                const scrollPrompt = document.querySelector('.scroll-prompt');
                if (self.progress > 0.05 && scrollPrompt) {
                    gsap.to(scrollPrompt, { opacity: 0, duration: 0.5 });
                } else if (self.progress <= 0.05 && scrollPrompt) {
                    gsap.to(scrollPrompt, { opacity: 1, duration: 0.5 });
                }
            },
        });

        // Animation loop
        const drawFrame = (frameIndex: number) => {
            if (framesRef.current.length === 0) return;

            const frameIndex_rounded = Math.round(frameIndex);
            const img = framesRef.current[frameIndex_rounded];

            if (!img || !img.complete) return;

            const imgAspect = img.width / img.height;
            const canvasAspect = canvas.width / canvas.height;

            let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number;

            if (imgAspect > canvasAspect) {
                drawHeight = canvas.height;
                drawWidth = drawHeight * imgAspect;
                offsetX = (canvas.width - drawWidth) / 2;
                offsetY = 0;
            } else {
                drawWidth = canvas.width;
                drawHeight = drawWidth / imgAspect;
                offsetX = 0;
                offsetY = (canvas.height - drawHeight) / 2;
            }

            // Apply dynamic filters based on frame position
            let brightnessBoost: number, contrastBoost: number, saturationBoost: number;

            if (frameIndex_rounded < 10) {
                brightnessBoost = 1.02;
                contrastBoost = 1.05;
                saturationBoost = 1.03;
            } else if (frameIndex_rounded >= 10 && frameIndex_rounded < 30) {
                const midProgress = (frameIndex_rounded - 10) / 20;
                const peakFactor = 1 - Math.abs(midProgress - 0.5) * 2;
                brightnessBoost = 1.08 + peakFactor * 0.07;
                contrastBoost = 1.12 + peakFactor * 0.06;
                saturationBoost = 1.08 + peakFactor * 0.04;
            } else {
                brightnessBoost = 1.02;
                contrastBoost = 1.05;
                saturationBoost = 1.03;
            }

            ctx.filter = `brightness(${brightnessBoost}) contrast(${contrastBoost}) saturate(${saturationBoost})`;
            ctx.globalCompositeOperation = 'copy';
            ctx.globalAlpha = 1;
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

            ctx.globalCompositeOperation = 'source-over';
            ctx.filter = 'none';
        };

        const animate = () => {
            animStateRef.current.frame += (animStateRef.current.targetFrame - animStateRef.current.frame) * 0.35;
            drawFrame(animStateRef.current.frame);
        };

        gsap.ticker.add(animate);

        // Draw first frame
        if (framesRef.current[0]?.complete) {
            drawFrame(0);
        }

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
            lenis.destroy();
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
            gsap.ticker.remove(animate);
        };
    }, [isLoaded, navigate]);

    return (
        <div className="relative w-full overflow-x-hidden bg-black">
            {/* Loading Screen */}
            {!isLoaded && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white">
                    <p className="text-2xl mb-6 tracking-wider">Loading Experience...</p>
                    <div className="w-[300px] h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                            style={{ width: `${loadingProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Scroll Prompt */}
            <div className="scroll-prompt fixed bottom-12 left-1/2 -translate-x-1/2 z-10 text-center text-white pointer-events-none">
                <FadeText
                    className="text-xl mb-5 tracking-[3px] uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-light"
                    direction="up"
                    framerProps={{
                        show: { transition: { delay: 0.5, type: "spring", stiffness: 100 } },
                    }}
                    text="clear your mind and scroll"
                />
                <div className="w-[30px] h-[50px] border-2 border-white/80 rounded-full mx-auto relative">
                    <span className="absolute top-2 left-1/2 -ml-[3px] w-1.5 h-1.5 bg-white/80 rounded-full animate-scroll-indicator" />
                </div>
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="fixed top-0 left-0 w-screen h-screen z-[1]"
            />

            {/* Scroll Spacer */}
            <div className="scroll-spacer relative z-0 h-[300vh]" />

            {/* Global styles for scroll indicator animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes scroll-indicator {
          0% {
            opacity: 1;
            top: 8px;
          }
          100% {
            opacity: 0;
            top: 30px;
          }
        }
        .animate-scroll-indicator {
          animation: scroll-indicator 2s infinite;
        }
      `}} />
        </div>
    );
};

export default ScrollAnimationLanding;
