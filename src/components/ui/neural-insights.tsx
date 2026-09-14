import React from 'react';
import { X, Clock, Brain, Zap, Heart, Shield, Eye } from 'lucide-react';
import ShaderBackground from './shader-background';

interface NeuralInsightsProps {
    onClose: () => void;
}

const NeuralInsights: React.FC<NeuralInsightsProps> = ({ onClose }) => {
    const microLearningCards = [
        {
            title: 'Why Anxiety Happens',
            description: 'Understand the evolutionary purpose behind anxious feelings',
            readTime: '1 min',
            icon: Brain,
            gradient: 'from-purple-500/20 to-violet-500/20',
            borderColor: 'border-purple-500/30',
        },
        {
            title: 'The Amygdala Hijack',
            description: 'How your brain overrides logic during stress',
            readTime: '2 min',
            icon: Zap,
            gradient: 'from-violet-500/20 to-pink-500/20',
            borderColor: 'border-violet-500/30',
        },
        {
            title: 'Neuroplasticity Basics',
            description: 'Your brain can rewire itself at any age',
            readTime: '1 min',
            icon: Brain,
            gradient: 'from-pink-500/20 to-rose-500/20',
            borderColor: 'border-pink-500/30',
        },
        {
            title: 'Fight or Flight Response',
            description: 'The survival mechanism that shaped human behavior',
            readTime: '1 min',
            icon: Shield,
            gradient: 'from-purple-500/20 to-indigo-500/20',
            borderColor: 'border-purple-500/30',
        },
        {
            title: 'Cortisol & Stress',
            description: 'The stress hormone and its effects on your body',
            readTime: '2 min',
            icon: Heart,
            gradient: 'from-indigo-500/20 to-cyan-500/20',
            borderColor: 'border-indigo-500/30',
        },
        {
            title: 'Mindfulness & The Brain',
            description: 'How meditation physically changes your neural pathways',
            readTime: '1 min',
            icon: Eye,
            gradient: 'from-cyan-500/20 to-teal-500/20',
            borderColor: 'border-cyan-500/30',
        },
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-black">
            {/* IMPORTANT: Keep the existing shader background */}
            <ShaderBackground />

            {/* Overlay Content */}
            <div className="relative z-[101] w-full h-full overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-black/40 backdrop-blur-md border-b border-white/10 p-6">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-1">Neural Insights</h2>
                            <p className="text-white/60 text-sm uppercase tracking-wider">
                                Scientific Micro-Learning
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/80 hover:text-white"
                            aria-label="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="max-w-7xl mx-auto p-6 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {microLearningCards.map((card, index) => {
                            const IconComponent = card.icon;
                            return (
                                <div
                                    key={index}
                                    className={`group relative bg-gradient-to-br ${card.gradient} backdrop-blur-xl border ${card.borderColor} rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer`}
                                >
                                    {/* Glow Effect on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                                    {/* Icon */}
                                    <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-4 group-hover:bg-white/20 transition-colors">
                                        <IconComponent className="text-white" size={24} />
                                    </div>

                                    {/* Content */}
                                    <div className="relative">
                                        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-purple-200 transition-colors">
                                            {card.title}
                                        </h3>
                                        <p className="text-white/70 text-sm mb-4 leading-relaxed">
                                            {card.description}
                                        </p>

                                        {/* Read Time Badge */}
                                        <div className="flex items-center gap-2 text-white/50 text-xs">
                                            <Clock size={14} />
                                            <span className="uppercase tracking-wider font-medium">
                                                Read {card.readTime}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Hover Arrow */}
                                    <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg
                                            className="w-4 h-4 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom Spacer */}
                    <div className="h-20" />
                </div>
            </div>

            {/* Bottom Instruction */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[102] text-white/60 text-sm uppercase tracking-widest">
                Click any card to learn more
            </div>
        </div>
    );
};

export default NeuralInsights;
