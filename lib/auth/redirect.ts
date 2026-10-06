/**
 * Only allow same-site relative paths as post-auth destinations. Rejects
 * absolute URLs, protocol-relative ("//evil.com") and backslash tricks
 * ("/\\evil.com", which browsers normalise to "//evil.com"), so a crafted
 * ?next= / ?redirect= link can never send a signed-in user off-site.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = '/'): string {
  if (typeof value !== 'string' || value.length === 0) return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  // Control characters (tabs/newlines are stripped by URL parsers) could smuggle a host.
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;
  return value;
}
