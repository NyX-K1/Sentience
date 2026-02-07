
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowRight, Menu, X } from 'lucide-react';
import GuidedBreakthroughs from '@/components/ui/guided-breakthroughs';
import ThoughtRewiring from '@/components/ui/thought-rewiring';
import NeuralInsights from '@/components/ui/neural-insights';

interface NavLink {
    label: string;
    ariaLabel: string;
    href?: string;
}

interface NavItem {
    label: string;
    bgColor: string;
    textColor: string;
    links: NavLink[];
}

interface CardNavProps {
    logo?: string;
    logoAlt?: string;
    items: NavItem[];
    baseColor: string;
    menuColor: string;
    buttonBgColor: string;
    buttonTextColor: string;
    ease?: string;
    theme?: string;
}

export default function CardNav({
    logo,
    logoAlt,
    items,
    baseColor,
    menuColor,
    buttonBgColor,
    buttonTextColor,
    ease = "circ.out",
}: CardNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showGuidedBreakthroughs, setShowGuidedBreakthroughs] = useState(false);
    const [showThoughtRewiring, setShowThoughtRewiring] = useState(false);
    const [showNeuralInsights, setShowNeuralInsights] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

    // Toggle Menu Animation
    useEffect(() => {
        const menu = menuRef.current;
        if (!menu) return;

        if (isOpen) {
            // Open Animation
            gsap.to(menu, {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 0.8,
                ease: ease
            });

            // Animate Items
            gsap.fromTo(itemsRef.current,
                { y: 100, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    delay: 0.3,
                    ease: "power3.out"
                }
            );

        } else {
            // Close Animation
            gsap.to(menu, {
                clipPath: "inset(0% 0% 100% 0%)",
                duration: 0.8,
                ease: ease
            });
        }
    }, [isOpen, ease]);

    // Card Hover animations
    const handleMouseEnter = (index: number) => {
        const card = itemsRef.current[index];
        if (card) {
            gsap.to(card, { scale: 1.02, duration: 0.3, ease: "power2.out" });
        }
    };

    const handleMouseLeave = (index: number) => {
        const card = itemsRef.current[index];
        if (card) {
            gsap.to(card, { scale: 1, duration: 0.3, ease: "power2.out" });
        }
    };

    const handleLinkClick = (label: string, href?: string) => {
        if (label === "Guided Breakthroughs") {
            setShowGuidedBreakthroughs(true);
            setIsOpen(false);
        } else if (label === "Thoughts and Exercises") {
            setShowThoughtRewiring(true);
            setIsOpen(false);
        } else if (label === "Neural Insights") {
            setShowNeuralInsights(true);
            setIsOpen(false);
        } else if (href) {
            window.location.href = href;
        }
    };

    return (
        <div ref={containerRef} className="fixed top-0 left-0 w-full z-50 font-sans">
            {/* Top Bar */}
            <div
                className="relative z-50 px-6 py-4 flex justify-between items-center transition-colors duration-300"
                style={{ color: isOpen ? '#fff' : '#fff' }} // Always white/light for Sentience
            >
                {/* Logo */}
                <div className="flex items-center gap-3">
                    {logo ? (
                        <img src={logo} alt={logoAlt} className="h-8 w-auto" />
                    ) : (
                        // Fallback Logo if image not provided
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
                            <span className="font-bold text-lg tracking-wider text-white">SENTIENCE</span>
                        </div>
                    )}
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="rounded-full px-6 py-2 flex items-center gap-2 font-medium tracking-wide transition-transform hover:scale-105 active:scale-95"
                    style={{
                        backgroundColor: buttonBgColor,
                        color: buttonTextColor,
                        boxShadow: '0 0 20px rgba(255,255,255,0.1)'
                    }}
                >
                    <span className="uppercase text-xs">{isOpen ? 'Close' : 'Menu'}</span>
                    {isOpen ? <X size={16} /> : <Menu size={16} />}
                </button>
            </div>

            {/* Full Screen Menu Overlay */}
            <div
                ref={menuRef}
                className="fixed inset-0 h-screen w-full flex flex-col justify-center items-center"
                style={{
                    backgroundColor: menuColor,
                    clipPath: "inset(0% 0% 100% 0%)"
                }}
            >
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            ref={(el) => (itemsRef.current[index] = el)}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={() => handleMouseLeave(index)}
                            className="relative p-8 rounded-2xl h-[400px] flex flex-col justify-between cursor-pointer group overflow-hidden"
                            style={{
                                backgroundColor: item.bgColor,
                                color: item.textColor
                            }}
                        >
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-150" />

                            {/* Content */}
                            <div>
                                <h3 className="text-4xl font-bold mb-6 tracking-tighter">{item.label}</h3>
                                <ul className="space-y-3">
                                    {item.links.map((link, i) => (
                                        <li key={i} className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
                                            <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                            <button
                                                onClick={() => handleLinkClick(link.label, link.href)}
                                                aria-label={link.ariaLabel}
                                                className="text-sm uppercase tracking-widest font-medium text-left"
                                            >
                                                {link.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Action */}
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] opacity-50 uppercase tracking-[0.2em]">{`0${index + 1}`}</span>
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-300">
                                    <ArrowRight size={18} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CBT Studio Feature Modals */}
            {showGuidedBreakthroughs && (
                <GuidedBreakthroughs onClose={() => setShowGuidedBreakthroughs(false)} />
            )}

            {showThoughtRewiring && (
                <ThoughtRewiring onClose={() => setShowThoughtRewiring(false)} />
            )}

            {showNeuralInsights && (
                <NeuralInsights onClose={() => setShowNeuralInsights(false)} />
            )}
        </div>
    );
}
