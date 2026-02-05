
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function CognitiveReframing() {
    return (
        <div className="relative w-full min-h-screen bg-zinc-950">
            {/* Back Button */}
            <div className="absolute top-6 left-6 z-[60]">
                <Link
                    to="/sentience"
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
                >
                    <ArrowLeft size={16} />
                    <span className="text-sm font-medium">Back</span>
                </Link>
            </div>

            <LampContainer>
                <motion.h1
                    initial={{ opacity: 0.5, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
                >
                    Cognitive Reframing <br /> Patterns
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-slate-400 max-w-lg text-center mt-4 text-lg"
                >
                    Shift your perspective. Illuminate new pathways of thought.
                </motion.p>
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 px-8 py-3 bg-cyan-900/40 border border-cyan-500/30 text-cyan-200 rounded-full font-medium tracking-wide hover:bg-cyan-800/50 hover:text-white hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                >
                    START SESSION
                </motion.button>
            </LampContainer>
        </div>
    );
}
