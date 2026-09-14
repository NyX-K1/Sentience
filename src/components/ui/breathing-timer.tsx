import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { BreathingCircle, BoxBreathingSquare, CalmingBackground } from './breathing-animations';
import { playBreathingTone, triggerHaptic } from '../../utils/audio-utils';

interface BreathingTimerProps {
    pattern: '2-4-6' | '4-4-4-4';
    duration?: number; // in minutes
    onClose: () => void;
    onComplete?: () => void;
}

type BreathPhase246 = 'inhale' | 'hold' | 'exhale' | 'idle';
type BreathPhaseBox = 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'idle';

export const BreathingTimer: React.FC<BreathingTimerProps> = ({
    pattern,
    duration = 2,
    onClose,
    onComplete,
}) => {
    const [isActive, setIsActive] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<BreathPhase246 | BreathPhaseBox>('idle');
    const [cycleCount, setcycleCount] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(duration * 60);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const audioEnabledRef = useRef(audioEnabled);

    const totalCycles = pattern === '2-4-6' ? Math.ceil(duration * 60 / 12) : Math.ceil(duration * 60 / 16);

    const getPhaseInfo = (phase?: string) => {
        const currentPhaseToUse = phase !== undefined ? phase : currentPhase;
        if (pattern === '2-4-6') {
            switch (currentPhaseToUse) {
                case 'inhale': return { text: 'Breathe In', duration: 2, next: 'hold' };
                case 'hold': return { text: 'Hold', duration: 4, next: 'exhale' };
                case 'exhale': return { text: 'Breathe Out', duration: 6, next: 'inhale' };
                default: return { text: 'Ready', duration: 0, next: 'inhale' };
            }
        } else {
            switch (currentPhaseToUse) {
                case 'inhale': return { text: 'Breathe In', duration: 4, next: 'hold1' };
                case 'hold1': return { text: 'Hold', duration: 4, next: 'exhale' };
                case 'exhale': return { text: 'Breathe Out', duration: 4, next: 'hold2' };
                case 'hold2': return { text: 'Hold', duration: 4, next: 'inhale' };
                default: return { text: 'Ready', duration: 0, next: 'inhale' };
            }
        }
    };

    const startNextPhase = (phase: string) => {
        setCurrentPhase(phase as any);

        // Play audio cue - use ref to get current value
        if (audioEnabledRef.current && phase !== 'idle') {
            const audioType = phase === 'hold1' || phase === 'hold2' ? 'hold' : phase;
            playBreathingTone(audioType as 'inhale' | 'hold' | 'exhale', 0.3);
            triggerHaptic(50);
        }

        const phaseInfo = getPhaseInfo(phase);

        if (phaseTimerRef.current) {
            clearTimeout(phaseTimerRef.current);
        }

        if (phase !== 'idle') {
            phaseTimerRef.current = setTimeout(() => {
                const nextPhase = phaseInfo.next;

                // Increment cycle when completing a full cycle
                if ((pattern === '2-4-6' && nextPhase === 'inhale') ||
                    (pattern === '4-4-4-4' && nextPhase === 'inhale')) {
                    setcycleCount(prev => prev + 1);
                }

                startNextPhase(nextPhase);
            }, phaseInfo.duration * 1000);
        }
    };

    const toggleBreathing = () => {
        if (!isActive) {
            setIsActive(true);
            setTimeRemaining(duration * 60);
            setcycleCount(0);
            startNextPhase('inhale');
        } else {
            setIsActive(false);
            setCurrentPhase('idle');
            if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    // Overall timer countdown
    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        setIsActive(false);
                        setCurrentPhase('idle');
                        if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
                        if (onComplete) onComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, onComplete]);

    // Sync audioEnabled state with ref
    useEffect(() => {
        audioEnabledRef.current = audioEnabled;
    }, [audioEnabled]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const phaseInfo = getPhaseInfo();
    const progress = ((totalCycles - cycleCount) / totalCycles) * 100;

    return (
        <div className="fixed inset-0 z-[150] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
            <CalmingBackground />

            <div className="relative z-10 max-w-2xl w-full mx-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-1">
                            {pattern === '2-4-6' ? 'Calming Breath' : 'Box Breathing'}
                        </h2>
                        <p className="text-purple-200">
                            {pattern === '2-4-6'
                                ? 'Inhale 2s • Hold 4s • Exhale 6s'
                                : 'Inhale 4s • Hold 4s • Exhale 4s • Hold 4s'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-white"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Main breathing visualization */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-12 shadow-2xl mb-6">
                    <div className="flex flex-col items-center gap-8">
                        {/* Animation */}
                        <div>
                            {pattern === '2-4-6' ? (
                                <BreathingCircle
                                    phase={currentPhase as BreathPhase246}
                                    size={150}
                                />
                            ) : (
                                <BoxBreathingSquare
                                    phase={currentPhase as BreathPhaseBox}
                                    size={180}
                                />
                            )}
                        </div>

                        {/* Phase instruction */}
                        <div className="text-center">
                            <h3 className="text-4xl font-bold text-white mb-2">
                                {phaseInfo.text}
                            </h3>
                            {isActive && (
                                <p className="text-xl text-purple-200">
                                    Cycle {cycleCount} of {totalCycles}
                                </p>
                            )}
                        </div>

                        {/* Progress bar */}
                        <div className="w-full">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 transition-all duration-1000"
                                    style={{ width: `${100 - progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-sm text-purple-200 mt-2">
                                <span>Time: {formatTime(timeRemaining)}</span>
                                <span>Duration: {duration} min</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4 justify-center items-center">
                    <button
                        onClick={toggleBreathing}
                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-3"
                    >
                        {isActive ? (
                            <>
                                <Pause size={20} />
                                Pause
                            </>
                        ) : (
                            <>
                                <Play size={20} />
                                {cycleCount > 0 ? 'Resume' : 'Start'}
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => setAudioEnabled(!audioEnabled)}
                        className={`p-4 rounded-2xl border-2 transition-all ${audioEnabled
                            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                            }`}
                        aria-label={audioEnabled ? 'Mute audio' : 'Enable audio'}
                    >
                        {audioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </button>
                </div>

                {/* Instructions */}
                {!isActive && cycleCount === 0 && (
                    <div className="mt-6 text-center">
                        <p className="text-purple-200 text-sm">
                            Click <strong>Start</strong> and follow the rhythm.
                            {audioEnabled && ' You\'ll hear gentle tone cues.'}
                        </p>
                    </div>
                )}

                {/* Completion message */}
                {!isActive && timeRemaining === 0 && (
                    <div className="mt-6 bg-green-500/20 border-2 border-green-400/30 rounded-2xl p-6 text-center">
                        <p className="text-2xl font-bold text-white mb-2">✨ Complete!</p>
                        <p className="text-green-200">
                            Great job! You've completed your breathing exercise.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BreathingTimer;
