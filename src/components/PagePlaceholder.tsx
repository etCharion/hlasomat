import type { ReactNode } from 'react';

/**
 * Dočasná kostra stránky (Fáze 1). Postupně ji nahradí reálné pohledy
 * podle fází 5–7 v MEMORY.md.
 */
export default function PagePlaceholder({
  role,
  title,
  children,
}: {
  role: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: 'var(--hm-display)',
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: '-0.02em',
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: 'var(--hm-ink)',
            color: 'var(--hm-bg)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--hm-mono)',
            fontSize: 15,
          }}
        >
          H
        </span>
        Hlasomat
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--hm-muted)',
        }}
      >
        {role}
      </span>
      <h1 style={{ margin: 0, fontFamily: 'var(--hm-display)', fontSize: 28 }}>{title}</h1>
      {children}
    </main>
  );
}
