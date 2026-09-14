
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowRight, Menu, X } from 'lucide-react';
import GuidedBreakthroughs from '@/components/ui/guided-breakthroughs';
import ThoughtRewiring from '@/components/ui/thought-rewiring';
import NeuralInsights from '@/components/ui/neural-insights';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

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
    menuColor: string;
    buttonBgColor: string;
    buttonTextColor: string;
    ease?: string;
    theme?: string;
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}

export default function CardNav({
    items,
    menuColor,
    buttonBgColor,
    buttonTextColor,
    ease = "circ.out",
    isOpen: controlledIsOpen,
    onOpenChange,
}: CardNavProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [showGuidedBreakthroughs, setShowGuidedBreakthroughs] = useState(false);
    const [showThoughtRewiring, setShowThoughtRewiring] = useState(false);
    const [showNeuralInsights, setShowNeuralInsights] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

    const handleOpenChange = (newState: boolean) => {
        if (!isControlled) {
            setInternalIsOpen(newState);
        }
        onOpenChange?.(newState);
    };

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
            handleOpenChange(false);
        } else if (label === "Thoughts and Exercises") {
            setShowThoughtRewiring(true);
            handleOpenChange(false);
        } else if (href) {
            handleOpenChange(false);
            navigate(href);
        }
    };

    return (
        <div ref={containerRef} className="fixed top-0 left-0 w-full z-50 font-sans">
            {/* Top Bar */}
            <div
                className="relative z-50 px-6 py-4 flex justify-end items-center transition-colors duration-300 pointer-events-none"
            >
                {/* Toggle Button */}
                <button
                    onClick={() => handleOpenChange(!isOpen)}
                    className="rounded-full px-6 py-2 flex items-center gap-2 font-medium tracking-wide transition-transform hover:scale-105 active:scale-95 pointer-events-auto"
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

            {/* Profile Button Top Left */}
            {user && (
                <div className="fixed top-6 left-8 z-[60] flex items-center gap-4 pointer-events-auto">
                    <div className="flex bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-1 pr-4 items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/40 to-cyan-500/40 border border-white/20 flex items-center justify-center">
                            <span className="text-xs font-semibold uppercase text-white tracking-widest">{user.full_name?.[0] || user.username?.[0] || 'U'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-white/90">{user.full_name || 'User'}</span>
                            <span className="text-[9px] text-white/40 uppercase tracking-widest">@{user.username || 'user'}</span>
                        </div>
                        <div className="w-[1px] h-4 bg-white/20 ml-2 mx-1 hidden sm:block"></div>
                        <button
                            onClick={handleLogout}
                            title="Log Out"
                            className="hidden sm:flex text-white/40 hover:text-red-400 transition-colors ml-1 p-1"
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                    {/* Mobile logout button outside */}
                    <button
                        onClick={handleLogout}
                        title="Log Out"
                        className="sm:hidden flex bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-2.5 text-white/40 hover:text-red-400 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            )}

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
