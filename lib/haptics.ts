/**
 * Native Haptic Feedback Utility
 * Provides tactile response for various user interactions
 */

export const hapticFeedback = (pattern: number | number[] = 10) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(pattern);
    }
};

export const hapticPatterns = {
    // Light tap for navigation or subtle interactions (like iOS 'selectionChanged')
    selection: 10,
    
    // Slightly firmer tap for primary actions (play/pause)
    impact: 15,
    
    // "Success" pattern: two short pulses (like iOS 'success')
    success: [10, 30, 10],
    
    // "Warning" pattern: two medium pulses
    warning: [20, 40, 20],
    
    // "Error" pattern: three rapid pulses
    error: [15, 30, 15, 30, 15],
    
    // "Heart" pattern for favorites: a soft double heart-beat
    heartbeat: [10, 60, 15]
};
