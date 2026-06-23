// question-editor.jsx — modal dialog for creating/editing questions

const { useState: useStateE, useEffect: useEffectE } = React;

const TYPE_LIST = ['yesno', 'choice', 'order', 'scale', 'matrix', 'wordcloud', 'emoji'];

const DEFAULT_TEMPLATES = {
  yesno: { type: 'yesno', q: '' },
  choice: { type: 'choice', q: '', options: ['', ''] },
  order: { type: 'order', q: '', options: ['', '', ''] },
  scale: { type: 'scale', q: '', min: 0, max: 10, lo: 'Nejhorší', hi: 'Nejlepší' },
  matrix: { type: 'matrix', q: '', rows: ['', ''], min: 1, max: 5 },
  wordcloud: { type: 'wordcloud', q: '', suggestions: [] },
  emoji: { type: 'emoji', q: '', options: [
    { e: '🤩', label: 'Skvěle' },
    { e: '😊', label: 'Dobře' },
    { e: '🙂', label: 'OK' },
    { e: '😐', label: 'Nic moc' },
    { e: '😕', label: 'Špatně' },
  ]},
};

function QuestionEditor({ mode, initial, onClose, onSave, onSaveAndStart }) {
  const [data, setData] = useStateE(() => initial ? structuredClone(initial) : DEFAULT_TEMPLATES.yesno);

  useEffectE(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function setType(t) {
    if (t === data.type) return;
    const tpl = structuredClone(DEFAULT_TEMPLATES[t]);
    tpl.q = data.q;
    setData(tpl);
  }

  function update(patch) { setData({ ...data, ...patch }); }

  const isValid = data.q.trim().length > 0 && validateForType(data);

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(14,14,21,.5)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'hm-fade-up .2s ease-out',
      }}>
      <div style={{
        background: 'var(--hm-surface)',
        borderRadius: 24,
        boxShadow: 'var(--hm-sh-3)',
        width: '100%',
        maxWidth: 640,
        maxHeight: 'calc(100vh - 40px)',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '22px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="hm-eyebrow">{mode === 'create' ? 'Nová otázka' : 'Upravit otázku'}</span>
            <h2 className="hm-h2" style={{ fontSize: 22, marginTop: 4 }}>
              {mode === 'create' ? 'Vytvoř novou otázku' : 'Úprava otázky'}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Zavřít"
            style={{
              border: 0, background: 'var(--hm-surface-2)',
              width: 36, height: 36, borderRadius: 999,
              color: 'var(--hm-muted)', cursor: 'pointer',
              display: 'grid', placeItems: 'center',
            }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={{ padding: '12px 24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--hm-muted)', letterSpacing: '.04em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
              Typ otázky
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
              {TYPE_LIST.map(t => (
                <button key={t}
                  onClick={() => setType(t)}
                  style={{
                    appearance: 'none', border: 0,
                    padding: '12px 12px',
                    borderRadius: 12,
                    background: data.type === t ? 'var(--hm-primary-soft)' : 'var(--hm-surface-2)',
                    boxShadow: data.type === t ? 'inset 0 0 0 2px var(--hm-primary)' : 'inset 0 0 0 1px var(--hm-line)',
                    color: data.type === t ? 'var(--hm-primary-ink)' : 'var(--hm-ink)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex', flexDirection: 'column', gap: 6,
                  }}>
                  <TypeIcon type={t} size={18}/>
                  <span style={{ fontSize: 12.5, fontWeight: 500 }}>{TYPE_META[t].label}</span>
                </button>
              ))}
            </div>
            {mode === 'edit' && (
              <p style={{ fontSize: 11.5, color: 'var(--hm-muted)', marginTop: 8 }}>
                Pozor — změnou typu se resetuje konfigurace (možnosti, řádky atd.) a smažou se dosud nasbirané hlasy.
              </p>
            )}
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--hm-muted)', letterSpacing: '.04em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Znění otázky
            </label>
            <textarea
              className="hm-input"
              autoFocus
              placeholder="Co se zeptáš studentů?"
              value={data.q}
              onChange={(e) => update({ q: e.target.value })}
              rows={2}
              style={{ resize: 'vertical', fontSize: 17, lineHeight: 1.35, fontFamily: 'inherit' }}/>
          </div>

          <TypeConfig data={data} setData={setData}/>
        </div>

        <div style={{
          padding: '14px 24px 20px',
          borderTop: '1px solid var(--hm-line)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          background: 'var(--hm-surface-2)',
        }}>
          <button className="hm-btn ghost" onClick={onClose}>Zrušit</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="hm-btn" disabled={!isValid} onClick={() => onSave(data)}>
              {mode === 'create' ? 'Uložit do knihovny' : 'Uložit změny'}
            </button>
            <button className="hm-btn primary" disabled={!isValid} onClick={() => onSaveAndStart(data)}>
              Uložit a spustit
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M3 2l9 5-9 5V2z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function validateForType(data) {
  switch (data.type) {
    case 'yesno': return true;
    case 'choice':
    case 'order':
      return (data.options || []).filter(o => String(o).trim()).length >= 2;
    case 'scale': return data.min < data.max;
    case 'matrix': return (data.rows || []).filter(r => String(r).trim()).length >= 1 && data.min < data.max;
    case 'wordcloud': return true;
    case 'emoji': return (data.options || []).filter(o => o.e && o.label).length >= 2;
    default: return true;
  }
}

function TypeConfig({ data, setData }) {
  const update = (patch) => setData({ ...data, ...patch });

  if (data.type === 'yesno') {
    return (
      <div style={{ padding: '14px 16px', background: 'var(--hm-surface-2)', borderRadius: 12, fontSize: 13.5, color: 'var(--hm-muted)' }}>
        Studenti uvidí dvě tlačítka: <b style={{ color: 'var(--hm-ink)' }}>ANO</b> a <b style={{ color: 'var(--hm-ink)' }}>NE</b>. Žádná další konfigurace.
      </div>
    );
  }

  if (data.type === 'choice' || data.type === 'order') {
    return (
      <ListEditor
        label={data.type === 'choice' ? 'Možnosti' : 'Položky k seřazení'}
        items={data.options || []}
        onChange={(options) => update({ options })}
        placeholder="Možnost..."
        minItems={2}/>
    );
  }

  if (data.type === 'scale') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FieldRow>
          <Field label="Min">
            <input className="hm-input" type="number" value={data.min}
              onChange={(e) => update({ min: Number(e.target.value) })}/>
          </Field>
          <Field label="Max">
            <input className="hm-input" type="number" value={data.max}
              onChange={(e) => update({ max: Number(e.target.value) })}/>
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Popisek minima">
            <input className="hm-input" value={data.lo}
              placeholder="např. Lehký"
              onChange={(e) => update({ lo: e.target.value })}/>
          </Field>
          <Field label="Popisek maxima">
            <input className="hm-input" value={data.hi}
              placeholder="např. Velmi těžký"
              onChange={(e) => update({ hi: e.target.value })}/>
          </Field>
        </FieldRow>
      </div>
    );
  }

  if (data.type === 'matrix') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <ListEditor
          label="Řádky (kritéria)"
          items={data.rows || []}
          onChange={(rows) => update({ rows })}
          placeholder="Kritérium..."
          minItems={1}/>
        <FieldRow>
          <Field label="Min hodnota">
            <input className="hm-input" type="number" value={data.min}
              onChange={(e) => update({ min: Number(e.target.value) })}/>
          </Field>
          <Field label="Max hodnota">
            <input className="hm-input" type="number" value={data.max}
              onChange={(e) => update({ max: Number(e.target.value) })}/>
          </Field>
        </FieldRow>
      </div>
    );
  }

  if (data.type === 'wordcloud') {
    return (
      <ListEditor
        label="Návrhy slov (volitelné)"
        items={data.suggestions || []}
        onChange={(suggestions) => update({ suggestions })}
        placeholder="Návrh..."
        minItems={0}
        hint="Nepovinné. Studentům se ukáží jako rychlé tipy."/>
    );
  }

  if (data.type === 'emoji') {
    return (
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--hm-muted)', letterSpacing: '.04em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
          Emoji možnosti
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(data.options || []).map((o, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input className="hm-input" value={o.e}
                onChange={(e) => {
                  const opts = [...data.options];
                  opts[i] = { ...opts[i], e: e.target.value };
                  update({ options: opts });
                }}
                style={{ width: 64, textAlign: 'center', fontSize: 24, padding: '10px 8px' }}/>
              <input className="hm-input" value={o.label}
                placeholder="Popisek..."
                onChange={(e) => {
                  const opts = [...data.options];
                  opts[i] = { ...opts[i], label: e.target.value };
                  update({ options: opts });
                }}/>
              <IconRemove onClick={() => {
                update({ options: data.options.filter((_, j) => j !== i) });
              }}/>
            </div>
          ))}
          {(data.options || []).length < 8 && (
            <button onClick={() => update({ options: [...(data.options || []), { e: '🙂', label: '' }] })}
              style={{
                appearance: 'none', border: '1px dashed var(--hm-line)',
                background: 'transparent',
                padding: '10px 12px', borderRadius: 10,
                color: 'var(--hm-muted)', cursor: 'pointer',
                fontSize: 13, fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
              }}>+ Přidat emoji</button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function FieldRow({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>;
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--hm-muted)', letterSpacing: '.04em', textTransform: 'uppercase' }}>{label}</label>
      {children}
    </div>
  );
}

function ListEditor({ label, items, onChange, placeholder, minItems = 1, hint }) {
  function set(i, v) {
    const arr = [...items]; arr[i] = v; onChange(arr);
  }
  function add() { onChange([...items, '']); }
  function remove(i) {
    if (items.length <= minItems) return;
    onChange(items.filter((_, j) => j !== i));
  }

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--hm-muted)', letterSpacing: '.04em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
        {label}
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'var(--hm-surface-2)', color: 'var(--hm-muted)',
              fontFamily: 'var(--hm-mono)', fontSize: 12, fontWeight: 600,
              display: 'grid', placeItems: 'center', flexShrink: 0,
            }}>{i + 1}</span>
            <input className="hm-input" value={it}
              placeholder={placeholder}
              onChange={(e) => set(i, e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); }}}/>
            <IconRemove onClick={() => remove(i)} disabled={items.length <= minItems}/>
          </div>
        ))}
        <button onClick={add}
          style={{
            appearance: 'none', border: '1px dashed var(--hm-line)',
            background: 'transparent',
            padding: '10px 12px', borderRadius: 10,
            color: 'var(--hm-muted)', cursor: 'pointer',
            fontSize: 13, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
          }}>+ Přidat</button>
      </div>
      {hint && <p style={{ fontSize: 11.5, color: 'var(--hm-muted)', marginTop: 6 }}>{hint}</p>}
    </div>
  );
}

function IconRemove({ onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label="Odebrat"
      style={{
        appearance: 'none', border: 0,
        width: 32, height: 32, borderRadius: 8,
        background: 'transparent', color: disabled ? 'var(--hm-muted-2)' : 'var(--hm-muted)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'grid', placeItems: 'center',
        flexShrink: 0,
      }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3 7h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    </button>
  );
}

Object.assign(window, { QuestionEditor });
