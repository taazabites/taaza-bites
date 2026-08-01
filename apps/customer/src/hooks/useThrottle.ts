import { useState, useEffect, useRef } from 'react';

/**
 * A hook that returns a throttled version of the provided value.
 * @param value The value to throttle
 * @param interval The interval in milliseconds
 * @returns The throttled value
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated.current;

    if (timeSinceLastUpdate >= interval) {
      setThrottledValue(value);
      lastUpdated.current = now;
    } else {
      const handler = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, interval - timeSinceLastUpdate);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [value, interval]);

  return throttledValue;
}
