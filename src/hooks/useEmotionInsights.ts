import { useState, useEffect } from 'react';
import { EmotionDef } from '../types/mood';
import { emotions as allEmotions } from '../data/emotions';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('groq_api_key') || '' : '');

export interface InsightData extends Partial<EmotionDef> {
    copingStrategies?: string[];
}

// Global cache to avoid re-fetching same emotions during a session
const EMOTION_CACHE: Record<string, InsightData> = {};

export function useEmotionInsights(emotionId: string | undefined) {
    const [data, setData] = useState<InsightData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!emotionId) return;

        const emotion = allEmotions.find(e => e.id === emotionId);
        if (!emotion) return;

        // 1. If it already has hardcoded data, use it immediately
        // For hardcoded emotions, we might still want Groq to generate coping strategies, 
        // but for now we'll just return what we have to save API calls.
        if (emotion.definition && emotion.definition.trim() !== '') {
            setData({
                definition: emotion.definition,
                example: emotion.example,
                bodySignals: emotion.bodySignals,
                otherAttributes: emotion.otherAttributes,
                copingStrategies: ["Observe the feeling without judgment.", "Take a deep breath and reflect.", "Allow yourself to experience it fully."]
            });
            return;
        }

        // 2. Check memory cache
        if (EMOTION_CACHE[emotionId]) {
            setData(EMOTION_CACHE[emotionId]);
            return;
        }

        // 3. Otherwise, fetch dynamically from Groq
        const fetchInsight = async () => {
            setLoading(true);
            try {
                const prompt = `You are an expert psychological AI. Analyze the emotion: "${emotion.label}" (Family: ${emotion.family}, Intensity: ${emotion.intensity}).
Return exactly in this JSON format:
{
  "definition": "A 1-2 sentence deep meaning of the emotion.",
  "example": "Example scenario 1. | Example scenario 2.",
  "bodySignals": ["Physical sign 1", "Physical sign 2", "Physical sign 3"],
  "otherAttributes": "Attribute1: value | Attribute2: value",
  "copingStrategies": ["Step 1 to deal with this emotion", "Step 2 to manage it", "Step 3"]
}
Only return the JSON object, NO markdown formatting, NO extra text.`;

                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${GROQ_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "openai/gpt-oss-120b",
                        messages: [{ role: "user", content: prompt }],
                        response_format: { type: "json_object" },
                        temperature: 0.3
                    })
                });

                if (!response.ok) throw new Error('API Rate Limit or Error');

                const json = await response.json();
                const content = JSON.parse(json.choices[0].message.content);

                EMOTION_CACHE[emotionId] = content;
                setData(content);
            } catch (err) {
                console.error("Failed to fetch emotion insight", err);
                // Fallback basic info
                setData({
                    definition: `A ${String(emotion.intensity).toLowerCase()} emotion related to the ${emotion.family} family.`,
                    example: "Information currently unavailable.",
                    bodySignals: ["Varies by individual"],
                    otherAttributes: "Type: Procedural Placeholder",
                    copingStrategies: ["Take a deep breath.", "Reflect on this feeling.", "Observe without judgment."]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchInsight();
    }, [emotionId]);

    return { data, loading };
}
