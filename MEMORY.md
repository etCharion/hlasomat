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
- **Produktová rozhodnutí jsou hotová** (sekce 4): anketa **i** kvíz (přepínač per
  otázka), **Google auth** (Firebase), **multi-tenant** (víc učitelů i sessions),
  **perzistence + export**, **anonymita** jako nastavení session.
- Stack potvrzen (sekce 3): React + Vite + TS, **Firebase (Firestore + Auth Google
  + Hosting)**, `qrcode.react`, `react-router-dom`, Tailwind.
- Konkrétní fázový plán je v **sekci 9**, datový model pro Firestore v **sekci 8**.

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

## 4. Produktová rozhodnutí — ROZHODNUTO (2026-06-23)

Všechny otevřené body ze sekce 4 jsou potvrzené uživatelem. Tato rozhodnutí
řídí datový model (sekce 8) i plán (sekce 9).

1. **Anketa i kvíz (přepínač per otázka).** Každá otázka má `mode: 'poll' | 'quiz'`.
   - `poll` = klasická anketa bez správné odpovědi (chování prototypu).
   - `quiz` = má **správnou odpověď**, **body**, volitelný **časový limit** a
     **žebříček** (leaderboard). Kvíz zatím dává smysl u `yesno`, `choice`,
     `order` (správné pořadí); u `scale/matrix/wordcloud/emoji` zůstává jen `poll`.
2. **Autentizace učitele = Google (Firebase Auth).** Učitel se přihlašuje přes
   Google účet; konzole je za auth guardem. Studenti se připojují přes PIN/QR
   **bez přihlášení** (Firebase anonymous auth pro dedup hlasů).
3. **Multi-tenant — více učitelů i více souběžných sessions.** Každá session
   patří `teacherId` (uid), PIN se generuje dynamicky a je unikátní mezi
   *aktivními* sessions. Jeden učitel může mít více sessions (běžící i archivní).
4. **Perzistence + export.** Sessions, otázky a hlasy se ukládají do Firestore.
   Učitel si může výsledky zobrazit zpětně a **exportovat (CSV, případně PDF/tisk
   přes `index-print.html` předlohu)**.
5. **Anonymita = nastavení session (administrace učitelem).**
   - Učitel **vždy** vidí jména v konzoli.
   - Přepínač `showNamesOnProjector` — jména viditelná i na projektoru.
   - Přepínač `showNamesToStudents` — jména viditelná i ve studentském pohledu.
   - Tím se zároveň opravuje matoucí přepínač „Se jmény“ (chyba #6).

**Backend:** Firebase — **Firestore** (realtime `onSnapshot`) + **Firebase Auth**
(Google) + **Firebase Hosting**. Autoritativní sčítání hlasů přes **Cloud
Functions** (anti-cheat, dedup), MVP může počítat na klientovi z listeneru hlasů.

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

## 8. Datový model — Firestore (dle rozhodnutí sekce 4)

Kolekce a dokumenty (cesty), realtime přes `onSnapshot`:

```
users/{uid}                         // profil učitele (Google auth)
  displayName, email, photoURL, createdAt

sessions/{sessionId}
  pin: string                       // unikátní mezi AKTIVNÍMI sessions
  teacherId: string                 // = uid vlastníka
  title: string
  status: 'lobby' | 'live' | 'ended'
  activeQuestionId: string | null
  running: boolean
  activeEnded: boolean
  showOnProjector: boolean          // odhalit výsledky na projektoru
  showToStudents: boolean           // odhalit výsledky studentům
  showNamesOnProjector: boolean     // anonymita — viz §4.5
  showNamesToStudents: boolean      // anonymita — viz §4.5
  showJoinOnProjector: boolean
  viewMode: Record<questionId, string>   // varianta vizualizace (donut/bars…)
  createdAt, updatedAt

sessions/{sessionId}/questions/{questionId}
  type: 'yesno'|'choice'|'order'|'scale'|'matrix'|'wordcloud'|'emoji'
  mode: 'poll' | 'quiz'             // §4.1
  q: string
  order: number                     // pořadí v knihovně
  // typově specifické: options[] | rows[] | min,max,lo,hi | suggestions[]
  // jen quiz: correctAnswer (dle typu), points: number, timeLimitSec?: number

sessions/{sessionId}/votes/{voteId}        // 1 dok = 1 hlas
  questionId, voterId, voterName, payload, ts
  // dedup: voteId = `${questionId}__${voterId}` (1 hlas na otázku a hlasujícího)

sessions/{sessionId}/participants/{voterId}
  name, joinedAt, score             // score jen pro quiz

sessions/{sessionId}/results/{questionId}  // (volitelné) agregace z Cloud Function
  // tvar = výstup emptyResults()+applyVote(); jinak počítat na klientovi
```

**Sčítání:** čisté funkce z `data.jsx` (`emptyResults`/`applyVote`/`aggregateOrder`/
`totalVoters`) se přenesou do TS a po opravě chyb #1/#2 se použijí buď
**autoritativně v Cloud Function** (trigger `onCreate` hlasu → zapíše `results/{qid}`;
anti-cheat, dedup, žebříček quizu), nebo v MVP **na klientovi** z listeneru `votes`.

**Bezpečnostní pravidla (Firestore rules) — záměr:**
- `users/{uid}` — čte/píše jen vlastník.
- `sessions/*` — plný zápis jen `teacherId`; veřejné čtení omezených polí podle PIN
  pro studenty a projektor (čtení control-polí ano, zápis ne).
- `votes` — vytvoření jen když `running && activeQuestionId == questionId`, právě
  1 dok na `voterId+questionId` (vynuceno ID dokumentu), bez update/delete studentem.
- `participants` — student smí vytvořit/aktualizovat jen svůj vlastní dokument.

---

## 9. Plán implementace (fáze) — KONKRÉTNÍ

Fáze 0 (produktová rozhodnutí) je **hotová** (sekce 4). Stack je potvrzen:
**React 19 + Vite + TS + Tailwind + react-router-dom + Firebase (Firestore, Auth
Google, Hosting) + qrcode.react**. Doporučené pořadí prací:

**Fáze 1 — Scaffolding + Firebase. ✅ HOTOVO (2026-06-23)**
- ✅ Vite + React 19 + TS (kořen repa; prototyp zůstává v `prototype/`).
- ✅ Tailwind v4 (`@tailwindcss/vite`); design tokeny portnuty do
  `src/styles/tokens.css` jako CSS proměnné (`--hm-*`), vč. `.hm-dark` projektoru.
- ✅ `react-router-dom`. Routy: `/` (join), `/s/:pin`, `/login`, `/teacher`,
  `/teacher/:sessionId`, `/projector/:pin`, `*`. Kostry v `src/pages/`.
- ✅ Firebase SDK init (`src/lib/firebase.ts`) z env (`.env.example`, `.env` v gitignore).
- ✅ Draft `firestore.rules` + `firebase.json` (hosting → `dist`) + indexy.
- ⏳ Založení reálného Firebase projektu (Firestore/Auth Google/Hosting) — udělá
  uživatel, doplní `.env`.

**Fáze 2 — Doménová logika + typy. ✅ HOTOVO (2026-06-23)**
- ✅ Čisté funkce portnuty do `src/lib/voting.ts`, **opraveny chyby #1 a #2**
  (wordcloud: hlas = pole slov, `voters` zvlášť; `totalVoters` = unikátní hlasující).
- ✅ Typy `Question` (union vč. `mode: poll|quiz`), `Session`, `Vote`, `Participant`,
  `Results` v `src/types.ts`. Metadata + vzorové otázky v `src/lib/questions.ts`.
- ✅ Unit testy (`src/lib/voting.test.ts`, Vitest) — 10 testů, pokrývají opravy #1/#2.

**Fáze 3 — Auth učitele. ✅ HOTOVO (2026-06-23)**
- ✅ Auth kontext `src/lib/auth.tsx` (`AuthProvider`, `useAuth`) — Google
  `signInWithPopup`, `onAuthStateChanged`, odhlášení.
- ✅ Po loginu upsert profilu do `users/{uid}` (`merge`).
- ✅ Route guard `src/components/RequireAuth.tsx` na `/teacher/*` (redirect na
  `/login`, návrat na původní routu).
- ✅ `LoginPage` s Google tlačítkem; `TeacherDashboard` ukazuje uživatele + odhlášení.
- 📄 Návod na nastavení Firebase projektu: `docs/FIREBASE_SETUP.md`.

**Fáze 4 — Datová vrstva Firestore.** CRUD sessions a otázek; generování unikátního
PINu; realtime hooky (`useSession`, `useVotes` přes `onSnapshot`). Bezpečnostní
pravidla dle sekce 8 + lokální emulátor. **Oprava #7** (úprava otázky maže hlasy
jen při změně typu).

**Fáze 5 — Student flow.** Join přes PIN/QR; **reálné QR** (`qrcode.react`)
kódující `…/s/<pin>`; anonymous auth → `voterId`; zápis hlasu + `participants`;
dedup přes ID dokumentu. Port `student-widgets`/`student-view` do TS s **opravou
#11** (touch `preventDefault` v `handleMove`) a **#3** (pauza nevyhazuje do čekárny,
neresetuje `hasVoted`). Odstranit nápovědu s PINem. **Oprava #4, #5** (varianty +
výsledky pro všech 7 typů).

**Fáze 6 — Učitelská konzole.** Knihovna a editor otázek (port `question-editor`),
řízení (spustit/pauza/ukončit), přepínače viditelnosti vč. **`showNamesOnProjector`
/`showNamesToStudents`** (oprava #6). Potvrzení před smazáním hlasů (#7).
Vyhodit `tweaks-panel.jsx`.

**Fáze 7 — Projektor.** Realtime výsledky (port `projector-view`). **Oprava #10**
(histogram = `max−min+1` sloupců, strop rozsahu škály) a **#12** (emoji mřížka dle
počtu možností).

**Fáze 8 — Kvíz režim.** `mode:'quiz'`: správné odpovědi, body, volitelný časový
limit, žebříček (`participants.score`); UI v editoru, studentovi, na projektoru.

**Fáze 9 — Autoritativní sčítání.** Cloud Function `onCreate` hlasu → `results/{qid}`
(anti-cheat, dedup, skóre quizu). Pokud MVP počítal na klientovi, sem přesunout.

**Fáze 10 — Perzistence + export.** Historie sessions na dashboardu; export výsledků
**CSV** (a PDF/tisk přes předlohu `prototype/index-print.html`).

**Fáze 11 — Přístupnost, mobil, hraniční stavy.** Klávesnice pro slider/řazení, ARIA,
oznamování výsledků čtečce; reconnection; velké třídy (30+); dlouhá zadání; zbytky
#13, #14.

**Fáze 12 — Testy a nasazení.** Unit (agregace, rules), e2e hlasovacího flow,
zátěžový test souběžných hlasů, deploy na Firebase Hosting.

---

## 10. Historie
- **2026-06-23** — Audit prototypu + založení této paměti a samostatného repa
  Hlasomat. Prototyp je v `prototype/`. Implementace zatím nezačala.
- **2026-06-23** — Potvrzena všechna produktová rozhodnutí (sekce 4): anketa
  i kvíz (přepínač per otázka), Google auth, multi-tenant, perzistence + export,
  anonymita jako nastavení session. Backend = Firebase/Firestore. Přepsán datový
  model (sekce 8 → Firestore) a fázový plán (sekce 9 → konkrétní).
- **2026-06-23** — **Fáze 1 + 2 hotové.** Scaffolding (Vite+React+TS+Tailwind+
  Firebase init, role-routy, design tokeny) a doménová logika v TS (`voting.ts`
  s opravou #1/#2, typy, 10 unit testů). `npm run typecheck`, `npm test` a
  `npm run build` procházejí.
- **2026-06-23** — **Fáze 3 hotová.** Google auth (`auth.tsx`, `RequireAuth`,
  login, upsert `users/{uid}`), guard na `/teacher/*`. Návod `docs/FIREBASE_SETUP.md`.
  Další na řadě: **Fáze 4 — datová vrstva Firestore (sessions, otázky, PIN, hooky).**
