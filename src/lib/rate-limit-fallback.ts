interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class MemoryRateLimit {
  private store = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  limit(key: string): { success: boolean } {
    const now = Date.now();
    this.cleanup(now);

    const entry = this.store.get(key);
    if (!entry || now >= entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return { success: true };
    }

    if (entry.count >= this.maxRequests) {
      return { success: false };
    }

    entry.count++;
    return { success: true };
  }

  private cleanup(now: number) {
    if (this.store.size > 10000) {
      for (const [key, entry] of this.store) {
        if (now >= entry.resetAt) {
          this.store.delete(key);
        }
      }
    }
  }
}

export const submissionFallback = new MemoryRateLimit(10, 60_000);
export const apiFallback = new MemoryRateLimit(60, 60_000);
