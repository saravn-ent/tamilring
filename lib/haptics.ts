/**
 * Native Haptic Feedback Utility
 * Delivers premium tactile micro-interactions adhering to mobile-first ergonomics.
 */

// Safety check for browser environment and vibration API support
export const isHapticsSupported = (): boolean => {
    return typeof window !== 'undefined' && 
           typeof window.navigator !== 'undefined' && 
           typeof window.navigator.vibrate === 'function';
};

export const hapticFeedback = (pattern: number | number[] = 10) => {
    if (isHapticsSupported()) {
        try {
            window.navigator.vibrate(pattern);
        } catch {
            // Silently fallback if vibration blocked by browser permission policy
        }
    }
};

// Throttled haptic feedback for continuous scrubbing (prevents vibration queue flooding)
let lastScrubTime = 0;
export const throttledScrubHaptic = (minIntervalMs: number = 60) => {
    const now = Date.now();
    if (now - lastScrubTime >= minIntervalMs) {
        lastScrubTime = now;
        hapticFeedback(hapticPatterns.scrub);
    }
};

export const hapticPatterns = {
    // Ultra-light 8ms micro-tap for subtle touches
    tap: 8,

    // Light tap for navigation pills or chips (12ms)
    selection: 12,
    
    // Firm tactile impact for primary controls like Play/Pause (18ms)
    impact: 18,
    
    // Rapid 6ms micro-tick for continuous waveform scrubbing
    scrub: 6,

    // Rich dual-pulse pattern when initiating a ringtone download
    download: [15, 35, 20],
    
    // Multi-pulse rewarding finish pattern on download completion
    success: [12, 30, 12, 30, 24],
    
    // Smooth single pulse when opening bottom sheets / modals (e.g. Set Ringtone)
    openModal: 14,

    // "Heart" double-pulse for favoriting / likes
    heartbeat: [10, 60, 16],

    // Warning alert pattern
    warning: [20, 40, 20],
    
    // Error feedback pattern
    error: [15, 30, 15, 30, 15]
};
