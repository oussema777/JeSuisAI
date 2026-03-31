'use client';

import Link from 'next/link';

export default function GlobalError({
  _error,
  reset,
}: {
  _error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#f9fafb',
          padding: '1rem',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>⚠</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
              Une erreur critique est survenue
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Nous nous excusons pour ce désagrément. Veuillez réessayer ou revenir à l&apos;accueil.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#187A58',
                  color: 'white',
                  fontWeight: 500,
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Réessayer
              </button>
              <Link
                href="/"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontWeight: 500,
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                Accueil
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
