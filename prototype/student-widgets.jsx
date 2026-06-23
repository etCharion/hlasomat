// student-widgets.jsx — voting widgets for each question type (student side)

const { useState, useRef, useEffect } = React;

// ─── YES / NO
function StudentYesNo({ question, onSubmit }) {
  return (
    <>
      <div className="hm-yesno">
        <button data-kind="yes" onClick={() => onSubmit('yes')}>
          <span className="icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14l5 5 11-12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          ANO
        </button>
        <button data-kind="no" onClick={() => onSubmit('no')}>
          <span className="icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M7 7l14 14M21 7L7 21" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </span>
          NE
        </button>
      </div>
    </>
  );
}

// ─── Single choice
function StudentChoice({ question, onSubmit }) {
  const [sel, setSel] = useState(null);
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  return (
    <>
      <div className="hm-vote-options">
        {question.options.map((opt, i) => (
          <button
            key={i}
            className="hm-vote-opt"
            data-selected={sel === i}
            onClick={() => setSel(i)}>
            <span className="letter">{letters[i]}</span>
            <span>{opt}</span>
          </button>
        ))}
      </div>
      <button className="hm-btn primary block lg" disabled={sel === null}
        onClick={() => onSubmit(sel)}
        style={{ marginTop: 16 }}>
        Odeslat hlas
      </button>
    </>
  );
}

// ─── Ordering — drag & drop
function StudentOrder({ question, onSubmit }) {
  const [items, setItems] = useState(question.options.map((o, i) => ({ id: i, label: o })));
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragY, setDragY] = useState(0);
  const startRef = useRef({ y: 0, idx: 0, originalItems: null });
  const itemHeight = 56;

  function handleStart(idx, e) {
    const point = e.touches ? e.touches[0] : e;
    startRef.current = { y: point.clientY, idx, originalItems: [...items] };
    setDraggingIdx(idx);
    setDragY(0);
    e.preventDefault();
  }
  function handleMove(e) {
    if (draggingIdx === null) return;
    const point = e.touches ? e.touches[0] : e;
    const dy = point.clientY - startRef.current.y;
    setDragY(dy);
    const offset = Math.round(dy / itemHeight);
    const newIdx = Math.max(0, Math.min(items.length - 1, startRef.current.idx + offset));
    if (newIdx !== draggingIdx) {
      const arr = [...startRef.current.originalItems];
      const [moved] = arr.splice(startRef.current.idx, 1);
      arr.splice(newIdx, 0, moved);
      setItems(arr);
      setDraggingIdx(newIdx);
    }
  }
  function handleEnd() {
    setDraggingIdx(null);
    setDragY(0);
  }
  useEffect(() => {
    if (draggingIdx === null) return;
    const m = (e) => handleMove(e);
    const u = () => handleEnd();
    window.addEventListener('mousemove', m);
    window.addEventListener('mouseup', u);
    window.addEventListener('touchmove', m, { passive: false });
    window.addEventListener('touchend', u);
    return () => {
      window.removeEventListener('mousemove', m);
      window.removeEventListener('mouseup', u);
      window.removeEventListener('touchmove', m);
      window.removeEventListener('touchend', u);
    };
  }, [draggingIdx, items]);

  return (
    <>
      <p className="hm-lead" style={{ fontSize: 13, marginBottom: 8 }}>
        Podrž a táhni pro přesun. Nahoře = nejlepší.
      </p>
      <div className="hm-order-list">
        {items.map((it, i) => {
          const isDragging = draggingIdx === i;
          return (
            <div key={it.id}
              className="hm-order-item"
              data-dragging={isDragging}
              style={isDragging ? { transform: `translateY(${dragY % itemHeight}px) scale(1.02)` } : {}}
              onMouseDown={(e) => handleStart(i, e)}
              onTouchStart={(e) => handleStart(i, e)}>
              <span className="rank">{i + 1}</span>
              <span>{it.label}</span>
              <span className="grip">⋮⋮</span>
            </div>
          );
        })}
      </div>
      <button className="hm-btn primary block lg" onClick={() => onSubmit(items.map(it => it.id))}
        style={{ marginTop: 16 }}>
        Potvrdit pořadí
      </button>
    </>
  );
}

// ─── Scale slider
function StudentScale({ question, onSubmit }) {
  const [val, setVal] = useState(Math.round((question.min + question.max) / 2));
  const trackRef = useRef(null);
  const dragRef = useRef(false);

  function setFromPoint(clientX) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const v = Math.round(question.min + pct * (question.max - question.min));
    setVal(v);
  }
  function onDown(e) {
    dragRef.current = true;
    const p = e.touches ? e.touches[0] : e;
    setFromPoint(p.clientX);
    e.preventDefault();
  }
  useEffect(() => {
    const m = (e) => { if (!dragRef.current) return; const p = e.touches ? e.touches[0] : e; setFromPoint(p.clientX); };
    const u = () => { dragRef.current = false; };
    window.addEventListener('mousemove', m);
    window.addEventListener('mouseup', u);
    window.addEventListener('touchmove', m, { passive: false });
    window.addEventListener('touchend', u);
    return () => {
      window.removeEventListener('mousemove', m);
      window.removeEventListener('mouseup', u);
      window.removeEventListener('touchmove', m);
      window.removeEventListener('touchend', u);
    };
  }, [question.min, question.max]);

  const pct = ((val - question.min) / (question.max - question.min)) * 100;

  return (
    <>
      <div className="hm-scale" ref={trackRef}
        style={{ '--val': pct }}
        onMouseDown={onDown} onTouchStart={onDown}>
        <div className="hm-scale-fill"></div>
        <div className="hm-scale-thumb">{val}</div>
      </div>
      <div className="hm-scale-labels">
        <span>{question.lo} ({question.min})</span>
        <span>{question.hi} ({question.max})</span>
      </div>
      <button className="hm-btn primary block lg" onClick={() => onSubmit(val)}
        style={{ marginTop: 20 }}>
        Odeslat hodnocení
      </button>
    </>
  );
}

// ─── Matrix
function StudentMatrix({ question, onSubmit }) {
  const [vals, setVals] = useState(() => question.rows.map(() => null));
  const choices = [];
  for (let i = question.min; i <= question.max; i++) choices.push(i);
  const allFilled = vals.every(v => v !== null);

  return (
    <>
      <div className="hm-matrix">
        {question.rows.map((row, ri) => (
          <div key={row} className="hm-matrix-row">
            <div className="label">{row}</div>
            <div className="scale-mini">
              {choices.map(c => (
                <button key={c}
                  data-selected={vals[ri] === c}
                  onClick={() => setVals(v => v.map((x, i) => i === ri ? c : x))}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="hm-btn primary block lg" disabled={!allFilled}
        onClick={() => onSubmit(vals)}
        style={{ marginTop: 16 }}>
        Odeslat
      </button>
    </>
  );
}

// ─── Wordcloud
function StudentWordcloud({ question, onSubmit }) {
  const [words, setWords] = useState([]);
  const [draft, setDraft] = useState('');
  const max = 3;

  function add() {
    const w = draft.trim();
    if (!w || words.length >= max) return;
    setWords([...words, w]);
    setDraft('');
  }

  return (
    <>
      <p className="hm-lead" style={{ fontSize: 13, marginBottom: 12 }}>
        Můžeš poslat až {max} slova. Stiskni Enter nebo "+".
      </p>
      <div className="hm-words">
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="hm-input"
            value={draft}
            placeholder="Tvoje slovo…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
            maxLength={24}
            disabled={words.length >= max}/>
          <button className="hm-btn" style={{ padding: '0 18px' }}
            onClick={add} disabled={!draft.trim() || words.length >= max}>+</button>
        </div>
        <div className="added">
          {words.map((w, i) => (
            <span key={i} className="chip">
              {w}
              <button onClick={() => setWords(words.filter((_, j) => j !== i))}×</button>
            </span>
          ))}
        </div>
        {question.suggestions && words.length < max && (
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--hm-muted)' }}>
            Návrhy: {question.suggestions.map((s, i) => (
              <button key={i} className="hm-chip" style={{ marginRight: 6, marginTop: 6, cursor: 'pointer' }}
                onClick={() => { if (!words.includes(s) && words.length < max) setWords([...words, s]); }}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <button className="hm-btn primary block lg" disabled={words.length === 0}
        onClick={() => { onSubmit(words); }}
        style={{ marginTop: 20 }}>
        Odeslat {words.length > 0 ? `(${words.length})` : ''}
      </button>
    </>
  );
}

// ─── Emoji picker
function StudentEmoji({ question, onSubmit }) {
  const [sel, setSel] = useState(null);
  return (
    <>
      <div className="hm-emo-grid">
        {question.options.map((opt, i) => (
          <button key={i} className="hm-emo"
            data-selected={sel === i}
            onClick={() => setSel(i)}>
            <span>{opt.e}</span>
            <span className="label">{opt.label}</span>
          </button>
        ))}
      </div>
      <button className="hm-btn primary block lg" disabled={sel === null}
        onClick={() => onSubmit(sel)}
        style={{ marginTop: 16 }}>
        Odeslat
      </button>
    </>
  );
}

function StudentWidget({ question, onSubmit }) {
  const map = {
    yesno: StudentYesNo,
    choice: StudentChoice,
    order: StudentOrder,
    scale: StudentScale,
    matrix: StudentMatrix,
    wordcloud: StudentWordcloud,
    emoji: StudentEmoji,
  };
  const C = map[question.type];
  return C ? <C question={question} onSubmit={onSubmit}/> : null;
}

Object.assign(window, { StudentWidget });
