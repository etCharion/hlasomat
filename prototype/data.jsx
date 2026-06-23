// data.jsx — sample questions, shared session state, bot vote simulation

// Question schemas:
//   yesno         — { type, q }
//   choice        — { type, q, options: [string] }              single choice
//   order         — { type, q, options: [string] }              rank highest->lowest
//   scale         — { type, q, min, max, lo, hi }              0..100 typically
//   matrix        — { type, q, rows: [string], min, max }      multiple scales
//   wordcloud     — { type, q, suggestions?: [string] }        free text words
//   emoji         — { type, q, options: [{e, label}] }         emoji pick

const SAMPLE_QUESTIONS = [
  {
    id: 'q-yn-1',
    type: 'yesno',
    q: 'Měli bychom psát test z dějepisu příští týden?',
  },
  {
    id: 'q-ch-1',
    type: 'choice',
    q: 'Které téma probereme jako další?',
    options: [
      'Druhá světová válka',
      'Studená válka',
      'Pád želez né opony',
      'Sametová revoluce',
    ],
  },
  {
    id: 'q-or-1',
    type: 'order',
    q: 'Seřaďte planety od nejbližší ke Slunci',
    options: ['Mars', 'Venuše', 'Země', 'Merkur'],
  },
  {
    id: 'q-sc-1',
    type: 'scale',
    q: 'Jak náročný byl dnešní výklad?',
    min: 0, max: 10, lo: 'Lehký', hi: 'Velmi těžký',
  },
  {
    id: 'q-mx-1',
    type: 'matrix',
    q: 'Ohodnoste dnešní hodinu',
    rows: ['Srozumitelnost', 'Tempo', 'Zajímavost', 'Atmosféra'],
    min: 1, max: 5,
  },
  {
    id: 'q-wc-1',
    type: 'wordcloud',
    q: 'Jedním slovem — co si vybavíte u pojmu "renesance"?',
    suggestions: ['umění', 'Itálie', 'Leonardo', 'znovuzrození'],
  },
  {
    id: 'q-em-1',
    type: 'emoji',
    q: 'Jak se ti dnes vede?',
    options: [
      { e: '🤩', label: 'Skvěle' },
      { e: '😊', label: 'Dobře' },
      { e: '🙂', label: 'OK' },
      { e: '😐', label: 'Nic moc' },
      { e: '😕', label: 'Špatně' },
      { e: '😴', label: 'Unaveně' },
    ],
  },
];

// Type metadata for library icons & labels
const TYPE_META = {
  yesno:    { label: 'ANO / NE',        sub: 'Binární volba' },
  choice:   { label: 'Výběr možnosti',  sub: 'Jedna z více' },
  order:    { label: 'Řazení',          sub: 'Drag & drop' },
  scale:    { label: 'Škála',           sub: 'Slider 0–10' },
  matrix:   { label: 'Více škál',       sub: 'Matice hodnocení' },
  wordcloud:{ label: 'Wordcloud',       sub: 'Volný text' },
  emoji:    { label: 'Emotikon',        sub: 'Nálada / pocit' },
};

function TypeIcon({ type, size = 16 }) {
  const s = { width: size, height: size, display: 'inline-block' };
  const stroke = 'currentColor';
  switch(type) {
    case 'yesno':
      return (<svg style={s} viewBox="0 0 16 16" fill="none">
        <path d="M3 9l2 2 4-5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 6l3 3M13 6l-3 3" stroke={stroke} strokeWidth="1.6" strokeLinecap="round"/>
      </svg>);
    case 'choice':
      return (<svg style={s} viewBox="0 0 16 16" fill="none">
        <circle cx="4" cy="4" r="2" stroke={stroke} strokeWidth="1.4"/>
        <circle cx="4" cy="12" r="2" stroke={stroke} strokeWidth="1.4" fill={stroke}/>
        <path d="M8 4h6M8 12h6" stroke={stroke} strokeWidth="1.4" strokeLinecap="round"/>
      </svg>);
    case 'order':
      return (<svg style={s} viewBox="0 0 16 16" fill="none">
        <path d="M3 4h10M3 8h7M3 12h4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M12 9l2 2 -2 2" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>);
    case 'scale':
      return (<svg style={s} viewBox="0 0 16 16" fill="none">
        <path d="M2 10h12" stroke={stroke} strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="10" cy="10" r="2.6" fill={stroke}/>
      </svg>);
    case 'matrix':
      return (<svg style={s} viewBox="0 0 16 16" fill="none">
        <path d="M2 5h12M2 9h12M2 13h12" stroke={stroke} strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="6" cy="5" r="1.5" fill={stroke}/>
        <circle cx="10" cy="9" r="1.5" fill={stroke}/>
        <circle cx="4" cy="13" r="1.5" fill={stroke}/>
      </svg>);
    case 'wordcloud':
      return (<svg style={s} viewBox="0 0 16 16" fill="none">
        <text x="1" y="7" fontSize="6" fontWeight="700" fill={stroke}>Aa</text>
        <text x="8" y="13" fontSize="5" fontWeight="600" fill={stroke}>bb</text>
        <text x="1" y="14" fontSize="4" fill={stroke}>cc</text>
      </svg>);
    case 'emoji':
      return (<svg style={s} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke={stroke} strokeWidth="1.4"/>
        <circle cx="6" cy="7" r=".9" fill={stroke}/>
        <circle cx="10" cy="7" r=".9" fill={stroke}/>
        <path d="M5.5 10c.7 1 1.5 1.4 2.5 1.4S9.8 11 10.5 10" stroke={stroke} strokeWidth="1.4" strokeLinecap="round"/>
      </svg>);
    default:
      return null;
  }
}

// fake names for connected students
const FAKE_NAMES = [
  'Adam', 'Bára', 'Cyril', 'Denisa', 'Eliška', 'Filip', 'Gita', 'Hana',
  'Ivan', 'Jana', 'Kamil', 'Lenka', 'Marek', 'Nikola', 'Ondra', 'Petra',
  'Radim', 'Šárka', 'Tomáš', 'Veronika', 'Vojta', 'Zuzka', 'Aneta', 'Honza',
];

// Build initial empty results for a question
function emptyResults(question) {
  switch(question.type) {
    case 'yesno':
      return { yes: 0, no: 0 };
    case 'choice':
      return Object.fromEntries(question.options.map((_,i) => [i, 0]));
    case 'order': {
      return { rankings: [] };
    }
    case 'scale': {
      const buckets = {};
      for (let i = question.min; i <= question.max; i++) buckets[i] = 0;
      return buckets;
    }
    case 'matrix': {
      const o = {};
      question.rows.forEach(r => { o[r] = { sum: 0, count: 0 }; });
      return o;
    }
    case 'wordcloud':
      return { words: {} };
    case 'emoji':
      return Object.fromEntries(question.options.map((_, i) => [i, 0]));
    default:
      return {};
  }
}

function fakeVote(question) {
  switch(question.type) {
    case 'yesno':
      return Math.random() < 0.62 ? 'yes' : 'no';
    case 'choice':
      const w = question.options.map((_, i) => Math.max(1, question.options.length - i + Math.random()*2));
      return weightedPick(w);
    case 'order': {
      const arr = question.options.map((_, i) => i);
      for (let i = arr.length - 1; i > 0; i--) {
        if (Math.random() < 0.55) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
      return arr;
    }
    case 'scale': {
      const mid = (question.min + question.max) / 2;
      const range = question.max - question.min;
      const u = Math.random() + Math.random() + Math.random();
      const offset = (u - 1.5) * (range / 3);
      return Math.max(question.min, Math.min(question.max, Math.round(mid + offset + (Math.random()-.4)*1.2)));
    }
    case 'matrix': {
      return question.rows.map(() => Math.max(question.min, Math.min(question.max, Math.round(question.min + Math.random()*(question.max-question.min)))));
    }
    case 'wordcloud': {
      const pool = (question.suggestions || []).concat([
        'umění','barvy','obrazy','perspektiva','Mona Lisa','Florencie','znovuzrození','Michelangelo','sochy','poznání','světlo','harmonie'
      ]);
      return pool[Math.floor(Math.random()*pool.length)];
    }
    case 'emoji':
      const ew = question.options.map((_, i) => {
        if (i < 3) return 4 + Math.random()*3;
        return 1 + Math.random()*1.5;
      });
      return weightedPick(ew);
  }
}

function weightedPick(weights) {
  const total = weights.reduce((a,b)=>a+b,0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function applyVote(question, results, vote) {
  const r = JSON.parse(JSON.stringify(results));
  switch(question.type) {
    case 'yesno':
      r[vote] = (r[vote] || 0) + 1; break;
    case 'choice':
      r[vote] = (r[vote] || 0) + 1; break;
    case 'order':
      r.rankings.push(vote); break;
    case 'scale':
      r[vote] = (r[vote] || 0) + 1; break;
    case 'matrix':
      question.rows.forEach((row, i) => {
        r[row].sum += vote[i];
        r[row].count += 1;
      });
      break;
    case 'wordcloud': {
      const w = String(vote).trim().toLowerCase();
      if (w) r.words[w] = (r.words[w] || 0) + 1;
      break;
    }
    case 'emoji':
      r[vote] = (r[vote] || 0) + 1; break;
  }
  return r;
}

function aggregateOrder(question, rankings) {
  const n = question.options.length;
  const sums = new Array(n).fill(0);
  const counts = new Array(n).fill(0);
  rankings.forEach(perm => {
    perm.forEach((opt, position) => {
      sums[opt] += position;
      counts[opt] += 1;
    });
  });
  const avg = sums.map((s, i) => counts[i] ? s / counts[i] : 0);
  const sorted = question.options.map((o, i) => ({ option: o, avg: avg[i] }))
    .sort((a,b) => a.avg - b.avg);
  return sorted;
}

function totalVoters(question, results) {
  switch(question.type) {
    case 'yesno': return results.yes + results.no;
    case 'choice':
    case 'emoji':
      return Object.values(results).reduce((a,b)=>a+b,0);
    case 'order': return results.rankings.length;
    case 'scale': return Object.values(results).reduce((a,b)=>a+b,0);
    case 'matrix': {
      const first = Object.values(results)[0];
      return first ? first.count : 0;
    }
    case 'wordcloud': return Object.values(results.words).reduce((a,b)=>a+b,0);
  }
  return 0;
}

Object.assign(window, {
  SAMPLE_QUESTIONS, TYPE_META, TypeIcon, FAKE_NAMES,
  emptyResults, fakeVote, applyVote, aggregateOrder, totalVoters,
});
