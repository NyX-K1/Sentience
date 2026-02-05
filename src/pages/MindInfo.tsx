
import SpatialProductShowcase from '@/components/ui/spatial-product-showcase';
import { motion } from 'framer-motion';

export default function MindInfo() {
    return (
        <div className="w-full min-h-screen bg-black">
            <SpatialProductShowcase />

            {/* Back Button Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="fixed top-6 left-6 z-50 mix-blend-difference"
            >
                <a href="/sentience" className="text-white/50 hover:text-white text-sm font-mono tracking-widest uppercase transition-colors">
                    &larr; Return
                </a>
            </motion.div>
        </div>
    );
}
