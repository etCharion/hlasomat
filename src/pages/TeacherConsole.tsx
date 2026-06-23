import { useParams } from 'react-router-dom';
import PagePlaceholder from '../components/PagePlaceholder';

/** Učitelská konzole — řízení session (Fáze 6). */
export default function TeacherConsole() {
  const { sessionId } = useParams();
  return (
    <PagePlaceholder role="Učitel" title="Konzole">
      <p style={{ color: 'var(--hm-muted)' }}>
        Řízení session <b>{sessionId}</b> doplní Fáze 6.
      </p>
    </PagePlaceholder>
  );
}
