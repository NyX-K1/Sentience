/**
 * Audio Utilities for Breathing Exercises and Relaxation
 * Uses Web Audio API for tones and binaural beats
 * Uses browser TTS for guided scripts
 */

let audioContext: AudioContext | null = null;

// Initialize audio context (must be called after user interaction)
export const initAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

/**
 * Play a breathing tone cue
 * @param type 'inhale' | 'hold' | 'exhale'
 * @param duration Duration in seconds
 */
export const playBreathingTone = (
    type: 'inhale' | 'hold' | 'exhale',
    duration: number = 0.3
): void => {
    try {
        const ctx = initAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Different frequencies for different phases
        const frequencies = {
            inhale: 440,  // A4 - higher pitch
            hold: 330,    // E4 - middle pitch
            exhale: 220   // A3 - lower pitch
        };

        oscillator.frequency.value = frequencies[type];
        oscillator.type = 'sine';

        // Gentle fade in/out
        const now = ctx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);
    } catch (error) {
        console.warn('Audio playback failed:', error);
    }
};

/**
 * Create binaural beat for relaxation
 * @param baseFrequency Base frequency (e.g., 200 Hz)
 * @param beatFrequency Beat frequency (e.g., 10 Hz for alpha waves)
 * @param duration Duration in seconds
 */
export const playBinauralBeat = (
    baseFrequency: number = 200,
    beatFrequency: number = 10,
    duration: number = 60
): (() => void) => {
    try {
        const ctx = initAudioContext();

        const leftOscillator = ctx.createOscillator();
        const rightOscillator = ctx.createOscillator();
        const leftGain = ctx.createGain();
        const rightGain = ctx.createGain();
        const merger = ctx.createChannelMerger(2);

        // Left channel - base frequency
        leftOscillator.frequency.value = baseFrequency;
        leftOscillator.type = 'sine';
        leftOscillator.connect(leftGain);
        leftGain.connect(merger, 0, 0);

        // Right channel - base + beat frequency
        rightOscillator.frequency.value = baseFrequency + beatFrequency;
        rightOscillator.type = 'sine';
        rightOscillator.connect(rightGain);
        rightGain.connect(merger, 0, 1);

        merger.connect(ctx.destination);

        // Very low volume for background
        const now = ctx.currentTime;
        leftGain.gain.setValueAtTime(0, now);
        rightGain.gain.setValueAtTime(0, now);
        leftGain.gain.linearRampToValueAtTime(0.05, now + 2);
        rightGain.gain.linearRampToValueAtTime(0.05, now + 2);

        leftOscillator.start(now);
        rightOscillator.start(now);

        const stopTime = now + duration;
        leftOscillator.stop(stopTime);
        rightOscillator.stop(stopTime);

        // Return stop function
        return () => {
            const fadeOutTime = ctx.currentTime;
            leftGain.gain.linearRampToValueAtTime(0, fadeOutTime + 1);
            rightGain.gain.linearRampToValueAtTime(0, fadeOutTime + 1);
            leftOscillator.stop(fadeOutTime + 1);
            rightOscillator.stop(fadeOutTime + 1);
        };
    } catch (error) {
        console.warn('Binaural beat playback failed:', error);
        return () => { };
    }
};

/**
 * Text-to-speech wrapper
 * @param text Text to speak
 * @param rate Speech rate (0.1 to 10, default 0.8 for relaxation)
 */
export const textToSpeech = (text: string, rate: number = 0.8): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            reject(new Error('Text-to-speech not supported'));
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = 0.9;
        utterance.volume = 0.8;

        utterance.onend = () => resolve();
        utterance.onerror = (error) => reject(error);

        window.speechSynthesis.speak(utterance);
    });
};

/**
 * Stop any ongoing speech
 */
export const stopSpeech = (): void => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};

/**
 * Get PMR (Progressive Muscle Relaxation) script
 * @param duration '5min' | '15min'
 */
export const getPMRScript = (duration: '5min' | '15min'): string[] => {
    const intro = [
        "Welcome to Progressive Muscle Relaxation.",
        "Find a comfortable position. Make sure you're not driving or operating machinery.",
        "Let's begin with three deep breaths.",
        "Breathe in deeply... and out slowly.",
        "Again, breathe in... and out.",
        "One more time. In... and out.",
    ];

    const quickScript = [
        ...intro,
        "Now, make tight fists with both hands. Hold for 5 seconds... and release. Notice the difference.",
        "Tense your arms and shoulders. Pull them up tight... hold... and let go completely.",
        "Scrunch your face. Close your eyes tight, wrinkle your nose... hold... and relax.",
        "Take a deep breath and hold it in your chest... hold... and slowly release.",
        "Tighten your stomach muscles... hold... and release.",
        "Point your toes down, tense your legs... hold... and let go.",
        "Now, notice your entire body. Feel the relaxation flowing from head to toe.",
        "Take three more deep breaths, feeling calm and refreshed.",
        "When you're ready, slowly open your eyes and return to the present moment.",
    ];

    const deepScript = [
        ...intro,
        "Starting with your hands. Make tight fists. Feel the tension... hold for 5 seconds... and release. Feel the warmth spreading through your hands.",
        "Pause for 10 seconds. Notice the difference between tension and relaxation.",
        "Now your forearms and biceps. Bend your arms and flex your muscles... hold tight... and let go completely.",
        "Relax for 10 seconds.",
        "Raise your shoulders up to your ears. Feel the tension in your shoulders and neck... hold... and drop them down. Feel the release.",
        "Rest for 10 seconds.",
        "Scrunch up your entire face. Close your eyes tight, wrinkle your nose and forehead... hold... and smooth everything out.",
        "Breathe naturally for 10 seconds.",
        "Now your chest. Take a deep breath, hold it... feel the tension... and slowly exhale completely.",
        "Rest for 10 seconds.",
        "Tighten your stomach muscles. Pull them in tight... hold... and release. Feel your belly soften.",
        "Breathe deeply for 10 seconds.",
        "Tense your lower back by arching it slightly... hold... and relax back down.",
        "Rest for 10 seconds.",
        "Tighten your buttocks and thighs. Squeeze... hold... and release.",
        "Relax for 10 seconds.",
        "Point your toes down, tensing your calves and feet... hold... and let go.",
        "Rest for 10 seconds.",
        "Now, scan your entire body from head to toe. Notice any remaining tension and let it go.",
        "Feel yourself sinking deeper into relaxation with each breath.",
        "Your whole body is calm, heavy, and completely relaxed.",
        "Rest here for a moment, enjoying this peaceful state.",
        "When you're ready, slowly wiggle your fingers and toes.",
        "Take a deep breath and gently open your eyes.",
        "Welcome back. You are refreshed and calm.",
    ];

    return duration === '5min' ? quickScript : deepScript;
};

/**
 * Haptic feedback (mobile vibration)
 * @param pattern Vibration pattern in milliseconds
 */
export const triggerHaptic = (pattern: number | number[] = 50): void => {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
};
