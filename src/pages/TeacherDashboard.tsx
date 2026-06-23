import { useNavigate } from 'react-router-dom';
import PagePlaceholder from '../components/PagePlaceholder';
import { useAuth } from '../lib/auth';

/** Přehled sessions učitele (seznam a zakládání doplní Fáze 4). */
export default function TeacherDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <PagePlaceholder role="Učitel" title="Moje hlasování">
      <p style={{ color: 'var(--hm-muted)' }}>
        Přihlášen jako <b>{user?.displayName || user?.email}</b>.
      </p>
      <p style={{ color: 'var(--hm-muted)' }}>
        Seznam a zakládání sessions doplní Fáze 4.
      </p>
      <button
        onClick={handleSignOut}
        style={{
          marginTop: 8,
          padding: '10px 18px',
          borderRadius: 'var(--hm-r-md)',
          border: '1px solid var(--hm-line)',
          background: 'var(--hm-surface)',
          color: 'var(--hm-ink)',
          fontWeight: 600,
        }}
      >
        Odhlásit se
      </button>
    </PagePlaceholder>
  );
}
