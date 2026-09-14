import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface StepTransitionProps {
    stepKey: number;
    direction: number; // 1 = forward, -1 = back
    children: ReactNode;
}

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        scale: 0.96
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -300 : 300,
        opacity: 0,
        scale: 0.96
    })
};

export default function StepTransition({ stepKey, direction, children }: StepTransitionProps) {
    return (
        <AnimatePresence mode="wait" custom={direction}>
            <motion.div
                key={stepKey}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 }
                }}
                className="w-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
