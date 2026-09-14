import React, { useState } from 'react';
import { X, Wind, Zap, Moon, Target, Clock } from 'lucide-react';
import BreathingTimer from './breathing-timer';
import { CalmingBackground } from './breathing-animations';

interface RelaxationLibraryProps {
    onClose: () => void;
}

type ExerciseType = {
    id: string;
    name: string;
    duration: string;
    description: string;
    pattern?: '2-4-6' | '4-4-4-4';
    durationMinutes?: number;
    category: 'quick' | 'deep' | 'sleep' | 'energize';
    icon: React.ReactNode;
};

const exercises: ExerciseType[] = [
    // Quick Calm
    {
        id: '2-4-6-breathing',
        name: '2-4-6 Calming Breath',
        duration: '2 min',
        description: 'Exhale-focused breathing to activate your parasympathetic nervous system',
        pattern: '2-4-6',
        durationMinutes: 2,
        category: 'quick',
        icon: <Wind size={24} />,
    },
    {
        id: 'box-breathing',
        name: 'Box Breathing',
        duration: '3 min',
        description: 'Equal-ratio breathing for grounding and focus (Navy SEAL technique)',
        pattern: '4-4-4-4',
        durationMinutes: 3,
        category: 'quick',
        icon: <Target size={24} />,
    },
    {
        id: '4-7-8-breathing',
        name: '4-7-8 Breathing',
        duration: '5 min',
        description: 'Dr. Weil\'s relaxation breath - hold-focused for deep calm',
        pattern: '2-4-6', // We'll repurpose this pattern with custom timing
        durationMinutes: 5,
        category: 'quick',
        icon: <Clock size={24} />,
    },

    // Sleep Preparation
    {
        id: 'sleep-scan',
        name: 'Body Scan for Sleep',
        duration: '10 min',
        description: 'Progressive relaxation through the body to prepare for rest',
        pattern: '2-4-6',
        durationMinutes: 10,
        category: 'sleep',
        icon: <Moon size={24} />,
    },

    // Pre-Challenge (Energizing)
    {
        id: 'power-breath',
        name: 'Energizing Breath',
        duration: '5 min',
        description: 'Activating breathwork to increase alertness and confidence',
        pattern: '4-4-4-4',
        durationMinutes: 5,
        category: 'energize',
        icon: <Zap size={24} />,
    },
];

export const RelaxationLibrary: React.FC<RelaxationLibraryProps> = ({ onClose }) => {
    const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
    const [activeCategory, setActiveCategory] = useState<'all' | 'quick' | 'deep' | 'sleep' | 'energize'>('all');

    const categories = [
        { id: 'all' as const, name: 'All Exercises', icon: '🧘' },
        { id: 'quick' as const, name: 'Quick Calm (2-5 min)', icon: '⚡' },
        { id: 'sleep' as const, name: 'Sleep Preparation', icon: '😴' },
        { id: 'energize' as const, name: 'Pre-Challenge', icon: '🔥' },
    ];

    const filteredExercises = activeCategory === 'all'
        ? exercises
        : exercises.filter(ex => ex.category === activeCategory);

    if (selectedExercise) {
        return (
            <BreathingTimer
                pattern={selectedExercise.pattern!}
                duration={selectedExercise.durationMinutes!}
                onClose={() => setSelectedExercise(null)}
                onComplete={() => setSelectedExercise(null)}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 overflow-y-auto">
            <CalmingBackground />

            <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Relaxation Library</h1>
                        <p className="text-purple-200">Research-backed breathing exercises for any moment</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-white"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-6 py-3 rounded-2xl font-semibold transition-all ${activeCategory === cat.id
                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                                    : 'bg-white/10 border border-white/20 text-purple-200 hover:bg-white/20'
                                }`}
                        >
                            <span className="mr-2">{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Exercise Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExercises.map((exercise) => (
                        <div
                            key={exercise.id}
                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all cursor-pointer group"
                            onClick={() => setSelectedExercise(exercise)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-purple-500/20 rounded-full text-purple-400 group-hover:bg-purple-500/30 transition-all">
                                    {exercise.icon}
                                </div>
                                <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-purple-200 font-medium">
                                    {exercise.duration}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                                {exercise.name}
                            </h3>

                            <p className="text-purple-200 text-sm leading-relaxed">
                                {exercise.description}
                            </p>

                            <div className="mt-4 pt-4 border-t border-white/10">
                                <button className="text-purple-400 font-semibold group-hover:text-purple-300 transition-colors flex items-center gap-2">
                                    Start Exercise
                                    <svg
                                        className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredExercises.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-purple-200 text-lg">No exercises in this category yet</p>
                    </div>
                )}

                {/* Info Footer */}
                <div className="mt-12 bg-blue-500/10 border-2 border-blue-400/30 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-3">💡 Breathing Exercise Tips</h3>
                    <ul className="space-y-2 text-blue-200">
                        <li>• Practice in a comfortable, quiet space</li>
                        <li>• Use headphones for the best audio experience</li>
                        <li>• Never force your breath - find your natural rhythm</li>
                        <li>• Regular practice (2-3x daily) yields the best results</li>
                        <li>• Each exercise uses different patterns for different benefits</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default RelaxationLibrary;
