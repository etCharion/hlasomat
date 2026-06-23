# Hlasomat

Školní hlasovací a anketní webová aplikace ve stylu Mentimeter/Kahoot se třemi
rolemi: **Student** (telefon — vstup), **Učitel** (konzole — řízení) a **Projektor**
(sdílená obrazovka — výstup). 7 typů otázek: ANO/NE, výběr, řazení, škála, matice,
wordcloud, emoji.

> **Stav:** zatím **spec + design prototyp**, produkční implementace ještě nezačala.

## Obsah repozitáře
- **`MEMORY.md`** — hlavní dokument: kompletní audit designu (technický + UX),
  seznam chyb s prioritami, návrh datového modelu a fázový plán implementace.
  **Začni tady.**
- **`prototype/`** — původní handoff prototyp z [Claude Design](https://claude.ai/design)
  (statický React + in-browser Babel; hlasy simulují boti). Slouží jako vizuální
  a logická předloha, **není to produkční kód**. Vstupní bod `prototype/index.html`.

## Doporučený stack (viz MEMORY.md §3)
React + Vite + TypeScript · Firebase (realtime) · `qrcode.react` · `react-router-dom`
· Tailwind CSS.
