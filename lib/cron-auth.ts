import type { NextRequest } from 'next/server';

/**
 * Vercel sends `Authorization: Bearer {CRON_SECRET}` on all cron invocations.
 * Manual callers (curl, tests) must send the same header.
 */
export function verifyCronSecret(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${secret}`;
}
