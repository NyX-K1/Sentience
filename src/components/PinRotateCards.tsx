import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const topics = [
    {
        id: "01",
        title: "Emotional Granularity",
        description: "The ability to accurately label emotions. Instead of just feeling 'bad', you can identify if you're 'frustrated', 'exhausted', or 'lonely'. High emotional granularity equips you with better tools to address your specific needs.",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200",
        color: "#2e1065", // Deep Violet
    },
    {
        id: "02",
        title: "Cognitive Reframing",
        description: "A core technique of CBT where you learn to identify and dispute irrational or maladaptive thoughts. By changing the way you look at a situation, you inherently change the way you feel about it.",
        image: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&q=80&w=1200",
        color: "#1e1b4b", // Deep Indigo
    },
    {
        id: "03",
        title: "The Shadow Self",
        description: "A concept popularized by Carl Jung, the shadow represents the unconscious, repressed aspects of our personality. Acknowledging and integrating your shadow prevents those hidden traits from controlling your behavior destructively.",
        image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200",
        color: "#0f172a", // Deep Slate
    },
    {
        id: "04",
        title: "Grounding Techniques",
        description: "Powerful exercises to pull you away from flashbacks, unwanted memories, or intense anxiety by focusing your attention squarely on the present moment. (e.g., the 5-4-3-2-1 sensory method).",
        image: "https://images.unsplash.com/photo-1444312645910-ffa973656eba?auto=format&fit=crop&q=80&w=1200",
        color: "#064e3b", // Deep Emerald
    },
    {
        id: "05",
        title: "Neuroplasticity",
        description: "The brain's incredible ability to reorganize itself by forming new neural connections throughout life. Every time you practice reframing a thought, you are physically rewiring your brain for long-term health.",
        image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&q=80&w=1200",
        color: "#4c1d95", // Deep Purple
    }
];

export default function PinRotateCards() {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<(HTMLElement | null)[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;

        const cards = cardsRef.current.filter(Boolean);
        if (cards.length === 0) return;

        const ctx = gsap.context(() => {
            cards.forEach((card, index) => {
                const overlay = card?.querySelector('.card-overlay');

                // Don't pin or rotate the very last card
                if (index < cards.length - 1) {

                    // Pin the current card when it hits the top
                    ScrollTrigger.create({
                        trigger: card,
                        start: "top top",
                        endTrigger: cards[cards.length - 1], // Unpin when the last card arrives
                        end: "top top",
                        pin: true,
                        pinSpacing: false,
                        id: `pin-${index}`
                    });

                    // Animate scale, rotation, and overlay opacity based on the NEXT card scrolling up
                    ScrollTrigger.create({
                        trigger: cards[index + 1],
                        start: "top bottom",
                        end: "top top",
                        scrub: 1.5, // changed to a number for smoothed (eased) scrubbing delay
                        id: `anim-${index}`,
                        onUpdate: (self) => {
                            const progress = self.progress;

                            // Scale down slightly and rotate
                            gsap.set(card, {
                                scale: 1 - progress * 0.15, // Scale down to 85%
                                rotation: index % 2 === 0 ? progress * 3 : -progress * 3, // Slight 2D rotation
                                rotationX: index % 2 === 0 ? progress * 25 : -progress * 25, // 3D tilt
                                transformOrigin: "top center"
                            });

                            // Darken the overlay
                            if (overlay) {
                                gsap.set(overlay, {
                                    opacity: progress * 0.7
                                });
                            }
                        }
                    });
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="w-full bg-[#050505] text-white overflow-hidden perspective-[1000px]">

            {/* Intro Section */}
            {/* Pinned Rotating Cards */}
            {topics.map((topic, index) => (
                <section
                    key={topic.id}
                    ref={(el) => (cardsRef.current[index] = el)}
                    className="relative w-full min-h-[80vh] md:min-h-[100vh] flex flex-col md:flex-row justify-between pt-24 md:pt-[15vh] px-6 md:px-[8vw] pb-24 border-t border-white/10"
                    style={{ backgroundColor: topic.color, transformStyle: "preserve-3d" }}
                >
                    {/* Darkening Overlay */}
                    <div className="card-overlay absolute inset-0 bg-black opacity-0 pointer-events-none z-10" />

                    {/* Number Indicator */}
                    <span className="text-6xl md:text-[8vw] font-bold text-white/20 mb-12 md:mb-0 leading-none">
                        ({topic.id})
                    </span>

                    {/* Content */}
                    <div className="w-full md:w-[60%] flex flex-col items-start justify-start z-20 pb-12">
                        <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-6 md:mb-10 tracking-tight uppercase">
                            {topic.title}
                        </h2>

                        <div className="w-full h-[25vh] md:h-[35vh] lg:h-[40vh] rounded-2xl overflow-hidden shadow-2xl relative">
                            <img
                                src={topic.image}
                                alt={topic.title}
                                className="object-cover w-full h-full mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                            />
                            {/* Subtle gradient overlay on image */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        </div>

                        <p className="mt-8 text-base md:text-xl lg:text-2xl text-white/80 leading-relaxed font-light max-w-2xl">
                            {topic.description}
                        </p>
                    </div>
                </section>
            ))}

            {/* Outro Section */}
            <section className="h-screen flex flex-col justify-center items-center px-6 md:px-20 text-center relative z-20 bg-[#050505] border-t border-white/10">
                <h2 className="text-4xl md:text-7xl font-extralight tracking-wide flex items-center justify-center flex-wrap gap-4 uppercase mb-8">
                    Ready to <span className="font-medium text-cyan-400 flex items-center gap-3">
                        Reframe?
                        <svg className="w-8 h-8 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </h2>
                <p className="max-w-3xl text-lg md:text-2xl text-neutral-400 font-light leading-relaxed mb-12">
                    Use these principles within Sentience to untangle your thoughts and build lasting emotional resilience.
                </p>
                <div className="w-[1px] h-32 bg-gradient-to-b from-cyan-500 to-transparent" />
            </section>

        </div>
    );
}

