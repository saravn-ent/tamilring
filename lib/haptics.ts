export const hapticFeedback = (intensity = 10) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(intensity);
    }
};
