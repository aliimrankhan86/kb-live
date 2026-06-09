/**
 * Rate limiter for auth API routes.
 *
 * Production: Upstash Redis sliding-window (requires UPSTASH_REDIS_REST_URL +
 * UPSTASH_REDIS_REST_TOKEN env vars — add to Vercel dashboard before launch).
 *
 * Dev / missing env: falls back to in-memory Map. In-memory resets on cold
 * start and is not safe for production serverless. See .clinerules §11.5.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const WINDOW_LABEL = '15 m';

// ─── In-memory fallback (dev only) ───────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memStore = new Map<string, RateLimitEntry>();

function pruneExpired(): void {
  const now = Date.now();
  for (const [key, entry] of memStore.entries()) {
    if (entry.resetAt <= now) memStore.delete(key);
  }
}

setInterval(pruneExpired, 5 * 60 * 1000);

function checkInMemory(identifier: string): { limited: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = memStore.get(identifier);

  if (!entry || entry.resetAt <= now) {
    memStore.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { limited: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { limited: false };
}

// ─── Upstash (production) ────────────────────────────────────────────────────

let upstashLimiter: import('@upstash/ratelimit').Ratelimit | null = null;

async function getUpstashLimiter() {
  if (upstashLimiter) return upstashLimiter;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  const { Ratelimit } = await import(/* webpackIgnore: true */ '@upstash/ratelimit');
  const { Redis } = await import(/* webpackIgnore: true */ '@upstash/redis');
  upstashLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(MAX_ATTEMPTS, WINDOW_LABEL),
    analytics: false,
  });
  return upstashLimiter;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function checkRateLimit(identifier: string): Promise<{ limited: boolean; retryAfter?: number }> {
  const limiter = await getUpstashLimiter();

  if (limiter) {
    const { success, reset } = await limiter.limit(identifier);
    if (!success) {
      return { limited: true, retryAfter: Math.ceil((reset - Date.now()) / 1000) };
    }
    return { limited: false };
  }

  return checkInMemory(identifier);
}

/**
 * Build a rate-limit key. The `scope` namespaces the bucket per endpoint so that,
 * e.g., login attempts do not consume the quote-request budget for the same IP.
 */
export function getRateLimitIdentifier(request: Request, scope = 'global'): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `ratelimit:${scope}:${ip}`;
}
