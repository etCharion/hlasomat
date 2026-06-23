import { describe, expect, it } from 'vitest';
import { aggregateOrder, applyVote, emptyResults, totalVoters } from './voting';
import type {
  ChoiceQuestion,
  OrderQuestion,
  ScaleResults,
  WordcloudQuestion,
  WordcloudResults,
  YesNoQuestion,
} from '../types';

const yesno: YesNoQuestion = { id: 'y', type: 'yesno', mode: 'poll', order: 0, q: '?' };
const choice: ChoiceQuestion = {
  id: 'c',
  type: 'choice',
  mode: 'poll',
  order: 0,
  q: '?',
  options: ['A', 'B', 'C'],
};
const order: OrderQuestion = {
  id: 'o',
  type: 'order',
  mode: 'poll',
  order: 0,
  q: '?',
  options: ['X', 'Y', 'Z'],
};
const wordcloud: WordcloudQuestion = {
  id: 'w',
  type: 'wordcloud',
  mode: 'poll',
  order: 0,
  q: '?',
};

describe('emptyResults', () => {
  it('inicializuje wordcloud s nulovými hlasujícími', () => {
    expect(emptyResults(wordcloud)).toEqual({ words: {}, voters: 0 });
  });
  it('inicializuje choice nulami pro každou možnost', () => {
    expect(emptyResults(choice)).toEqual({ 0: 0, 1: 0, 2: 0 });
  });
});

describe('applyVote — wordcloud (oprava #1 a #2)', () => {
  it('#1: víc slov v jednom hlasu se počítá zvlášť, ne jako jeden token', () => {
    let r = emptyResults(wordcloud);
    r = applyVote(wordcloud, r, ['umění', 'Itálie', 'umění']);
    const wc = r as WordcloudResults;
    expect(wc.words).toEqual({ umění: 2, itálie: 1 });
  });

  it('#2: totalVoters počítá hlasující, ne výskyty slov', () => {
    let r = emptyResults(wordcloud);
    r = applyVote(wordcloud, r, ['a', 'b', 'c']); // 1 hlasující, 3 slova
    r = applyVote(wordcloud, r, ['d']); // 1 hlasující, 1 slovo
    expect(totalVoters(wordcloud, r)).toBe(2);
    expect((r as WordcloudResults).voters).toBe(2);
  });

  it('prázdný hlas nezvyšuje počet hlasujících', () => {
    let r = emptyResults(wordcloud);
    r = applyVote(wordcloud, r, ['   ']);
    expect(totalVoters(wordcloud, r)).toBe(0);
  });
});

describe('applyVote — počítání', () => {
  it('yesno přičítá hlasy', () => {
    let r = emptyResults(yesno);
    r = applyVote(yesno, r, 'yes');
    r = applyVote(yesno, r, 'yes');
    r = applyVote(yesno, r, 'no');
    expect(r).toEqual({ yes: 2, no: 1 });
    expect(totalVoters(yesno, r)).toBe(3);
  });

  it('choice přičítá podle indexu', () => {
    let r = emptyResults(choice);
    r = applyVote(choice, r, 1);
    r = applyVote(choice, r, 1);
    expect(r).toEqual({ 0: 0, 1: 2, 2: 0 });
    expect(totalVoters(choice, r)).toBe(2);
  });

  it('je immutable — nemění vstupní výsledky', () => {
    const r0 = emptyResults(choice);
    const r1 = applyVote(choice, r0, 0);
    expect(r0).toEqual({ 0: 0, 1: 0, 2: 0 });
    expect(r1).not.toBe(r0);
  });

  it('scale přičítá do správného bucketu', () => {
    const scale = {
      id: 's',
      type: 'scale' as const,
      mode: 'poll' as const,
      order: 0,
      q: '?',
      min: 0,
      max: 5,
      lo: 'a',
      hi: 'b',
    };
    let r = emptyResults(scale);
    r = applyVote(scale, r, 3);
    r = applyVote(scale, r, 3);
    expect((r as ScaleResults)['3']).toBe(2);
    expect(totalVoters(scale, r)).toBe(2);
  });
});

describe('aggregateOrder', () => {
  it('řadí podle průměrné pozice (nejnižší první)', () => {
    // dva hlasy, oba shodně X,Y,Z
    const ranked = aggregateOrder(order, [
      [0, 1, 2],
      [0, 1, 2],
    ]);
    expect(ranked.map((r) => r.option)).toEqual(['X', 'Y', 'Z']);
    expect(ranked[0].avg).toBe(0);
  });
});
