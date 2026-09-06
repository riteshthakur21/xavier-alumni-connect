/**
 * In-Memory Client Cache for Xavier AlumniConnect Modules:
 * 1. Career & Referrals ('career-referrals')
 * 2. Events & Reunions ('events')
 * 3. Alumni Stories ('alumni-stories')
 * 4. Alumni Directory ('directory')
 * 5. User-Scoped Dashboard ('dashboard:<userId>')
 *
 * Survives client-side route transitions during the active browser session.
 */

export type ModuleCacheKey =
  | 'career-referrals'
  | 'events'
  | 'alumni-stories'
  | 'directory'
  | `dashboard:${string}`
  | string;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryStore = new Map<string, CacheEntry<any>>();

export const moduleCache = {
  /**
   * Retrieve cached data for a module key if present.
   */
  get<T>(key: ModuleCacheKey): T | null {
    const entry = memoryStore.get(key);
    if (!entry) return null;
    return entry.data as T;
  },

  /**
   * Store data in memory for a module key.
   */
  set<T>(key: ModuleCacheKey, data: T): void {
    memoryStore.set(key, {
      data,
      timestamp: Date.now(),
    });
  },

  /**
   * Invalidate a specific module cache (e.g. after mutations).
   */
  invalidate(key: ModuleCacheKey): void {
    memoryStore.delete(key);
  },

  /**
   * Check if valid cached data exists.
   */
  has(key: ModuleCacheKey): boolean {
    return memoryStore.has(key);
  },

  /**
   * Clear all module caches (e.g. on logout/account switch).
   */
  clear(): void {
    memoryStore.clear();
  },
};
