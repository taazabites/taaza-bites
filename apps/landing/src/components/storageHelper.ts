/**
 * Safe wrapper for localStorage and sessionStorage to prevent security errors
 * in restricted environments like sandboxed iframes or private windows.
 */

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`localStorage.getItem denied for key "${key}":`, e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`localStorage.setItem denied for key "${key}":`, e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`localStorage.removeItem denied for key "${key}":`, e);
    }
  },
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('localStorage.clear denied:', e);
    }
  },
  getLength: (): number => {
    try {
      return localStorage.length;
    } catch (e) {
      console.warn('localStorage.length denied:', e);
      return 0;
    }
  },
  key: (index: number): string | null => {
    try {
      return localStorage.key(index);
    } catch (e) {
      console.warn(`localStorage.key denied for index ${index}:`, e);
      return null;
    }
  }
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.warn(`sessionStorage.getItem denied for key "${key}":`, e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.warn(`sessionStorage.setItem denied for key "${key}":`, e);
    }
  },
  removeItem: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn(`sessionStorage.removeItem denied for key "${key}":`, e);
    }
  },
  clear: (): void => {
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('sessionStorage.clear denied:', e);
    }
  }
};
