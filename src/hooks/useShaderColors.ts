import { useMemo } from 'react';
import { emotions as allEmotions } from '../data/emotions';

export type ShaderState = {
    colorA: string;
    colorB: string;
    colorC: string;
    speed: number;
    intensity: number;
};

export function useShaderColors(selectedEmotionIds: string[]): ShaderState {
    return useMemo(() => {
        if (selectedEmotionIds.length === 0) {
            // Neutral / Calm state
            return {
                colorA: '#0f172a', // slate-900
                colorB: '#1e1b4b', // indigo-950
                colorC: '#000000', // black
                speed: 1,
                intensity: 0.2
            };
        }

        const selected = allEmotions.filter(e => selectedEmotionIds.includes(e.id));

        // Handle case where IDs don't match our stubbed taxonomy yet
        if (selected.length === 0) {
            return {
                colorA: '#0f172a',
                colorB: '#1e1b4b',
                colorC: '#000000',
                speed: 1,
                intensity: 0.2
            };
        }

        const avgValence = selected.reduce((acc, e) => acc + e.valence, 0) / selected.length;
        const avgArousal = selected.reduce((acc, e) => acc + e.arousal, 0) / selected.length;
        const maxIntensity = Math.max(...selected.map(e => e.intensity));

        let colorA = '#0f172a';
        let colorB = '#1e1b4b';
        let colorC = '#172554'; // blue-950

        // Heuristic mapping of Valence & Arousal to Hexcodes
        if (avgValence > 0.2) {
            if (avgArousal > 0.2) {
                // High Energy, Positive (Ecstatic, Joy)
                colorA = '#ca8a04'; // yellow-600
                colorB = '#ea580c'; // orange-600
                colorC = '#9d174d'; // pink-800
            } else {
                // Low Energy, Positive (Serene, Calm)
                colorA = '#0d9488'; // teal-600
                colorB = '#0369a1'; // sky-700
                colorC = '#1e3a8a'; // blue-900
            }
        } else if (avgValence < -0.2) {
            if (avgArousal > 0.2) {
                // High Energy, Negative (Anxious, Fear, Anger)
                colorA = '#9f1239'; // rose-800
                colorB = '#581c87'; // purple-900
                colorC = '#4c0519'; // rose-950
            } else {
                // Low Energy, Negative (Melancholic, Sadness)
                colorA = '#1e3a8a'; // blue-900
                colorB = '#312e81'; // indigo-900
                colorC = '#0f172a'; // slate-900
            }
        } else {
            // Mixed or Neutral Valence
            if (avgArousal > 0.2) {
                // Surprised or Tense
                colorA = '#9a3412'; // orange-800
                colorB = '#4c1d95'; // violet-900
                colorC = '#1e1b4b'; // indigo-950
            }
        }

        // Feature: Infuse the most intense emotion's exact color
        const dominant = selected.reduce((p, c) => p.intensity > c.intensity ? p : c);
        if (dominant.colorHex) {
            colorC = dominant.colorHex;
        }

        // Speed multiplier based on arousal (-1 to 1 scales to 0.5 to 2.5)
        const speed = Math.max(0.5, 1 + (avgArousal * 1.5));

        return {
            colorA,
            colorB,
            colorC,
            speed,
            intensity: maxIntensity / 4 // 0.25 to 1.0
        };

    }, [selectedEmotionIds]);
}
