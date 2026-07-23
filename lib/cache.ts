const CACHE_PREFIX = 'cbami_v1_';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export function cacheSet<T>(key: string, data: T, ttlMs: number = 3_600_000): void {
  if (typeof window === 'undefined') return;
  const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl: ttlMs };
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

export function cacheGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > entry.ttl) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function cacheRemove(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_PREFIX + key);
}

export function cacheClear(): void {
  if (typeof window === 'undefined') return;
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(CACHE_PREFIX)) toRemove.push(k);
  }
  toRemove.forEach(k => localStorage.removeItem(k));
}

export function getCacheKeys(): string[] {
  if (typeof window === 'undefined') return [];
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(CACHE_PREFIX)) keys.push(k.slice(CACHE_PREFIX.length));
  }
  return keys;
}

export function getCacheSizeKB(): number {
  if (typeof window === 'undefined') return 0;
  let bytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(CACHE_PREFIX)) {
      bytes += (localStorage.getItem(k) || '').length * 2;
    }
  }
  return Math.round(bytes / 1024);
}
