import { motion } from 'framer-motion';
import { EmotionFamily } from '../types/mood';

export const QUADRANT_TO_FAMILIES: Record<string, EmotionFamily[]> = {
    'tense': ['Fear', 'Anger', 'Disgust'],
    'energized': ['Joy', 'Surprise', 'Anticipation'],
    'low': ['Sadness', 'Disgust'],
    'calm': ['Trust', 'Joy', 'Anticipation']
};

export const FAMILY_COLORS: Record<EmotionFamily, string> = {
    'Joy': 'from-yellow-400 to-amber-600',
    'Trust': 'from-emerald-400 to-green-600',
    'Fear': 'from-violet-500 to-fuchsia-700',
    'Surprise': 'from-cyan-400 to-blue-500',
    'Sadness': 'from-blue-600 to-indigo-900',
    'Disgust': 'from-lime-600 to-olive-800', // using approximate tailwind classes
    'Anger': 'from-red-500 to-rose-700',
    'Anticipation': 'from-orange-400 to-red-500',
    'Complex': 'from-gray-400 to-slate-600'
};

interface EmotionWheelProps {
    quadrant: string | null;
    selectedFamily: EmotionFamily | null;
    onSelectFamily: (f: EmotionFamily) => void;
    onBack: () => void;
}

export default function EmotionWheel({ quadrant, selectedFamily, onSelectFamily, onBack }: EmotionWheelProps) {
    if (!quadrant || selectedFamily) return null;

    const families = QUADRANT_TO_FAMILIES[quadrant] || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-4 min-h-[50vh]"
        >
            <button onClick={onBack} className="absolute top-24 left-8 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2 z-50">
                ← Back to Energy
            </button>

            <h2 className="text-2xl md:text-3xl font-light mb-12 tracking-wide text-center">Which family of emotions feels closest?</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full px-2">
                {families.map((family, i) => (
                    <motion.button
                        key={family}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.1 } }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectFamily(family)}
                        className={`
                            relative w-full h-36 md:h-48 rounded-2xl md:rounded-3xl
                            bg-gradient-to-br ${FAMILY_COLORS[family]} 
                            flex flex-col items-center justify-end p-4 
                            overflow-hidden group border border-white/10
                        `}
                    >
                        {/* Inner glass highlight */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-[40px] pointer-events-none" />

                        <div className="relative z-10 w-full px-2 flex items-center justify-center h-[50%]">
                            <span className="text-white font-medium text-xs sm:text-sm md:text-lg tracking-wide text-center leading-tight break-words break-all sm:break-words line-clamp-2 max-w-full">
                                {family}
                            </span>
                        </div>
                    </motion.button>
                ))}
            </div>

            <button
                onClick={() => onSelectFamily('Complex')}
                className="mt-12 text-sm text-white/40 hover:text-white/80 transition-colors border-b border-transparent hover:border-white/50 pb-1"
            >
                It's more complex / nuanced...
            </button>
        </motion.div>
    );
}
