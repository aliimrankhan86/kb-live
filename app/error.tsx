'use client';

import { useEffect } from 'react';

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const msg = (err as { message: unknown }).message;
    if (typeof msg === 'string') return msg;
  }
  if (err instanceof Error) return (err as Error).message;
  const s = String(err);
  if (s === '[object Event]') return 'An unexpected error occurred.';
  return s || 'An unexpected error occurred.';
}

export default function Error({
  error,
  reset,
}: {
  error: unknown;
  reset: () => void;
}) {
  const message = getErrorMessage(error);

  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#0B0B0B',
        color: '#FFFFFF',
        fontFamily: 'system-ui, sans-serif',
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
  );
}
