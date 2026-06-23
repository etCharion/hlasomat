import { useParams } from 'react-router-dom';
import PagePlaceholder from '../components/PagePlaceholder';

/** Studentský pohled hlasování (Fáze 5). */
export default function StudentPage() {
  const { pin } = useParams();
  return (
    <PagePlaceholder role="Student" title="Hlasování">
      <p style={{ color: 'var(--hm-muted)' }}>
        Připojeno k session <b>{pin}</b>. Hlasovací rozhraní doplní Fáze 5.
      </p>
    </PagePlaceholder>
  );
}
