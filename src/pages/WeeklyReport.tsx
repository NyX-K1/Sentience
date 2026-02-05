
import { FullScreenScrollFX } from "@/components/ui/full-screen-scroll-fx";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const sections = [
    {
        leftLabel: "Velocity",
        title: "Fast",
        rightLabel: "92%",
        background: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop", // Abstract speed/neon
    },
    {
        leftLabel: "Clarity",
        title: "High",
        rightLabel: "88%",
        background: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670&auto=format&fit=crop", // Code/Matrix visuals
    },
    {
        leftLabel: "Social",
        title: "Warm",
        rightLabel: "High",
        background: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2564&auto=format&fit=crop", // Camera lens/connection
    },
    {
        leftLabel: "Cognitive",
        title: "Deep",
        rightLabel: "Load",
        background: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop", // Abstract geometry
    },
];

export default function WeeklyReport() {
    return (
        <div className="relative">
            {/* Back Button Overlay */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="fixed top-6 left-6 z-[60]"
            >
                <Link
                    to="/sentience"
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
                >
                    <ArrowLeft size={16} />
                    <span className="text-sm font-medium">Back</span>
                </Link>
            </motion.div>

            <FullScreenScrollFX
                sections={sections}
                header={
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-light tracking-widest opacity-70 mb-2">WEEKLY INSIGHTS</span>
                        <span>REPORT</span>
                    </div>
                }
                footer={<div className="text-xs opacity-50 tracking-widest">SENTIENCE ANALYTICS ENGINE</div>}
                showProgress
                durations={{ change: 0.8, snap: 900 }}
                colors={{
                    text: "#ffffff",
                    overlay: "rgba(0,0,0,0.6)",
                    pageBg: "#000000",
                    stageBg: "#000000"
                }}
            />
        </div>
    );
}
