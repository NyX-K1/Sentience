import { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, EffectCreative } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import 'swiper/css';

// ─── Journal Story Templates ───
// Each story is a guided emotional writing journey with a theme, prompt, and mood context
interface JournalStory {
    id: string;
    title: string;
    subtitle: string;
    prompt: string;
    gradient: string;
    glowColor: string;
    accentHex: string;
    icon: string; // SVG path
    category: string;
}

const STORIES: JournalStory[] = [
    {
        id: 'unsent-letter',
        title: 'The Unsent Letter',
        subtitle: 'Words you never said',
        prompt: 'Write a letter to someone — living or gone — that you never sent. Say what you couldn\'t say then. You don\'t have to show it to anyone.',
        gradient: 'from-rose-950/40 via-rose-900/20 to-transparent',
        glowColor: 'rgba(244, 63, 94, 0.15)',
        accentHex: '#fb7185',
        icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
        category: 'Relationships',
    },
    {
        id: 'shadow-work',
        title: 'Shadow Dialogue',
        subtitle: 'Meet the part you hide',
        prompt: 'If the part of yourself you suppress could speak — the anger, the jealousy, the fear — what would it say? Write a conversation between you and your shadow.',
        gradient: 'from-violet-950/40 via-violet-900/20 to-transparent',
        glowColor: 'rgba(139, 92, 246, 0.15)',
        accentHex: '#a78bfa',
        icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
        category: 'Self-Discovery',
    },
    {
        id: 'body-scan',
        title: 'Where It Lives',
        subtitle: 'Emotions in the body',
        prompt: 'Close your eyes for 10 seconds. Where do you feel tension, warmth, or heaviness? Describe the physical landscape of your emotions right now — without naming the emotions themselves.',
        gradient: 'from-emerald-950/40 via-emerald-900/20 to-transparent',
        glowColor: 'rgba(52, 211, 153, 0.15)',
        accentHex: '#6ee7b7',
        icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
        category: 'Mindfulness',
    },
    {
        id: 'future-self',
        title: 'Letter From Tomorrow',
        subtitle: 'Your future self writes back',
        prompt: 'Imagine yourself 5 years from now, healed and whole. Write a letter from that person to who you are today. What would they say? What do they want you to know?',
        gradient: 'from-cyan-950/40 via-cyan-900/20 to-transparent',
        glowColor: 'rgba(34, 211, 238, 0.15)',
        accentHex: '#67e8f9',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
        category: 'Growth',
    },
    {
        id: 'forgiveness',
        title: 'The Forgiveness Draft',
        subtitle: 'Release what weighs you',
        prompt: 'Write about something you haven\'t forgiven — yourself or someone else. Don\'t force forgiveness. Just describe the weight of carrying it. What would it feel like to set it down?',
        gradient: 'from-amber-950/40 via-amber-900/20 to-transparent',
        glowColor: 'rgba(251, 191, 36, 0.15)',
        accentHex: '#fcd34d',
        icon: 'M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z',
        category: 'Healing',
    },
    {
        id: 'gratitude-archaeology',
        title: 'Gratitude Archaeology',
        subtitle: 'Dig beneath the surface',
        prompt: 'Pick one ordinary thing from today — a cup of coffee, a stranger\'s smile, a breath of cold air. Write about all the invisible chains of events that had to align for that moment to exist.',
        gradient: 'from-sky-950/40 via-sky-900/20 to-transparent',
        glowColor: 'rgba(56, 189, 248, 0.12)',
        accentHex: '#7dd3fc',
        icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z',
        category: 'Perspective',
    },
];

// ─── Component ───
interface JournalStoriesProps {
    onSelectStory: (prompt: string, title: string) => void;
}

export default function JournalStories({ onSelectStory }: JournalStoriesProps) {
    const [activeIndex, setActiveIndex] = useState(1);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const activeStory = STORIES[activeIndex] || STORIES[0];

    return (
        <div ref={containerRef} className="w-full relative">
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-8"
            >
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/15 mb-3 font-light">Guided Writing</p>
                <h3 className="text-lg md:text-xl font-extralight text-white/50 tracking-wide">Story Templates</h3>
            </motion.div>

            {/* Blur Slider */}
            <div className="relative w-full overflow-hidden">
                {/* Background glow from active slide */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStory.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 -z-10 pointer-events-none"
                        style={{
                            background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${activeStory.glowColor}, transparent)`
                        }}
                    />
                </AnimatePresence>

                <Swiper
                    modules={[Mousewheel, EffectCreative]}
                    slidesPerView={3}
                    centeredSlides
                    initialSlide={1}
                    speed={1200}
                    mousewheel={{ forceToAxis: true, sensitivity: 0.5 }}
                    loop
                    onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                    breakpoints={{
                        0: { slidesPerView: 1.15 },
                        640: { slidesPerView: 1.6 },
                        1024: { slidesPerView: 2.2 },
                    }}
                    className="!overflow-visible !py-6"
                >
                    {STORIES.map((story, index) => (
                        <SwiperSlide key={story.id}>
                            {({ isActive, isNext, isPrev }) => (
                                <motion.div
                                    animate={{
                                        scale: isActive ? 1 : isNext || isPrev ? 0.88 : 0.75,
                                        filter: isActive ? 'blur(0px)' : isNext || isPrev ? 'blur(3px)' : 'blur(8px)',
                                        opacity: isActive ? 1 : isNext || isPrev ? 0.6 : 0.3,
                                    }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    className="relative select-none"
                                >
                                    {/* Card */}
                                    <div className={`relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b ${story.gradient} backdrop-blur-xl p-8 md:p-12 min-h-[400px] md:min-h-[480px] flex flex-col justify-between transition-colors duration-700`}>

                                        {/* Blur echo behind card (like the reference) */}
                                        <div
                                            className="absolute -inset-8 -z-10 rounded-3xl opacity-40 blur-[50px] transition-opacity duration-700"
                                            style={{ background: `radial-gradient(circle, ${story.glowColor}, transparent 70%)` }}
                                        />

                                        {/* Category tag */}
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-[9px] uppercase tracking-[0.3em] px-3 py-1.5 rounded-full border font-light"
                                                style={{ color: story.accentHex, borderColor: story.accentHex + '20', backgroundColor: story.accentHex + '08' }}>
                                                {story.category}
                                            </span>
                                            <span className="text-[9px] text-white/15 uppercase tracking-[0.2em] font-mono">
                                                {String(index + 1).padStart(2, '0')} / {String(STORIES.length).padStart(2, '0')}
                                            </span>
                                        </div>

                                        {/* Icon */}
                                        <div className="mb-5">
                                            <svg className="w-8 h-8 opacity-40" viewBox="0 0 24 24" fill="none" stroke={story.accentHex} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d={story.icon} />
                                            </svg>
                                        </div>

                                        {/* Title + Subtitle */}
                                        <div className="mb-5">
                                            <h4 className="text-xl md:text-2xl font-extralight text-white/80 tracking-wide mb-2">{story.title}</h4>
                                            <p className="text-xs text-white/25 font-light italic">{story.subtitle}</p>
                                        </div>

                                        {/* Prompt preview */}
                                        <p className="text-sm text-white/30 leading-relaxed font-light line-clamp-3 mb-6">{story.prompt}</p>

                                        {/* CTA for active slide */}
                                        <div className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                                            <button
                                                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-medium transition-all duration-300 rounded-full px-5 py-2.5 border"
                                                style={{
                                                    color: story.accentHex,
                                                    borderColor: story.accentHex + '25',
                                                    backgroundColor: story.accentHex + '08',
                                                }}
                                                onClick={() => onSelectStory(story.prompt, story.title)}
                                            >
                                                Begin Writing <ArrowRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
}
