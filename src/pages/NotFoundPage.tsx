import { Link } from 'react-router-dom';
import PagePlaceholder from '../components/PagePlaceholder';

export default function NotFoundPage() {
  return (
    <PagePlaceholder role="404" title="Stránka nenalezena">
      <Link to="/" style={{ color: 'var(--hm-primary)', fontWeight: 600 }}>
        Zpět na úvod
      </Link>
    </PagePlaceholder>
  );
}
