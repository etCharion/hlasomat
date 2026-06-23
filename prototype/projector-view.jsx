// projector-view.jsx — full-screen projector display

function BigQR() {
  const cells = [];
  let r = 0x4f1;
  for (let i = 0; i < 25 * 25; i++) {
    r = (r * 9301 + 49297) % 233280;
    cells.push(r / 233280 > 0.5);
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

function ProjectorLobby({ session }) {
  return (
    <div className="hm-proj">
      <div className="hm-proj-head">
        <div className="meta">
          <span className="eyebrow">Hlasomat · čeká na hlasování</span>
        </div>
        <div className="count">
          <span style={{ width: 8, height: 8, borderRadius: 999, background: '#4ADE80', boxShadow: '0 0 0 4px rgba(74,222,128,.2)' }} />
          {session.connected.length} {session.connected.length === 1 ? 'student' : session.connected.length >= 2 && session.connected.length <= 4 ? 'studenti' : 'studentů'} připojeno
        </div>
      </div>

      <div className="hm-proj-lobby">
        <div className="hm-proj-pin-block">
          <div>
            <div style={{ fontSize: 22, color: 'rgba(245,242,235,.6)', marginBottom: 6 }}>Připoj se ze svého zařízení</div>
            <div style={{ fontSize: 28, color: 'rgba(245,242,235,.7)', fontFamily: 'var(--hm-mono)' }}>
              hlasomat.app
            </div>
          </div>
          <div>
            <div style={{ fontSize: 16, color: 'rgba(245,242,235,.5)', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 8 }}>
              Kód
            </div>
            <div className="hm-proj-pin">{session.pin}</div>
          </div>

          {session.connected.length > 0 &&
          <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 14, color: 'rgba(245,242,235,.5)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 12 }}>
                Už jsou tu
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {session.connected.slice(-18).map((n, i) =>
              <span key={`${n}-${i}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 14px 8px 8px',
                background: 'rgba(255,255,255,.06)',
                borderRadius: 999,
                fontSize: 18,
                fontWeight: 500,
                animation: 'hm-pop .35s ease-out both'
              }}>
                    <span style={{
                  width: 26, height: 26, borderRadius: 999,
                  background: 'var(--hm-primary)', color: '#fff',
                  display: 'grid', placeItems: 'center',
                  fontSize: 13, fontWeight: 600
                }}>{n.charAt(0).toUpperCase()}</span>
                    {n}
                  </span>
              )}
              </div>
            </div>
          }
        </div>

        <div className="hm-proj-qr-block">
          <div style={{ background: '#fff', padding: 18, borderRadius: 28 }}>
            <BigQR />
          </div>
          <div className="url">Naskenuj kód</div>
        </div>
      </div>
    </div>);

}

function PResYesNo({ question, results, viewMode }) {
  const total = results.yes + results.no || 1;
  if (viewMode === 'donut') {
    const yesPct = results.yes / total * 100;
    const r = 110,c = 2 * Math.PI * r;
    const yesLen = yesPct / 100 * c;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 80, padding: '20px 0', justifyContent: 'center' }}>
        <svg width="320" height="320" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r={r} fill="none" stroke="rgba(229,72,77,.3)" strokeWidth="44" />
          <circle cx="160" cy="160" r={r} fill="none" stroke="#34D399" strokeWidth="44"
          strokeDasharray={`${yesLen} ${c - yesLen}`} strokeDashoffset={c / 4} transform="rotate(-90 160 160)"
          style={{ transition: 'stroke-dasharray .8s ease' }} />
          <text x="160" y="158" textAnchor="middle" style={{ fontFamily: 'var(--hm-display)', fontWeight: 600, fontSize: 78, fill: '#fff' }}>{Math.round(yesPct)}%</text>
          <text x="160" y="200" textAnchor="middle" style={{ fontSize: 18, fill: 'rgba(245,242,235,.6)', letterSpacing: '.16em', textTransform: 'uppercase' }}>ANO</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontSize: 28 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 18, height: 18, background: '#34D399', borderRadius: 4 }} />
            <b>ANO</b>
            <span style={{ fontFamily: 'var(--hm-mono)', color: 'rgba(245,242,235,.65)' }}>{results.yes}</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 18, height: 18, background: 'var(--hm-danger)', borderRadius: 4 }} />
            <b>NE</b>
            <span style={{ fontFamily: 'var(--hm-mono)', color: 'rgba(245,242,235,.65)' }}>{results.no}</span>
          </span>
        </div>
      </div>);

  }
  return (
    <div>
      <div className="hm-proj-bar" data-kind="yes">
        <div className="label">ANO</div>
        <div className="track-wrap">
          <div className="track"><div className="fill" style={{ width: `${results.yes / total * 100}%` }} /></div>
        </div>
        <div className="pct">{Math.round(results.yes / total * 100)}% · {results.yes}</div>
      </div>
      <div className="hm-proj-bar" data-kind="no">
        <div className="label">NE</div>
        <div className="track-wrap">
          <div className="track"><div className="fill" style={{ width: `${results.no / total * 100}%` }} /></div>
        </div>
        <div className="pct">{Math.round(results.no / total * 100)}% · {results.no}</div>
      </div>
    </div>);

}

function PResChoice({ question, results, viewMode }) {
  const total = Object.values(results).reduce((a, b) => a + b, 0) || 1;
  const PALETTE = ['#5547FF', '#FFB23B', '#16A07A', '#E5484D', '#0EA5E9', '#9B59FF', '#F472B6', '#FFFFFF'];

  if (viewMode === 'donut') {
    let acc = 0;
    const r = 110,c = 2 * Math.PI * r;
    const segments = question.options.map((o, i) => {
      const n = results[i] || 0;
      const pct = n / total * 100;
      const len = pct / 100 * c;
      const seg = { o, i, n, pct, len, offset: acc };
      acc += len;
      return seg;
    });
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 60, padding: '20px 0', justifyContent: 'center' }}>
        <svg width="320" height="320" viewBox="0 0 320 320" style={{ flexShrink: 0 }}>
          <circle cx="160" cy="160" r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="44" />
          {segments.map((seg, i) =>
          <circle key={i} cx="160" cy="160" r={r} fill="none"
          stroke={PALETTE[i % PALETTE.length]} strokeWidth="44"
          strokeDasharray={`${seg.len} ${c - seg.len}`}
          strokeDashoffset={c / 4 - seg.offset} transform="rotate(-90 160 160)"
          style={{ transition: 'stroke-dasharray .8s ease' }} />
          )}
          <text x="160" y="160" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'var(--hm-mono)', fontWeight: 600, fontSize: 56, fill: '#fff' }}>{total}</text>
          <text x="160" y="200" textAnchor="middle" style={{ fontSize: 16, fill: 'rgba(245,242,235,.5)' }}>hlasů</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, maxWidth: 580 }}>
          {segments.map((seg) =>
          <div key={seg.i} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 22 }}>
              <span style={{ width: 16, height: 16, background: PALETTE[seg.i % PALETTE.length], borderRadius: 4, flexShrink: 0 }} />
              <span style={{ flex: 1, fontFamily: 'var(--hm-display)', fontWeight: 600 }}>{seg.o}</span>
              <span style={{ fontFamily: 'var(--hm-mono)', color: 'rgba(245,242,235,.65)' }}>{seg.n}</span>
              <span style={{ fontFamily: 'var(--hm-mono)', color: 'rgba(245,242,235,.85)', minWidth: 70, textAlign: 'right' }}>{Math.round(seg.pct)}%</span>
            </div>
          )}
        </div>
      </div>);

  }

  const sorted = viewMode === 'hbars' ?
  question.options.map((o, i) => ({ o, i, n: results[i] || 0 })).sort((a, b) => b.n - a.n) :
  question.options.map((o, i) => ({ o, i, n: results[i] || 0 }));

  return (
    <div>
      {sorted.map(({ o, i, n }, idx) =>
      <div key={i} className="hm-proj-bar">
          <div className="label">
            {viewMode === 'hbars' && <span style={{ color: 'var(--hm-accent)', marginRight: 14, fontFamily: 'var(--hm-mono)' }}>{idx + 1}.</span>}
            {o}
          </div>
          <div className="track-wrap">
            <div className="track"><div className="fill" style={{ width: `${n / total * 100}%` }} /></div>
          </div>
          <div className="pct">{Math.round(n / total * 100)}% · {n}</div>
        </div>
      )}
    </div>);

}

function PResScale({ question, results, viewMode }) {
  const total = Object.values(results).reduce((a, b) => a + b, 0) || 1;
  const allVals = [];
  Object.entries(results).forEach(([k, v]) => {for (let i = 0; i < v; i++) allVals.push(Number(k));});
  allVals.sort((a, b) => a - b);
  const sum = allVals.reduce((a, b) => a + b, 0);
  const avg = allVals.length ? sum / allVals.length : 0;
  const median = allVals.length ?
  allVals.length % 2 === 0 ?
  (allVals[allVals.length / 2 - 1] + allVals[allVals.length / 2]) / 2 :
  allVals[Math.floor(allVals.length / 2)] :
  0;
  const max = Math.max(1, ...Object.values(results));
  const range = question.max - question.min;
  const avgPct = (avg - question.min) / range * 100;
  const medPct = (median - question.min) / range * 100;

  if (viewMode === 'summary') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24, padding: '40px 0' }}>
        <BigStat label="Průměr" value={avg.toFixed(1)} />
        <BigStat label="Medián" value={median.toFixed(1)} accent />
        <BigStat label="Minimum" value={allVals[0] ?? '–'} />
        <BigStat label="Maximum" value={allVals[allVals.length - 1] ?? '–'} />
        <BigStat label="Hlasů" value={total} />
      </div>);

  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 36, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontSize: 16, color: 'rgba(245,242,235,.55)', letterSpacing: '.14em', textTransform: 'uppercase' }}>Průměr</span>
          <span style={{ fontFamily: 'var(--hm-mono)', fontWeight: 600, fontSize: 56, color: '#fff' }}>{avg.toFixed(1)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontSize: 16, color: 'var(--hm-accent)', letterSpacing: '.14em', textTransform: 'uppercase' }}>Medián</span>
          <span style={{ fontFamily: 'var(--hm-mono)', fontWeight: 600, fontSize: 56, color: 'var(--hm-accent)' }}>{median.toFixed(1)}</span>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 18, color: 'rgba(245,242,235,.5)' }}>{total} hlasů</span>
      </div>
      <div style={{ position: 'relative' }}>
        <div className="hm-proj-hist">
          {Array.from({ length: question.max - question.min + 1 }, (_, i) => {
            const v = question.min + i;
            const n = results[v] || 0;
            return (
              <div key={v} className="col">
                <span className="num">{n}</span>
                <div className="bar" style={{ height: `${n / max * 92}%`, minHeight: n > 0 ? 12 : 4 }} />
                <span className="tick">{v}</span>
              </div>);

          })}
        </div>
        {total > 0 &&
        <>
            <ScaleMarker pct={avgPct} color="var(--hm-primary)" label="ø" labelTop />
            <ScaleMarker pct={medPct} color="var(--hm-accent)" label="med" />
          </>
        }
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 18, color: 'rgba(245,242,235,.55)' }}>
        <span>{question.lo}</span>
        <span>{question.hi}</span>
      </div>
    </div>);

}

function ScaleMarker({ pct, color, label, labelTop }) {
  return (
    <div style={{
      position: 'absolute', top: 30, bottom: 28,
      left: `calc(${pct}% )`,
      width: 0,
      borderLeft: `2px dashed ${color}`,
      pointerEvents: 'none'
    }}>
      <span style={{
        position: 'absolute',
        [labelTop ? 'top' : 'bottom']: -4,
        left: 4,
        fontFamily: 'var(--hm-mono)',
        fontSize: 12,
        fontWeight: 600,
        color,
        background: '#0B0B12',
        padding: '2px 6px',
        borderRadius: 6,
        whiteSpace: 'nowrap'
      }}>{label}</span>
    </div>);

}

function BigStat({ label, value, accent }) {
  return (
    <div style={{
      padding: '28px 20px',
      background: accent ? 'rgba(255,178,59,.15)' : 'rgba(255,255,255,.05)',
      borderRadius: 22,
      border: accent ? '1px solid rgba(255,178,59,.3)' : '1px solid rgba(255,255,255,.08)',
      display: 'flex', flexDirection: 'column', gap: 10,
      alignItems: 'flex-start'
    }}>
      <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: accent ? 'var(--hm-accent)' : 'rgba(245,242,235,.55)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--hm-mono)', fontWeight: 600, fontSize: 64, color: accent ? 'var(--hm-accent)' : '#fff', lineHeight: 1 }}>{value}</span>
    </div>);

}

function PResMatrix({ question, results }) {
  return (
    <div className="hm-proj-matrix">
      {question.rows.map((row) => {
        const data = results[row];
        const avg = data.count ? data.sum / data.count : 0;
        const pct = (avg - question.min) / (question.max - question.min) * 100;
        return (
          <div key={row} className="row">
            <div className="label">{row}</div>
            <div className="track-mini"><div className="fill-mini" style={{ width: `${pct}%` }} /></div>
            <div className="val">{avg.toFixed(1)}</div>
          </div>);

      })}
    </div>);

}

function PResOrder({ question, results }) {
  const agg = aggregateOrder(question, results.rankings);
  if (agg.length === 0 || results.rankings.length === 0) {
    return <p style={{ fontSize: 22, color: 'rgba(245,242,235,.5)' }}>Zatím nikdo nehlasoval…</p>;
  }
  return (
    <div className="hm-proj-order">
      {agg.map((it, idx) =>
      <div key={it.option} className="row" style={{ animationDelay: `${idx * .05}s`, animation: 'hm-fade-up .4s ease-out both' }}>
          <div className="rank">{idx + 1}.</div>
          <div className="label">{it.option}</div>
          <div className="score">průměrná pozice {(it.avg + 1).toFixed(2)}</div>
        </div>
      )}
    </div>);

}

function PResWordcloud({ question, results, viewMode }) {
  const entries = Object.entries(results.words).sort((a, b) => b[1] - a[1]).slice(0, 30);
  if (entries.length === 0) {
    return <p style={{ fontSize: 22, color: 'rgba(245,242,235,.5)' }}>Čekáme na slova…</p>;
  }
  const max = entries[0][1];

  if (viewMode === 'list') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {entries.slice(0, 16).map(([w, n], i) =>
        <div key={w} style={{
          display: 'flex', alignItems: 'center', gap: 18,
          padding: '18px 24px',
          background: 'rgba(255,255,255,.04)',
          borderRadius: 16
        }}>
            <span style={{ fontFamily: 'var(--hm-mono)', fontSize: 18, color: 'rgba(245,242,235,.5)', width: 30 }}>{i + 1}</span>
            <span style={{ fontFamily: 'var(--hm-display)', fontWeight: 600, fontSize: 28, flex: 1 }}>{w}</span>
            <span style={{ fontFamily: 'var(--hm-mono)', fontWeight: 600, fontSize: 22, color: 'var(--hm-accent)' }}>{n}×</span>
          </div>
        )}
      </div>);

  }

  return (
    <div className="hm-proj-cloud" style={{ minHeight: 280 }}>
      {entries.map(([w, n], i) => {
        const intensity = n / max;
        const size = 32 + intensity * 80;
        const opacity = 0.55 + intensity * 0.45;
        const color = intensity > 0.66 ? '#fff' :
        intensity > 0.33 ? 'var(--hm-accent)' :
        'rgba(245,242,235,.7)';
        return (
          <span key={w} className="word" style={{
            fontSize: size,
            opacity,
            color,
            animationDelay: `${i * .03}s`
          }}>{w}</span>);

      })}
    </div>);

}

function PResEmoji({ question, results, viewMode }) {
  const total = Object.values(results).reduce((a, b) => a + b, 0) || 1;
  const max = Math.max(1, ...Object.values(results));
  const items = question.options.map((o, i) => ({ ...o, i, n: results[i] || 0 }));

  if (viewMode === 'rank') {
    const sorted = [...items].sort((a, b) => b.n - a.n);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {sorted.map((it, idx) =>
        <div key={it.i} style={{
          display: 'grid', gridTemplateColumns: '60px 80px 1fr 100px 140px',
          alignItems: 'center', gap: 24,
          padding: '18px 24px',
          background: idx === 0 ? 'rgba(255,178,59,.15)' : 'rgba(255,255,255,.04)',
          borderRadius: 18,
          border: idx === 0 ? '1px solid rgba(255,178,59,.3)' : 'none'
        }}>
            <span style={{ fontFamily: 'var(--hm-mono)', fontWeight: 600, fontSize: 32, color: idx === 0 ? 'var(--hm-accent)' : 'rgba(245,242,235,.5)' }}>{idx + 1}</span>
            <span style={{ fontSize: 56, lineHeight: 1 }}>{it.e}</span>
            <span style={{ fontFamily: 'var(--hm-display)', fontWeight: 600, fontSize: 28 }}>{it.label}</span>
            <span style={{ fontFamily: 'var(--hm-mono)', fontWeight: 600, fontSize: 28, textAlign: 'right' }}>{it.n}</span>
            <span style={{ fontFamily: 'var(--hm-mono)', fontSize: 20, color: 'rgba(245,242,235,.6)', textAlign: 'right' }}>{Math.round(it.n / total * 100)}%</span>
          </div>
        )}
      </div>);

  }

  return (
    <div className="hm-proj-emo">
      {question.options.map((o, i) => {
        const n = results[i] || 0;
        return (
          <div key={i} className="cell">
            <div className="em">{o.e}</div>
            <div className="num">{n}</div>
            <div className="bar"><div className="f" style={{ width: `${n / max * 100}%` }} /></div>
            <div style={{ fontSize: 14, color: 'rgba(245,242,235,.5)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{o.label}</div>
          </div>);

      })}
    </div>);

}

function ProjectorQuestion({ session }) {
  const q = session.questions.find((x) => x.id === session.activeId);
  const r = session.results[session.activeId];
  const voted = totalVoters(q, r);
  const total = session.connected.length;
  const pct = total > 0 ? voted / total * 100 : 0;
  const viewMode = session.viewMode[q.id];

  const components = {
    yesno: PResYesNo,
    choice: PResChoice,
    scale: PResScale,
    matrix: PResMatrix,
    order: PResOrder,
    wordcloud: PResWordcloud,
    emoji: PResEmoji
  };
  const C = components[q.type];
  const revealResults = session.showOnProjector || session.activeEnded;

  return (
    <div className="hm-proj">
      <div className="hm-proj-head">
        <div className="meta">
          <span className="eyebrow">
            <TypeIcon type={q.type} size={14} />
            <span style={{ marginLeft: 8 }}>{TYPE_META[q.type].label}</span>
            {!session.running && !session.activeEnded && <span style={{ marginLeft: 12, color: 'var(--hm-accent)' }}>· ČEKÁ NA SPUTŠTĚJÍ</span>}
            {!session.running && session.activeEnded && <span style={{ marginLeft: 12, color: 'var(--hm-accent)' }}>· UZAVŘENO</span>}
          </span>
        </div>
        <div className="count">
          <span style={{ width: 8, height: 8, borderRadius: 999, background: session.running ? '#4ADE80' : '#9CA3AF', boxShadow: session.running ? '0 0 0 4px rgba(74,222,128,.2)' : 'none', animation: session.running ? 'hm-pulse 1.4s infinite' : 'none' }} />
          {voted}<span style={{ color: 'rgba(245,242,235,.4)' }}>/{total}</span> hlasovalo
        </div>
      </div>

      <h1 className="hm-proj-q">{q.q}</h1>

      <div style={{ height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--hm-primary), #8B7CFF)', width: `${pct}%`, transition: 'width .8s cubic-bezier(.2,.7,.2,1)' }} />
      </div>

      <div className="hm-proj-body">
        {revealResults ?
        C ? <C question={q} results={r} viewMode={viewMode} /> : null :

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 56, padding: '40px 0', flexWrap: 'wrap' }}>
            <div style={{
              background: '#fff',
              padding: 18,
              borderRadius: 28,
              width: 280, height: 280,
              flexShrink: 0,
            }}>
              <BigQR/>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 22, color: 'rgba(245,242,235,.55)', letterSpacing: '.16em', textTransform: 'uppercase' }}>
                {session.running ? 'Hlasujte na svém zařízení' : 'Otázka se připravuje'}
              </div>
              <div style={{ fontFamily: 'var(--hm-mono)', fontSize: 22, color: 'rgba(245,242,235,.7)' }}>
                hlasomat.app
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(245,242,235,.45)', marginTop: 8 }}>
                Kód
              </div>
              <div style={{
                fontFamily: 'var(--hm-mono)', fontSize: 110, fontWeight: 600,
                color: '#fff',
                letterSpacing: '.08em',
                lineHeight: 1,
              }}>
                {session.pin}
              </div>
              <div style={{ fontSize: 16, color: 'rgba(245,242,235,.5)', marginTop: 10 }}>
                Připojeno {session.connected.length} studentů
              </div>
            </div>
          </div>
        }
      </div>

      {session.running && revealResults && session.showJoinOnProjector !== false &&
      <div style={{
        position: 'absolute', right: 56, bottom: 48,
        display: 'flex', alignItems: 'center', gap: 20,
        padding: '16px 22px 16px 16px',
        background: 'rgba(255,255,255,.06)',
        border: '1px solid rgba(255,255,255,.12)',
        borderRadius: 22,
        backdropFilter: 'blur(12px)',
        zIndex: 5
      }}>
          <div style={{ background: '#fff', padding: 8, borderRadius: 12, width: 120, height: 120 }}>
            <BigQR />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(245,242,235,.5)' }}>
              Přidej se · kód
            </span>
            <span style={{ fontFamily: 'var(--hm-mono)', fontSize: 42, fontWeight: 600, color: '#fff', letterSpacing: '.08em', lineHeight: 1 }}>
              {session.pin}
            </span>
            <span style={{ fontFamily: 'var(--hm-mono)', fontSize: 14, color: 'rgba(245,242,235,.5)', marginTop: 2 }}>
              hlasomat.app
            </span>
          </div>
        </div>
      }
    </div>);

}

function ProjectorView({ session }) {
  return (
    <div className="hm-stage projector">
      {session.activeId ?
      <ProjectorQuestion session={session} /> :
      <ProjectorLobby session={session} />}
    </div>);

}

Object.assign(window, { ProjectorView, ProjectorQuestion, ProjectorLobby });