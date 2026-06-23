// app.jsx — main app, session state, view switcher

const { useState, useEffect, useRef, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primary": "#5547FF",
  "accent": "#FFB23B",
  "view": "student",
  "autoSimulate": true,
  "showStudentResults": false
}/*EDITMODE-END*/;

function makeInitialSession() {
  const questions = SAMPLE_QUESTIONS;
  const results = {};
  const votes = {};
  questions.forEach(q => { results[q.id] = emptyResults(q); votes[q.id] = []; });
  return {
    pin: '472 819',
    questions,
    activeId: null,
    running: false,
    activeEnded: false,
    showOnProjector: false,
    showToStudents: false,
    showNames: false,
    showJoinOnProjector: true,
    viewMode: {},
    results,
    votes,
    studentVoted: {},
    connected: ['Eliška', 'Filip', 'Marek', 'Petra', 'Tomáš', 'Adam', 'Bára', 'Honza', 'Jana', 'Vojta', 'Šárka', 'Zuzka', 'Nikola', 'Ondra'],
  };
}

function useSession() {
  const [session, setSession] = useState(makeInitialSession);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const controller = useMemo(() => ({
    selectQuestion(id) {
      setSession(s => ({ ...s, activeId: id, running: false, activeEnded: false }));
    },
    startVoting() {
      setSession(s => {
        if (!s.activeId) return s;
        const q = s.questions.find(x => x.id === s.activeId);
        return {
          ...s,
          running: true,
          activeEnded: false,
          showOnProjector: false,
          showToStudents: false,
          showJoinOnProjector: true,
          results: { ...s.results, [s.activeId]: emptyResults(q) },
          votes: { ...s.votes, [s.activeId]: [] },
          studentVoted: { ...s.studentVoted, [s.activeId]: new Set() },
        };
      });
    },
    pause() { setSession(s => ({ ...s, running: false })); },
    resume() { setSession(s => ({ ...s, running: true })); },
    end() {
      setSession(s => ({ ...s, running: false, activeEnded: true, showOnProjector: true }));
    },
    deselect() {
      setSession(s => ({ ...s, activeId: null, running: false, activeEnded: false }));
    },
    setShowOnProjector(v) { setSession(s => ({ ...s, showOnProjector: v })); },
    setShowToStudents(v) { setSession(s => ({ ...s, showToStudents: v })); },
    setShowNames(v) { setSession(s => ({ ...s, showNames: v })); },
    setShowJoinOnProjector(v) { setSession(s => ({ ...s, showJoinOnProjector: v })); },
    setViewMode(qid, mode) { setSession(s => ({ ...s, viewMode: { ...s.viewMode, [qid]: mode } })); },
    submitVote(vote, name) {
      setSession(s => {
        if (!s.running || !s.activeId) return s;
        const q = s.questions.find(x => x.id === s.activeId);
        if (!q) return s;
        const voted = s.studentVoted[s.activeId] || new Set();
        if (name && voted.has(name)) return s;
        const r = applyVote(q, s.results[s.activeId], vote);
        const newLog = [...(s.votes[s.activeId] || []), { name: name || 'Anonym', vote, ts: Date.now() }];
        const newVoted = new Set(voted);
        if (name) newVoted.add(name);
        return {
          ...s,
          results: { ...s.results, [s.activeId]: r },
          votes: { ...s.votes, [s.activeId]: newLog },
          studentVoted: { ...s.studentVoted, [s.activeId]: newVoted },
        };
      });
    },
    botVote() {
      setSession(s => {
        if (!s.running || !s.activeId || s.activeEnded) return s;
        const q = s.questions.find(x => x.id === s.activeId);
        const voted = s.studentVoted[s.activeId] || new Set();
        const available = s.connected.filter(n => !voted.has(n));
        const cap = Math.max(1, Math.floor(s.connected.length * 0.9));
        if (voted.size >= cap || available.length === 0) return s;
        const name = available[Math.floor(Math.random()*available.length)];
        const vote = fakeVote(q);
        const r = applyVote(q, s.results[s.activeId], vote);
        const newLog = [...(s.votes[s.activeId] || []), { name, vote, ts: Date.now() }];
        const newVoted = new Set(voted);
        newVoted.add(name);
        return {
          ...s,
          results: { ...s.results, [s.activeId]: r },
          votes: { ...s.votes, [s.activeId]: newLog },
          studentVoted: { ...s.studentVoted, [s.activeId]: newVoted },
        };
      });
    },
    studentConnect(name) {
      setSession(s => s.connected.includes(name) ? s : ({ ...s, connected: [...s.connected, name] }));
    },
    addQuestion(q) {
      const id = `q-new-${Date.now()}`;
      const newQ = { ...q, id };
      setSession(s => ({
        ...s,
        questions: [...s.questions, newQ],
        results: { ...s.results, [id]: emptyResults(newQ) },
        votes: { ...s.votes, [id]: [] },
      }));
      return id;
    },
    updateQuestion(id, patch) {
      setSession(s => {
        const idx = s.questions.findIndex(q => q.id === id);
        if (idx < 0) return s;
        const updated = { ...s.questions[idx], ...patch };
        const qs = [...s.questions];
        qs[idx] = updated;
        return {
          ...s,
          questions: qs,
          results: { ...s.results, [id]: emptyResults(updated) },
          votes: { ...s.votes, [id]: [] },
        };
      });
    },
    deleteQuestion(id) {
      setSession(s => ({
        ...s,
        questions: s.questions.filter(q => q.id !== id),
        activeId: s.activeId === id ? null : s.activeId,
        running: s.activeId === id ? false : s.running,
      }));
    },
    moveQuestion(id, direction) {
      setSession(s => {
        const idx = s.questions.findIndex(q => q.id === id);
        if (idx < 0) return s;
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= s.questions.length) return s;
        const qs = [...s.questions];
        [qs[idx], qs[newIdx]] = [qs[newIdx], qs[idx]];
        return { ...s, questions: qs };
      });
    },
  }), []);

  return [session, controller];
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [session, controller] = useSession();
  const [view, setView] = useState('split');

  useEffect(() => {
    if (!t.autoSimulate) return;
    if (!session.running) return;
    const id = setInterval(() => {
      controller.botVote();
    }, 700 + Math.random()*900);
    return () => clearInterval(id);
  }, [session.running, t.autoSimulate, controller]);

  useEffect(() => {
    document.documentElement.style.setProperty('--hm-primary', t.primary);
    document.documentElement.style.setProperty('--hm-accent', t.accent);
  }, [t.primary, t.accent]);

  let body;
  if (view === 'split') {
    body = <SplitView session={session} controller={controller}/>;
  } else if (view === 'student') {
    body = <StudentView session={session} controller={controller}/>;
  } else if (view === 'teacher') {
    body = <TeacherView session={session} controller={controller}/>;
  } else if (view === 'projector') {
    body = <ProjectorView session={session}/>;
  }

  return (
    <div className="hm-app">
      <header className="hm-topbar">
        <div className="hm-logo">
          <div className="hm-logo-mark"><span>H</span></div>
          Hlasomat
        </div>
        <div className="hm-seg">
          <button data-active={view === 'student'} onClick={() => setView('student')}>
            <span className="hm-seg-icon">
              <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                <rect x="3.5" y="1" width="7" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                <circle cx="7" cy="11" r=".8" fill="currentColor"/>
              </svg>
            </span>
            Student
          </button>
          <button data-active={view === 'teacher'} onClick={() => setView('teacher')}>
            <span className="hm-seg-icon">
              <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M5 12.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </span>
            Učitel
          </button>
          <button data-active={view === 'projector'} onClick={() => setView('projector')}>
            <span className="hm-seg-icon">
              <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                <rect x="1" y="2.5" width="12" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M3 12.5l1.5-2.5M11 12.5L9.5 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </span>
            Projektor
          </button>
          <button data-active={view === 'split'} onClick={() => setView('split')}>
            <span className="hm-seg-icon">
              <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="4.5" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
            </span>
            Vše naráz
          </button>
        </div>
        <div className="hm-top-right">
          <span className="hm-pin-chip">
            <span className="dot"/>
            kód: <b>{session.pin}</b>
          </span>
        </div>
      </header>
      {body}

      <TweaksPanel>
        <TweakSection label="Pohled"/>
        <TweakSelect label="Aktivní pohled" value={view}
          options={[
            { value: 'split', label: 'Vše naráz (split)' },
            { value: 'student', label: 'Pouze student' },
            { value: 'teacher', label: 'Pouze učitel' },
            { value: 'projector', label: 'Pouze projektor' },
          ]}
          onChange={(v) => setView(v)}/>
        <TweakToggle label="Simulovat hlasy ostatních studentů" value={t.autoSimulate}
          onChange={(v) => setTweak('autoSimulate', v)}/>

        <TweakSection label="Spustit ukázku"/>
        {SAMPLE_QUESTIONS.map(q => (
          <TweakButton key={q.id}
            label={`${TYPE_META[q.type].label}`}
            onClick={() => { controller.selectQuestion(q.id); controller.startVoting(); }}/>
        ))}
        <TweakButton label="Ukončit & odhalit výsledky" secondary onClick={() => controller.end()}/>

        <TweakSection label="Barvy"/>
        <TweakColor label="Akcent" value={t.primary}
          options={['#5547FF', '#0EA5E9', '#16A07A', '#E5484D', '#F59E0B', '#0E0E15']}
          onChange={(v) => setTweak('primary', v)}/>
      </TweaksPanel>
    </div>
  );
}

function SplitView({ session, controller }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '380px 1fr',
      flex: 1,
      minHeight: 0,
      background: 'var(--hm-bg)',
    }}>
      <div style={{
        background: 'var(--hm-bg)',
        borderRight: '1px solid var(--hm-line)',
        padding: '20px 16px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        overflow: 'auto',
      }}>
        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: 11, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--hm-muted)' }}>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <rect x="3.5" y="1" width="7" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
          Studentský telefon
        </div>
        <div style={{ width: '100%', maxWidth: 340 }}>
          <StudentView session={session} controller={controller}/>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto' }}>
        <div style={{
          position: 'relative',
          height: 320,
          flexShrink: 0,
          overflow: 'hidden',
          background: '#0B0B12',
          borderBottom: '1px solid var(--hm-line)',
        }}>
          <div style={{
            position: 'absolute',
            top: 0, left: '50%',
            width: 1600, height: 900,
            transform: 'translateX(-50%) scale(0.30)',
            transformOrigin: 'top center',
            color: '#F5F2EB',
            pointerEvents: 'none',
          }}>
            {session.activeId
              ? <ProjectorQuestion session={session}/>
              : <ProjectorLobby session={session}/>}
          </div>
          <div style={{
            position: 'absolute', top: 14, right: 16,
            display: 'inline-flex', gap: 8, alignItems: 'center',
            padding: '6px 12px',
            background: 'rgba(255,255,255,.1)',
            backdropFilter: 'blur(8px)',
            borderRadius: 999,
            fontSize: 11, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,.85)',
            zIndex: 2,
          }}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2.5" width="12" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M3 12.5l1.5-2.5M11 12.5L9.5 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Projektor (živý náhled)
          </div>
        </div>

        <div style={{ padding: '18px 24px 28px', background: 'var(--hm-bg)' }}>
          <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: 11, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--hm-muted)', marginBottom: 14 }}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M5 12.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Učitelská konzole
          </div>
          <TeacherView session={session} controller={controller}/>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
