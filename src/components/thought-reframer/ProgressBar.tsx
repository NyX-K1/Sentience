import { motion } from 'framer-motion';

const STEP_ICONS = ['📍', '💭', '🫀', '🔍', '⚖️', '🔄', '📊', '✨'];
const STEP_LABELS = ['Situation', 'Thought', 'Emotion', 'Distortion', 'Evidence', 'Reframe', 'Shift', 'Takeaway'];

interface ProgressBarProps {
    currentStep: number;
    totalSteps?: number;
}

export default function ProgressBar({ currentStep, totalSteps = 8 }: ProgressBarProps) {
    return (
        <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-4 py-3">
            <div className="max-w-3xl mx-auto flex gap-1.5">
                {Array.from({ length: totalSteps }, (_, i) => {
                    const step = i + 1;
                    const isActive = step === currentStep;
                    const isComplete = step < currentStep;

                    return (
                        <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
                            <motion.div
                                className={`w-full h-1.5 rounded-full overflow-hidden ${isComplete || isActive ? '' : 'bg-white/10'}`}
                                layout
                            >
                                {(isComplete || isActive) && (
                                    <motion.div
                                        className="h-full rounded-full"
                                        initial={{ width: '0%' }}
                                        animate={{ width: isComplete ? '100%' : '50%' }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                        style={{
                                            background: `linear-gradient(90deg, 
                                                hsl(${220 + (step * 18)}, 70%, 50%), 
                                                hsl(${220 + ((step + 1) * 18)}, 65%, 55%)
                                            )`
                                        }}
                                    />
                                )}
                            </motion.div>
                            <span className={`text-[10px] hidden md:block transition-colors ${isActive ? 'text-white/90' : isComplete ? 'text-white/50' : 'text-white/20'}`}>
                                {STEP_ICONS[i]} {STEP_LABELS[i]}
                            </span>
                            <span className={`text-xs md:hidden transition-colors ${isActive ? 'text-white/90' : 'text-white/20'}`}>
                                {STEP_ICONS[i]}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
