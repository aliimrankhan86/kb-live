/**
 * True only on the Vercel production deployment (VERCEL_ENV === 'production').
 * Preview deployments, local dev, CI and tests are all non-production: they
 * show the test-site banner, are not indexed, and send email only to
 * STAGING_EMAIL_TO. Read at call time so tests can switch it.
 */
export function isProduction(): boolean {
  return process.env.VERCEL_ENV === 'production';
}
