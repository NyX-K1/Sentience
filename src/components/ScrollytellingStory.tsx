import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollytellingStory() {
    const containerRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const cameraRef = useRef<HTMLDivElement>(null);

    // Cinematic layers
    const vignetteRef = useRef<HTMLDivElement>(null);
    const letterboxTopRef = useRef<HTMLDivElement>(null);
    const letterboxBottomRef = useRef<HTMLDivElement>(null);
    const grainRef = useRef<HTMLDivElement>(null);

    // Scene refs
    const scene1Ref = useRef<HTMLDivElement>(null);
    const scene2Ref = useRef<HTMLDivElement>(null);
    const scene3Ref = useRef<HTMLDivElement>(null);
    const scene4Ref = useRef<HTMLDivElement>(null);

    // Background layers (far, mid, near — parallax)
    const bg1FarRef = useRef<HTMLDivElement>(null);
    const bg1MidRef = useRef<HTMLDivElement>(null);
    const bg1NearRef = useRef<HTMLDivElement>(null);

    const bg2Ref = useRef<HTMLDivElement>(null);
    const bg3Ref = useRef<HTMLDivElement>(null);
    const bg4Ref = useRef<HTMLDivElement>(null);

    // Character refs
    const architect1Ref = useRef<SVGSVGElement>(null);
    const architect2Ref = useRef<SVGSVGElement>(null);
    const shadow2Ref = useRef<SVGSVGElement>(null);
    const architect3Ref = useRef<SVGSVGElement>(null);
    const shadow3Ref = useRef<SVGSVGElement>(null);

    // Particle refs
    const particles1Ref = useRef<HTMLDivElement>(null);
    const particles2Ref = useRef<HTMLDivElement>(null);
    const particles3Ref = useRef<HTMLDivElement>(null);
    const particles4Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=8000",
                    scrub: 2,
                    pin: true,
                    anticipatePin: 1
                }
            });

            // Initial states
            gsap.set([scene1Ref.current, scene2Ref.current, scene3Ref.current, scene4Ref.current], { opacity: 0 });
            gsap.set([bg1FarRef.current, bg1MidRef.current, bg1NearRef.current, bg2Ref.current, bg3Ref.current, bg4Ref.current], { opacity: 0 });
            gsap.set(cameraRef.current, { scale: 1, x: 0, y: 0 });
            gsap.set([letterboxTopRef.current, letterboxBottomRef.current], { scaleY: 0 });
            gsap.set(vignetteRef.current, { opacity: 0 });
            gsap.set(grainRef.current, { opacity: 0 });

            // ═══════════════════════════════════════════════════════
            // PROLOGUE: Cinematic bars slide in, vignette appears
            // ═══════════════════════════════════════════════════════
            tl.to([letterboxTopRef.current, letterboxBottomRef.current], { scaleY: 1, duration: 0.4, ease: 'power2.inOut' })
                .to(vignetteRef.current, { opacity: 1, duration: 0.3 }, '<0.1')
                .to(grainRef.current, { opacity: 0.03, duration: 0.3 }, '<');

            // ═══════════════════════════════════════════════════════
            // ACT 1: THE GLASS CITY — Camera starts wide, slowly zooms in
            // ═══════════════════════════════════════════════════════

            // Background layers rise at different speeds (parallax)
            tl.to(bgRef.current, { backgroundColor: '#ededed', duration: 0.4 })
                .fromTo(bg1FarRef.current, { opacity: 0, y: 200 }, { opacity: 0.5, y: 0, duration: 1.2 }, '<')
                .fromTo(bg1MidRef.current, { opacity: 0, y: 150 }, { opacity: 0.7, y: 0, duration: 1 }, '<0.15')
                .fromTo(bg1NearRef.current, { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 0.8 }, '<0.15')
                .to(particles1Ref.current, { opacity: 0.5, duration: 0.5 }, '<0.3')
                // Character walks in
                .fromTo(architect1Ref.current, { x: -250, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: 'power2.out' }, '<0.4')
                // Text reveal
                .to(scene1Ref.current, { opacity: 1, duration: 0.6 }, '<0.6')
                // Camera slowly zooms in during reading
                .to(cameraRef.current, { scale: 1.08, duration: 1.5, ease: 'none' }, '<')
                // Hold
                .to({}, { duration: 0.6 })
                // Exit: Camera zooms further as scene fades — creates "traveling into" feeling
                .to(cameraRef.current, { scale: 1.25, duration: 1, ease: 'power2.in' })
                .to(scene1Ref.current, { opacity: 0, y: -60, filter: 'blur(4px)', duration: 0.8 }, '<')
                .to(architect1Ref.current, { opacity: 0, y: -40, duration: 0.8 }, '<')
                .to([bg1FarRef.current, bg1MidRef.current, bg1NearRef.current], { opacity: 0, y: -80, duration: 0.8 }, '<')
                .to(particles1Ref.current, { opacity: 0, duration: 0.5 }, '<');

            // ═══════════════════════════════════════════════════════
            // TRANSITION 1→2: Camera resets with a dramatic snap
            // ═══════════════════════════════════════════════════════
            tl.to(cameraRef.current, { scale: 0.95, duration: 0.15, ease: 'power3.in' }, '>')
                .to(cameraRef.current, { scale: 1, duration: 0.3, ease: 'back.out(2)' });

            // ═══════════════════════════════════════════════════════
            // ACT 2: THE SHATTERING — Camera shakes, off-axis
            // ═══════════════════════════════════════════════════════
            tl.to(bgRef.current, { backgroundColor: '#050505', duration: 0.4 }, '>')
                .to(bg2Ref.current, { opacity: 1, scale: 1, duration: 0.6 }, '<')
                .to(particles2Ref.current, { opacity: 0.7, duration: 0.4 }, '<0.2')
                // Camera slightly tilted (off-axis unease)
                .to(cameraRef.current, { rotation: -0.5, scale: 1.02, duration: 0.5 }, '<')
                // Characters
                .fromTo(architect2Ref.current,
                    { x: 100, opacity: 0, rotation: 0 },
                    { x: 0, opacity: 1, rotation: -8, duration: 0.8, ease: 'back.out(1.2)' }, '<0.3')
                .fromTo(shadow2Ref.current,
                    { y: 120, opacity: 0, scaleY: 0.3 },
                    { y: 0, opacity: 0.7, scaleY: 1, duration: 1.2, ease: 'power3.out' }, '<0.3')
                // Text
                .fromTo(scene2Ref.current,
                    { opacity: 0, scale: 0.92 },
                    { opacity: 1, scale: 1, duration: 0.6 }, '<0.4')
                // Camera breathing (slight pulse)
                .to(cameraRef.current, { scale: 1.06, duration: 0.8, ease: 'sine.inOut' })
                // Hold
                .to({}, { duration: 0.5 })
                // Exit: violent zoom + blur
                .to(cameraRef.current, { scale: 1.3, rotation: 0, duration: 0.6, ease: 'power3.in' })
                .to(scene2Ref.current, { opacity: 0, scale: 1.1, filter: 'blur(15px)', duration: 0.6 }, '<')
                .to(architect2Ref.current, { opacity: 0, x: -80, rotation: -20, duration: 0.6 }, '<')
                .to(shadow2Ref.current, { opacity: 0, scaleY: 1.5, y: -60, duration: 0.6 }, '<')
                .to(bg2Ref.current, { opacity: 0, scale: 1.4, filter: 'blur(10px)', duration: 0.6 }, '<')
                .to(particles2Ref.current, { opacity: 0, duration: 0.4 }, '<');

            // ═══════════════════════════════════════════════════════
            // TRANSITION 2→3: Camera pulls way back (wide shot)
            // ═══════════════════════════════════════════════════════
            tl.to(cameraRef.current, { scale: 0.9, rotation: 0, duration: 0.4, ease: 'power2.out' }, '>');

            // ═══════════════════════════════════════════════════════
            // ACT 3: THE CONVERGENCE — Camera slowly centers
            // ═══════════════════════════════════════════════════════
            tl.to(bgRef.current, { backgroundColor: '#1a1338', duration: 0.5 }, '>')
                .to(bg3Ref.current, { opacity: 1, scaleX: 1, duration: 0.8 }, '<')
                .to(particles3Ref.current, { opacity: 0.4, duration: 0.5 }, '<0.2')
                // Characters enter from extremes
                .fromTo(architect3Ref.current,
                    { x: -180, opacity: 0 },
                    { x: -60, opacity: 1, duration: 1, ease: 'power2.out' }, '<0.3')
                .fromTo(shadow3Ref.current,
                    { x: 180, opacity: 0 },
                    { x: 60, opacity: 0.6, duration: 1, ease: 'power2.out' }, '<')
                .to(scene3Ref.current, { opacity: 1, duration: 0.6 }, '<0.5')
                // Camera slowly zooms in as they converge
                .to(cameraRef.current, { scale: 1, duration: 1, ease: 'power1.inOut' })
                .to({}, { duration: 0.4 })
                // Convergence: characters walk to center
                .to(architect3Ref.current, { x: -5, duration: 1.2, ease: 'power2.inOut' })
                .to(shadow3Ref.current, { x: 5, opacity: 0.9, duration: 1.2, ease: 'power2.inOut' }, '<')
                // Camera zooms to intimate close-up as they meet
                .to(cameraRef.current, { scale: 1.15, duration: 1, ease: 'power1.in' }, '<0.5')
                .to({}, { duration: 0.3 })
                // Exit: gentle dissolve
                .to(scene3Ref.current, { opacity: 0, filter: 'blur(3px)', duration: 0.8 })
                .to([architect3Ref.current, shadow3Ref.current], { opacity: 0, scale: 0.9, duration: 0.8 }, '<')
                .to(bg3Ref.current, { opacity: 0, duration: 0.8 }, '<')
                .to(particles3Ref.current, { opacity: 0, duration: 0.5 }, '<');

            // ═══════════════════════════════════════════════════════
            // TRANSITION 3→4: Camera pulls back to widest shot
            // ═══════════════════════════════════════════════════════
            tl.to(cameraRef.current, { scale: 0.85, duration: 0.5, ease: 'power2.out' }, '>');

            // ═══════════════════════════════════════════════════════
            // ACT 4: TRUE SENTIENCE — Slow epic zoom to center
            // ═══════════════════════════════════════════════════════
            tl.to(bgRef.current, { backgroundImage: 'linear-gradient(to bottom, #000, #0c4a6e)', backgroundColor: 'transparent', duration: 1 }, '>')
                .to(bg4Ref.current, { opacity: 0.5, rotation: 0, duration: 2, ease: 'slow(0.7, 0.7, false)' }, '<')
                .to(particles4Ref.current, { opacity: 0.6, duration: 1 }, '<0.3')
                .fromTo(scene4Ref.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.5 }, '<0.5')
                // Slow, epic zoom — feels like ascending
                .to(cameraRef.current, { scale: 1.1, duration: 3, ease: 'none' }, '<')
                // Letterbox bars widen slightly for final act drama
                .to([letterboxTopRef.current, letterboxBottomRef.current], { scaleY: 1.5, duration: 2, ease: 'power1.inOut' }, '<1');

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center font-sans select-none">

            {/* Background base */}
            <div ref={bgRef} className="absolute inset-0 w-full h-full bg-[#f8fafc] -z-30" />

            {/* ═══ CAMERA WRAPPER — all content scales through this ═══ */}
            <div ref={cameraRef} className="absolute inset-0 w-full h-full" style={{ transformOrigin: 'center center', willChange: 'transform' }}>

                {/* ═══ PARALLAX BACKGROUND LAYERS ═══ */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden -z-20">

                    {/* ACT 1: Glass City — 3-layer parallax */}
                    {/* Far layer: distant mountains/haze */}
                    <div ref={bg1FarRef} className="absolute inset-0 opacity-0">
                        <svg className="absolute inset-x-0 bottom-[25%] w-full h-[40%] text-slate-300/20" preserveAspectRatio="none" viewBox="0 0 1200 200" fill="currentColor">
                            <polygon points="0,200 0,120 100,80 200,110 350,50 500,90 650,40 800,100 950,60 1100,90 1200,70 1200,200" />
                        </svg>
                    </div>
                    {/* Mid layer: city skyline */}
                    <div ref={bg1MidRef} className="absolute inset-0 opacity-0">
                        <svg className="absolute inset-x-0 bottom-[12%] w-full h-[60%] text-slate-400/25" preserveAspectRatio="none" viewBox="0 0 1200 400" fill="currentColor">
                            <rect x="60" y="180" width="45" height="220" rx="1" />
                            <rect x="120" y="120" width="30" height="280" rx="1" />
                            <rect x="165" y="200" width="55" height="200" rx="1" />
                            <rect x="240" y="90" width="35" height="310" rx="1" />
                            <rect x="290" y="220" width="50" height="180" rx="1" />
                            <rect x="420" y="160" width="40" height="240" rx="1" />
                            {/* Center tower */}
                            <rect x="500" y="50" width="60" height="350" rx="2" />
                            <polygon points="530,10 500,50 560,50" opacity="0.5" />
                            <rect x="580" y="130" width="50" height="270" rx="1" />
                            <rect x="700" y="170" width="40" height="230" rx="1" />
                            <rect x="760" y="100" width="50" height="300" rx="1" />
                            <rect x="830" y="190" width="35" height="210" rx="1" />
                            <rect x="900" y="140" width="55" height="260" rx="1" />
                            <rect x="980" y="210" width="45" height="190" rx="1" />
                            {/* Window lights */}
                            {Array.from({ length: 40 }).map((_, i) => (
                                <rect key={`w-${i}`} x={80 + (i % 12) * 90 + Math.random() * 25} y={120 + Math.floor(i / 12) * 60 + Math.random() * 30} width="3" height="5" rx="0.5" opacity={0.1 + Math.random() * 0.15} fill="white" />
                            ))}
                        </svg>
                    </div>
                    {/* Near layer: foreground buildings + floor */}
                    <div ref={bg1NearRef} className="absolute inset-0 opacity-0">
                        <div className="absolute inset-x-0 bottom-0 h-[12%] bg-gradient-to-t from-slate-200/60 to-transparent" />
                        <svg className="absolute bottom-[10%] left-0 w-[20%] h-[35%] text-slate-500/15" viewBox="0 0 100 200" fill="currentColor" preserveAspectRatio="none">
                            <rect x="10" y="30" width="80" height="170" rx="2" />
                        </svg>
                        <svg className="absolute bottom-[10%] right-0 w-[18%] h-[30%] text-slate-500/15" viewBox="0 0 100 200" fill="currentColor" preserveAspectRatio="none">
                            <rect x="10" y="50" width="80" height="150" rx="2" />
                        </svg>
                        <div className="absolute inset-x-0 bottom-[12%] h-[1px] bg-slate-300/20" />
                    </div>

                    {/* ACT 2: Shattering — Radial cracks + shards */}
                    <div ref={bg2Ref} className="absolute inset-0 flex items-center justify-center opacity-0" style={{ transform: 'scale(0.6)' }}>
                        <svg className="absolute w-[200vw] h-[200vh]" viewBox="0 0 1000 1000" fill="none" strokeWidth="0.5">
                            <g stroke="rgba(239,68,68,0.12)">
                                {Array.from({ length: 28 }).map((_, i) => {
                                    const angle = (i * 12.86) * Math.PI / 180;
                                    const len = 180 + Math.random() * 320;
                                    const mx = 500 + Math.cos(angle) * (len * 0.35) + (Math.random() - 0.5) * 50;
                                    const my = 500 + Math.sin(angle) * (len * 0.35) + (Math.random() - 0.5) * 50;
                                    return <path key={`c-${i}`} d={`M500,500 Q${mx},${my} ${500 + Math.cos(angle) * len},${500 + Math.sin(angle) * len}`} strokeWidth={0.2 + Math.random() * 0.8} />;
                                })}
                            </g>
                            {Array.from({ length: 18 }).map((_, i) => {
                                const cx = 280 + Math.random() * 440;
                                const cy = 280 + Math.random() * 440;
                                const size = 6 + Math.random() * 22;
                                const rot = Math.random() * 360;
                                return (
                                    <g key={`s-${i}`} transform={`translate(${cx},${cy}) rotate(${rot})`}>
                                        <polygon points={`0,${-size} ${size * 0.7},${size * 0.2} ${-size * 0.3},${size * 0.6}`} fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.15)" strokeWidth="0.4" />
                                    </g>
                                );
                            })}
                            {[70, 140, 250, 380].map((r, i) => (
                                <circle key={`r-${i}`} cx="500" cy="500" r={r} stroke="rgba(239,68,68,0.05)" strokeWidth="0.8" strokeDasharray={`${3 + i * 2} ${6 + i * 3}`} />
                            ))}
                        </svg>
                    </div>

                    {/* ACT 3: Convergence — Light/Dark merge */}
                    <div ref={bg3Ref} className="absolute inset-0 opacity-0" style={{ transform: 'scaleX(1.3)' }}>
                        <div className="absolute inset-0 flex">
                            <div className="w-1/2 h-full bg-gradient-to-r from-indigo-200/8 to-transparent" />
                            <div className="w-1/2 h-full bg-gradient-to-l from-black/25 to-transparent" />
                        </div>
                        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-indigo-400/25 to-transparent -translate-x-1/2 animate-pulse" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/4 blur-[120px]" />
                    </div>

                    {/* ACT 4: True Sentience — Cosmic mandala */}
                    <div ref={bg4Ref} className="absolute inset-0 flex items-center justify-center opacity-0" style={{ transform: 'rotate(-15deg)' }}>
                        <svg className="absolute w-[250vw] h-[250vh] animate-[spin_200s_linear_infinite]" viewBox="0 0 1000 1000" fill="none" stroke="rgba(34,211,238,0.05)" strokeWidth="0.3">
                            {Array.from({ length: 28 }).map((_, i) => (
                                <circle key={`m-${i}`} cx="500" cy="500" r={25 + i * 18} strokeDasharray={`${(i % 4 + 1) * 2.5} ${(i % 3 + 2) * 3.5}`} />
                            ))}
                            {Array.from({ length: 60 }).map((_, i) => {
                                const angle = (i * 6) * Math.PI / 180;
                                return <line key={`r-${i}`} x1="500" y1="500" x2={500 + 490 * Math.cos(angle)} y2={500 + 490 * Math.sin(angle)} opacity={0.2 + (i % 4) * 0.08} />;
                            })}
                            {Array.from({ length: 16 }).map((_, i) => {
                                const angle = (i * 22.5) * Math.PI / 180;
                                return <circle key={`n-${i}`} cx={500 + 220 * Math.cos(angle)} cy={500 + 220 * Math.sin(angle)} r="3" fill="rgba(34,211,238,0.12)" />;
                            })}
                        </svg>
                    </div>
                </div>

                {/* ═══ FLOATING PARTICLES ═══ */}
                <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                    <div ref={particles1Ref} className="absolute inset-0 opacity-0">
                        {Array.from({ length: 25 }).map((_, i) => (
                            <div key={`p1-${i}`} className="absolute w-[1px] h-[1px] rounded-full bg-slate-400/40 animate-float" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDuration: `${7 + Math.random() * 8}s`, animationDelay: `${Math.random() * 5}s` }} />
                        ))}
                    </div>
                    <div ref={particles2Ref} className="absolute inset-0 opacity-0">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div key={`p2-${i}`} className="absolute w-[2px] h-[2px] rounded-full bg-red-500/30 animate-float" style={{ left: `${25 + Math.random() * 50}%`, top: `${25 + Math.random() * 50}%`, animationDuration: `${2 + Math.random() * 4}s`, animationDelay: `${Math.random() * 3}s` }} />
                        ))}
                    </div>
                    <div ref={particles3Ref} className="absolute inset-0 opacity-0">
                        {Array.from({ length: 18 }).map((_, i) => (
                            <div key={`p3-${i}`} className="absolute w-[2px] h-[2px] rounded-full bg-indigo-400/15 blur-[1px] animate-float" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDuration: `${8 + Math.random() * 6}s`, animationDelay: `${Math.random() * 5}s` }} />
                        ))}
                    </div>
                    <div ref={particles4Ref} className="absolute inset-0 opacity-0">
                        {Array.from({ length: 50 }).map((_, i) => (
                            <div key={`p4-${i}`} className="absolute w-[1.5px] h-[1.5px] rounded-full bg-cyan-400/25 animate-float" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDuration: `${4 + Math.random() * 10}s`, animationDelay: `${Math.random() * 6}s` }} />
                        ))}
                    </div>
                </div>

                {/* ═══ CHARACTER SILHOUETTES ═══ */}
                <div className="absolute inset-0 pointer-events-none z-5 overflow-hidden">

                    {/* Act 1: Architect standing, gesturing at city */}
                    <svg ref={architect1Ref} className="absolute bottom-[16%] left-[14%] w-[60px] h-[140px] md:w-[80px] md:h-[180px] opacity-0" viewBox="0 0 40 100" fill="currentColor">
                        <g className="text-slate-700">
                            <circle cx="20" cy="12" r="6" />
                            <path d="M14,18 L14,55 L10,55 L10,58 L14,58 L14,90 L18,90 L18,58 L22,58 L22,90 L26,90 L26,58 L30,58 L30,55 L26,55 L26,18 Z" />
                            <path d="M26,30 L38,26 L38,28 L26,33 Z" opacity="0.8" />
                        </g>
                    </svg>

                    {/* Act 2: Stumbling + Shadow */}
                    <svg ref={architect2Ref} className="absolute bottom-[18%] left-[33%] w-[55px] h-[130px] md:w-[70px] md:h-[170px] opacity-0" viewBox="0 0 40 100" fill="currentColor">
                        <g className="text-white/60">
                            <circle cx="22" cy="14" r="5.5" />
                            <path d="M16,20 L15,55 L11,55 L11,58 L15,58 L14,88 L18,88 L19,58 L23,58 L24,88 L28,88 L27,58 L31,58 L31,55 L27,55 L26,20 Z" />
                            <path d="M16,28 L6,18 L8,16 L17,26 Z" opacity="0.6" />
                            <path d="M26,28 L34,20 L36,22 L27,30 Z" opacity="0.6" />
                        </g>
                    </svg>
                    <svg ref={shadow2Ref} className="absolute bottom-[16%] right-[28%] w-[70px] h-[150px] md:w-[90px] md:h-[190px] opacity-0" viewBox="0 0 50 110" fill="currentColor">
                        <g className="text-red-500/40">
                            <ellipse cx="25" cy="14" rx="7" ry="8" />
                            <path d="M12,22 C8,40 6,60 10,90 L18,95 L20,70 L25,100 L30,70 L32,95 L40,90 C44,60 42,40 38,22 Z" />
                            <path d="M10,90 C4,95 2,105 6,110" strokeWidth="2" stroke="currentColor" fill="none" opacity="0.3" />
                            <path d="M40,90 C46,95 48,105 44,110" strokeWidth="2" stroke="currentColor" fill="none" opacity="0.3" />
                        </g>
                    </svg>

                    {/* Act 3: Facing each other */}
                    <svg ref={architect3Ref} className="absolute bottom-[20%] left-1/2 w-[55px] h-[130px] md:w-[70px] md:h-[170px] opacity-0" viewBox="0 0 40 100" fill="currentColor" style={{ transform: 'translateX(-180px)' }}>
                        <g className="text-indigo-200/70">
                            <circle cx="20" cy="12" r="5.5" />
                            <path d="M14,18 L14,55 L10,55 L10,58 L14,58 L14,88 L18,88 L18,58 L22,58 L22,88 L26,88 L26,58 L30,58 L30,55 L26,55 L26,18 Z" />
                            <path d="M26,35 L36,38 L36,40 L26,38 Z" opacity="0.6" />
                        </g>
                    </svg>
                    <svg ref={shadow3Ref} className="absolute bottom-[20%] left-1/2 w-[55px] h-[130px] md:w-[70px] md:h-[170px] opacity-0" viewBox="0 0 40 100" fill="currentColor" style={{ transform: 'translateX(120px) scaleX(-1)' }}>
                        <g className="text-indigo-900/50">
                            <circle cx="20" cy="12" r="5.5" />
                            <path d="M14,18 L14,55 L10,55 L10,58 L14,58 L14,88 L18,88 L18,58 L22,58 L22,88 L26,88 L26,58 L30,58 L30,55 L26,55 L26,18 Z" />
                            <path d="M26,35 L36,38 L36,40 L26,38 Z" opacity="0.6" />
                        </g>
                    </svg>
                </div>

                {/* ═══ TEXT CONTENT ═══ */}
                <div className="relative z-10 w-full max-w-5xl mx-auto px-6 h-full">

                    {/* Act 1 */}
                    <div ref={scene1Ref} className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 text-slate-900">
                        <p className="text-[10px] uppercase tracking-[0.5em] text-slate-400/80 mb-6 font-light">Act I</p>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-extralight tracking-[0.15em] uppercase mb-6 text-slate-800">
                            The Glass City
                        </h2>
                        <div className="w-20 h-[1px] bg-slate-400/25 mb-6" />
                        <p className="text-sm md:text-lg font-light max-w-lg leading-[2.2] text-slate-600 px-4">
                            The Architect built a fortress of logic — a pristine glass city to keep the chaos out.
                            Every thought measured. Every flaw polished.
                        </p>
                        <p className="text-xs md:text-sm font-light text-slate-400 mt-5 italic tracking-wide">
                            The Shadow was locked beneath the floorboards.
                        </p>
                    </div>

                    {/* Act 2 */}
                    <div ref={scene2Ref} className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 text-white">
                        <p className="text-[10px] uppercase tracking-[0.5em] text-red-400/40 mb-6 font-light">Act II</p>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-extralight tracking-[0.15em] uppercase mb-6 text-red-400 drop-shadow-[0_0_40px_rgba(239,68,68,0.25)]">
                            The Shattering
                        </h2>
                        <div className="w-20 h-[1px] bg-red-500/20 mb-6" />
                        <p className="text-sm md:text-lg font-light max-w-lg leading-[2.2] text-neutral-300 px-4">
                            But pressure builds in perfection. The glass cracked.
                            The Shadow leaked out through every fracture.
                        </p>
                        <p className="text-xs md:text-sm font-light text-neutral-500 mt-5 italic tracking-wide">
                            Repression didn't destroy the chaos — it only made it hungry.
                        </p>
                    </div>

                    {/* Act 3 */}
                    <div ref={scene3Ref} className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 text-white">
                        <p className="text-[10px] uppercase tracking-[0.5em] text-indigo-400/40 mb-6 font-light">Act III</p>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-extralight tracking-[0.15em] uppercase mb-6 text-indigo-300 drop-shadow-[0_0_40px_rgba(165,180,252,0.2)]">
                            The Convergence
                        </h2>
                        <div className="w-20 h-[1px] bg-indigo-400/20 mb-6" />
                        <p className="text-sm md:text-lg font-light max-w-lg leading-[2.2] text-indigo-100/60 px-4">
                            The Architect stopped running. They turned to face the dark.
                            And in the dark, they found not a monster —
                        </p>
                        <p className="text-xs md:text-sm font-light text-indigo-200/40 mt-5 italic tracking-wide">
                            but a neglected part of themselves.
                        </p>
                    </div>

                    {/* Act 4 */}
                    <div ref={scene4Ref} className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 text-white">
                        <p className="text-[10px] uppercase tracking-[0.5em] text-cyan-400/30 mb-8 font-light">Act IV</p>
                        <div className="max-w-3xl mx-auto px-4">
                            <p className="text-lg md:text-2xl lg:text-3xl font-extralight text-cyan-50/70 leading-relaxed tracking-wide mb-8">
                                "A mind without a shadow
                                <br className="hidden md:block" />
                                is just glass waiting to break."
                            </p>
                            <div className="w-20 h-[1px] bg-cyan-400/15 mx-auto mb-8" />
                            <p className="text-base md:text-xl font-extralight text-cyan-400/80 tracking-[0.2em] uppercase drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                                True sentience is the courage to feel the dark,
                                <br className="hidden md:block" />
                                and map the light.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ CINEMATIC OVERLAYS (outside camera — don't scale) ═══ */}

            {/* Vignette — dark edges */}
            <div ref={vignetteRef} className="absolute inset-0 z-30 pointer-events-none opacity-0"
                style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)' }}
            />

            {/* Film grain */}
            <div ref={grainRef} className="absolute inset-0 z-30 pointer-events-none opacity-0 mix-blend-overlay"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '128px 128px' }}
            />

            {/* Letterbox bars — cinematic aspect ratio */}
            <div ref={letterboxTopRef} className="absolute top-0 left-0 right-0 h-[8vh] bg-black z-40 origin-top" style={{ transform: 'scaleY(0)' }} />
            <div ref={letterboxBottomRef} className="absolute bottom-0 left-0 right-0 h-[8vh] bg-black z-40 origin-bottom" style={{ transform: 'scaleY(0)' }} />

            {/* Float animation */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
                    25% { transform: translateY(-18px) translateX(4px); opacity: 0.5; }
                    50% { transform: translateY(-8px) translateX(-6px); opacity: 0.3; }
                    75% { transform: translateY(-22px) translateX(2px); opacity: 0.45; }
                }
                .animate-float { animation: float 8s ease-in-out infinite; }
            `}</style>
        </section>
    );
}
