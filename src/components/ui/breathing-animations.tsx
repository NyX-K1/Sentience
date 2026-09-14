import React from 'react';

interface CircleAnimationProps {
    phase: 'inhale' | 'hold' | 'exhale' | 'idle';
    size?: number;
}

/**
 * Expanding/contracting circle for breathing visualization
 */
export const BreathingCircle: React.FC<CircleAnimationProps> = ({
    phase,
    size = 200
}) => {
    const getScale = () => {
        switch (phase) {
            case 'inhale': return 1.0;
            case 'hold': return 1.0;
            case 'exhale': return 0.4;
            case 'idle': return 0.7;
        }
    };

    const getColor = () => {
        switch (phase) {
            case 'inhale': return '#60a5fa'; // blue-400
            case 'hold': return '#a78bfa';   // purple-400
            case 'exhale': return '#34d399'; // green-400
            case 'idle': return '#94a3b8';   // slate-400
        }
    };

    const getDuration = () => {
        switch (phase) {
            case 'inhale': return '2s';
            case 'hold': return '0.5s';
            case 'exhale': return '6s';
            case 'idle': return '1s';
        }
    };

    return (
        <div className="flex items-center justify-center">
            <svg width={size * 2} height={size * 2} className="overflow-visible">
                <defs>
                    <radialGradient id="breathGradient">
                        <stop offset="0%" stopColor={getColor()} stopOpacity="0.8" />
                        <stop offset="100%" stopColor={getColor()} stopOpacity="0.2" />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Outer glow ring */}
                <circle
                    cx={size}
                    cy={size}
                    r={size * 0.7}
                    fill="url(#breathGradient)"
                    filter="url(#glow)"
                    opacity="0.6"
                    style={{
                        transform: `scale(${getScale()})`,
                        transformOrigin: 'center',
                        transition: `transform ${getDuration()} ease-in-out`,
                    }}
                />

                {/* Main circle */}
                <circle
                    cx={size}
                    cy={size}
                    r={size * 0.5}
                    fill={getColor()}
                    opacity="0.9"
                    style={{
                        transform: `scale(${getScale()})`,
                        transformOrigin: 'center',
                        transition: `transform ${getDuration()} ease-in-out`,
                    }}
                />

                {/* Inner circle */}
                <circle
                    cx={size}
                    cy={size}
                    r={size * 0.3}
                    fill="white"
                    opacity="0.3"
                    style={{
                        transform: `scale(${getScale()})`,
                        transformOrigin: 'center',
                        transition: `transform ${getDuration()} ease-in-out`,
                    }}
                />
            </svg>
        </div>
    );
};

interface SquareAnimationProps {
    phase: 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'idle';
    size?: number;
}

/**
 * Square tracing animation for box breathing (4-4-4-4)
 */
export const BoxBreathingSquare: React.FC<SquareAnimationProps> = ({
    phase,
    size = 150
}) => {
    const getStrokeDashoffset = () => {
        const perimeter = size * 4;
        switch (phase) {
            case 'idle': return perimeter;
            case 'inhale': return perimeter * 0.75; // Top edge
            case 'hold1': return perimeter * 0.5;   // Right edge
            case 'exhale': return perimeter * 0.25; // Bottom edge
            case 'hold2': return 0;                  // Left edge
        }
    };

    const getActiveCorner = () => {
        switch (phase) {
            case 'inhale': return 0;
            case 'hold1': return 1;
            case 'exhale': return 2;
            case 'hold2': return 3;
            default: return -1;
        }
    };

    const corners = [
        { x: size, y: 0 },        // Top-right
        { x: size, y: size },     // Bottom-right
        { x: 0, y: size },        // Bottom-left
        { x: 0, y: 0 },           // Top-left
    ];

    return (
        <div className="flex items-center justify-center">
            <svg width={size + 40} height={size + 40}>
                <defs>
                    <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="50%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                </defs>

                <g transform="translate(20, 20)">
                    {/* Background square */}
                    <rect
                        x="0"
                        y="0"
                        width={size}
                        height={size}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="3"
                        rx="8"
                    />

                    {/* Animated tracing path */}
                    <rect
                        x="0"
                        y="0"
                        width={size}
                        height={size}
                        fill="none"
                        stroke="url(#boxGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        rx="8"
                        strokeDasharray={size * 4}
                        strokeDashoffset={getStrokeDashoffset()}
                        style={{
                            transition: phase === 'idle' ? 'none' : 'stroke-dashoffset 4s linear',
                        }}
                    />

                    {/* Corner indicators */}
                    {corners.map((corner, index) => (
                        <circle
                            key={index}
                            cx={corner.x}
                            cy={corner.y}
                            r="6"
                            fill={getActiveCorner() === index ? '#60a5fa' : 'rgba(255, 255, 255, 0.3)'}
                            style={{
                                transition: 'fill 0.3s ease',
                            }}
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
};

/**
 * Abstract calming background animation
 */
export const CalmingBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <svg className="w-full h-full">
                <defs>
                    <linearGradient id="bgGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8">
                            <animate
                                attributeName="stop-color"
                                values="#818cf8; #c084fc; #818cf8"
                                dur="10s"
                                repeatCount="indefinite"
                            />
                        </stop>
                        <stop offset="100%" stopColor="#c084fc">
                            <animate
                                attributeName="stop-color"
                                values="#c084fc; #818cf8; #c084fc"
                                dur="10s"
                                repeatCount="indefinite"
                            />
                        </stop>
                    </linearGradient>
                </defs>

                {/* Floating circles */}
                <circle cx="10%" cy="20%" r="100" fill="url(#bgGradient1)" opacity="0.3">
                    <animate
                        attributeName="cy"
                        values="20%; 80%; 20%"
                        dur="20s"
                        repeatCount="indefinite"
                    />
                </circle>

                <circle cx="80%" cy="60%" r="150" fill="url(#bgGradient1)" opacity="0.2">
                    <animate
                        attributeName="cy"
                        values="60%; 20%; 60%"
                        dur="25s"
                        repeatCount="indefinite"
                    />
                </circle>

                <circle cx="50%" cy="50%" r="80" fill="url(#bgGradient1)" opacity="0.25">
                    <animate
                        attributeName="r"
                        values="80; 120; 80"
                        dur="15s"
                        repeatCount="indefinite"
                    />
                </circle>
            </svg>
        </div>
    );
};
