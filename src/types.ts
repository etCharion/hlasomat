// Doménové typy Hlasomatu. Sdílené napříč klientem (a později Cloud Functions).

export type QuestionType =
  | 'yesno'
  | 'choice'
  | 'order'
  | 'scale'
  | 'matrix'
  | 'wordcloud'
  | 'emoji';

/** Anketa (bez správné odpovědi) vs. kvíz (správná odpověď, body, čas, žebříček). */
export type QuestionMode = 'poll' | 'quiz';

export interface EmojiOption {
  e: string;
  label: string;
}

/** Pole společná všem otázkám. */
interface QuestionBase {
  id: string;
  mode: QuestionMode;
  q: string;
  /** Pořadí v knihovně otázek. */
  order: number;
  /** Body za správnou odpověď (jen mode === 'quiz'). */
  points?: number;
  /** Časový limit v sekundách (jen mode === 'quiz'). */
  timeLimitSec?: number;
}

export interface YesNoQuestion extends QuestionBase {
  type: 'yesno';
  /** Správná odpověď pro kvíz. */
  correctAnswer?: 'yes' | 'no';
}

export interface ChoiceQuestion extends QuestionBase {
  type: 'choice';
  options: string[];
  /** Index správné možnosti pro kvíz. */
  correctAnswer?: number;
}

export interface OrderQuestion extends QuestionBase {
  type: 'order';
  options: string[];
  /** Správné pořadí (indexy do options) pro kvíz. */
  correctAnswer?: number[];
}

export interface ScaleQuestion extends QuestionBase {
  type: 'scale';
  min: number;
  max: number;
  lo: string;
  hi: string;
}

export interface MatrixQuestion extends QuestionBase {
  type: 'matrix';
  rows: string[];
  min: number;
  max: number;
}

export interface WordcloudQuestion extends QuestionBase {
  type: 'wordcloud';
  suggestions?: string[];
}

export interface EmojiQuestion extends QuestionBase {
  type: 'emoji';
  options: EmojiOption[];
}

export type Question =
  | YesNoQuestion
  | ChoiceQuestion
  | OrderQuestion
  | ScaleQuestion
  | MatrixQuestion
  | WordcloudQuestion
  | EmojiQuestion;

// ── Tvar hlasu (payload) podle typu otázky ───────────────────────────────
export type YesNoVote = 'yes' | 'no';
export type ChoiceVote = number; // index možnosti
export type OrderVote = number[]; // permutace indexů (pořadí)
export type ScaleVote = number; // hodnota v <min, max>
export type MatrixVote = number[]; // hodnota pro každý řádek
export type WordcloudVote = string[]; // jedno či více slov (oprava chyby #1)
export type EmojiVote = number; // index možnosti

export type VotePayload =
  | YesNoVote
  | ChoiceVote
  | OrderVote
  | ScaleVote
  | MatrixVote
  | WordcloudVote
  | EmojiVote;

// ── Tvar výsledků (agregace) podle typu otázky ───────────────────────────
export interface YesNoResults {
  yes: number;
  no: number;
}
/** Klíč = index možnosti (jako string ve Firestore mapě). */
export type ChoiceResults = Record<string, number>;
export interface OrderResults {
  rankings: number[][];
}
/** Klíč = hodnota škály. */
export type ScaleResults = Record<string, number>;
/** Klíč = název řádku → suma a počet. */
export type MatrixResults = Record<string, { sum: number; count: number }>;
export interface WordcloudResults {
  words: Record<string, number>;
  /** Počet unikátních hlasujících (oprava chyby #2). */
  voters: number;
}
export type EmojiResults = Record<string, number>;

export type Results =
  | YesNoResults
  | ChoiceResults
  | OrderResults
  | ScaleResults
  | MatrixResults
  | WordcloudResults
  | EmojiResults;

// ── Session a související dokumenty (Firestore) ───────────────────────────
export type SessionStatus = 'lobby' | 'live' | 'ended';

export interface Session {
  id: string;
  pin: string;
  teacherId: string;
  title: string;
  status: SessionStatus;
  activeQuestionId: string | null;
  running: boolean;
  activeEnded: boolean;
  showOnProjector: boolean;
  showToStudents: boolean;
  showNamesOnProjector: boolean;
  showNamesToStudents: boolean;
  showJoinOnProjector: boolean;
  viewMode: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

export interface Vote {
  questionId: string;
  voterId: string;
  voterName: string;
  payload: VotePayload;
  ts: number;
}

export interface Participant {
  id: string;
  name: string;
  joinedAt: number;
  /** Skóre pro kvíz. */
  score: number;
}
