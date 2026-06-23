// voting.ts — čistá doménová logika hlasování (port z prototype/data.jsx).
//
// Oproti prototypu opraveno:
//   • #1 wordcloud: hlas je pole slov; každé slovo se počítá zvlášť
//        (dřív se String(vote) sloučilo na jeden token "a,b,c").
//   • #2 wordcloud: totalVoters počítá unikátní hlasující (results.voters),
//        ne výskyty slov (dřív progress přetékal přes 100 %).
//
// Funkce jsou bez vedlejších efektů, aby šly použít autoritativně v Cloud
// Function i v klientovi (sekce 8/9 MEMORY.md).

import type {
  ChoiceResults,
  EmojiResults,
  MatrixResults,
  OrderResults,
  Question,
  Results,
  ScaleResults,
  VotePayload,
  WordcloudResults,
  YesNoResults,
} from '../types';

/** Prázdné (nulové) výsledky pro daný typ otázky. */
export function emptyResults(question: Question): Results {
  switch (question.type) {
    case 'yesno':
      return { yes: 0, no: 0 };
    case 'choice':
      return Object.fromEntries(question.options.map((_, i) => [i, 0]));
    case 'order':
      return { rankings: [] };
    case 'scale': {
      const buckets: ScaleResults = {};
      for (let i = question.min; i <= question.max; i++) buckets[i] = 0;
      return buckets;
    }
    case 'matrix': {
      const o: MatrixResults = {};
      question.rows.forEach((r) => {
        o[r] = { sum: 0, count: 0 };
      });
      return o;
    }
    case 'wordcloud':
      return { words: {}, voters: 0 };
    case 'emoji':
      return Object.fromEntries(question.options.map((_, i) => [i, 0]));
  }
}

/** Vrátí NOVÉ výsledky po započtení jednoho hlasu (immutable). */
export function applyVote(
  question: Question,
  results: Results,
  vote: VotePayload,
): Results {
  switch (question.type) {
    case 'yesno': {
      const r = { ...(results as YesNoResults) };
      const key = vote as 'yes' | 'no';
      r[key] = (r[key] || 0) + 1;
      return r;
    }
    case 'choice':
    case 'emoji': {
      const r = { ...(results as ChoiceResults | EmojiResults) };
      const key = String(vote as number);
      r[key] = (r[key] || 0) + 1;
      return r;
    }
    case 'order': {
      const prev = results as OrderResults;
      return { rankings: [...prev.rankings, vote as number[]] };
    }
    case 'scale': {
      const r = { ...(results as ScaleResults) };
      const key = String(vote as number);
      r[key] = (r[key] || 0) + 1;
      return r;
    }
    case 'matrix': {
      const prev = results as MatrixResults;
      const r: MatrixResults = {};
      const values = vote as number[];
      question.rows.forEach((row, i) => {
        const cell = prev[row] ?? { sum: 0, count: 0 };
        r[row] = { sum: cell.sum + (values[i] ?? 0), count: cell.count + 1 };
      });
      return r;
    }
    case 'wordcloud': {
      const prev = results as WordcloudResults;
      const words = { ...prev.words };
      // #1: hlas je pole slov — iterujeme přes všechna.
      const list = Array.isArray(vote) ? (vote as string[]) : [String(vote)];
      let added = false;
      for (const raw of list) {
        const w = String(raw).trim().toLowerCase();
        if (w) {
          words[w] = (words[w] || 0) + 1;
          added = true;
        }
      }
      // #2: jeden hlas = jeden hlasující, i když poslal víc slov.
      return { words, voters: prev.voters + (added ? 1 : 0) };
    }
  }
}

/** Seřadí možnosti řazení podle průměrné pozice (nejnižší = nejvýše). */
export function aggregateOrder(
  question: { options: string[] },
  rankings: number[][],
): { option: string; avg: number }[] {
  const n = question.options.length;
  const sums = new Array(n).fill(0);
  const counts = new Array(n).fill(0);
  rankings.forEach((perm) => {
    perm.forEach((opt, position) => {
      sums[opt] += position;
      counts[opt] += 1;
    });
  });
  const avg = sums.map((s, i) => (counts[i] ? s / counts[i] : 0));
  return question.options
    .map((o, i) => ({ option: o, avg: avg[i] }))
    .sort((a, b) => a.avg - b.avg);
}

/** Počet hlasujících (ne výskytů). */
export function totalVoters(question: Question, results: Results): number {
  switch (question.type) {
    case 'yesno': {
      const r = results as YesNoResults;
      return r.yes + r.no;
    }
    case 'choice':
    case 'emoji':
    case 'scale':
      return Object.values(results as Record<string, number>).reduce(
        (a, b) => a + b,
        0,
      );
    case 'order':
      return (results as OrderResults).rankings.length;
    case 'matrix': {
      const first = Object.values(results as MatrixResults)[0];
      return first ? first.count : 0;
    }
    case 'wordcloud':
      // #2: unikátní hlasující, ne součet výskytů slov.
      return (results as WordcloudResults).voters;
  }
}
