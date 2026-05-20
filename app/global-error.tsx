'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: '#0e0e14',
          color: '#f0f0f5',
          fontFamily: 'Inter, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          margin: 0,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            maxWidth: 400,
            padding: 40,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #8b2df5 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 120 120" fill="none">
              <circle cx="47" cy="55" r="7" fill="#1e1e38"/>
              <circle cx="75" cy="55" r="7" fill="#1e1e38"/>
              <path d="M56 70 L60 76 L64 70" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: 'white' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 14, color: '#9090a8', marginBottom: 24, lineHeight: 1.6 }}>
            The app encountered an error. Your data is safe — try reloading.
          </p>
          <button
            onClick={reset}
            style={{
              backgroundColor: '#8b2df5',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '12px 28px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}