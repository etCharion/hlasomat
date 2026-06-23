import { useParams } from 'react-router-dom';
import PagePlaceholder from '../components/PagePlaceholder';

/** Projektorový pohled — živé výsledky (Fáze 7). */
export default function ProjectorPage() {
  const { pin } = useParams();
  return (
    <div className="hm-dark">
      <PagePlaceholder role="Projektor" title="Živé výsledky">
        <p style={{ color: 'var(--hm-muted)' }}>
          Projekce session <b>{pin}</b> doplní Fáze 7.
        </p>
      </PagePlaceholder>
    </div>
  );
}
