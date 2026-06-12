import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

config({ path: '.env.local', quiet: true });

const REQUIRED_ENV = ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'];

function hasEnv(name) {
  return typeof process.env[name] === 'string' && process.env[name].trim().length > 0;
}

function printEnvPresence() {
  console.log('Upstash env:', {
    UPSTASH_REDIS_REST_URL: hasEnv('UPSTASH_REDIS_REST_URL'),
    UPSTASH_REDIS_REST_TOKEN: hasEnv('UPSTASH_REDIS_REST_TOKEN'),
  });
}

function missingEnv() {
  return REQUIRED_ENV.filter((name) => !hasEnv(name));
}

async function main() {
  printEnvPresence();

  const missing = missingEnv();
  if (missing.length > 0) {
    console.error(`FAIL: missing ${missing.join(', ')}.`);
    console.error('Production rate limiting would fall back to in-memory storage without these env vars.');
    process.exitCode = 1;
    return;
  }

  const redis = Redis.fromEnv();
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: false,
  });

  const pong = await redis.ping();
  if (pong !== 'PONG') {
    throw new Error('Unexpected Redis ping response.');
  }
  console.log('Redis ping: OK');

  const probeKey = `pilgrimcompare:upstash-connectivity:${randomUUID()}`;
  const result = await limiter.limit(probeKey);
  console.log('Rate limiter probe:', {
    success: result.success,
    remaining: result.remaining,
  });

  if (!result.success) {
    throw new Error('Rate limiter probe was unexpectedly limited.');
  }

  console.log('Upstash connectivity: OK');
  console.log('No secret values were printed.');
}

main().catch((error) => {
  const name = error instanceof Error ? error.name : 'UnknownError';
  console.error(`FAIL: Upstash connectivity check failed (${name}).`);
  console.error('No secret values were printed. Check env vars, Upstash project status, and network access.');
  process.exitCode = 1;
});
