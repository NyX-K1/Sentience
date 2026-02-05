
import { EmotionalHero } from "@/components/ui/emotional-hero";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function EmotionalUnloading() {
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

            <EmotionalHero />
        </div>
    );
}
