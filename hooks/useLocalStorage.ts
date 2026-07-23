'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const prefixedKey = `cbami_hook_${key}`;

  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(prefixedKey);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch {
      // fall back to initial value
    }
    setIsLoaded(true);
  }, [prefixedKey]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue(prev => {
          const next = value instanceof Function ? value(prev) : value;
          window.localStorage.setItem(prefixedKey, JSON.stringify(next));
          return next;
        });
      } catch {
        // quota exceeded — no-op
      }
    },
    [prefixedKey]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(prefixedKey);
      setStoredValue(initialValue);
    } catch {
      // ignore
    }
  }, [prefixedKey, initialValue]);

  return { value: storedValue, setValue, removeValue, isLoaded } as const;
}

export default useLocalStorage;
