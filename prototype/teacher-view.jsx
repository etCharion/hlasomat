// teacher-view.jsx — teacher control console

const { useState: useStateT } = React;

function MiniQR({ size = 'normal' }) {
  const cells = [];
  const seed = 0xa37;
  let r = seed;
  for (let i = 0; i < 25 * 25; i++) {
    r = (r * 9301 + 49297) % 233280;
    cells.push(r / 233280 > 0.52);
  }
  const isMarker = (x, y) => {
    const inBox = (bx, by) => x >= bx && x < bx + 7 && y >= by && y < by + 7;
    const inInner = (bx, by) => x >= bx + 2 && x < bx + 5 && y >= by + 2 && y < by + 5;
    const onEdge = (bx, by) => inBox(bx, by) && !(x > bx && x < bx + 6 && y > by && y < by + 6);
    return onEdge(0, 0) || inInner(0, 0) ||
    onEdge(18, 0) || inInner(18, 0) ||
    onEdge(0, 18) || inInner(0, 18) ||
    x === 8 && y < 7 || y === 8 && x < 7;
  };
  return (
    <div className="hm-qr">
      {Array.from({ length: 25 * 25 }).map((_, idx) => {
        const x = idx % 25,y = Math.floor(idx / 25);
        const on = isMarker(x, y) ? true : cells[idx];
        return on ? <i key={idx} style={{ gridColumn: x + 1, gridRow: y + 1 }} /> : null;
      })}
    </div>);

}

function SessionCard({ session }) {
  const [copied, setCopied] = useStateT(false);
  const url = `hlasomat.app/${session.pin.replace(/\s/g, '')}`;

  function copyLink() {
    const fullUrl = `https://${url}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function downloadQR() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#000';
    const padding = 32;const cellSize = (512 - padding * 2) / 25;
    let r = 0xa37;
    const cells = [];
    for (let i = 0; i < 25 * 25; i++) {
      r = (r * 9301 + 49297) % 233280;
      cells.push(r / 233280 > 0.52);
    }
    const isMarker = (x, y) => {
      const inBox = (bx, by) => x >= bx && x < bx + 7 && y >= by && y < by + 7;
      const inInner = (bx, by) => x >= bx + 2 && x < bx + 5 && y >= by + 2 && y < by + 5;
      const onEdge = (bx, by) => inBox(bx, by) && !(x > bx && x < bx + 6 && y > by && y < by + 6);
      return onEdge(0, 0) || inInner(0, 0) ||
      onEdge(18, 0) || inInner(18, 0) ||
      onEdge(0, 18) || inInner(0, 18) ||
      x === 8 && y < 7 || y === 8 && x < 7;
    };
    for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) {
      const on = isMarker(x, y) ? true : cells[y * 25 + x];
      if (on) ctx.fillRect(padding + x * cellSize, padding + y * cellSize, cellSize + 0.5, cellSize + 0.5);
    }
    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `hlasomat-${session.pin.replace(/\s/g, '')}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
  }

  return (
    <div className="hm-session-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>
            Připojovací kód
          </div>
          <div className="pin">{session.pin}</div>
        </div>
        <span className="live">
          <span className="dot" /> LIVE
        </span>
      </div>
      <div className="qr-box">
        <MiniQR />
      </div>
      <div className="meta">
        <b style={{ color: '#fff', fontFamily: 'var(--hm-mono)', fontSize: 13 }}>{url}</b>
        <div style={{ marginTop: 4 }}>
          <b style={{ color: '#fff' }}>{session.connected.length}</b> studentů připojeno
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="hm-btn sm" onClick={copyLink}
        style={{ background: 'rgba(255,255,255,.12)', color: '#fff', flex: 1 }}>
          {copied ?
          <>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3 3 7-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Zkopirováno
            </> :

          <>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <rect x="3" y="3" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M5 3V2a1 1 0 011-1h4a1 1 0 011 1v7" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              Kopírovat odkaz
            </>
          }
        </button>
        <button className="hm-btn sm" onClick={downloadQR}
        style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}
        title="Stáhnout QR jako PNG">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v8m0 0L4 6m3 3l3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 11v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>);

}

function LibraryPanel({ session, controller, onCreate }) {
  const { questions, activeId } = session;
  return (
    <div className="hm-card" style={{ padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 4px 4px' }}>
        <span className="hm-eyebrow">Knihovna otázek</span>
        <button className="hm-btn sm" onClick={onCreate}
        style={{ background: 'var(--hm-primary)', color: '#fff' }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Nová
        </button>
      </div>
      <p style={{ fontSize: 11.5, color: 'var(--hm-muted)', margin: '4px 4px 12px', lineHeight: 1.35 }}>
        Vyber otázku k zobrazení, pak ji spusť tlačítkem „Spustit hlasování“.
      </p>
      <div className="hm-lib">
        {questions.map((q, idx) =>
        <LibraryItem key={q.id} q={q} idx={idx} total={questions.length}
        active={activeId === q.id}
        running={session.running && activeId === q.id}
        controller={controller} />
        )}
        {questions.length === 0 &&
        <p style={{ fontSize: 13, color: 'var(--hm-muted)', padding: '24px 8px', textAlign: 'center' }}>
            Knihovna je prázdná. Klikni „Nová“ a vytvoř první otázku.
          </p>
        }
      </div>
    </div>);

}

function LibraryItem({ q, idx, total, active, running, controller }) {
  const [hover, setHover] = useStateT(false);
  return (
    <div style={{ position: 'relative' }}
    onMouseEnter={() => setHover(true)}
    onMouseLeave={() => setHover(false)}>
      <button
        className="hm-lib-item"
        data-active={active}
        onClick={() => controller.selectQuestion(q.id)}>
        <span className="type-icon"><TypeIcon type={q.type} size={18} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.q}</div>
          <div className="sub">
            {TYPE_META[q.type].label}
            {running && <span style={{ color: 'var(--hm-success)', marginLeft: 6, fontWeight: 600 }}>● běží</span>}
          </div>
        </div>
      </button>
      {hover &&
      <div style={{
        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
        display: 'flex', gap: 2,
        background: 'var(--hm-surface)',
        borderRadius: 8,
        padding: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,.06)',
        border: '1px solid var(--hm-line)'
      }} onClick={(e) => e.stopPropagation()}>
          <IconBtn title="Posunout nahoru" disabled={idx === 0}
        onClick={() => controller.moveQuestion(q.id, -1)}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M7 11V3m0 0L3 7m4-4l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconBtn>
          <IconBtn title="Posunout dolů" disabled={idx === total - 1}
        onClick={() => controller.moveQuestion(q.id, 1)}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M7 3v8m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconBtn>
          <IconBtn title="Upravit" onClick={() => controller.openEdit(q.id)}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M2 12l1-3 7-7 2 2-7 7-3 1zM9 3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconBtn>
          <IconBtn title="Smazat" danger
        onClick={() => {if (confirm('Smazat otázku „' + q.q + '"?')) controller.deleteQuestion(q.id);}}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M3 4h8M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 7v3M9 7v3M4 4l.5 8a1 1 0 001 1h3a1 1 0 001-1L10 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconBtn>
        </div>
      }
    </div>);

}

function IconBtn({ children, onClick, disabled, danger, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 26, height: 26, padding: 0,
        border: 0,
        borderRadius: 6,
        background: 'transparent',
        color: disabled ? 'var(--hm-muted-2)' : danger ? 'var(--hm-danger)' : 'var(--hm-muted)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'grid', placeItems: 'center',
        transition: 'background .12s ease, color .12s ease'
      }}
      onMouseEnter={(e) => {if (!disabled) e.currentTarget.style.background = danger ? 'var(--hm-danger-soft)' : 'var(--hm-surface-2)';}}
      onMouseLeave={(e) => {e.currentTarget.style.background = 'transparent';}}>
      {children}
    </button>);

}

function ActiveQuestionPanel({ session, controller }) {
  if (!session.activeId) {
    return (
      <div className="hm-active-card">
        <div className="hm-active-empty">
          <div className="icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="2" />
              <path d="M14 8v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="hm-h2" style={{ color: 'var(--hm-ink)' }}>Žádná otázka není vybraná</h2>
            <p className="hm-lead" style={{ marginTop: 4 }}>Vyber otázku z knihovny.</p>
          </div>
        </div>
      </div>);

  }

  const q = session.questions.find((x) => x.id === session.activeId);
  const r = session.results[session.activeId];
  const voted = totalVoters(q, r);
  const total = session.connected.length || 1;
  const pct = voted / total * 100;

  const variants = RESULT_VARIANTS[q.type] || ['default'];
  const showRunning = session.running;
  const showResults = session.running || session.activeEnded;
  const viewMode = session.viewMode[q.id] || variants[0];

  return (
    <div className="hm-active-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
            <span className="hm-chip primary">
              <TypeIcon type={q.type} size={12} />
              {TYPE_META[q.type].label}
            </span>
            {showRunning && <span className="hm-chip success">● Hlasování běží</span>}
            {session.activeEnded && <span className="hm-chip">🔒 Uzavřeno</span>}
            {!showRunning && !session.activeEnded && <span className="hm-chip accent">Náhled — nespouštěno</span>}
          </div>
          <h2 className="hm-h2" style={{ fontSize: 26 }}>{q.q}</h2>
        </div>
      </div>

      <div style={{
        display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
        padding: '12px 14px',
        background: 'var(--hm-surface-2)',
        borderRadius: 14,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--hm-muted)', marginRight: 6 }}>
          Zobrazit výsledky na
        </span>
        <Tog label="Projektoru" on={session.showOnProjector}
          onChange={(v) => controller.setShowOnProjector(v)}/>
        <Tog label="Studentech" on={session.showToStudents}
          onChange={(v) => controller.setShowToStudents(v)}/>
        <Tog label="Se jmény" on={session.showNames}
          onChange={(v) => controller.setShowNames(v)}/>
        <span style={{ width: 1, height: 18, background: 'var(--hm-border)', margin: '0 4px' }} />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--hm-muted)', marginRight: 2 }}>
          Na projektoru
        </span>
        <Tog label="Přihlašovací údaje" on={session.showJoinOnProjector}
          onChange={(v) => controller.setShowJoinOnProjector(v)}/>
      </div>

      {!showRunning && !session.activeEnded ?
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '4px 0' }}>
          <button className="hm-btn primary lg" onClick={() => controller.startVoting()} style={{ padding: '14px 22px' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2l9 5-9 5V2z" fill="currentColor" /></svg>
            Spustit hlasování
          </button>
          <button className="hm-btn ghost sm" onClick={() => controller.openEdit(q.id)}>Upravit otázku</button>
          <div className="hm-spacer" />
          <span style={{ fontSize: 13, color: 'var(--hm-muted)' }}>{session.connected.length} studentů čeká</span>
        </div> :

      <>
          <div className="hm-progress">
            <div className="track"><div className="fill" style={{ width: `${pct}%` }} /></div>
            <span className="count">{voted}/{session.connected.length}</span>
            <span style={{ color: 'var(--hm-muted)' }}>hlasovalo</span>
          </div>

          <div className="hm-controls-row">
            {showRunning ?
          <button className="hm-btn ghost" onClick={() => controller.pause()}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="3" y="2" width="3" height="10" rx="1" fill="currentColor" />
                  <rect x="8" y="2" width="3" height="10" rx="1" fill="currentColor" />
                </svg>
                Pozastavit
              </button> :
          !session.activeEnded ?
          <button className="hm-btn primary" onClick={() => controller.resume()}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2l9 5-9 5V2z" fill="currentColor" /></svg>
                Pokračovat
              </button> :
          null}
            {!session.activeEnded &&
          <button className="hm-btn danger" onClick={() => controller.end()}>Ukončit hlasování</button>
          }
            {session.activeEnded &&
          <button className="hm-btn ghost" onClick={() => controller.startVoting()}>Spustit znovu</button>
          }
          </div>
        </>
      }

      <div className="hm-divider" style={{ margin: '4px 0' }} />

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12 }}>
          <span className="hm-eyebrow">{session.activeEnded ? 'Finální výsledky' : showRunning ? 'Živé výsledky' : 'Náhled otázky'}</span>
          {variants.length > 1 &&
          <div style={{ display: 'inline-flex', background: 'var(--hm-surface-2)', borderRadius: 999, padding: 3, gap: 2 }}>
              {variants.map((v) =>
            <button key={v}
            onClick={() => controller.setViewMode(q.id, v)}
            style={{
              border: 0,
              background: viewMode === v ? 'var(--hm-surface)' : 'transparent',
              color: viewMode === v ? 'var(--hm-ink)' : 'var(--hm-muted)',
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 500,
              boxShadow: viewMode === v ? 'var(--hm-sh-1)' : 'none',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}>
                  {RESULT_VARIANT_LABELS[v] || v}
                </button>
            )}
            </div>
          }
        </div>
        {showResults ?
        <TeacherResultsPreview question={q} results={r} votes={session.votes[q.id] || []}
        viewMode={viewMode} showNames={session.showNames} /> :

        <QuestionPreviewSummary question={q} />
        }
      </div>
    </div>);

}

function QuestionPreviewSummary({ question }) {
  const q = question;
  let body;
  if (q.type === 'yesno') body = <p className="hm-lead">Dvě tlačítka: ANO / NE.</p>;else
  if (q.type === 'choice' || q.type === 'order') body =
  <ul style={{ margin: '6px 0 0 0', paddingLeft: 22, fontSize: 14, color: 'var(--hm-ink-2)', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {q.options.map((o, i) => <li key={i}>{o}</li>)}
    </ul>;else

  if (q.type === 'scale') body = <p className="hm-lead">Slider {q.min}–{q.max} ({q.lo} → {q.hi}).</p>;else
  if (q.type === 'matrix') body =
  <ul style={{ margin: '6px 0 0 0', paddingLeft: 22, fontSize: 14, color: 'var(--hm-ink-2)', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {q.rows.map((o, i) => <li key={i}>{o} <span style={{ color: 'var(--hm-muted)', fontFamily: 'var(--hm-mono)', fontSize: 12 }}>{q.min}–{q.max}</span></li>)}
    </ul>;else

  if (q.type === 'wordcloud') body = <p className="hm-lead">Studenti napíší vlastní slova (až 3 každý).</p>;else
  if (q.type === 'emoji') body =
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
      {q.options.map((o, i) =>
    <span key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 32 }}>{o.e}</span>
          <span style={{ fontSize: 11, color: 'var(--hm-muted)' }}>{o.label}</span>
        </span>
    )}
    </div>;


  return (
    <div style={{ padding: 16, background: 'var(--hm-surface-2)', borderRadius: 14 }}>
      <span className="hm-eyebrow" style={{ display: 'block', marginBottom: 6 }}>Co uvidí student</span>
      {body}
    </div>);

}

function Tog({ label, on, onChange }) {
  return (
    <button className="hm-toggle" data-on={on} onClick={() => onChange(!on)}>
      <span className="sw" />
      {label}
    </button>);

}

const RESULT_VARIANTS = {
  yesno: ['bars', 'donut'],
  choice: ['bars', 'donut', 'hbars'],
  scale: ['histogram', 'summary'],
  emoji: ['grid', 'rank'],
  order: ['ranked'],
  matrix: ['bars'],
  wordcloud: ['cloud', 'list']
};

const RESULT_VARIANT_LABELS = {
  bars: 'Sloupce', donut: 'Donut', hbars: 'Žebříček',
  histogram: 'Histogram', summary: 'Souhrn',
  grid: 'Mřížka', rank: 'Žebříček',
  ranked: 'Žebříček',
  cloud: 'Cloud', list: 'Seznam'
};

function TeacherResultsPreview({ question, results, votes, viewMode, showNames }) {
  if (!results) return null;

  if (question.type === 'yesno') {
    const total = results.yes + results.no || 1;
    if (viewMode === 'donut') {
      return <YesNoDonut yes={results.yes} no={results.no} total={total} />;
    }
    return (
      <div>
        <div className="hm-bar-row" data-kind="yes">
          <div className="top"><b>ANO</b><span className="pct">{results.yes} · {Math.round(results.yes / total * 100)}%</span></div>
          <div className="track"><div className="fill" style={{ width: `${results.yes / total * 100}%` }} /></div>
          {showNames && <VoterChips votes={votes.filter((v) => v.vote === 'yes')} />}
        </div>
        <div className="hm-bar-row" data-kind="no">
          <div className="top"><b>NE</b><span className="pct">{results.no} · {Math.round(results.no / total * 100)}%</span></div>
          <div className="track"><div className="fill" style={{ width: `${results.no / total * 100}%` }} /></div>
          {showNames && <VoterChips votes={votes.filter((v) => v.vote === 'no')} />}
        </div>
      </div>);

  }

  if (question.type === 'choice') {
    const total = Object.values(results).reduce((a, b) => a + b, 0) || 1;
    const sorted = viewMode === 'hbars' ?
    [...question.options.map((o, i) => ({ o, i, n: results[i] || 0 }))].sort((a, b) => b.n - a.n) :
    question.options.map((o, i) => ({ o, i, n: results[i] || 0 }));
    if (viewMode === 'donut') {
      return <ChoiceDonut question={question} results={results} total={total} votes={votes} showNames={showNames} />;
    }
    return (
      <div>
        {sorted.map(({ o, i, n }, idx) =>
        <div key={i} className="hm-bar-row">
            <div className="top">
              <b>{viewMode === 'hbars' && <span style={{ fontFamily: 'var(--hm-mono)', color: 'var(--hm-muted)', marginRight: 8 }}>{idx + 1}.</span>}{o}</b>
              <span className="pct">{n} · {Math.round(n / total * 100)}%</span>
            </div>
            <div className="track"><div className="fill" style={{ width: `${n / total * 100}%` }} /></div>
            {showNames && <VoterChips votes={votes.filter((v) => v.vote === i)} />}
          </div>
        )}
      </div>);

  }

  if (question.type === 'scale') {
    const total = Object.values(results).reduce((a, b) => a + b, 0);
    const allVals = [];
    Object.entries(results).forEach(([k, v]) => {for (let i = 0; i < v; i++) allVals.push(Number(k));});
    allVals.sort((a, b) => a - b);
    const avg = allVals.length ? allVals.reduce((a, b) => a + b, 0) / allVals.length : 0;
    const median = allVals.length ?
    allVals.length % 2 === 0 ?
    (allVals[allVals.length / 2 - 1] + allVals[allVals.length / 2]) / 2 :
    allVals[Math.floor(allVals.length / 2)] :
    0;
    const max = Math.max(1, ...Object.values(results));

    if (viewMode === 'summary' || total === 0) {
      return (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StatTile label="Průměr" value={avg.toFixed(1)} />
          <StatTile label="Medián" value={median.toFixed(1)} accent />
          <StatTile label="Min" value={allVals[0] ?? '–'} />
          <StatTile label="Max" value={allVals[allVals.length - 1] ?? '–'} />
          <StatTile label="Hlasů" value={total} />
        </div>);

    }

    const range = question.max - question.min;
    const avgPct = (avg - question.min) / range * 100;
    const medPct = (median - question.min) / range * 100;
    return (
      <div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <StatTile label="Průměr" value={avg.toFixed(1)} />
          <StatTile label="Medián" value={median.toFixed(1)} accent />
          <StatTile label="Hlasů" value={total} />
        </div>
        <div style={{ position: 'relative', paddingTop: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${range + 1}, 1fr)`, gap: 4, alignItems: 'end', height: 100 }}>
            {Array.from({ length: range + 1 }, (_, i) => {
              const v = question.min + i;
              const n = results[v] || 0;
              return (
                <div key={v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--hm-mono)', color: n > 0 ? 'var(--hm-ink)' : 'transparent' }}>{n}</span>
                  <div style={{ width: '100%', height: `${n / max * 100}%`, background: 'var(--hm-primary)', borderRadius: '4px 4px 1px 1px', minHeight: n > 0 ? 4 : 0, transition: 'height .4s ease' }} />
                  <span style={{ fontSize: 11, fontFamily: 'var(--hm-mono)', color: 'var(--hm-muted)' }}>{v}</span>
                </div>);

            })}
          </div>
          {total > 0 &&
          <>
              <div style={{ position: 'absolute', left: `calc(${avgPct}% + ${100 / (range + 1) / 2}% - ${100 / (range + 1) / 2}%)`, top: 8, bottom: 18, width: 0, borderLeft: '2px dashed var(--hm-primary)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', left: `calc(${medPct}% + ${100 / (range + 1) / 2}% - ${100 / (range + 1) / 2}%)`, top: 8, bottom: 18, width: 0, borderLeft: '2px dashed var(--hm-accent)', pointerEvents: 'none' }} />
            </>
          }
        </div>
      </div>);

  }

  if (question.type === 'matrix') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {question.rows.map((row) => {
          const data = results[row];
          const avg = data.count ? data.sum / data.count : 0;
          const pct = (avg - question.min) / (question.max - question.min) * 100;
          return (
            <div key={row} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 50px', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{row}</span>
              <div style={{ height: 10, background: 'var(--hm-surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--hm-primary)', borderRadius: 999, transition: 'width .5s ease' }} />
              </div>
              <span style={{ fontFamily: 'var(--hm-mono)', fontWeight: 600, fontSize: 14, textAlign: 'right' }}>{avg.toFixed(1)}</span>
            </div>);

        })}
      </div>);

  }

  if (question.type === 'order') {
    const agg = aggregateOrder(question, results.rankings);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {agg.map((it, idx) =>
        <div key={it.option} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--hm-surface-2)', borderRadius: 10 }}>
            <span style={{ fontFamily: 'var(--hm-mono)', fontWeight: 600, color: 'var(--hm-accent)', width: 22 }}>{idx + 1}.</span>
            <span style={{ flex: 1, fontWeight: 500 }}>{it.option}</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--hm-mono)', color: 'var(--hm-muted)' }}>průměr {(it.avg + 1).toFixed(2)}</span>
          </div>
        )}
        {results.rankings.length === 0 && <span style={{ fontSize: 13, color: 'var(--hm-muted)' }}>Zatím žádné hlasy.</span>}
      </div>);

  }

  if (question.type === 'wordcloud') {
    const entries = Object.entries(results.words).sort((a, b) => b[1] - a[1]);
    const max = entries[0]?.[1] || 1;

    if (viewMode === 'list') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {entries.slice(0, 20).map(([w, n]) =>
          <div key={w} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--hm-surface-2)', borderRadius: 10 }}>
              <span style={{ fontWeight: 500 }}>{w}</span>
              <span style={{ fontFamily: 'var(--hm-mono)', color: 'var(--hm-muted)', fontSize: 13 }}>{n}×</span>
            </div>
          )}
          {entries.length === 0 && <span style={{ fontSize: 13, color: 'var(--hm-muted)' }}>Zatím žádná slova.</span>}
        </div>);

    }

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px', alignItems: 'baseline' }}>
        {entries.slice(0, 18).map(([w, n]) =>
        <span key={w} style={{
          fontFamily: 'var(--hm-display)',
          fontWeight: 600,
          fontSize: 14 + n / max * 22,
          color: n >= max * .66 ? 'var(--hm-primary)' : n >= max * .33 ? 'var(--hm-ink)' : 'var(--hm-muted)',
          letterSpacing: '-.01em'
        }}>{w}</span>
        )}
        {entries.length === 0 && <span style={{ fontSize: 13, color: 'var(--hm-muted)' }}>Zatím žádná slova.</span>}
      </div>);

  }

  if (question.type === 'emoji') {
    const total = Object.values(results).reduce((a, b) => a + b, 0) || 1;
    const items = question.options.map((o, i) => ({ ...o, i, n: results[i] || 0 }));
    if (viewMode === 'rank') {
      const sorted = [...items].sort((a, b) => b.n - a.n);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sorted.map((it, idx) =>
          <div key={it.i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: idx === 0 ? 'var(--hm-accent-soft)' : 'var(--hm-surface-2)', borderRadius: 10 }}>
              <span style={{ fontFamily: 'var(--hm-mono)', fontWeight: 600, color: 'var(--hm-muted)', width: 18 }}>{idx + 1}</span>
              <span style={{ fontSize: 24 }}>{it.e}</span>
              <span style={{ flex: 1, fontWeight: 500 }}>{it.label}</span>
              <span style={{ fontFamily: 'var(--hm-mono)', fontWeight: 600 }}>{it.n}</span>
              <span style={{ fontFamily: 'var(--hm-mono)', color: 'var(--hm-muted)', fontSize: 12, width: 40, textAlign: 'right' }}>{Math.round(it.n / total * 100)}%</span>
            </div>
          )}
        </div>);

    }
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 6)}, 1fr)`, gap: 8 }}>
        {items.map((o) =>
        <div key={o.i} style={{ textAlign: 'center', padding: '10px 4px', background: 'var(--hm-surface-2)', borderRadius: 10 }}>
            <div style={{ fontSize: 30 }}>{o.e}</div>
            <div style={{ fontFamily: 'var(--hm-mono)', fontWeight: 600, fontSize: 16, marginTop: 4 }}>{o.n}</div>
            <div style={{ fontSize: 11, color: 'var(--hm-muted)' }}>{Math.round(o.n / total * 100)}%</div>
            {showNames && <VoterChips votes={votes.filter((v) => v.vote === o.i)} compact />}
          </div>
        )}
      </div>);

  }

  return null;
}

function StatTile({ label, value, accent }) {
  return (
    <div style={{
      padding: '12px 16px',
      background: accent ? 'var(--hm-accent-soft)' : 'var(--hm-surface-2)',
      borderRadius: 14,
      flex: '1 1 100px',
      minWidth: 100
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: accent ? '#6E4A00' : 'var(--hm-muted)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--hm-mono)', fontWeight: 600, fontSize: 26, marginTop: 4, color: accent ? '#6E4A00' : 'var(--hm-ink)' }}>{value}</div>
    </div>);

}

function VoterChips({ votes, compact }) {
  if (!votes || votes.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: compact ? 6 : 8 }}>
      {votes.map((v, i) =>
      <span key={i} style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px 2px 2px',
        background: 'var(--hm-surface)',
        border: '1px solid var(--hm-line)',
        borderRadius: 999,
        fontSize: compact ? 10 : 11,
        color: 'var(--hm-ink-2)'
      }}>
          <span style={{
          width: compact ? 14 : 16, height: compact ? 14 : 16, borderRadius: 999,
          background: 'var(--hm-primary-soft)', color: 'var(--hm-primary-ink)',
          display: 'grid', placeItems: 'center',
          fontSize: 9, fontWeight: 600
        }}>{v.name.charAt(0).toUpperCase()}</span>
          {v.name}
        </span>
      )}
    </div>);

}

function YesNoDonut({ yes, no, total }) {
  const yesPct = yes / total * 100;
  const r = 56,c = 2 * Math.PI * r;
  const yesLen = yesPct / 100 * c;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '10px 0' }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--hm-danger-soft)" strokeWidth="22" />
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--hm-success)" strokeWidth="22"
        strokeDasharray={`${yesLen} ${c - yesLen}`} strokeDashoffset={c / 4} transform="rotate(-90 80 80)"
        style={{ transition: 'stroke-dasharray .6s ease' }} />
        <text x="80" y="78" textAnchor="middle" style={{ fontFamily: 'var(--hm-display)', fontWeight: 600, fontSize: 28, fill: 'var(--hm-ink)' }}>{Math.round(yesPct)}%</text>
        <text x="80" y="98" textAnchor="middle" style={{ fontSize: 12, fill: 'var(--hm-muted)' }}>ANO</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, background: 'var(--hm-success)', borderRadius: 3 }} />
          <b>ANO</b>
          <span style={{ fontFamily: 'var(--hm-mono)', color: 'var(--hm-muted)' }}>{yes} hlasů</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, background: 'var(--hm-danger)', borderRadius: 3 }} />
          <b>NE</b>
          <span style={{ fontFamily: 'var(--hm-mono)', color: 'var(--hm-muted)' }}>{no} hlasů</span>
        </span>
      </div>
    </div>);

}

function ChoiceDonut({ question, results, total, votes, showNames }) {
  const PALETTE = ['#5547FF', '#FFB23B', '#16A07A', '#E5484D', '#0EA5E9', '#9B59FF', '#F472B6', '#0E0E15'];
  let acc = 0;
  const r = 56,c = 2 * Math.PI * r;
  const segments = question.options.map((o, i) => {
    const n = results[i] || 0;
    const pct = n / total * 100;
    const len = pct / 100 * c;
    const seg = { o, i, n, pct, len, offset: acc };
    acc += len;
    return seg;
  });
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', padding: '10px 0' }}>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--hm-surface-2)" strokeWidth="22" />
        {segments.map((seg, i) =>
        <circle key={i} cx="80" cy="80" r={r} fill="none"
        stroke={PALETTE[i % PALETTE.length]} strokeWidth="22"
        strokeDasharray={`${seg.len} ${c - seg.len}`}
        strokeDashoffset={c / 4 - seg.offset} transform="rotate(-90 80 80)"
        style={{ transition: 'stroke-dasharray .6s ease' }} />
        )}
        <text x="80" y="80" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'var(--hm-mono)', fontWeight: 600, fontSize: 22, fill: 'var(--hm-ink)' }}>{total}</text>
        <text x="80" y="100" textAnchor="middle" style={{ fontSize: 11, fill: 'var(--hm-muted)' }}>hlasů</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {segments.map((seg) =>
        <div key={seg.i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ width: 10, height: 10, background: PALETTE[seg.i % PALETTE.length], borderRadius: 3, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{seg.o}</span>
            <span style={{ fontFamily: 'var(--hm-mono)', color: 'var(--hm-muted)' }}>{seg.n}</span>
            <span style={{ fontFamily: 'var(--hm-mono)', color: 'var(--hm-muted)', minWidth: 38, textAlign: 'right' }}>{Math.round(seg.pct)}%</span>
          </div>
        )}
      </div>
    </div>);

}

function ConnectedStudents({ session }) {
  const list = session.connected.slice(-12).reverse();
  return (
    <div className="hm-card" style={{ padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span className="hm-eyebrow">Připojení studenti</span>
        <span className="hm-chip">{session.connected.length}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {list.map((n, i) =>
        <span key={`${n}-${i}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px 4px 4px',
          background: 'var(--hm-surface-2)',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 500
        }}>
            <span style={{
            width: 20, height: 20, borderRadius: 999,
            background: 'var(--hm-primary-soft)', color: 'var(--hm-primary-ink)',
            display: 'grid', placeItems: 'center',
            fontSize: 10, fontWeight: 600
          }}>{n.charAt(0).toUpperCase()}</span>
            {n}
          </span>
        )}
        {session.connected.length > 12 &&
        <span className="hm-chip">+{session.connected.length - 12} dalších</span>
        }
      </div>
    </div>);

}

function TeacherView({ session, controller }) {
  const [modal, setModal] = useStateT(null);

  controller.openEdit = (id) => setModal({ mode: 'edit', id });

  function closeModal() {setModal(null);}
  function handleSave(data) {
    if (modal.mode === 'create') {
      const id = controller.addQuestion(data);
      controller.selectQuestion(id);
    } else {
      controller.updateQuestion(modal.id, data);
    }
    closeModal();
  }
  function handleSaveAndStart(data) {
    if (modal.mode === 'create') {
      const id = controller.addQuestion(data);
      controller.selectQuestion(id);
      setTimeout(() => controller.startVoting(), 50);
    } else {
      controller.updateQuestion(modal.id, data);
      controller.selectQuestion(modal.id);
      setTimeout(() => controller.startVoting(), 50);
    }
    closeModal();
  }

  return (
    <div className="hm-stage teacher">
      <div className="hm-teach">
        <div className="hm-teach-side">
          <SessionCard session={session} />
          <LibraryPanel session={session} controller={controller}
          onCreate={() => setModal({ mode: 'create' })} />
        </div>
        <div className="hm-teach-main">
          <ActiveQuestionPanel session={session} controller={controller} />
          <ConnectedStudents session={session} />
        </div>
      </div>
      {modal &&
      <QuestionEditor
        mode={modal.mode}
        initial={modal.mode === 'edit' ? session.questions.find((q) => q.id === modal.id) : null}
        onClose={closeModal}
        onSave={handleSave}
        onSaveAndStart={handleSaveAndStart} />
      }
    </div>);

}

Object.assign(window, { TeacherView, RESULT_VARIANTS, RESULT_VARIANT_LABELS });