# Hlasomat — pokyny pro Claude

Tento repozitář je **Hlasomat** — školní hlasovací/anketní aplikace (role
student/učitel/projektor). Zatím **jen spec + design prototyp**, neimplementováno.

**Než začneš cokoli implementovat, přečti `MEMORY.md`** — je tam shrnutý design,
kompletní audit, seznam chyb s prioritami, návrh datového modelu a fázový plán.
Bez něj nezačínej.

- `MEMORY.md` — hlavní paměť (audit + plán + datový model + otevřená rozhodnutí).
- `prototype/` — původní handoff prototyp z Claude Design (statický React + Babel,
  hlasy simulují boti). Vizuální a logická předloha, **ne produkční kód**.
  Vstupní bod `prototype/index.html`.

Otevřené body, které je potřeba s uživatelem potvrdit před implementací
(detaily v `MEMORY.md` §4): **anketa vs. kvíz** se správnými odpověďmi, autentizace
učitele, perzistence a export výsledků, anonymita hlasování.
