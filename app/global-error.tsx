'use client';

import { useEffect } from 'react';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  const s = String(error);
  if (s === '[object Event]') return 'An unexpected error occurred.';
  return s || 'An unexpected error occurred.';
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = getErrorMessage(error);

  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0B0B0B', color: '#FFFFFF', fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ color: 'rgba(255,255,255,0.64)', marginBottom: '1.5rem', textAlign: 'center' }}>
            {message}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: '#FFD31D',
              color: '#0B0B0B',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
