import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PagePlaceholder from '../components/PagePlaceholder';

/** Vstupní obrazovka studenta — zadání PINu (Fáze 5 doplní QR a validaci). */
export default function JoinPage() {
  const [pin, setPin] = useState('');
  const navigate = useNavigate();

  function join(e: React.FormEvent) {
    e.preventDefault();
    const clean = pin.replace(/\s+/g, '');
    if (clean) navigate(`/s/${clean}`);
  }

  return (
    <PagePlaceholder role="Student" title="Připoj se k hlasování">
      <form onSubmit={join} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          inputMode="numeric"
          placeholder="Zadej PIN"
          aria-label="PIN hlasování"
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--hm-r-md)',
            border: '1px solid var(--hm-line)',
            background: 'var(--hm-surface)',
            fontSize: 18,
            letterSpacing: '0.1em',
            width: 180,
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 20px',
            borderRadius: 'var(--hm-r-md)',
            border: 'none',
            background: 'var(--hm-primary)',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          Vstoupit
        </button>
      </form>
    </PagePlaceholder>
  );
}
