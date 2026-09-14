import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, SkipForward, Volume2, VolumeX, Music } from 'lucide-react';
import { textToSpeech, stopSpeech, getPMRScript, playBinauralBeat } from '../../utils/audio-utils';
import { CalmingBackground } from './breathing-animations';

interface PMRProps {
    duration: '5min' | '15min';
    onClose: () => void;
    onComplete?: () => void;
}

export const ProgressiveMuscleRelaxation: React.FC<PMRProps> = ({
    duration,
    onClose,
    onComplete,
}) => {
    const [hasStarted, setHasStarted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [volumeEnabled, setVolumeEnabled] = useState(true);
    const [binauralEnabled, setBinauralEnabled] = useState(false);
    const [showSafetyCheck, setShowSafetyCheck] = useState(true);

    const stopBinauralRef = useRef<(() => void) | null>(null);
    const script = getPMRScript(duration);
    const totalSteps = script.length;
    const progress = (currentStep / totalSteps) * 100;

    const startBinauralBeats = () => {
        if (binauralEnabled && !stopBinauralRef.current) {
            // 10 Hz alpha waves for relaxation
            const stopFn = playBinauralBeat(200, 10, duration === '5min' ? 300 : 900);
            stopBinauralRef.current = stopFn;
        }
    };

    const stopBinauralBeats = () => {
        if (stopBinauralRef.current) {
            stopBinauralRef.current();
            stopBinauralRef.current = null;
        }
    };

    const speakCurrentStep = async () => {
        if (!volumeEnabled || currentStep >= totalSteps) return;

        try {
            await textToSpeech(script[currentStep], 0.75);

            // Auto-advance to next step
            if (currentStep < totalSteps - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                // Completed
                setIsPlaying(false);
                stopBinauralBeats();
                if (onComplete) onComplete();
            }
        } catch (error) {
            console.error('Speech error:', error);
            setIsPlaying(false);
        }
    };

    const handleStart = () => {
        setShowSafetyCheck(false);
        setHasStarted(true);
        setIsPlaying(true);
        if (binauralEnabled) startBinauralBeats();
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            setIsPlaying(false);
            stopSpeech();
        } else {
            setIsPlaying(true);
        }
    };

    const skipToNext = () => {
        stopSpeech();
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const toggleBinaural = () => {
        if (binauralEnabled) {
            stopBinauralBeats();
            setBinauralEnabled(false);
        } else {
            setBinauralEnabled(true);
            if (isPlaying) startBinauralBeats();
        }
    };

    // Auto-play current step when playing
    useEffect(() => {
        if (isPlaying && hasStarted) {
            speakCurrentStep();
        }
    }, [isPlaying, currentStep, hasStarted]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopSpeech();
            stopBinauralBeats();
        };
    }, []);

    // Safety check screen
    if (showSafetyCheck) {
        return (
            <div className="fixed inset-0 z-[150] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <CalmingBackground />

                <div className="relative z-10 max-w-xl w-full mx-4">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    Progressive Muscle Relaxation
                                </h2>
                                <p className="text-purple-200">
                                    {duration === '5min' ? '5-minute' : '15-minute'} guided audio
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
                                aria-label="Close"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-yellow-500/20 border-2 border-yellow-400/30 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-yellow-300 mb-3 flex items-center gap-2">
                                    ⚠️ Safety Check
                                </h3>
                                <ul className="space-y-2 text-yellow-100">
                                    <li>• Do NOT use while driving</li>
                                    <li>• Do NOT use while operating machinery</li>
                                    <li>• Find a comfortable, safe place to relax</li>
                                    <li>• You may sit or lie down</li>
                                </ul>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">What to expect:</h3>
                                <p className="text-purple-200 leading-relaxed">
                                    This guided audio will walk you through tensing and relaxing different muscle
                                    groups in your body. You'll learn to recognize the difference between tension
                                    and relaxation, helping to calm your nervous system.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                                <button
                                    onClick={toggleBinaural}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${binauralEnabled
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-white/10 text-purple-200 hover:bg-white/20'
                                        }`}
                                >
                                    <Music size={20} />
                                    Binaural Beats (10 Hz)
                                </button>
                                <div className="text-xs text-purple-300 flex-1">
                                    Optional background audio for enhanced relaxation
                                </div>
                            </div>

                            <button
                                onClick={handleStart}
                                className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-2xl hover:from-green-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                            >
                                <Play size={24} />
                                I'm Ready - Start Session
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main PMR session
    return (
        <div className="fixed inset-0 z-[150] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
            <CalmingBackground />

            <div className="relative z-10 max-w-3xl w-full mx-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Progressive Muscle Relaxation</h2>
                        <p className="text-purple-200">{duration === '5min' ? '5 minutes' : '15 minutes'}</p>
                    </div>
                    <button
                        onClick={() => {
                            stopSpeech();
                            stopBinauralBeats();
                            onClose();
                        }}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Progress */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl mb-6">
                    <div className="mb-6">
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 via-teal-400 to-blue-400 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-sm text-purple-200 mt-2">
                            <span>Step {currentStep + 1} of {totalSteps}</span>
                            <span>{Math.round(progress)}% complete</span>
                        </div>
                    </div>

                    {/* Current instruction */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[120px] flex items-center justify-center">
                        <p className="text-xl text-white text-center leading-relaxed">
                            {script[currentStep]}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4 justify-center items-center">
                    <button
                        onClick={togglePlayPause}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-2xl hover:from-green-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-3"
                    >
                        {isPlaying ? (
                            <>
                                <Pause size={24} />
                                Pause
                            </>
                        ) : (
                            <>
                                <Play size={24} />
                                {currentStep === 0 ? 'Start' : 'Resume'}
                            </>
                        )}
                    </button>

                    <button
                        onClick={skipToNext}
                        disabled={currentStep >= totalSteps - 1}
                        className="p-4 rounded-2xl bg-white/10 border-2 border-white/20 text-white hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Skip to next"
                    >
                        <SkipForward size={24} />
                    </button>

                    <button
                        onClick={() => setVolumeEnabled(!volumeEnabled)}
                        className={`p-4 rounded-2xl border-2 transition-all ${volumeEnabled
                                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                            }`}
                        aria-label={volumeEnabled ? 'Mute' : 'Unmute'}
                    >
                        {volumeEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </button>

                    <button
                        onClick={toggleBinaural}
                        className={`p-4 rounded-2xl border-2 transition-all ${binauralEnabled
                                ? 'bg-purple-500 border-purple-400 text-white hover:bg-purple-600'
                                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                            }`}
                        aria-label="Toggle binaural beats"
                    >
                        <Music size={24} />
                    </button>
                </div>

                {/* Completion message */}
                {currentStep === totalSteps - 1 && !isPlaying && (
                    <div className="mt-6 bg-green-500/20 border-2 border-green-400/30 rounded-2xl p-6 text-center">
                        <p className="text-2xl font-bold text-white mb-2">🌟 Session Complete</p>
                        <p className="text-green-200">
                            Excellent work! Your nervous system is now in a more relaxed state.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressiveMuscleRelaxation;
