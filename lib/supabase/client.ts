import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for browser-side usage.
 * Uses the anon key — never the service role key.
 * Returns null if env vars are missing so callers can degrade gracefully.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Dev/CI fallback: log once, return null so UI still renders
    if (typeof window !== 'undefined') {
      console.warn(
        '[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Auth features disabled.'
      );
    }
    return null;
  }

  return createBrowserClient(url, anonKey)
}
