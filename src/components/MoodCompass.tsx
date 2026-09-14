import { motion } from 'framer-motion';

export type Quadrant = 'tense' | 'energized' | 'low' | 'calm' | null;

interface MoodCompassProps {
    selectedQuadrant: Quadrant;
    onSelectQuadrant: (q: Quadrant) => void;
}

export default function MoodCompass({ selectedQuadrant, onSelectQuadrant }: MoodCompassProps) {
    const quadrants: { id: Quadrant; label: string; desc: string; colors: string; x: number; y: number }[] = [
        {
            id: 'tense', label: 'Tense', desc: 'High energy, unpleasant',
            colors: 'from-orange-500 to-amber-700', x: -1, y: -1
        },
        {
            id: 'energized', label: 'Energized', desc: 'High energy, pleasant',
            colors: 'from-amber-400 to-rose-400', x: 1, y: -1
        },
        {
            id: 'low', label: 'Low', desc: 'Low energy, unpleasant',
            colors: 'from-indigo-900 to-slate-700', x: -1, y: 1
        },
        {
            id: 'calm', label: 'Calm', desc: 'Low energy, pleasant',
            colors: 'from-teal-400 to-emerald-600', x: 1, y: 1
        }
    ];

    if (selectedQuadrant) return null; // Hide or shrink compass when passing to Stage 2

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="relative w-[340px] h-[340px] md:w-[480px] md:h-[480px] mx-auto rounded-full p-2"
        >
            {/* Base Circle Background */}
            <div className="absolute inset-0 rounded-full bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)] backdrop-blur-3xl overflow-hidden">
                {/* Axis Lines */}
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20 -translate-y-1/2" />
                <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white/20 -translate-x-1/2" />
            </div>

            {/* Labels outside */}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.2em] text-white/50">High Energy</span>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.2em] text-white/50">Low Energy</span>
            <span className="absolute top-1/2 -left-20 -translate-y-1/2 text-xs uppercase tracking-[0.2em] text-white/50 -rotate-90">Unpleasant</span>
            <span className="absolute top-1/2 -right-[70px] -translate-y-1/2 text-xs uppercase tracking-[0.2em] text-white/50 rotate-90">Pleasant</span>


            {/* Clickable Quadrants */}
            <div className="relative w-full h-full rounded-full overflow-hidden flex flex-wrap">
                {quadrants.map((q) => (
                    <motion.div
                        key={q.id}
                        className={`w-1/2 h-1/2 relative group cursor-pointer overflow-hidden p-6 flex flex-col items-center justify-center text-center`}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelectQuadrant(q.id)}
                    >
                        {/* Hover Gradient Fill */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${q.colors} opacity-0 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none`} />

                        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 lg:p-8">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-light tracking-wide text-white/90 group-hover:text-white transition-colors text-center">
                                {q.label}
                            </h3>
                            <p className="text-[10px] sm:text-xs text-white/0 group-hover:text-white/80 mt-1 sm:mt-2 transition-colors duration-300 font-sans text-center px-2">
                                {q.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Center indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none z-20" />
        </motion.div>
    );
}
