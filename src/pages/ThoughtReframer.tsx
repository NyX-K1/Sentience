import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Trash2, Heart, Phone, Check, Layers, Home } from 'lucide-react';
import { useReframerSession } from '../hooks/useReframerSession';
import { useReframerHistory } from '../hooks/useReframerHistory';
import { COGNITIVE_DISTORTIONS } from '../data/distortions';
import { CRISIS_KEYWORDS } from '../data/reframePrompts';
import { CRISIS_HELPLINES } from '../data/helplines';
import ProgressBar from '../components/thought-reframer/ProgressBar';
import StepTransition from '../components/thought-reframer/StepTransition';
import SituationStep from '../components/thought-reframer/SituationStep';
import ThoughtTrapStep from '../components/thought-reframer/ThoughtTrapStep';
import EmotionCheckStep from '../components/thought-reframer/EmotionCheckStep';
import DistortionDetective from '../components/thought-reframer/DistortionDetective';
import EvidenceScale from '../components/thought-reframer/EvidenceScale';
import ReframeStep from '../components/thought-reframer/ReframeStep';
import ShiftStep from '../components/thought-reframer/ShiftStep';
import TakeawayStep from '../components/thought-reframer/TakeawayStep';
import ShaderBackground from '../components/ui/shader-background';

type View = 'landing' | 'session' | 'history' | 'completed';

export default function ThoughtReframer() {
    const {
        session,
        hasDraft,
        resumeDraft,
        startFresh,
        updateSession,
        goToStep,
        completeSession
    } = useReframerSession();
    const { sessions, deleteSession, refresh, analytics } = useReframerHistory();
    const [view, setView] = useState<View>('landing');
    const [direction, setDirection] = useState(1);
    const [showCrisis, setShowCrisis] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Crisis keyword detection
    useEffect(() => {
        const textToCheck = `${session.situation} ${session.automaticThought}`.toLowerCase();
        const hasCrisisKeyword = CRISIS_KEYWORDS.some(kw => textToCheck.includes(kw));
        setShowCrisis(hasCrisisKeyword);
    }, [session.situation, session.automaticThought]);

    const nextStep = useCallback(() => {
        if (session.currentStep < 8) {
            setDirection(1);
            goToStep((session.currentStep + 1) as any);
        }
    }, [session.currentStep, goToStep]);

    const prevStep = useCallback(() => {
        if (session.currentStep > 1) {
            setDirection(-1);
            goToStep((session.currentStep - 1) as any);
        }
    }, [session.currentStep, goToStep]);

    const handleComplete = useCallback(async () => {
        setIsSaving(true);
        try {
            await completeSession();
            refresh();
            setView('completed');
        } finally {
            setIsSaving(false);
        }
    }, [completeSession, refresh]);

    const handleStartNewSession = useCallback(() => {
        startFresh();
        setView('session');
    }, [startFresh]);

    // Ambient background color per step
    const ambientColors: Record<number, string> = {
        1: 'from-indigo-950 via-slate-950 to-violet-950',
        2: 'from-rose-950 via-slate-950 to-pink-950',
        3: 'from-pink-950 via-slate-950 to-fuchsia-950',
        4: 'from-amber-950 via-slate-950 to-orange-950',
        5: 'from-teal-950 via-slate-950 to-cyan-950',
        6: 'from-emerald-950 via-slate-950 to-green-950',
        7: 'from-sky-950 via-slate-950 to-blue-950',
        8: 'from-violet-950 via-slate-950 to-fuchsia-950'
    };

    // LANDING VIEW
    if (view === 'landing') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-violet-950 text-white relative overflow-hidden">
                {/* Calming Neural Shader */}
                <div className="fixed inset-0 z-0 opacity-40">
                    <ShaderBackground />
                </div>
                {/* Ambient orbs */}
                <div className="absolute top-20 left-10 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />

                {/* Back & Home */}
                <div className="absolute top-6 left-6 z-50 flex gap-3">
                    <Link to="/sentience" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10" title="Back to Sentience">
                        <ArrowLeft size={16} />
                        <span className="text-sm font-medium">Back</span>
                    </Link>
                    <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10" title="Return to Home">
                        <Home size={16} />
                        <span className="text-sm font-medium">Home</span>
                    </Link>
                </div>

                <div className="max-w-3xl mx-auto px-4 pt-28 pb-16 relative z-10">
                    {/* Hero */}
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/40 mb-6 tracking-[0.2em] uppercase">
                            Guided CBT Exercise
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/80 to-white/40">
                            Thought Reframer
                        </h1>
                        <p className="text-white/35 text-lg max-w-md mx-auto leading-relaxed">
                            See your thoughts through a clearer lens. 8 guided steps grounded in cognitive behavioral therapy.
                        </p>
                    </motion.div>

                    {/* Draft Resume */}
                    <AnimatePresence>
                        {hasDraft && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-center gap-4"
                            >
                                <Clock className="text-amber-400 flex-shrink-0" size={20} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white/80">You have an unfinished session</p>
                                    <p className="text-xs text-white/40">Pick up where you left off</p>
                                </div>
                                <button onClick={() => { resumeDraft(); setView('session'); }} className="px-4 py-2 bg-amber-500/20 rounded-xl text-amber-300 text-sm font-medium hover:bg-amber-500/30 transition-colors">
                                    Resume
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-14">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleStartNewSession}
                            className="flex-1 px-8 py-5 bg-white text-black font-medium rounded-full transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 text-sm uppercase tracking-widest hover:bg-zinc-100"
                        >
                            New Session
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { refresh(); setView('history'); }}
                            className="px-8 py-5 bg-white/5 border border-white/10 text-white/50 rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                        >
                            <Layers size={16} />
                            Past Sessions ({sessions.length})
                        </motion.button>
                    </div>

                    {/* How It Works — Clean step flow */}
                    <div className="bg-black/30 backdrop-blur-xl border border-white/8 rounded-3xl p-8">
                        <h3 className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-8 text-center">The 8-Step Process</h3>
                        <div className="flex flex-col gap-4">
                            {[
                                { steps: '1 → 2', label: 'Capture', desc: 'Describe the situation and identify the automatic thought' },
                                { steps: '3 → 4', label: 'Identify', desc: 'Check in with your emotions and detect cognitive distortions' },
                                { steps: '5 → 6', label: 'Examine', desc: 'Weigh the evidence and craft a balanced reframe' },
                                { steps: '7 → 8', label: 'Transform', desc: 'Measure your belief shift and take away a growth insight' },
                            ].map(item => (
                                <div key={item.steps} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/3 transition-colors">
                                    <span className="text-[10px] text-white/20 uppercase tracking-widest mt-1 shrink-0 w-12">{item.steps}</span>
                                    <div>
                                        <p className="text-sm font-medium text-white/70">{item.label}</p>
                                        <p className="text-xs text-white/30 mt-0.5 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // HISTORY VIEW
    if (view === 'history') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-violet-950 text-white">
                <div className="max-w-3xl mx-auto px-4 pt-8 pb-16">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => setView('landing')} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                            <ArrowLeft size={18} className="text-white/60" />
                        </button>
                        <h2 className="text-2xl font-bold">Past Sessions</h2>
                    </div>

                    {/* Analytics */}
                    {analytics.totalSessions > 0 && (
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-bold text-violet-400">{analytics.totalSessions}</p>
                                <p className="text-xs text-white/30 mt-1">Sessions</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-bold text-emerald-400">{analytics.averageBeliefShift}%</p>
                                <p className="text-xs text-white/30 mt-1">Avg Shift</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-bold text-sky-400">{analytics.averageDuration}m</p>
                                <p className="text-xs text-white/30 mt-1">Avg Duration</p>
                            </div>
                        </div>
                    )}

                    {/* Top Distortions */}
                    {analytics.mostCommonDistortions.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
                            <p className="text-xs text-white/30 uppercase tracking-widest mb-3 font-medium">Most common patterns</p>
                            <div className="space-y-2">
                                {analytics.mostCommonDistortions.map(({ id, count, percentage }) => {
                                    const d = COGNITIVE_DISTORTIONS.find(cd => cd.id === id);
                                    return d ? (
                                        <div key={id} className="flex items-center gap-3">
                                            <span className="text-lg">{d.icon}</span>
                                            <span className="text-sm text-white/60 flex-1">{d.name}</span>
                                            <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: d.colorAccent }} />
                                            </div>
                                            <span className="text-xs text-white/30 min-w-[40px] text-right">{count}x</span>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}

                    {/* Session List */}
                    {sessions.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-white/30 text-lg mb-4">No sessions yet</p>
                            <button onClick={handleStartNewSession} className="px-6 py-3 bg-violet-600 rounded-xl text-white font-medium">Start Your First Session</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sessions.map(s => {
                                const distortions = s.identifiedDistortions.map(id => COGNITIVE_DISTORTIONS.find(d => d.id === id)).filter(Boolean);
                                return (
                                    <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[.07] transition-colors group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white/70 line-clamp-1 font-medium">"{s.automaticThought}"</p>
                                                <p className="text-xs text-white/30 mt-1">{new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                            <div className="flex items-center gap-3 ml-4">
                                                <span className={`text-sm font-bold ${s.beliefShift > 0 ? 'text-emerald-400' : 'text-white/30'}`}>
                                                    {s.beliefShift > 0 ? '-' : ''}{Math.abs(s.beliefShift)}%
                                                </span>
                                                <button onClick={() => deleteSession(s.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all p-1">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {distortions.map(d => d && (
                                                <span key={d.id} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: d.colorAccent + '20', color: d.colorAccent }}>
                                                    {d.icon} {d.name}
                                                </span>
                                            ))}
                                            {s.contextTags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/30">{tag}</span>
                                            ))}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // COMPLETED VIEW
    if (view === 'completed') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-950 to-fuchsia-950 text-white flex items-center justify-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/15 rounded-full mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                    >
                        <Check className="w-8 h-8 text-white/80" />
                    </motion.div>
                    <h2 className="text-3xl font-light tracking-wide mb-3">Session Complete</h2>
                    <p className="text-white/35 mb-8 max-w-sm mx-auto text-sm leading-relaxed">Your progress has been recorded. Every session strengthens your cognitive flexibility.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onClick={handleStartNewSession} className="px-8 py-4 bg-white text-black rounded-full font-medium text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)]">Start Another</button>
                        <button onClick={() => setView('landing')} className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-white/50 text-sm uppercase tracking-widest hover:bg-white/10 transition-colors">Back to Menu</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // SESSION VIEW (main exercise flow)
    return (
        <div className={`min-h-screen bg-gradient-to-br ${ambientColors[session.currentStep] || ambientColors[1]} text-white transition-colors duration-1000 relative`}>
            {/* Calming Neural Shader */}
            <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
                <ShaderBackground />
            </div>
            {/* Ambient Particles */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-64 h-64 rounded-full bg-white/[.02] blur-3xl"
                        animate={{
                            x: [0, 100, -50, 0],
                            y: [0, -80, 60, 0],
                            scale: [1, 1.2, 0.9, 1]
                        }}
                        transition={{
                            duration: 20 + i * 5,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                        style={{
                            left: `${(i * 20) % 80}%`,
                            top: `${(i * 15) % 70}%`
                        }}
                    />
                ))}
            </div>

            {/* Back to Landing */}
            <div className="absolute top-4 left-4 z-50">
                <button onClick={() => setView('landing')} className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm">
                    <ArrowLeft size={14} /> Exit
                </button>
            </div>

            {/* Progress Bar */}
            <ProgressBar currentStep={session.currentStep} />

            {/* Crisis Banner */}
            <AnimatePresence>
                {showCrisis && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mx-4 mt-4 bg-red-950/60 border border-red-500/30 rounded-2xl p-5 relative z-40"
                    >
                        <div className="flex items-start gap-3">
                            <Heart size={20} className="text-blue-400" />
                            <div>
                                <p className="text-sm font-bold text-red-100 mb-1">You are not alone in this.</p>
                                <p className="text-xs text-red-200/60 mb-3">If you're in crisis, please reach out to trained professionals:</p>
                                <div className="flex flex-wrap gap-2">
                                    {CRISIS_HELPLINES.slice(0, 2).map(h => (
                                        <a key={h.id} href={`tel:${h.phone.replace(/\D/g, '')}`} className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-xl text-xs text-red-200 hover:bg-red-500/30 transition-colors flex items-center gap-1">
                                            <Phone size={10} /> {h.organization}: {h.phone}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Step Content */}
            <div className="relative z-10">
                <StepTransition stepKey={session.currentStep} direction={direction}>
                    {session.currentStep === 1 && (
                        <SituationStep
                            situation={session.situation}
                            contextTags={session.contextTags}
                            onUpdate={updateSession}
                            onContinue={nextStep}
                        />
                    )}
                    {session.currentStep === 2 && (
                        <ThoughtTrapStep
                            automaticThought={session.automaticThought}
                            initialBelief={session.initialBelief}
                            onUpdate={updateSession}
                            onContinue={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {session.currentStep === 3 && (
                        <EmotionCheckStep
                            initialEmotions={session.initialEmotions}
                            onUpdate={updateSession}
                            onContinue={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {session.currentStep === 4 && (
                        <DistortionDetective
                            automaticThought={session.automaticThought}
                            identifiedDistortions={session.identifiedDistortions}
                            onUpdate={updateSession}
                            onContinue={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {session.currentStep === 5 && (
                        <EvidenceScale
                            evidenceFor={session.evidenceFor}
                            evidenceAgainst={session.evidenceAgainst}
                            automaticThought={session.automaticThought}
                            onUpdate={updateSession}
                            onContinue={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {session.currentStep === 6 && (
                        <ReframeStep
                            automaticThought={session.automaticThought}
                            identifiedDistortions={session.identifiedDistortions}
                            reframedThoughts={session.reframedThoughts}
                            selectedReframe={session.selectedReframe}
                            onUpdate={updateSession}
                            onContinue={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {session.currentStep === 7 && (
                        <ShiftStep
                            automaticThought={session.automaticThought}
                            selectedReframe={session.selectedReframe}
                            initialBelief={session.initialBelief}
                            finalBelief={session.finalBelief}
                            initialEmotions={session.initialEmotions}
                            finalEmotions={session.finalEmotions}
                            onUpdate={updateSession}
                            onContinue={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {session.currentStep === 8 && (
                        <TakeawayStep
                            situation={session.situation}
                            automaticThought={session.automaticThought}
                            selectedReframe={session.selectedReframe}
                            initialBelief={session.initialBelief}
                            finalBelief={session.finalBelief}
                            identifiedDistortions={session.identifiedDistortions}
                            initialEmotions={session.initialEmotions}
                            finalEmotions={session.finalEmotions}
                            personalTakeaway={session.personalTakeaway}
                            onUpdate={updateSession}
                            onComplete={handleComplete}
                            onBack={prevStep}
                            onStartNew={handleStartNewSession}
                            isSaving={isSaving}
                        />
                    )}
                </StepTransition>
            </div>
        </div>
    );
}
