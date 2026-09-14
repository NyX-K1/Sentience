import { motion, AnimatePresence } from 'framer-motion';
import { EmotionFamily, EmotionDef } from '../types/mood';
import { emotions as allEmotions } from '../data/emotions';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import EmotionTooltip from './EmotionTooltip';
import { Search, X, Sparkles } from 'lucide-react';

interface EmotionBloomProps {
    family: EmotionFamily | null;
    selectedEmotionIds: string[];
    onToggleEmotion: (id: string) => void;
    onBack: () => void;
    onProceed: () => void;
}

/* ─── Intensity style mappings ─── */
const INTENSITY_STYLES: Record<number, { pill: string; selectedPill: string; size: string; glow: string; ring: number; color: string; ringColor: string }> = {
    4: {
        pill: 'text-sm font-semibold bg-cyan-500/20 border-cyan-400/30 hover:bg-cyan-400/30 hover:border-cyan-300/50 text-cyan-200',
        selectedPill: 'bg-cyan-400 text-black border-cyan-300 shadow-[0_0_28px_rgba(34,211,238,0.4)]',
        size: 'px-4 py-2',
        glow: 'hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]',
        ring: 14,
        color: 'rgba(34,211,238,0.7)',
        ringColor: 'border-cyan-400/10',
    },
    3: {
        pill: 'text-sm bg-violet-500/15 border-violet-400/25 hover:bg-violet-400/25 hover:border-violet-300/40 text-violet-200',
        selectedPill: 'bg-violet-400 text-black border-violet-300 shadow-[0_0_24px_rgba(167,139,250,0.4)]',
        size: 'px-3.5 py-1.5',
        glow: 'hover:shadow-[0_0_16px_rgba(167,139,250,0.15)]',
        ring: 26,
        color: 'rgba(167,139,250,0.6)',
        ringColor: 'border-violet-400/8',
    },
    2: {
        pill: 'text-xs bg-amber-500/12 border-amber-400/20 hover:bg-amber-400/20 hover:border-amber-300/35 text-amber-200/90',
        selectedPill: 'bg-amber-400 text-black border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.35)]',
        size: 'px-3 py-1.5',
        glow: 'hover:shadow-[0_0_12px_rgba(251,191,36,0.12)]',
        ring: 36,
        color: 'rgba(251,191,36,0.5)',
        ringColor: 'border-amber-400/8',
    },
    1: {
        pill: 'text-[11px] bg-emerald-500/10 border-emerald-400/15 hover:bg-emerald-400/15 hover:border-emerald-300/30 text-emerald-300/70',
        selectedPill: 'bg-emerald-400 text-black border-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.3)]',
        size: 'px-2.5 py-1',
        glow: 'hover:shadow-[0_0_10px_rgba(52,211,153,0.1)]',
        ring: 44,
        color: 'rgba(52,211,153,0.4)',
        ringColor: 'border-emerald-400/6',
    },
};

const INTENSITY_LABELS: Record<number, { label: string; icon: string }> = {
    4: { label: 'Peak', icon: '◉' },
    3: { label: 'Strong', icon: '◎' },
    2: { label: 'Moderate', icon: '○' },
    1: { label: 'Subtle', icon: '·' },
};

export default function EmotionBloom({ family, selectedEmotionIds, onToggleEmotion, onBack, onProceed }: EmotionBloomProps) {
    const [hoveredEmotion, setHoveredEmotion] = useState<EmotionDef | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'galaxy' | 'cloud'>('cloud');
    const searchRef = useRef<HTMLInputElement>(null);
    const galaxyRef = useRef<HTMLDivElement>(null);

    // Auto-focus search on mount
    useEffect(() => {
        const timer = setTimeout(() => searchRef.current?.focus(), 400);
        return () => clearTimeout(timer);
    }, []);

    // Filter taxonomy by family
    const relevantEmotions = useMemo(() =>
        allEmotions.filter(e => e.family === family || (family === 'Complex' && e.family === 'Complex')),
        [family]
    );

    // Apply search filter
    const filteredEmotions = useMemo(() => {
        if (!searchQuery.trim()) return relevantEmotions;
        const q = searchQuery.toLowerCase().trim();
        return relevantEmotions.filter(e => e.label.toLowerCase().includes(q));
    }, [relevantEmotions, searchQuery]);

    const isSearching = searchQuery.trim().length > 0;

    // Get selected emotion objects for chip display
    const selectedEmotionObjects = useMemo(() =>
        allEmotions.filter(e => selectedEmotionIds.includes(e.id)),
        [selectedEmotionIds]
    );

    // Group emotions by intensity
    const groupedByIntensity = useMemo(() => {
        const groups: Record<number, EmotionDef[]> = { 4: [], 3: [], 2: [], 1: [] };
        filteredEmotions.forEach(e => {
            if (groups[e.intensity]) groups[e.intensity].push(e);
        });
        return groups;
    }, [filteredEmotions]);

    // Group Complex emotions by subFamily
    const groupedBySubFamily = useMemo(() => {
        if (family !== 'Complex') return {};
        const groups: Record<string, EmotionDef[]> = {};
        filteredEmotions.forEach(e => {
            const key = e.subFamily || 'Other';
            if (!groups[key]) groups[key] = [];
            groups[key].push(e);
        });
        return groups;
    }, [filteredEmotions, family]);

    // Galaxy position calculator — more organic spacing
    const getGalaxyPosition = useCallback((index: number, total: number, ringPercent: number) => {
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        const angularJitter = Math.sin(index * 5.7) * 0.03; // very subtle, keep on ring
        const finalAngle = angle + angularJitter;
        const x = 50 + ringPercent * Math.cos(finalAngle);
        const y = 50 + ringPercent * Math.sin(finalAngle);
        return { x, y };
    }, []);

    const renderPill = (em: EmotionDef, i: number, style?: React.CSSProperties) => {
        const isSelected = selectedEmotionIds.includes(em.id);
        const intensity = INTENSITY_STYLES[em.intensity] || INTENSITY_STYLES[2];

        return (
            <motion.button
                key={em.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: Math.min(i * 0.008, 0.4) } }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleEmotion(em.id)}
                onMouseEnter={() => setHoveredEmotion(em)}
                onMouseLeave={() => setHoveredEmotion(null)}
                style={style}
                className={`
                    rounded-full border transition-all duration-300 cursor-pointer select-none whitespace-nowrap backdrop-blur-sm
                    ${intensity.size} ${intensity.glow}
                    ${isSelected
                        ? `${intensity.selectedPill} font-semibold !text-sm`
                        : intensity.pill
                    }
                `}
            >
                {em.label}
            </motion.button>
        );
    };

    /* ─── Galaxy View: Radial constellation ─── */
    const renderGalaxyView = () => {
        return (
            <div
                ref={galaxyRef}
                className="relative w-full mx-auto"
                style={{ aspectRatio: '1 / 1', maxWidth: '850px', width: '100%' }}
            >
                {/* Center glow — gradient core */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-violet-400 shadow-[0_0_40px_15px_rgba(34,211,238,0.2)]" />
                    <div className="absolute w-24 h-24 rounded-full bg-gradient-radial from-cyan-500/10 to-transparent" />
                </div>

                {/* Concentric ring guides — colored */}
                {[4, 3, 2, 1].map(intensity => (
                    <div
                        key={intensity}
                        className={`absolute rounded-full pointer-events-none border ${INTENSITY_STYLES[intensity].ringColor}`}
                        style={{
                            width: `${INTENSITY_STYLES[intensity].ring * 2}%`,
                            height: `${INTENSITY_STYLES[intensity].ring * 2}%`,
                            left: `${50 - INTENSITY_STYLES[intensity].ring}%`,
                            top: `${50 - INTENSITY_STYLES[intensity].ring}%`,
                        }}
                    />
                ))}

                {/* Emotion pills on rings */}
                {[4, 3, 2, 1].map(intensity => {
                    const items = groupedByIntensity[intensity] || [];
                    return items.map((em, i) => {
                        const pos = getGalaxyPosition(i, items.length, INTENSITY_STYLES[intensity].ring);
                        return renderPill(em, i, {
                            position: 'absolute',
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: selectedEmotionIds.includes(em.id) ? 20 : 10,
                        });
                    });
                })}

                {/* Ring labels */}
                {[4, 3, 2, 1].map(intensity => {
                    const style = INTENSITY_STYLES[intensity];
                    return (
                        <span
                            key={`label-${intensity}`}
                            className="absolute text-[9px] text-white/20 uppercase tracking-[0.2em] pointer-events-none"
                            style={{
                                left: `${50 + style.ring - 2}%`,
                                top: '50%',
                                transform: 'translateY(-50%) rotate(-90deg)',
                                transformOrigin: 'left center',
                            }}
                        >
                            {INTENSITY_LABELS[intensity].label}
                        </span>
                    );
                })}
            </div>
        );
    };

    /* ─── Cloud View: Tag cloud with intensity sections ─── */
    const renderCloudView = () => {
        if (family === 'Complex' && !isSearching) {
            // Complex: group by subFamily
            const subFamilies = Object.keys(groupedBySubFamily).sort();
            return (
                <div className="flex flex-col gap-6">
                    {subFamilies.map(sub => {
                        const items = groupedBySubFamily[sub];
                        if (!items || items.length === 0) return null;
                        return (
                            <div key={sub} className="flex flex-col gap-2">
                                <span className="text-[10px] text-white/25 uppercase tracking-[0.25em] px-1">
                                    {sub} · {items.length}
                                </span>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {items.map((em, i) => renderPill(em, i))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        if (isSearching) {
            // Flat search results
            return filteredEmotions.length > 0 ? (
                <div className="flex flex-col items-center gap-3">
                    <span className="text-[10px] text-white/25 uppercase tracking-[0.25em]">
                        {filteredEmotions.length} result{filteredEmotions.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {filteredEmotions.map((em, i) => renderPill(em, i))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Search className="w-8 h-8 text-white/10 mb-4" />
                    <p className="text-white/30 text-sm">No emotions match "{searchQuery}"</p>
                    <button onClick={() => setSearchQuery('')} className="text-xs text-white/20 hover:text-white/40 mt-2 transition-colors">
                        Clear search
                    </button>
                </div>
            );
        }

        // Standard: group by intensity, render as centered tag clouds
        return (
            <div className="flex flex-col gap-5">
                {[4, 3, 2, 1].map(intensity => {
                    const items = groupedByIntensity[intensity] || [];
                    if (items.length === 0) return null;
                    const meta = INTENSITY_LABELS[intensity];

                    return (
                        <motion.div
                            key={intensity}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: (4 - intensity) * 0.08 } }}
                            className="flex flex-col items-center gap-2.5"
                        >
                            {/* Intensity header */}
                            <div className="flex items-center gap-2 px-3">
                                <span className="text-white/15 text-sm">{meta.icon}</span>
                                <span className="text-[10px] text-white/25 uppercase tracking-[0.25em]">
                                    {meta.label}
                                </span>
                                <span className="text-[10px] text-white/15">· {items.length}</span>
                            </div>

                            {/* Pill cloud */}
                            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                                {items.map((em, i) => renderPill(em, i))}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-4xl mx-auto flex flex-col items-center justify-start pt-12 min-h-[70vh] relative"
        >
            <button onClick={onBack} className="absolute top-0 left-4 md:left-8 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2 z-50">
                ← Back to Families
            </button>

            <h2 className="text-2xl md:text-3xl font-light mb-2 tracking-wide text-center shrink-0">
                Can you pinpoint it?
                <span className="block text-sm text-zinc-500 mt-2">Tap to select · Hover for definition</span>
            </h2>

            {/* View Mode Toggle */}
            {family !== 'Complex' && (
                <div className="flex items-center gap-1 mb-3 shrink-0">
                    <button
                        onClick={() => setViewMode('cloud')}
                        className={`text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border transition-all ${viewMode === 'cloud'
                            ? 'bg-white/10 border-white/20 text-white/80'
                            : 'border-transparent text-white/30 hover:text-white/50'
                            }`}
                    >
                        Cloud
                    </button>
                    <button
                        onClick={() => setViewMode('galaxy')}
                        className={`text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${viewMode === 'galaxy'
                            ? 'bg-white/10 border-white/20 text-white/80'
                            : 'border-transparent text-white/30 hover:text-white/50'
                            }`}
                    >
                        <Sparkles className="w-3 h-3" /> Galaxy
                    </button>
                </div>
            )}

            {/* Search Bar */}
            <div className="w-full max-w-md px-4 mb-3 shrink-0">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                    <input
                        ref={searchRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); if (viewMode === 'galaxy') setViewMode('cloud'); }}
                        placeholder={`Search ${relevantEmotions.length} emotions...`}
                        className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-full py-2.5 pl-11 pr-10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/20 focus:bg-white/8 transition-all"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Selected Emotion Chips */}
            <AnimatePresence>
                {selectedEmotionObjects.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full max-w-lg px-4 mb-4 shrink-0"
                    >
                        <div className="flex flex-wrap gap-1.5 justify-center">
                            {selectedEmotionObjects.map(em => (
                                <motion.button
                                    key={em.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => onToggleEmotion(em.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-sm border border-white/25 rounded-full text-[11px] text-white/90 hover:bg-white/30 transition-all group"
                                >
                                    <span>{em.label}</span>
                                    <X className="w-2.5 h-2.5 text-white/40 group-hover:text-white/80 transition-colors" />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Emotion Display */}
            <div className="w-full flex-grow overflow-y-auto scrollbar-hide px-4 pb-32 relative">
                {viewMode === 'galaxy' && !isSearching && family !== 'Complex'
                    ? renderGalaxyView()
                    : renderCloudView()
                }
            </div>

            {/* Floating Tooltip Component */}
            {hoveredEmotion && <EmotionTooltip emotion={hoveredEmotion} />}

            {/* Action Bar */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: selectedEmotionIds.length > 0 ? 1 : 0, y: selectedEmotionIds.length > 0 ? 0 : 40 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
            >
                <button
                    onClick={onProceed}
                    disabled={selectedEmotionIds.length === 0}
                    className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                >
                    Add Context →
                </button>
            </motion.div>
        </motion.div>
    );
}
