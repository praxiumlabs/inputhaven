import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

// Per-IP rate limit for form submissions: 10 per minute
export const submissionRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "ratelimit:submission",
});

// Per-IP rate limit for auth endpoints: 5 per minute
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "ratelimit:auth",
});

// Per-IP rate limit for API endpoints: 60 per minute
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  prefix: "ratelimit:api",
});
