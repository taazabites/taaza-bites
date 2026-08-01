export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export const triggerHaptic = (style: HapticStyle = 'light') => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      switch (style) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(35);
          break;
        case 'success':
          navigator.vibrate([10, 30, 20]);
          break;
        case 'warning':
          navigator.vibrate([20, 50, 20]);
          break;
        case 'error':
          navigator.vibrate([40, 40, 40]);
          break;
      }
    } catch {
      // Ignore vibration unsupported errors safely
    }
  }
};
