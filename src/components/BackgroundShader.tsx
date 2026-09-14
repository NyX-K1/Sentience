import { motion, useReducedMotion } from 'framer-motion';
import { useShaderColors } from '../hooks/useShaderColors';

interface BackgroundShaderProps {
    selectedEmotionIds: string[];
}

export default function BackgroundShader({ selectedEmotionIds }: BackgroundShaderProps) {
    const { colorA, colorB, colorC, speed } = useShaderColors(selectedEmotionIds);
    const prefersReducedMotion = useReducedMotion();

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black transition-colors duration-1000">
            {/* Ambient Base Layer */}
            <motion.div
                className="absolute inset-0 opacity-40 mix-blend-screen"
                animate={{ backgroundColor: colorA }}
                transition={{ duration: 2, ease: "easeInOut" }}
            />

            {/* Animated Blob 1 */}
            <motion.div
                className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full mix-blend-screen filter blur-[100px] opacity-60"
                animate={prefersReducedMotion ? { backgroundColor: colorB } : {
                    backgroundColor: colorB,
                    scale: [1, 1.2, 1],
                    x: [0, 40, 0],
                    y: [0, 30, 0]
                }}
                transition={prefersReducedMotion ? { duration: 2 } : {
                    backgroundColor: { duration: 2 },
                    scale: { duration: 10 / speed, repeat: Infinity, ease: "easeInOut" },
                    x: { duration: 15 / speed, repeat: Infinity, ease: "easeInOut" },
                    y: { duration: 12 / speed, repeat: Infinity, ease: "easeInOut" }
                }}
            />

            {/* Animated Blob 2 */}
            <motion.div
                className="absolute top-[20%] -right-[20%] w-[80vw] h-[80vw] rounded-full mix-blend-screen filter blur-[120px] opacity-50"
                animate={prefersReducedMotion ? { backgroundColor: colorC } : {
                    backgroundColor: colorC,
                    scale: [1, 1.1, 1],
                    x: [0, -30, 0],
                    y: [0, -40, 0]
                }}
                transition={prefersReducedMotion ? { duration: 2 } : {
                    backgroundColor: { duration: 2 },
                    scale: { duration: 12 / speed, repeat: Infinity, ease: "easeInOut" },
                    x: { duration: 18 / speed, repeat: Infinity, ease: "easeInOut" },
                    y: { duration: 14 / speed, repeat: Infinity, ease: "easeInOut" }
                }}
            />

            {/* Animated Blob 3 */}
            <motion.div
                className="absolute -bottom-[20%] left-[10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[100px] opacity-40"
                animate={prefersReducedMotion ? { backgroundColor: colorA } : {
                    backgroundColor: colorA,
                    scale: [1, 1.3, 1],
                    x: [0, 20, 0],
                    y: [0, -30, 0]
                }}
                transition={prefersReducedMotion ? { duration: 2 } : {
                    backgroundColor: { duration: 2 },
                    scale: { duration: 14 / speed, repeat: Infinity, ease: "easeInOut" },
                    x: { duration: 20 / speed, repeat: Infinity, ease: "easeInOut" },
                    y: { duration: 16 / speed, repeat: Infinity, ease: "easeInOut" }
                }}
            />

            {/* Grain/Noise Overlay for texture - highly performant generic SVG filter string */}
            <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        </div>
    );
}
