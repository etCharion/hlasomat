// student-view.jsx — student-facing phone screen

const { useState: useStateS, useEffect: useEffectS } = React;

function PhoneStatusBar() {
  return (
    <div className="hm-phone-statusbar">
      <span>9:41</span>
      <span className="right">
        <svg width="18" height="11" viewBox="0 0 18 11" fill="none">
          <rect x="0" y="6.5" width="3" height="4" rx=".6" fill="currentColor"/>
          <rect x="4.5" y="4.5" width="3" height="6" rx=".6" fill="currentColor"/>
          <rect x="9" y="2.5" width="3" height="8" rx=".6" fill="currentColor"/>
          <rect x="13.5" y="0" width="3" height="11" rx=".6" fill="currentColor"/>
        </svg>
        <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
          <path d="M7 3.2c1.9 0 3.7.7 5 2L13 4c-1.6-1.5-3.7-2.5-6-2.5S2.6 2.5 1 4L2 5.2c1.3-1.3 3.1-2 5-2z" fill="currentColor"/>
          <circle cx="7" cy="9" r="1.2" fill="currentColor"/>
        </svg>
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
          <rect x=".5" y=".5" width="20" height="11" rx="3" stroke="currentColor" opacity=".4"/>
          <rect x="2" y="2" width="17" height="8" rx="1.5" fill="currentColor"/>
          <path d="M22 4v4c.6-.2 1-.8 1-2s-.4-1.8-1-2z" fill="currentColor" opacity=".5"/>
        </svg>
      </span>
    </div>
  );
}

function StudentJoin({ session, onJoin }) {
  const [pin, setPin] = useStateS('');
  const [name, setName] = useStateS('');
  const [step, setStep] = useStateS(1);
  const correctPin = session.pin;
  const [error, setError] = useStateS('');

  function submitPin() {
    if (pin.replace(/\s/g, '') === correctPin.replace(/\s/g, '')) {
      setError('');
      setStep(2);
    } else {
      setError('Tento kód neexistuje. Zkus to znovu.');
    }
  }

  if (step === 1) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 28, flex: 1 }}>
        <span className="hm-eyebrow">Hlasomat</span>
        <h1 className="hm-h1">Připoj se k hlasování</h1>
        <p className="hm-lead">Zadej kód, který vidíš na tabuli, nebo nasměruj fotoaparát na QR kód.</p>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--hm-muted)' }}>6-místný kód</label>
          <input className="hm-input hm-pin"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g,'').slice(0,6))}/>
          {error && <span style={{ fontSize: 13, color: 'var(--hm-danger)' }}>{error}</span>}
          <span style={{ fontSize: 12, color: 'var(--hm-muted)' }}>
            Tip: zkus <code style={{ fontFamily: 'var(--hm-mono)', color: 'var(--hm-primary-ink)', background: 'var(--hm-primary-soft)', padding: '2px 6px', borderRadius: 4 }}>{correctPin}</code>
          </span>
        </div>
        <button className="hm-btn primary block lg" disabled={pin.length !== 6} onClick={submitPin}>
          Pokračovat
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--hm-muted)', fontSize: 13 }}>
          <div className="hm-divider" style={{ flex: 1 }}/>
          <span>nebo</span>
          <div className="hm-divider" style={{ flex: 1 }}/>
        </div>
        <button className="hm-btn ghost block" onClick={() => alert('Fotoaparát by se otevřel na reálném zařízení.')}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="11.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="1.5" y="11.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11.5 11.5h2v2M16.5 13v3.5h-3M11.5 16.5v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Naskenovat QR kód
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 28, flex: 1 }}>
      <span className="hm-eyebrow">Hlasomat · {correctPin}</span>
      <h1 className="hm-h1">Jak ti máme říkat?</h1>
      <p className="hm-lead">Jméno nebo přezdívka. Učitel ho uvidí ve výsledcích.</p>
      <input className="hm-input"
        autoFocus
        placeholder="Tvoje jméno"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onJoin(name.trim()); }}
        style={{ marginTop: 12 }}/>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="hm-btn primary block lg" disabled={!name.trim()} onClick={() => onJoin(name.trim())}>
          Vstoupit do hlasování
        </button>
        <button className="hm-btn ghost block" onClick={() => setStep(1)}>Zpět</button>
      </div>
    </div>
  );
}

function StudentLobby({ name, pendingQuestion }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--hm-primary-soft)', display: 'grid', placeItems: 'center', position: 'relative' }}>
          <span style={{ fontFamily: 'var(--hm-display)', fontWeight: 600, color: 'var(--hm-primary-ink)', fontSize: 24 }}>
            {(name || '?').charAt(0).toUpperCase()}
          </span>
          <span style={{ position: 'absolute', inset: -6, borderRadius: 999, border: '2px solid var(--hm-primary)', opacity: .25, animation: 'hm-pulse 1.6s infinite' }}/>
      </div>
      <div>
        <h2 className="hm-h2">Ahoj, {name || 'studente'}!</h2>
        <p className="hm-lead" style={{ marginTop: 6 }}>
          {pendingQuestion ? 'Učitel připravuje otázku…' : 'Čekáme, až učitel spustí otázku…'}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        {[0,1,2].map(i => (
          <span key={i} style={{
            width: 8, height: 8, borderRadius: 999, background: 'var(--hm-muted-2)',
            animation: `hm-pulse 1.4s ${i*.2}s infinite`,
          }}/>
        ))}
      </div>
    </div>
  );
}

function StudentVoted({ question, results, showResults, onLeave }) {
  const [localView, setLocalView] = useStateS(null);
  const variants = window.RESULT_VARIANTS?.[question.type] || [];
  const view = localView || variants[0];
  return (
    <div className="hm-voted">
      <div className="mark">
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
          <path d="M11 22l7 7 14-16" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="hm-h2">Hlas odeslán</h2>
      <p className="hm-lead">Tvůj hlas se započítal mezi ostatní.</p>
      {showResults ? (
        <div style={{ width: '100%', marginTop: 18, textAlign: 'left' }}>
          {variants.length > 1 && (
            <div style={{ display: 'inline-flex', background: 'var(--hm-surface-2)', borderRadius: 999, padding: 3, gap: 2, marginBottom: 12 }}>
              {variants.map(v => (
                <button key={v} onClick={() => setLocalView(v)}
                  style={{
                    border: 0,
                    background: view === v ? 'var(--hm-surface)' : 'transparent',
                    color: view === v ? 'var(--hm-ink)' : 'var(--hm-muted)',
                    padding: '5px 12px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 500,
                    boxShadow: view === v ? '0 1px 2px rgba(0,0,0,.08)' : 'none',
                    cursor: 'pointer',
                  }}>
                  {window.RESULT_VARIANT_LABELS?.[v] || v}
                </button>
              ))}
            </div>
          )}
          <StudentMiniResults question={question} results={results} viewMode={view}/>
        </div>
      ) : (
        <p style={{ fontSize: 12, color: 'var(--hm-muted)', marginTop: 4 }}>
          Výsledky uvidíš, až je učitel zobrazí.
        </p>
      )}
    </div>
  );
}

function StudentMiniResults({ question, results, viewMode }) {
  if (!results) return null;
  if (question.type === 'yesno') {
    const total = results.yes + results.no || 1;
    if (viewMode === 'donut') {
      const yesPct = (results.yes / total) * 100;
      const r = 44, c = 2 * Math.PI * r;
      const yesLen = (yesPct / 100) * c;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'center' }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--hm-danger-soft)" strokeWidth="18"/>
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--hm-success)" strokeWidth="18"
              strokeDasharray={`${yesLen} ${c - yesLen}`} strokeDashoffset={c/4} transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray .6s ease' }}/>
            <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'var(--hm-display)', fontWeight: 600, fontSize: 22, fill: 'var(--hm-ink)' }}>{Math.round(yesPct)}%</text>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, background: 'var(--hm-success)', borderRadius: 3 }}/>
              <b>ANO</b> <span style={{ color: 'var(--hm-muted)' }}>{results.yes}</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, background: 'var(--hm-danger)', borderRadius: 3 }}/>
              <b>NE</b> <span style={{ color: 'var(--hm-muted)' }}>{results.no}</span>
            </span>
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="hm-bar-row" data-kind="yes">
          <div className="top"><b>ANO</b><span className="pct">{Math.round(results.yes/total*100)}%</span></div>
          <div className="track"><div className="fill" style={{ width: `${results.yes/total*100}%` }}/></div>
        </div>
        <div className="hm-bar-row" data-kind="no">
          <div className="top"><b>NE</b><span className="pct">{Math.round(results.no/total*100)}%</span></div>
          <div className="track"><div className="fill" style={{ width: `${results.no/total*100}%` }}/></div>
        </div>
      </div>
    );
  }
  if (question.type === 'choice') {
    const total = Object.values(results).reduce((a,b)=>a+b,0) || 1;
    const sorted = viewMode === 'hbars'
      ? question.options.map((o, i) => ({ o, i, n: results[i] || 0 })).sort((a,b) => b.n - a.n)
      : question.options.map((o, i) => ({ o, i, n: results[i] || 0 }));
    return (
      <div>
        {sorted.map(({ o, i, n }, idx) => (
          <div key={i} className="hm-bar-row">
            <div className="top"><b>{viewMode === 'hbars' && <span style={{ fontFamily: 'var(--hm-mono)', color: 'var(--hm-muted)', marginRight: 6 }}>{idx+1}.</span>}{o}</b><span className="pct">{Math.round(n/total*100)}%</span></div>
            <div className="track"><div className="fill" style={{ width: `${n/total*100}%` }}/></div>
          </div>
        ))}
      </div>
    );
  }
  if (question.type === 'emoji') {
    const total = Object.values(results).reduce((a,b)=>a+b,0) || 1;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-around', gap: 8 }}>
        {question.options.map((o, i) => {
          const n = results[i] || 0;
          return (
            <div key={i} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 30 }}>{o.e}</div>
              <div style={{ fontFamily: 'var(--hm-mono)', fontWeight: 600, fontSize: 14, marginTop: 4 }}>{n}</div>
              <div style={{ fontSize: 11, color: 'var(--hm-muted)' }}>{Math.round(n/total*100)}%</div>
            </div>
          );
        })}
      </div>
    );
  }
  return <p className="hm-lead" style={{ fontSize: 13 }}>Výsledky se zobrazují na tabuli.</p>;
}

function StudentVotingScreen({ question, onSubmit, voteCount, totalConnected }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 18, flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="hm-chip primary">
          <TypeIcon type={question.type} size={12}/>
          {TYPE_META[question.type].label}
        </span>
        <span className="hm-chip">{voteCount} / {totalConnected} hlasovalo</span>
      </div>
      <h2 className="hm-h2" style={{ fontSize: 24 }}>{question.q}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'flex-start', gap: 4 }}>
        <StudentWidget question={question} onSubmit={onSubmit}/>
      </div>
    </div>
  );
}

function StudentView({ session, controller }) {
  const [name, setName] = useStateS('');
  const [joined, setJoined] = useStateS(false);
  const [hasVoted, setHasVoted] = useStateS(false);

  useEffectS(() => {
    setHasVoted(false);
  }, [session.activeId, session.running && session.activeId]);

  function handleSubmit(vote) {
    controller.submitVote(vote, name);
    setHasVoted(true);
  }

  let body;
  if (!joined) {
    body = <StudentJoin session={session} onJoin={(n) => { setName(n); setJoined(true); controller.studentConnect(n); }}/>;
  } else if (!session.activeId || !session.running) {
    body = <StudentLobby name={name} pendingQuestion={!!session.activeId && !session.running}/>;
  } else if (hasVoted) {
    const q = session.questions.find(q => q.id === session.activeId);
    body = <StudentVoted
      question={q}
      results={session.results[session.activeId]}
      showResults={session.showToStudents}/>;
  } else {
    const q = session.questions.find(q => q.id === session.activeId);
    const r = session.results[session.activeId];
    body = <StudentVotingScreen
      question={q}
      onSubmit={handleSubmit}
      voteCount={totalVoters(q, r)}
      totalConnected={session.connected.length}/>;
  }

  return (
    <div className="hm-stage student">
      <div className="hm-phone">
        <PhoneStatusBar/>
        <div className="hm-phone-body">{body}</div>
        <div className="hm-phone-home"/>
      </div>
    </div>
  );
}

Object.assign(window, { StudentView, StudentJoin, StudentLobby, StudentVotingScreen, StudentVoted, PhoneStatusBar });
