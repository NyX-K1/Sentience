import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, ArrowLeft, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { COGNITIVE_DISTORTIONS } from '../../data/distortions';
import AICompanion from './AICompanion';
import DistortionIcon from './DistortionIcon';

interface DistortionDetectiveProps {
    automaticThought: string;
    identifiedDistortions: string[];
    onUpdate: (data: { identifiedDistortions: string[] }) => void;
    onContinue: () => void;
    onBack: () => void;
}

export default function DistortionDetective({ automaticThought, identifiedDistortions, onUpdate, onContinue, onBack }: DistortionDetectiveProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleDistortion = (id: string) => {
        const updated = identifiedDistortions.includes(id)
            ? identifiedDistortions.filter(d => d !== id)
            : [...identifiedDistortions, id];
        onUpdate({ identifiedDistortions: updated });
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl"
            >
                {/* Header */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-amber-500/20 rounded-xl">
                            <Search className="text-amber-400" size={22} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Distortion Detective</h2>
                    </div>
                    <p className="text-white/50 text-sm ml-[52px] mb-6">
                        Cognitive distortions are mental shortcuts that feel true but distort reality. See if any of these patterns match your thought.
                    </p>

                    {/* Pinned Thought Specimen */}
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 relative overflow-hidden">
                        <p className="text-xs text-rose-400/60 uppercase tracking-widest mb-2 font-medium">Your thought</p>
                        <p className="text-white/90 text-base italic leading-relaxed">
                            "{automaticThought}"
                        </p>
                        {identifiedDistortions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {identifiedDistortions.map(id => {
                                    const d = COGNITIVE_DISTORTIONS.find(cd => cd.id === id);
                                    return d ? (
                                        <span key={id} className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ backgroundColor: d.colorAccent + '30', color: d.colorAccent }}>
                                            {d.name}
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        )}
                    </div>

                    {/* AI Distortion Detection */}
                    <div className="mt-5">
                        <AICompanion
                            accentColor="amber"
                            buttonLabel="AI: Detect my distortions"
                            systemPrompt={`You are a CBT therapist AI. Analyze the user's automatic thought and identify which cognitive distortions are present.
Return ONLY raw JSON:
{
  "observation": "A brief, empathetic 1-2 sentence observation about THIS specific thought pattern",
  "suggestions": ["distortion-id-1", "distortion-id-2"]
}
The valid distortion IDs are: ${COGNITIVE_DISTORTIONS.map(d => d.id).join(', ')}.
Pick ONLY the ones that clearly match. Usually 1-3 distortions. Be specific to the user's thought, not generic.`}
                            userContext={`My automatic thought is: "${automaticThought}"`}
                            renderSuggestion={(id, i) => {
                                const d = COGNITIVE_DISTORTIONS.find(cd => cd.id === id);
                                if (!d) return <p key={i} className="text-xs text-white/30">Unknown: {id}</p>;
                                const isSelected = identifiedDistortions.includes(d.id);
                                return (
                                    <button
                                        key={d.id}
                                        onClick={() => toggleDistortion(d.id)}
                                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${isSelected
                                            ? 'border-2 bg-amber-500/10'
                                            : 'border-white/10 bg-white/[.02] hover:bg-white/5'
                                            }`}
                                        style={isSelected ? { borderColor: d.colorAccent + '60' } : {}}
                                    >
                                        <span className="text-xl">{d.icon}</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white/80">{d.name}</p>
                                            <p className="text-xs text-white/30">{d.hook}</p>
                                        </div>
                                        {isSelected && (
                                            <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: d.colorAccent }}>
                                                <Check size={12} className="text-white" />
                                            </span>
                                        )}
                                    </button>
                                );
                            }}
                        />
                    </div>
                </div>

                {/* Distortion Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {COGNITIVE_DISTORTIONS.map(distortion => {
                        const isSelected = identifiedDistortions.includes(distortion.id);
                        const isExpanded = expandedId === distortion.id;

                        return (
                            <motion.div
                                key={distortion.id}
                                layout
                                className={`bg-white/5 backdrop-blur-md border rounded-2xl overflow-hidden transition-all ${isSelected
                                    ? 'border-2 shadow-lg'
                                    : 'border-white/10 hover:border-white/20'
                                    }`}
                                style={isSelected ? { borderColor: distortion.colorAccent + '60', boxShadow: `0 0 20px ${distortion.colorAccent}15` } : {}}
                            >
                                {/* Collapsed Header */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : distortion.id)}
                                    className="w-full text-left p-5 flex items-center gap-3"
                                >
                                    <span className="text-2xl"><DistortionIcon distortionId={distortion.id} size={22} color={distortion.colorAccent} /></span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-white truncate">{distortion.name}</h3>
                                            {isSelected && (
                                                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: distortion.colorAccent }}>
                                                    <Check size={12} className="text-white" />
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-white/40 mt-0.5 truncate">{distortion.hook}</p>
                                    </div>
                                    {isExpanded ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
                                </button>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-5 space-y-4">
                                                <p className="text-sm text-white/70 leading-relaxed">{distortion.definition}</p>

                                                <div>
                                                    <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Sounds like...</p>
                                                    {distortion.examples.map((ex, i) => (
                                                        <p key={i} className="text-sm text-white/50 italic mb-1.5 pl-3 border-l-2 border-white/10">"{ex}"</p>
                                                    ))}
                                                </div>

                                                <div className="bg-white/5 rounded-xl p-3">
                                                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Reality check</p>
                                                    <p className="text-sm text-teal-300/80">{distortion.realityCheck}</p>
                                                </div>

                                                <p className="text-xs text-white/30 italic"><DistortionIcon distortionId={distortion.id} size={10} className="inline mr-1 opacity-50" /> {distortion.visualMetaphor}</p>

                                                <div className="flex gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleDistortion(distortion.id);
                                                            setExpandedId(null);
                                                        }}
                                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${isSelected
                                                            ? 'bg-white/10 text-white/50'
                                                            : 'text-white'
                                                            }`}
                                                        style={!isSelected ? { backgroundColor: distortion.colorAccent + '30', color: distortion.colorAccent } : {}}
                                                    >
                                                        {isSelected ? 'Remove ✕' : 'This one fits ✓'}
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Counter + Note */}
                <div className="text-center mb-6">
                    {identifiedDistortions.length > 0 ? (
                        <p className="text-white/60 text-sm">{identifiedDistortions.length} distortion{identifiedDistortions.length > 1 ? 's' : ''} identified</p>
                    ) : (
                        <p className="text-white/40 text-sm italic">Not every thought involves a distortion. If none of these fit, that's perfectly fine — you can still examine the evidence.</p>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onBack}
                        className="px-6 py-4 bg-white/5 border border-white/10 text-white/70 font-medium rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onContinue}
                        className="flex-1 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-3"
                    >
                        Continue
                        <ArrowRight size={18} />
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
