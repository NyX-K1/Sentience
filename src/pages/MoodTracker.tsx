import { useState } from 'react';
import { useMoodStore } from '../hooks/useMoodStore';
import MoodCompass, { Quadrant } from '../components/MoodCompass';
import EmotionWheel from '../components/EmotionWheel';
import EmotionBloom from '../components/EmotionBloom';
import ContextPanel from '../components/ContextPanel';
import BackgroundShader from '../components/BackgroundShader';
import WellbeingScore from '../components/WellbeingScore';
import EmotionRhythm from '../components/EmotionRhythm';
import FamilyDistribution from '../components/FamilyDistribution';
import EmotionHeatmap from '../components/EmotionHeatmap';
import PostSaveReflection from '../components/PostSaveReflection';
import Ballpit from '../components/Ballpit';
import { EmotionFamily } from '../types/mood';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const MoodTracker = () => {
    const [activeTab, setActiveTab] = useState<'log' | 'trends'>('log');

    // Logging Flow State
    const [quadrant, setQuadrant] = useState<Quadrant>(null);
    const [family, setFamily] = useState<EmotionFamily | null>(null);
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [showContext, setShowContext] = useState(false);

    const [showReflection, setShowReflection] = useState(false);
    const [justSavedEmotionIds, setJustSavedEmotionIds] = useState<string[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const navigate = useNavigate();
    const { entries, addEntry } = useMoodStore();
    const { user } = useAuth();

    const handleToggleEmotion = (id: string) => {
        setSelectedEmotions(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    const handleSave = async (contextData: {
        emotions: { emotion: string; intensity: number }[];
        valence: number;
        arousal: number;
        dominantFamily: string;
        triggers: string[];
        note: string
    }) => {
        if (!user) {
            alert('You must be logged in to save mood logs.');
            return;
        }

        try {
            // Map state to the exact columns in mood_logs table
            const { data: moodData, error } = await supabase.from('mood_logs').insert([{
                user_id: user.id,
                local_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                valence: contextData.valence,
                arousal: contextData.arousal,
                dominant_family: contextData.dominantFamily,
                notes: contextData.note,
                source_context: 'manual'
            }]).select('id').single();

            if (error) {
                console.error("Supabase Error:", error);
                throw error;
            }

            if (moodData) {
                if (contextData.emotions.length > 0) {
                    await supabase.from('mood_emotions').insert(
                        contextData.emotions.map(e => ({ mood_log_id: moodData.id, emotion_id: e.emotion, intensity: e.intensity }))
                    );
                }
                if (contextData.triggers.length > 0) {
                    await supabase.from('mood_triggers').insert(
                        contextData.triggers.map(t => ({ mood_log_id: moodData.id, trigger_name: t }))
                    );
                }
            }

            // Keep optimistic UI updated for the Trends tab
            addEntry({
                emotions: contextData.emotions.map(e => ({ emotionId: e.emotion, intensity: e.intensity })),
                compositeValence: contextData.valence,
                compositeArousal: contextData.arousal,
                dominantFamily: contextData.dominantFamily as EmotionFamily,
                triggers: contextData.triggers,
                customTriggers: [],
                freeNote: contextData.note,
                source: 'manual',
                userId: user.id,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });

            // Show a calming toast notification
            setToastMessage('Mood logged successfully 🍃');
            setTimeout(() => setToastMessage(null), 3000);

            // Store saved IDs for reflection modal
            setJustSavedEmotionIds([...selectedEmotions]);
            setShowReflection(true);

            // Reset flow
            setQuadrant(null);
            setFamily(null);
            setSelectedEmotions([]);
            setShowContext(false);
        } catch (error) {
            alert('An error occurred while saving. Please try again.');
        }
    };

    const handleContinueFromReflection = () => {
        setShowReflection(false);
        setActiveTab('trends');
    };

    return (
        <div className="min-h-screen bg-black text-white relative font-mono overflow-x-hidden">
            {/* Dynamic Background Shader */}
            <BackgroundShader selectedEmotionIds={selectedEmotions} />

            {/* Ballpit Interactive Background */}
            <div className="fixed inset-0 z-0 pointer-events-auto opacity-50" style={{ position: 'fixed', overflow: 'hidden', minHeight: '100vh', width: '100%' }}>
                <Ballpit
                    count={240}
                    gravity={0.1}
                    friction={0.9975}
                    wallBounce={0.95}
                    followCursor={false}
                    colors={[0x0c4a6e, 0x0284c7, 0x38bdf8, 0x818cf8, 0x4f46e5, 0x2e1065]}
                />
            </div>

            {/* Calming Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)] font-medium text-sm flex items-center gap-2"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="relative z-10 container mx-auto px-4 pt-6 pb-24 md:pb-6 flex flex-col h-screen overflow-hidden pointer-events-none">

                {/* Return Home Button */}
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-6 left-4 md:left-8 z-40 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.5)] group"
                    title="Return to Home"
                    aria-label="Return to Home"
                >
                    <Home size={20} className="group-hover:scale-110 transition-transform" />
                </button>

                {/* Floating Navigation Pill */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4 pointer-events-auto">
                    <div className="flex space-x-1 bg-black/40 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                        {(['log', 'trends'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    flex-1 py-2.5 px-4 rounded-full text-[10px] sm:text-xs uppercase tracking-[0.2em] transition-all duration-300 relative font-medium
                                    ${activeTab === tab ? 'text-black' : 'text-white/40 hover:text-white/80'}
                                `}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTabBadge"
                                        className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-white rounded-full -z-10 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                    />
                                )}
                                <span className="relative z-10">{tab}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <main className="flex-grow overflow-y-auto pt-24 pb-20 scrollbar-hide relative z-10 pointer-events-auto">
                    {/* Header Title moved into scroll area */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-light tracking-widest text-white/90">TRACK<span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ER</span></h1>
                    </div>
                    {activeTab === 'log' && (
                        <div className="w-full flex-col flex items-center justify-center min-h-[60vh]">
                            {!quadrant && (
                                <MoodCompass selectedQuadrant={quadrant} onSelectQuadrant={setQuadrant} />
                            )}

                            {quadrant && !family && (
                                <EmotionWheel
                                    quadrant={quadrant}
                                    selectedFamily={family}
                                    onSelectFamily={setFamily}
                                    onBack={() => setQuadrant(null)}
                                />
                            )}

                            {family && !showContext && (
                                <EmotionBloom
                                    family={family}
                                    selectedEmotionIds={selectedEmotions}
                                    onToggleEmotion={handleToggleEmotion}
                                    onBack={() => { setFamily(null); setSelectedEmotions([]); }}
                                    onProceed={() => setShowContext(true)}
                                />
                            )}

                            {showContext && (
                                <ContextPanel
                                    selectedEmotionIds={selectedEmotions}
                                    onSave={handleSave}
                                    onBack={() => setShowContext(false)}
                                />
                            )}
                        </div>
                    )}

                    {activeTab === 'trends' && (
                        <div className="w-full max-w-5xl mx-auto px-4 lg:px-0 flex flex-col gap-6 pt-4">
                            {/* Top Row: Wellbeing + Distribution */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <WellbeingScore entries={entries} />
                                </div>
                                <div className="lg:col-span-1">
                                    <FamilyDistribution entries={entries} />
                                </div>
                            </div>

                            {/* Bottom Row: Heatmap + Rhythm */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <EmotionHeatmap entries={entries} />
                                <EmotionRhythm entries={entries} />
                            </div>
                        </div>
                    )}

                </main>
            </div>

            {/* Post-Save Reflection Modal */}
            {showReflection && (
                <PostSaveReflection
                    emotionIds={justSavedEmotionIds}
                    onClose={() => setShowReflection(false)}
                    onContinue={handleContinueFromReflection}
                />
            )}

        </div>
    );
};

export default MoodTracker;
