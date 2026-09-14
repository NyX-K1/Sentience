import { LucideProps } from 'lucide-react';
import {
    Circle, RefreshCw, Search, XCircle, Brain, Sparkles,
    Maximize, Minimize, HeartPulse, Ruler, Tag, Target,
    ArrowRight, Scale, Wrench, Trophy
} from 'lucide-react';

/**
 * Maps distortion IDs to elegant Lucide SVG icons.
 * Replaces emojis across the Thought Reframer UI.
 */
const ICON_MAP: Record<string, React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>> = {
    'all-or-nothing': Circle,
    'overgeneralization': RefreshCw,
    'mental-filter': Search,
    'disqualifying-positive': XCircle,
    'jumping-to-conclusions': Brain,
    'fortune-telling': Sparkles,
    'magnification': Maximize,
    'minimization': Minimize,
    'emotional-reasoning': HeartPulse,
    'should-statements': Ruler,
    'labeling': Tag,
    'personalization': Target,
    'blame': ArrowRight,
    'fallacy-of-fairness': Scale,
    'fallacy-of-change': Wrench,
    'heaven-reward-fallacy': Trophy,
};

interface DistortionIconProps {
    distortionId: string;
    size?: number;
    className?: string;
    color?: string;
}

export default function DistortionIcon({ distortionId, size = 16, className = '', color }: DistortionIconProps) {
    const IconComponent = ICON_MAP[distortionId];

    if (!IconComponent) {
        return <Circle size={size} className={className} color={color} />;
    }

    return <IconComponent size={size} className={className} color={color} />;
}

export { ICON_MAP };
