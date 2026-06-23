import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PagePlaceholder from '../components/PagePlaceholder';
import { useAuth } from '../lib/auth';

/** Přihlášení učitele přes Google (Fáze 3). */
export default function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/teacher';

  // Už přihlášen → rovnou do konzole.
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  async function handleSignIn() {
    setError(null);
    setBusy(true);
    try {
      await signIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Přihlášení selhalo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PagePlaceholder role="Učitel" title="Přihlášení">
      <p style={{ color: 'var(--hm-muted)', maxWidth: 360 }}>
        Pro řízení hlasování se přihlas svým Google účtem.
      </p>
      <button
        onClick={handleSignIn}
        disabled={busy}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 22px',
          borderRadius: 'var(--hm-r-md)',
          border: '1px solid var(--hm-line)',
          background: 'var(--hm-surface)',
          color: 'var(--hm-ink)',
          fontWeight: 600,
          fontSize: 15,
          boxShadow: 'var(--hm-sh-1)',
          opacity: busy ? 0.6 : 1,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
          />
        </svg>
        {busy ? 'Přihlašuji…' : 'Přihlásit se přes Google'}
      </button>
      {error && (
        <p style={{ color: 'var(--hm-danger)', fontSize: 13, maxWidth: 360 }}>{error}</p>
      )}
    </PagePlaceholder>
  );
}
