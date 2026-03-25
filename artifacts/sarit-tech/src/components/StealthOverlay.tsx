import React, { useEffect, useState } from 'react';

function isPreviewMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('preview') === 'true';
}

export function StealthOverlay({ children }: { children: React.ReactNode }) {
  const [bypass, setBypass] = useState(false);

  useEffect(() => {
    setBypass(isPreviewMode());
  }, []);

  if (bypass) return <>{children}</>;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: '#0F172A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(45, 212, 191, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(45, 212, 191, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
          }}
        />

        {/* Radial fade from center */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, #0F172A 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', textAlign: 'center', padding: '2rem' }}>
          {/* Loading ring */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <div style={{ position: 'relative', width: 72, height: 72 }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '2px solid rgba(45, 212, 191, 0.15)',
                }}
              />
              <div
                className="stealth-spin"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '2px solid transparent',
                  borderTopColor: '#2DD4BF',
                  borderRightColor: 'rgba(45, 212, 191, 0.3)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: '20%',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(45, 212, 191, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  className="stealth-pulse"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#2DD4BF',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Loading label */}
          <div
            className="stealth-blink"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.3em',
              color: '#2DD4BF',
              textTransform: 'uppercase',
              marginBottom: '2.5rem',
              fontFamily: 'monospace',
            }}
          >
            Loading...
          </div>

          {/* Divider */}
          <div
            style={{
              width: 40,
              height: 1,
              backgroundColor: 'rgba(45, 212, 191, 0.3)',
              margin: '0 auto 2rem',
            }}
          />

          {/* Name */}
          <h1
            style={{
              color: '#F8FAFC',
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              marginBottom: '0.75rem',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Sarit Sethi{' '}
            <span style={{ color: '#2DD4BF' }}>|</span>{' '}
            AI Product Leader
          </h1>

          {/* Subheader */}
          <p
            style={{
              color: 'rgba(148, 163, 184, 0.8)',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              maxWidth: 420,
              lineHeight: 1.6,
              margin: '0 auto',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Building in Public.{' '}
            <span style={{ color: 'rgba(45, 212, 191, 0.7)' }}>sarit.tech</span>{' '}
            is currently under construction.
          </p>

          {/* Bottom dots */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              justifyContent: 'center',
              marginTop: '2.5rem',
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`stealth-dot-${i}`}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  backgroundColor: '#2DD4BF',
                  opacity: 0.3,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes stealth-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes stealth-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes stealth-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes stealth-dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(1); }
          40% { opacity: 1; transform: scale(1.4); }
        }
        .stealth-spin {
          animation: stealth-spin 1.4s linear infinite;
        }
        .stealth-pulse {
          animation: stealth-pulse 1.8s ease-in-out infinite;
        }
        .stealth-blink {
          animation: stealth-blink 2s ease-in-out infinite;
        }
        .stealth-dot-0 { animation: stealth-dot 1.4s ease-in-out 0s infinite; }
        .stealth-dot-1 { animation: stealth-dot 1.4s ease-in-out 0.2s infinite; }
        .stealth-dot-2 { animation: stealth-dot 1.4s ease-in-out 0.4s infinite; }
      `}</style>
    </>
  );
}
