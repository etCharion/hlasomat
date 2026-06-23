// questions.ts — metadata typů otázek a vzorové otázky (port z prototype/data.jsx).

import type { Question, QuestionType } from '../types';

export const TYPE_META: Record<QuestionType, { label: string; sub: string }> = {
  yesno: { label: 'ANO / NE', sub: 'Binární volba' },
  choice: { label: 'Výběr možnosti', sub: 'Jedna z více' },
  order: { label: 'Řazení', sub: 'Drag & drop' },
  scale: { label: 'Škála', sub: 'Slider 0–10' },
  matrix: { label: 'Více škál', sub: 'Matice hodnocení' },
  wordcloud: { label: 'Wordcloud', sub: 'Volný text' },
  emoji: { label: 'Emotikon', sub: 'Nálada / pocit' },
};

/** Které typy mohou fungovat jako kvíz (mají smysl správné odpovědi). */
export const QUIZ_CAPABLE: ReadonlySet<QuestionType> = new Set<QuestionType>([
  'yesno',
  'choice',
  'order',
]);

/** Vzorové otázky pro seed knihovny / dev. Všechny jako anketa (poll). */
export const SAMPLE_QUESTIONS: Question[] = [
  { id: 'q-yn-1', type: 'yesno', mode: 'poll', order: 0, q: 'Měli bychom psát test z dějepisu příští týden?' },
  {
    id: 'q-ch-1',
    type: 'choice',
    mode: 'poll',
    order: 1,
    q: 'Které téma probereme jako další?',
    options: ['Druhá světová válka', 'Studená válka', 'Pád železné opony', 'Sametová revoluce'],
  },
  {
    id: 'q-or-1',
    type: 'order',
    mode: 'poll',
    order: 2,
    q: 'Seřaďte planety od nejbližší ke Slunci',
    options: ['Mars', 'Venuše', 'Země', 'Merkur'],
  },
  {
    id: 'q-sc-1',
    type: 'scale',
    mode: 'poll',
    order: 3,
    q: 'Jak náročný byl dnešní výklad?',
    min: 0,
    max: 10,
    lo: 'Lehký',
    hi: 'Velmi těžký',
  },
  {
    id: 'q-mx-1',
    type: 'matrix',
    mode: 'poll',
    order: 4,
    q: 'Ohodnoťte dnešní hodinu',
    rows: ['Srozumitelnost', 'Tempo', 'Zajímavost', 'Atmosféra'],
    min: 1,
    max: 5,
  },
  {
    id: 'q-wc-1',
    type: 'wordcloud',
    mode: 'poll',
    order: 5,
    q: 'Jedním slovem — co si vybavíte u pojmu "renesance"?',
    suggestions: ['umění', 'Itálie', 'Leonardo', 'znovuzrození'],
  },
  {
    id: 'q-em-1',
    type: 'emoji',
    mode: 'poll',
    order: 6,
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
