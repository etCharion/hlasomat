# Hlasomat — projektová paměť (audit + plán implementace)

> **Účel tohoto dokumentu.** Trvalá paměť pro práci na aplikaci **Hlasomat** napříč
> chaty/sezeními. Každé sezení Claude Code startuje z čerst vě naklonovoného repa,
> takže cokoli důležitého musí být zde v gitu. Tady je shrnutý design, nalezené
> chyby a plán, abychom mohli kdykoli navázat a začít implementovat.
>
> **Datum auditu:** 2026-06-23 · **Zdroj:** handoff bundle z Claude Design
> (`prototype/`).

---

## 0. TL;DR pro budoucí sezení

- **Hlasomat** = školní hlasovací/anketní webová aplikace (styl Mentimeter/Kahoot)
  se třemi rolemi: **Student** (telefon, vstup), **Učitel** (konzole, řízení),
  **Projektor** (sdílená obrazovka, výstup).
- Tento repo je **čistě Hlasomat**. Zatím existuje jako **prototyp**
  (`prototype/`) — statický React + in-browser Babel, hlasy simulují boti.
  **Není to produkční kód**, je to vizuální a logická předloha.
- Před implementací je nutné rozhodnout **otevřené produktové otázky** (sekce 4),
  hlavne: **anketa vs. kvíz se správnými odpověděmi**.
- Doporučený stack (sekce 3): React + Vite + TS, Firebase (realtime),
  `qrcode.react`, `react-router-dom`, Tailwind.

---

## 1. Co je Hlasomat

Webová aplikace pro hlasování ve třídě. Učitel pustí otázku, studenti hlasují na
svých telefonech, výsledky se v reálném čase ukazují na projektoru.

### Tři role
| Role | Zařízení | Co dělá |
|------|----------|---------|
| **Student** | vlastní telefon | připojí se přes PIN/QR, zadá jméno, hlasuje |
| **Učitel** | notebook/konzole | knihovna otázek, spuštění/pauza/ukončení, přepínače viditelnosti |
| **Projektor** | sdílená obrazovka (read-only) | čeká → QR+PIN → živé výsledky; řízeno učitelem |

V prototypu jsou všechny tři role v jednom okně + „split“ náhled — to je jen
**demo nástroj**. V produkci je každá role jiná routa/zařízení.

### 7 typů otázek (schéma viz `prototype/data.jsx`)
- `yesno` — ANO/NE
- `choice` — výběr jedné z možností
- `order` — řazení (drag & drop), agreguje se průměrná pozice
- `scale` — škála se sliderem (např. 0–10), histogram + průměr/medián
- `matrix` — více škál (matice kritérií)
- `wordcloud` — volný text, mračno slov
- `emoji` — výběr nálady/pocitu

---

## 2. Stav: prototyp z Claude Design

Umístění: **`prototype/`**. Primární soubor je `index.html`, který načítá
(v tomto pořadí) `tweaks-panel.jsx`, `data.jsx`, `student-widgets.jsx`,
`student-view.jsx`, `question-editor.jsx`, `teacher-view.jsx`,
`projector-view.jsx`, `app.jsx` a `styles.css`.

**Co je prototypové a v produkci zmizí:**
- React **dev** build + `@babel/standalone` v prohlížeči (musí se kompilovat),
- `tweaks-panel.jsx` (dev nástroj Claude Designu, posílá `postMessage` hostiteli),
- **falešné QR** (negenerují URL), tlačítko „Naskenovat QR“ jen `alert()`,
- nápověda s PINem v join obrazovce,
- mrtvá konfigurace `TWEAK_DEFAULTS.view` a `showStudentResults`.

**Co je dobré zachovat:** design tokeny a styly (`styles.css`), strukturu komponent
a hlavne **čisté funkce v `data.jsx`** (`emptyResults`, `applyVote`, `aggregateOrder`,
`totalVoters`) — po opravě chyb #1 a #2 jsou ideálním základem sčítání na serveru.

---

## 3. Doporučený stack

| Knihovna | Využití v Hlasomatu |
|----------|---------------------|
| `react` 19 + `vite` + `typescript` | moderní build místo in-browser Babelu |
| `firebase` | **realtime synchronizace** session (učitel ↔ studenti ↔ projektor), autoritativní úložiště hlasů, deduplikace |
| `qrcode.react` | **reálné QR** pro připojení `hlasomat.app/<pin>` (nahradí falešné QR) |
| `react-router-dom` | role na různých routách: `/` student, `/teacher`, `/projector/:pin` |
| `tailwindcss` | styly (alternativa k portu `styles.css`; tokeny lze přenést do `tailwind.config.js`) |
| `framer-motion` | animace (donut, mračno slov, přechody) |

> Poznámka: tento stack je odpozorovaný ze sourozeneckého projektu (hexová hra
> Althistory), který stejnou kombinaci úspěšně používá pro realtime + QR + role.
> Konkrétní volbu (zejm. realtime: Firebase vs. Supabase/Ably/Pusher) potvrď
> s uživatelem.

---

## 4. Otevřená produktová rozhodnutí (rozhodnout PRVNÍ)

1. **Anketa, nebo kvíz?** Prototyp **nemá** pojem správné odpovědi, bodů, žebříčku
   ani časového limitu (= Mentimeter, ne Kahoot). Vzorové otázky ale míchají ankety
   („Měli bychom psát test?“) s faktickými („Setřiďte planety“). Tohle mění datový
   model i UI.
2. **Autentizace učitele** — kdokoli s URL konzole teď řídí hlasování. Login / SSO?
3. **Více souběžných tříd/sessions?** Více učitelů? Prototyp má 1 napevno daný PIN.
4. **Perzistence a export** výsledků (CSV/PDF)? `prototype/index-print.html` naznačuje,
   že tisk se počítá.
5. **Anonymita** — smí být vidět jména hlasujících? Komu a kde? (souvisí s chybou #6)

---

## 5. AUDIT 1 — technické chyby (v prototypu)

Závažnost: 🔴 vážné · 🟠 střední · 🟡 drobné. Odkazy míří do `prototype/`.

### Funkční chyby
- **🔴 #1 Wordcloud — víc slov se zřetězí do 1 tokenu.** `StudentWordcloud` posílá
  pole slov, ale `applyVote` (`data.jsx:243`) udělá `String(vote)` → `"a,b,c"` jako
  jediné slovo. Maskuje to simulace (boti posílají 1 slovo). **Oprava:** iterovat pole.
- **🔴 #2 Wordcloud — `totalVoters` počítá výskyty slov, ne hlasující.**
  (`data.jsx:286`) → „X/Y hlasovalo“ a progress přeteče přes 100 %. **Oprava:**
  počítat unikátní hlasující, slova řešit zvlášť.
- **🔴 #3 Pauza vyhodí studenty do čekárny a po obnovení znovu otevře hlasování.**
  `pause()` (`app.jsx:65`) dá `running:false`; `student-view.jsx:300` to bere jako
  „žádná otázka“ → čekárna. Efekt na `student-view.jsx:288` navic při pauze i
  obnovení **resetuje `hasVoted`** → student může znovu vidět formulář. Dvojhlas
  blokuje deduplikace podle jména, ale UX je rozbité a nekonzistentní s projektorem
  (tam výsledky během pauzy zůstanou).
- **🟠 #4 Donut varianta u `choice` na straně studenta nedělá nic.**
  `StudentMiniResults` (`student-view.jsx:228`) nemá větev pro donut → ukáže sloupce.

### Logické / nedotažené
- **🟠 #5 Výsledky studentům fungují jen u 3/7 typů.** `StudentMiniResults` umí jen
  `yesno`, `choice`, `emoji`; `order/scale/matrix/wordcloud` vrací hlášku
  „Výsledky se zobrazují na tabuli.“ i když je zapnuto „Zobrazit na studentech“.
- **🟠 #6 Přepínač „Se jmény“ je zavadějící + soukromí.** (`teacher-view.jsx:311`,
  `473`) Jména se ukazují **jen v učitelké konzoli** a jen u `yesno/choice/emoji`;
  nikdy ne na projektor/studentům. Umístění ve skupině „Zobrazit výsledky na“ klame.
- **🟠 #7 `updateQuestion` maže VŠECHNY hlasy při jakékoli úpravě**, ne jen při změně
  typu (`app.jsx:133`); editor varuje jen před změnou typu (`question-editor.jsx:114`).
- **🟡 #8 Ukončení odhalí projektor, ale ne studenty** (`app.jsx:67`) — nekonzistence.
- **🟡 #9 Globální model jedné aktivní otázky** — nejde pozastavit Q1, mrknout na Q2
  a vrátit se k Q1 bez vynulování (`startVoting` vždy resetuje).

### Zobrazení / rendering
- **🔴 #10 Histogram škály na projektoru je natvrdo 11 sloupců.** `.hm-proj-hist`
  (`styles.css:820`) má `repeat(11,1fr)`, ale `PResScale` generuje `max−min+1` sloupců.
  Sedí jen pro 0–10. Pro 1–5 nebo 0–100 se rozbíjí. **Žádný strop na rozsah škály.**
  (Učitelká konzole používá inline styl, takže nekonzistence konzole vs. projektor.)
- **🟠 #11 Dotykové tahání roluje stránku** (řazení i slider). `touchmove` je
  `{passive:false}`, ale `preventDefault` se volá jen v `handleStart`, ne v `handleMove`
  (`student-widgets.jsx:73`, `158`).
- **🟡 #12 Projektorová emoji mřížka natvrdo 6 sloupců** (`styles.css:786`); editor
  povolí až 8 → zalomí se.
- **🟡 #13 Zbytkový no-op výpočet značek ø/medián** `calc(...+X% −X%)` (`teacher-view.jsx:578`)
  + posun o půl buňky mřížky.
- **🟡 #14 `itemHeight=56` u řazení je natvrdo** — drag může poskakovat.

---

## 6. AUDIT 2 — UX, intuitivita, rozdělení rolí

### Rozdělení rolí
Model student=vstup / učitel=řízení / projektor=výstup je čistý a správný. Ale:
- Přepínač rolí v hlavičce prototypu je **demo**, ne reálná hranice. V produkci =
  jiné zařízení/URL pro každou roli.
- **Chybí autentizace učitele** (kdokoli s URL řídí).
- Projektor je read-only klient čthoucí sdílený stav → **vyžaduje realtime backend**.

### Intuitivita — student
Flow PIN → jméno → čekárna → hlasování → „Hlas odeslán“ je známý a čistý. Slabiny:
nápověda s PINem (demo), pauza vyhodí do čekárny (#3), výsledky u většiny typů nevidí
(#5), dotykové tahání roluje (#11), žádná podpora klávesnice/čtečky.

### Intuitivita — učitel
Model „vyber (náhled) → Spustit“ je srozumitelný. Drhne:
- „Spustit/Spustit znovu“ i üprava otázky **mažou data bez potvrzení** (#7).
- Význam tří přepínačů + to, že ukončení odhalí jen projektor (#6, #8), není zřejmé.
- V režimu „pouze učitel“ nevidí, co je na projektoru (náhled jen ve split).
- Některé přepínače variant nedělají nic (#4).

### Přístupnost
Vlastní drag/slider bez klávesnice, minimum ARIA, výsledky se neoznamují čtečce.
Pro školní (často veřejnou) aplikaci je to nutné dořešit.

---

## 7. Priorita oprav

| # | Problém | Záv. | Kde |
|---|---------|------|-----|
| 1 | Wordcloud: víc slov → 1 token | 🔴 | `data.jsx:243` |
| 2 | Wordcloud: `totalVoters` počítá slova | 🔴 | `data.jsx:286` |
| 3 | Pauza → čekárna + reset `hasVoted` | 🔴 | `app.jsx:65`, `student-view.jsx:288,300` |
| 10 | Histogram projektoru natvrdo 11 sl. + bez stropu | 🔴 | `styles.css:820` |
| 4 | Donut u choice na studentovi nefunguje | 🟠 | `student-view.jsx:228` |
| 5 | Výsledky studentům jen 3/7 typů | 🟠 | `student-view.jsx:261` |
| 6 | „Se jmény“ zavadějící + soukromí | 🟠 | `teacher-view.jsx:311,473` |
| 7 | Úprava maže všechny hlasy | 🟠 | `app.jsx:133` |
| 11 | Dotykové tahání roluje stránku | 🟠 | `student-widgets.jsx:73,158` |
| 8,9,12,13,14 | Nekonzistence / 1 aktivní otázka / emoji / no-op / výška | 🟡 | viz sekce 5 |

---

## 8. Návrh datového modelu (pro realtime backend)

```
Session {
  pin: string            // přihlašovací kód (unikátní, krátký)
  teacherId: string      // vlastník (po zavedení auth)
  activeQuestionId: string | null
  running: boolean
  activeEnded: boolean
  showOnProjector, showToStudents, showNames, showJoinOnProjector: boolean
  viewMode: Record<questionId, string>   // varianta vizualizace
  createdAt, updatedAt
}
Question { id, type, q, ...typově specifické (options/rows/min/max/lo/hi/suggestions) }
Vote     { sessionId, questionId, voter, payload, ts }   // 1 řádek = 1 hlas; dedup na (q, voter)
Connection { sessionId, name, joinedAt }                 // připojení studenti
```
Sčítání (`emptyResults`/`applyVote`/`aggregateOrder`/`totalVoters`) běží
**autoritativně na serveru** (anti-cheat, deduplikace), ne v klientovi.

---

## 9. Plán implementace (fáze)

**Fáze 0 — Produktová rozhodnutí.** Vyřešit sekci 4 (hlavně anketa vs. kvíz) +
volbu realtime backendu (sekce 3).

**Fáze 1 — Architektura.**
- Frontend: React + Vite + TS. Routy: `/` student, `/teacher`, `/projector/:pin`.
  Přenést design tokeny z `prototype/styles.css` (do Tailwindu nebo CSS proměnných).
- Realtime: **Firebase** (doporučeno) — Firestore/RTDB, session keyovaná PINem.
  Hlasy sčítat autoritativně na serveru/cloud functions.
- Datový model dle sekce 8.

**Fáze 2 — Pixel-perfect port designu.** Přestavit komponenty jako reálné
(TS, žádný in-browser Babel), zachovat vzhled. Vyhodit `tweaks-panel.jsx`, nápovědu
s PINem, falešné QR.

**Fáze 3 — Oprava chyb z auditu** (sekce 7), zvlášť #1, #2, #3, #10.

**Fáze 4 — Reálné funkce.** Reálné QR (`qrcode.react`) kódující `hlasomat.app/<pin>`,
připojení přes URL+PIN, autentizace učitele, perzistence, export výsledků.

**Fáze 5 — Přístupnost, mobil, hraniční stavy.** Klávesnice pro slider/řazení, ARIA,
oznamování výsledků; `preventDefault` při dotyku; reconnection; velké třídy (30+);
strop rozsahu škály; velmi dlouhá zadání.

**Fáze 6 — Testy a nasazení.** Unit testy agregací, e2e test hlasovacího flow,
zátěžový test souběžných hlasů, deploy.

---

## 10. Historie
- **2026-06-23** — Audit prototypu + založení této paměti a samostatného repa
  Hlasomat. Prototyp je v `prototype/`. Implementace zatím nezačala.
