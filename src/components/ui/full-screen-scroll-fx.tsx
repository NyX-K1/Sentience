
import React, {
    CSSProperties,
    ReactNode,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

type Section = {
    id?: string;
    background: string;
    leftLabel?: ReactNode;
    title: string | ReactNode;
    rightLabel?: ReactNode;
    renderBackground?: (active: boolean, previous: boolean) => ReactNode;
};

type Colors = Partial<{
    text: string;
    overlay: string;
    pageBg: string;
    stageBg: string;
}>;

type Durations = Partial<{
    change: number; // section change animation
    snap: number;   // programmatic scroll duration (ms)
}>;

export type FullScreenFXAPI = {
    next: () => void;
    prev: () => void;
    goTo: (index: number) => void;
    getIndex: () => number;
    refresh: () => void;
};

export type FullScreenFXProps = {
    sections: Section[];
    className?: string;
    style?: CSSProperties;

    // Layout
    fontFamily?: string;
    header?: ReactNode;
    footer?: ReactNode;
    gap?: number;           // rem
    gridPaddingX?: number;  // rem

    showProgress?: boolean;
    debug?: boolean;

    // Motion
    durations?: Durations;
    reduceMotion?: boolean;
    smoothScroll?: boolean; // if you use Lenis, set to true and install lenis

    // Background transition
    bgTransition?: "fade" | "wipe"; // default "fade"
    parallaxAmount?: number;        // % for outgoing bg (fade mode uses a tiny y drift)

    // Controlled index
    currentIndex?: number;
    onIndexChange?: (index: number) => void;
    initialIndex?: number;

    // Colors
    colors?: Colors;

    // Imperative API
    apiRef?: React.Ref<FullScreenFXAPI>;
    ariaLabel?: string;
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const FullScreenScrollFX = forwardRef<HTMLDivElement, FullScreenFXProps>(
    (
        {
            sections,
            className,
            style,

            fontFamily = '"Inter", system-ui, -apple-system, sans-serif',
            header,
            footer,
            gap = 1,
            gridPaddingX = 2,

            showProgress = true,
            debug = false,

            durations = { change: 0.7, snap: 800 },
            reduceMotion,
            smoothScroll = false, // enable if you install Lenis

            bgTransition = "fade",
            parallaxAmount = 4,

            currentIndex,
            onIndexChange,
            initialIndex = 0,

            colors = {
                text: "rgba(245,245,245,0.92)",
                overlay: "rgba(0,0,0,0.35)",
                pageBg: "#000000",
                stageBg: "#050505",
            },

            apiRef,
            ariaLabel = "Full screen scroll slideshow",
        },
        ref
    ) => {
        const total = sections.length;
        const [localIndex, setLocalIndex] = useState(clamp(initialIndex, 0, Math.max(0, total - 1)));
        const isControlled = typeof currentIndex === "number";
        const index = isControlled ? clamp(currentIndex!, 0, Math.max(0, total - 1)) : localIndex;

        const rootRef = useRef<HTMLDivElement | null>(null);
        const fixedRef = useRef<HTMLDivElement | null>(null);
        const fixedSectionRef = useRef<HTMLDivElement | null>(null);

        const bgRefs = useRef<HTMLImageElement[]>([]);
        const wordRefs = useRef<HTMLSpanElement[][]>([]);

        const leftTrackRef = useRef<HTMLDivElement | null>(null);
        const rightTrackRef = useRef<HTMLDivElement | null>(null);
        const leftItemRefs = useRef<HTMLDivElement[]>([]);
        const rightItemRefs = useRef<HTMLDivElement[]>([]);

        const progressFillRef = useRef<HTMLDivElement | null>(null);
        const currentNumberRef = useRef<HTMLSpanElement | null>(null);

        const stRef = useRef<ScrollTrigger | null>(null);
        const lastIndexRef = useRef(index);
        const isAnimatingRef = useRef(false);
        const isSnappingRef = useRef(false);
        const sectionTopRef = useRef<number[]>([]);

        // prefers-reduced-motion
        const prefersReduced = useMemo(() => {
            if (typeof window === "undefined") return false;
            return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        }, []);
        const motionOff = reduceMotion ?? prefersReduced;

        // Split words for center title
        const tempWordBucket = useRef<HTMLSpanElement[]>([]);
        const splitWords = (text: string) => {
            const words = text.split(/\s+/).filter(Boolean);
            return words.map((w, i) => (
                <span className="fx-word-mask" key={i}>
                    <span className="fx-word" ref={(el) => el && tempWordBucket.current.push(el)}>{w}</span>
                    {i < words.length - 1 ? " " : null}
                </span>
            ));
        };
        const WordsCollector = ({ onReady }: { onReady: () => void }) => {
            useEffect(() => onReady(), []); // eslint-disable-line
            return null;
        };

        // Compute scroll snap positions
        const computePositions = () => {
            const el = fixedSectionRef.current;
            if (!el) return;
            const top = el.offsetTop;
            const h = el.offsetHeight;
            const arr: number[] = [];
            for (let i = 0; i < total; i++) arr.push(top + (h * i) / total);
            sectionTopRef.current = arr;
        };

        // Align lists: center active row
        const measureAndCenterLists = (toIndex = index, animate = true) => {
            const centerTrack = (
                container: HTMLDivElement | null,
                items: HTMLDivElement[],
                isRight: boolean
            ) => {
                if (!container || items.length === 0) return;
                const first = items[0];
                const second = items[1];
                const contRect = container.getBoundingClientRect();
                let rowH = first.getBoundingClientRect().height;
                if (second) {
                    // more accurate: distance between rows includes gap
                    rowH = second.getBoundingClientRect().top - first.getBoundingClientRect().top;
                }
                // center math
                const targetY = contRect.height / 2 - rowH / 2 - toIndex * rowH;
                const prop = isRight ? rightTrackRef : leftTrackRef;
                if (!prop.current) return;
                if (animate) {
                    gsap.to(prop.current, {
                        y: targetY,
                        duration: (durations.change ?? 0.7) * 0.9,
                        ease: "power3.out",
                    });
                } else {
                    gsap.set(prop.current, { y: targetY });
                }
            };

            measureRAF(() => {
                measureRAF(() => {
                    centerTrack(leftTrackRef.current, leftItemRefs.current, false);
                    centerTrack(rightTrackRef.current, rightItemRefs.current, true);
                });
            });
        };

        const measureRAF = (fn: () => void) => {
            if (typeof window === "undefined") return;
            requestAnimationFrame(() => requestAnimationFrame(fn));
        };

        // ScrollTrigger for pinning + index step detection
        useLayoutEffect(() => {
            if (typeof window === "undefined") return;
            const fixed = fixedRef.current;
            const fs = fixedSectionRef.current;
            if (!fixed || !fs || total === 0) return;

            // initial bg states
            gsap.set(bgRefs.current, { opacity: 0, scale: 1.04, yPercent: 0 });
            if (bgRefs.current[0]) gsap.set(bgRefs.current[0], { opacity: 1, scale: 1 });

            // initial center words
            wordRefs.current.forEach((words, sIdx) => {
                words.forEach((w) => {
                    gsap.set(w, {
                        yPercent: sIdx === index ? 0 : 100,
                        opacity: sIdx === index ? 1 : 0,
                    });
                });
            });

            computePositions();
            measureAndCenterLists(index, false);

            const st = ScrollTrigger.create({
                trigger: fs,
                start: "top top",
                end: "bottom bottom",
                pin: fixed,
                pinSpacing: true,
                onUpdate: (self) => {
                    if (motionOff || isSnappingRef.current) return;
                    const prog = self.progress;
                    const target = Math.min(total - 1, Math.floor(prog * total));
                    if (target !== lastIndexRef.current && !isAnimatingRef.current) {
                        const next = lastIndexRef.current + (target > lastIndexRef.current ? 1 : -1);
                        // programmatic one-step snap without extra sound
                        goTo(next, false);
                    }
                    if (progressFillRef.current) {
                        const p = (lastIndexRef.current / (total - 1 || 1)) * 100;
                        progressFillRef.current.style.width = `${p}%`;
                    }
                },
            });

            stRef.current = st;

            // initial jump if needed
            if (initialIndex && initialIndex > 0 && initialIndex < total) {
                requestAnimationFrame(() => goTo(initialIndex, false));
            }

            // handle resize
            const ro = new ResizeObserver(() => {
                computePositions();
                measureAndCenterLists(lastIndexRef.current, false);
                ScrollTrigger.refresh();
            });
            ro.observe(fs);

            return () => {
                ro.disconnect();
                st.kill();
                stRef.current = null;
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [total, initialIndex, motionOff, bgTransition, parallaxAmount]);

        // Section change visuals
        const changeSection = (to: number) => {
            if (to === lastIndexRef.current || isAnimatingRef.current) return;
            const from = lastIndexRef.current;
            const down = to > from;
            isAnimatingRef.current = true;

            if (!isControlled) setLocalIndex(to);
            onIndexChange?.(to);

            // progress numbers
            if (currentNumberRef.current) {
                currentNumberRef.current.textContent = String(to + 1).padStart(2, "0");
            }
            if (progressFillRef.current) {
                const p = (to / (total - 1 || 1)) * 100;
                progressFillRef.current.style.width = `${p}%`;
            }

            const D = durations.change ?? 0.7;

            // center title word animation (mask slide)
            const outWords = wordRefs.current[from] || [];
            const inWords = wordRefs.current[to] || [];
            if (outWords.length) {
                gsap.to(outWords, {
                    yPercent: down ? -100 : 100,
                    opacity: 0,
                    duration: D * 0.6,
                    stagger: down ? 0.03 : -0.03,
                    ease: "power3.out",
                });
            }
            if (inWords.length) {
                gsap.set(inWords, { yPercent: down ? 100 : -100, opacity: 0 });
                gsap.to(inWords, {
                    yPercent: 0,
                    opacity: 1,
                    duration: D,
                    stagger: down ? 0.05 : -0.05,
                    ease: "power3.out",
                });
            }

            // backgrounds — FADE mode (requested)
            const prevBg = bgRefs.current[from];
            const newBg = bgRefs.current[to];
            if (bgTransition === "fade") {
                if (newBg) {
                    gsap.set(newBg, { opacity: 0, scale: 1.04, yPercent: down ? 1 : -1 });
                    gsap.to(newBg, { opacity: 1, scale: 1, yPercent: 0, duration: D, ease: "power2.out" });
                }
                if (prevBg) {
                    gsap.to(prevBg, {
                        opacity: 0,
                        yPercent: down ? -parallaxAmount : parallaxAmount,
                        duration: D,
                        ease: "power2.out",
                    });
                }
            } else {
                // optional wipe mode
                if (newBg) {
                    gsap.set(newBg, {
                        opacity: 1,
                        clipPath: down ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)",
                        scale: 1,
                        yPercent: 0,
                    });
                    gsap.to(newBg, { clipPath: "inset(0 0 0 0)", duration: D, ease: "power3.out" });
                }
                if (prevBg) {
                    gsap.to(prevBg, { opacity: 0, duration: D * 0.8, ease: "power2.out" });
                }
            }

            // lists — center active row and animate active state
            measureAndCenterLists(to, true);

            leftItemRefs.current.forEach((el, i) => {
                el.classList.toggle("active", i === to);
                gsap.to(el, {
                    opacity: i === to ? 1 : 0.35,
                    x: i === to ? 10 : 0,
                    duration: D * 0.6,
                    ease: "power3.out",
                });
            });
            rightItemRefs.current.forEach((el, i) => {
                el.classList.toggle("active", i === to);
                gsap.to(el, {
                    opacity: i === to ? 1 : 0.35,
                    x: i === to ? -10 : 0,
                    duration: D * 0.6,
                    ease: "power3.out",
                });
            });

            gsap.delayedCall(D, () => {
                lastIndexRef.current = to;
                isAnimatingRef.current = false;
            });
        };

        // programmatic navigation
        const goTo = (to: number, withScroll = true) => {
            const clamped = clamp(to, 0, total - 1);
            isSnappingRef.current = true;
            changeSection(clamped);

            const pos = sectionTopRef.current[clamped];
            const snapMs = durations.snap ?? 800;

            if (withScroll && typeof window !== "undefined") {
                // If you installed Lenis, you can integrate here
                window.scrollTo({ top: pos, behavior: "smooth" });
                setTimeout(() => (isSnappingRef.current = false), snapMs);
            } else {
                setTimeout(() => (isSnappingRef.current = false), 10);
            }
        };

        const next = () => goTo(index + 1);
        const prev = () => goTo(index - 1);

        useImperativeHandle(apiRef, () => ({
            next,
            prev,
            goTo,
            getIndex: () => index,
            refresh: () => ScrollTrigger.refresh(),
        }));

        // click/hover on list items
        const handleJump = (i: number) => goTo(i);
        const handleLoadedStagger = () => {
            // soft entrance for lists at mount
            leftItemRefs.current.forEach((el, i) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 20 },
                    { opacity: i === index ? 1 : 0.35, y: 0, duration: 0.5, delay: i * 0.06, ease: "power3.out" }
                );
            });
            rightItemRefs.current.forEach((el, i) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 20 },
                    { opacity: i === index ? 1 : 0.35, y: 0, duration: 0.5, delay: 0.2 + i * 0.06, ease: "power3.out" }
                );
            });
        };

        // mount entrance
        useEffect(() => {
            handleLoadedStagger();
            measureAndCenterLists(index, false);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        // CSS vars
        const cssVars: CSSProperties = {
            ["--fx-font" as any]: fontFamily,
            ["--fx-text" as any]: colors.text ?? "rgba(245,245,245,0.92)",
            ["--fx-overlay" as any]: colors.overlay ?? "rgba(0,0,0,0.35)",
            ["--fx-page-bg" as any]: colors.pageBg ?? "#fff",
            ["--fx-stage-bg" as any]: colors.stageBg ?? "#000",
            ["--fx-gap" as any]: `${gap}rem`,
            ["--fx-grid-px" as any]: `${gridPaddingX}rem`,
            ["--fx-row-gap" as any]: "10px",
        };

        return (
            <div
                ref={(node) => {
                    (rootRef as any).current = node;
                    if (typeof ref === "function") ref(node);
                    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
                }}
                className={["fx", className].filter(Boolean).join(" ")}
                style={{ ...cssVars, ...style }}
                aria-label={ariaLabel}
            >
                {debug && <div className="fx-debug">Section: {index}</div>}

                <div className="fx-scroll">
                    <div className="fx-fixed-section" ref={fixedSectionRef}>
                        <div className="fx-fixed" ref={fixedRef}>
                            {/* Backgrounds */}
                            <div className="fx-bgs" aria-hidden="true">
                                {sections.map((s, i) => (
                                    <div className="fx-bg" key={s.id ?? i}>
                                        {s.renderBackground ? (
                                            s.renderBackground(index === i, lastIndexRef.current === i)
                                        ) : (
                                            <>
                                                <img
                                                    ref={(el) => el && (bgRefs.current[i] = el)}
                                                    src={s.background}
                                                    alt=""
                                                    className="fx-bg-img"
                                                />
                                                <div className="fx-bg-overlay" />
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Grid */}
                            <div className="fx-grid">
                                {/* Header */}
                                {header && <div className="fx-header">{header}</div>}

                                {/* Content (lists + center) */}
                                <div className="fx-content">
                                    {/* Left list */}
                                    <div className="fx-left" role="list">
                                        <div className="fx-track" ref={leftTrackRef}>
                                            {sections.map((s, i) => (
                                                <div
                                                    key={`L-${s.id ?? i}`}
                                                    className={`fx-item fx-left-item ${i === index ? "active" : ""}`}
                                                    ref={(el) => el && (leftItemRefs.current[i] = el)}
                                                    onClick={() => handleJump(i)}
                                                    role="button"
                                                    tabIndex={0}
                                                    aria-pressed={i === index}
                                                >
                                                    {s.leftLabel}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Center title (masked words if string) */}
                                    <div className="fx-center">
                                        {sections.map((s, sIdx) => {
                                            tempWordBucket.current = [];
                                            const isString = typeof s.title === "string";
                                            return (
                                                <div key={`C-${s.id ?? sIdx}`} className={`fx-featured ${sIdx === index ? "active" : ""}`}>
                                                    <h3 className="fx-featured-title">
                                                        {isString ? splitWords(s.title as string) : s.title}
                                                    </h3>
                                                    <WordsCollector
                                                        onReady={() => {
                                                            if (tempWordBucket.current.length) {
                                                                wordRefs.current[sIdx] = [...tempWordBucket.current];
                                                            }
                                                            tempWordBucket.current = [];
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Right list */}
                                    <div className="fx-right" role="list">
                                        <div className="fx-track" ref={rightTrackRef}>
                                            {sections.map((s, i) => (
                                                <div
                                                    key={`R-${s.id ?? i}`}
                                                    className={`fx-item fx-right-item ${i === index ? "active" : ""}`}
                                                    ref={(el) => el && (rightItemRefs.current[i] = el)}
                                                    onClick={() => handleJump(i)}
                                                    role="button"
                                                    tabIndex={0}
                                                    aria-pressed={i === index}
                                                >
                                                    {s.rightLabel}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer + progress */}
                                <div className="fx-footer">
                                    {footer && <div className="fx-footer-title">{footer}</div>}
                                    {showProgress && (
                                        <div className="fx-progress">
                                            <div className="fx-progress-numbers">
                                                <span ref={currentNumberRef}>{String(index + 1).padStart(2, "0")}</span>
                                                <span>{String(total).padStart(2, "0")}</span>
                                            </div>
                                            <div className="fx-progress-bar">
                                                <div className="fx-progress-fill" ref={progressFillRef} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* End spacer */}
                    <div className="fx-end h-screen bg-black text-white flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-2xl font-bold mb-4">You've reached the end.</p>
                            <p className="text-neutral-500">Scroll up to review your report.</p>
                        </div>
                    </div>
                </div>

                <style>{`
          .fx {
            width: 100%;
            overflow: hidden;
            background: var(--fx-page-bg);
            color: #000;
            font-family: var(--fx-font);
            text-transform: uppercase;
            letter-spacing: -0.02em;
          }

          .fx-debug {
            position: fixed; bottom: 10px; right: 10px; z-index: 9999;
            background: rgba(255,255,255,0.8); color: #000; padding: 6px 8px; font: 12px/1 monospace; border-radius: 4px;
          }

          .fx-fixed-section { height: ${Math.max(1, total + 1)}00vh; position: relative; }
          .fx-fixed { position: sticky; top: 0; height: 100vh; width: 100%; overflow: hidden; background: var(--fx-page-bg); }

          .fx-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: var(--fx-gap);
            padding: 0 var(--fx-grid-px);
            position: relative;
            height: 100%;
            z-index: 2;
          }

          .fx-bgs { position: absolute; inset: 0; background: var(--fx-stage-bg); z-index: 1; }
          .fx-bg { position: absolute; inset: 0; }
          .fx-bg-img {
            position: absolute; inset: -10% 0 -10% 0;
            width: 100%; height: 120%; object-fit: cover;
            filter: brightness(0.8);
            opacity: 0;
            will-change: transform, opacity;
          }
          .fx-bg-overlay { position: absolute; inset: 0; background: var(--fx-overlay); }

          .fx-header {
            grid-column: 1 / 13; align-self: start; padding-top: 6vh;
            font-size: clamp(2rem, 9vw, 9rem); line-height: 0.86; text-align: center; color: var(--fx-text);
          }
          .fx-header > * { display: block; }

          .fx-content {
            grid-column: 1 / 13;
            position: absolute; inset: 0;
            display: grid; grid-template-columns: 1fr 1.3fr 1fr; /* L 30% / C 40% / R 30% vibe */
            align-items: center;
            height: 100%;
            padding: 0 var(--fx-grid-px);
          }

          .fx-left, .fx-right {
            height: 60vh; /* gives us room to center the active row */
            overflow: hidden;
            display: grid; align-content: center;
          }
          .fx-left { justify-items: start; }
          .fx-right { justify-items: end; }
          .fx-track { will-change: transform; }

          .fx-item {
            color: var(--fx-text);
            font-weight: 800;
            letter-spacing: 0em;
            line-height: 1;
            margin: calc(var(--fx-row-gap) / 2) 0;
            opacity: 0.35;
            transition: opacity 0.3s ease, transform 0.3s ease;
            position: relative;
            font-size: clamp(1rem, 2.4vw, 1.8rem);
            user-select: none;
            cursor: pointer;
          }
          .fx-left-item.active, .fx-right-item.active { opacity: 1; }
          .fx-left-item.active { transform: translateX(10px); padding-left: 16px; }
          .fx-right-item.active { transform: translateX(-10px); padding-right: 16px; }

          .fx-left-item.active::before,
          .fx-right-item.active::after {
            content: "";
            position: absolute; top: 50%; transform: translateY(-50%);
            width: 6px; height: 6px; background: var(--fx-text); border-radius: 50%;
          }
          .fx-left-item.active::before { left: 0; }
          .fx-right-item.active::after { right: 0; }

          .fx-center {
            display: grid; place-items: center; text-align: center; height: 60vh; overflow: hidden;
          }
          .fx-featured { position: absolute; opacity: 0; visibility: hidden; }
          .fx-featured.active { opacity: 1; visibility: visible; }
          .fx-featured-title {
            margin: 0; color: var(--fx-text);
            font-weight: 900; letter-spacing: -0.01em;
            font-size: clamp(2rem, 7.5vw, 6rem);
          }
          .fx-word-mask { display: inline-block; overflow: hidden; vertical-align: middle; }
          .fx-word { display: inline-block; vertical-align: middle; }

          .fx-footer {
            grid-column: 1 / 13; align-self: end; padding-bottom: 5vh; text-align: center;
          }
          .fx-footer-title { color: var(--fx-text); font-size: clamp(1.6rem, 7vw, 7rem); font-weight: 900; letter-spacing: -0.01em; line-height: 0.9; }
          .fx-progress { width: 200px; height: 2px; margin: 1rem auto 0; background: rgba(245,245,245,0.28); position: relative; }
          .fx-progress-fill { position: absolute; inset: 0 auto 0 0; width: 0%; background: var(--fx-text); height: 100%; transition: width 0.3s ease; }
          .fx-progress-numbers { position: absolute; inset: auto 0 100% 0; display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--fx-text); }

          .fx-end { height: 100vh; display: grid; place-items: center; }
          .fx-fin { transform: rotate(90deg); color: #111; }

          @media (max-width: 900px) {
            .fx-content {
              grid-template-columns: 1fr; row-gap: 3vh;
              place-items: center;
            }
            .fx-left, .fx-right, .fx-center { height: auto; }
            .fx-left, .fx-right { justify-items: center; }
            .fx-track { transform: none !important; }
          }
        `}</style>
            </div>
        );
    }
);

FullScreenScrollFX.displayName = "FullScreenScrollFX";
