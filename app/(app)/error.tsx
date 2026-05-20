'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 16,
        padding: 40,
        textAlign: 'center',
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
        }}
      >
        <svg width="32" height="32" viewBox="0 0 120 120" fill="none">
          <circle cx="47" cy="55" r="7" fill="#1e1e38"/>
          <circle cx="75" cy="55" r="7" fill="#1e1e38"/>
          <path d="M56 70 L60 76 L64 70" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'white', margin: 0 }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: 14, color: '#9090a8', margin: 0 }}>
        Try reloading the page.
      </p>
      <button
        onClick={reset}
        style={{
          backgroundColor: '#8b2df5',
          color: 'white',
          border: 'none',
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Reload
      </button>
    </div>
  );
}