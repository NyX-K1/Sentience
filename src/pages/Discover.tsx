import { RevealWaveImage } from "@/components/ui/reveal-wave-image";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Discover() {
    const navigate = useNavigate();

    useEffect(() => {
        // 7 Second Loading Screen -> Redirect to Lumina
        const timer = setTimeout(() => {
            navigate('/sentience');
        }, 7000);
        return () => clearTimeout(timer);
    }, [navigate]);

    const emotions = [
        "ANGER", "OVERWHELMED", "DISAPPOINTED", "FEAR", "ANXIETY",
        "NUMBNESS", "ISOLATION", "REGRET", "DESPAIR", "GUILT",
        "HOLLOW", "LOST", "FRAGILE", "BROKEN", "SILENCE"
    ];

    // Duplicate list for seamless loop
    const creditList = [...emotions, ...emotions, ...emotions, ...emotions];

    return (
        <div className="min-h-screen min-w-full fixed inset-0 bg-black relative overflow-hidden font-mono">
            <style>{`
                @keyframes scrollUp {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
                @keyframes scrollDown {
                    0% { transform: translateY(-50%); }
                    100% { transform: translateY(0); }
                }
                .credits-scroll-up {
                    animation: scrollUp 20s linear infinite;
                }
                .credits-scroll-down {
                    animation: scrollDown 20s linear infinite;
                }
            `}</style>

            <RevealWaveImage
                // src="/assets/reveal.jpg"
                // Fallback if local asset missing
                src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2000&auto=format&fit=crop"

                waveSpeed={0.2}
                waveFrequency={0.7}
                waveAmplitude={0.5}
                revealRadius={0.3}
                revealSoftness={0.5}
                pixelSize={1}
                mouseRadius={0.4}
            />

            {/* Left Columns */}
            <div className="absolute top-0 left-0 h-full z-20 pointer-events-none flex gap-2 pl-4 mix-blend-difference opacity-80">
                {/* Col 1: Up */}
                <div className="w-24 h-full overflow-hidden flex justify-center relative">
                    <div className="credits-scroll-up flex flex-col gap-12 py-8">
                        {creditList.map((word, i) => (
                            <span key={`l1-${i}`} className="text-white text-2xl tracking-[0.2em] font-light rotate-180" style={{ writingMode: 'vertical-rl' }}>
                                {word}
                            </span>
                        ))}
                    </div>
                </div>
                {/* Col 2: Down (Opposite) */}
                <div className="w-24 h-full overflow-hidden flex justify-center relative">
                    <div className="credits-scroll-down flex flex-col gap-12 py-8" style={{ animationDuration: '25s' }}>
                        {creditList.map((word, i) => (
                            <span key={`l2-${i}`} className="text-white text-2xl tracking-[0.2em] font-light rotate-180" style={{ writingMode: 'vertical-rl' }}>
                                {word}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Columns */}
            <div className="absolute top-0 right-0 h-full z-20 pointer-events-none flex gap-2 pr-4 mix-blend-difference opacity-80">
                {/* Col 3: Up (Opposite) */}
                <div className="w-24 h-full overflow-hidden flex justify-center relative">
                    <div className="credits-scroll-up flex flex-col gap-12 py-8" style={{ animationDuration: '25s' }}>
                        {creditList.map((word, i) => (
                            <span key={`r1-${i}`} className="text-white text-2xl tracking-[0.2em] font-light" style={{ writingMode: 'vertical-rl' }}>
                                {word}
                            </span>
                        ))}
                    </div>
                </div>
                {/* Col 4: Down */}
                <div className="w-24 h-full overflow-hidden flex justify-center relative">
                    <div className="credits-scroll-down flex flex-col gap-12 py-8">
                        {creditList.map((word, i) => (
                            <span key={`r2-${i}`} className="text-white text-2xl tracking-[0.2em] font-light" style={{ writingMode: 'vertical-rl' }}>
                                {word}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-[0.3em] uppercase pointer-events-none animate-pulse z-30">
                Loading Experience...
            </div>
        </div>
    )
}
