import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-[var(--text)]">Page not found</h1>
      <p className="mt-2 text-[var(--textMuted)]">The page you are looking for does not exist or has moved.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/packages"
          data-testid="not-found-packages"
          className="inline-flex min-h-11 items-center rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--bg)]"
        >
          Browse packages
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-lg border border-[var(--borderSubtle)] px-5 text-sm font-semibold text-[var(--text)]"
        >
          Go home
        </Link>
      </div>
    </section>
  );
}
