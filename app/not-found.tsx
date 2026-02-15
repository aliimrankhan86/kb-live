import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false },
};

export default function NotFound() {
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
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Page not found</h2>
      <p style={{ color: 'rgba(255,255,255,0.64)', marginBottom: '1.5rem' }}>
        The page you’re looking for doesn’t exist.
      </p>
      <Link
        href="/"
        style={{
          background: '#FFD31D',
          color: '#0B0B0B',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Go home
      </Link>
    </div>
  );
}
