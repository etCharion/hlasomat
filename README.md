# Hlasomat

Školní hlasovací a anketní webová aplikace ve stylu Mentimeter/Kahoot se třemi
rolemi: **Student** (telefon — vstup), **Učitel** (konzole — řízení) a **Projektor**
(sdílená obrazovka — výstup). 7 typů otázek: ANO/NE, výběr, řazení, škála, matice,
wordcloud, emoji.

> **Stav:** rozjeta produkční implementace — **Fáze 1 (scaffolding) hotová**.
> Plán a postup viz `MEMORY.md` §9.

## Obsah repozitáře
- **`MEMORY.md`** — hlavní dokument: kompletní audit designu (technický + UX),
  seznam chyb s prioritami, datový model (Firestore) a fázový plán implementace.
  **Začni tady.**
- **`src/`** — produkční aplikace (React + Vite + TS). Doménová logika hlasování
  je v `src/lib/voting.ts` (s opravou wordcloud chyb #1/#2), typy v `src/types.ts`,
  Firebase init v `src/lib/firebase.ts`, role-routy v `src/pages/`.
- **`prototype/`** — původní handoff prototyp z [Claude Design](https://claude.ai/design)
  (statický React + in-browser Babel; hlasy simulují boti). Slouží jako vizuální
  a logická předloha, **není to produkční kód**. Vstupní bod `prototype/index.html`.

## Stack
React 19 + Vite + TypeScript · Tailwind CSS · Firebase (Firestore + Auth Google +
Hosting) · `qrcode.react` · `react-router-dom`.

## Vývoj
```bash
npm install
cp .env.example .env   # doplň hodnoty z Firebase konzole
npm run dev            # dev server
npm test               # unit testy (Vitest)
npm run typecheck      # kontrola typů
npm run build          # produkční build do dist/
```

Routy podle rolí: `/` (join), `/s/:pin` (student), `/login` + `/teacher` +
`/teacher/:sessionId` (učitel), `/projector/:pin` (projektor).
