# Nastavení Firebase pro Hlasomat

Tento návod tě provede založením Firebase projektu, který aplikace potřebuje:
**Firestore** (databáze), **Authentication** (Google přihlášení učitele) a
**Hosting** (nasazení). Bez tohoto kroku poběží jen `npm run build` a testy, ne
živé přihlášení a databáze.

## 1. Založení projektu

1. Otevři <https://console.firebase.google.com> a **Add project** (Přidat projekt).
2. Zadej název (např. `hlasomat`), Google Analytics můžeš vypnout.

## 2. Web aplikace + konfigurace do `.env`

1. V projektu klikni na ikonu **`</>`** („Add app“ → Web).
2. Pojmenuj appku (např. `hlasomat-web`), **Register app**.
3. Firebase ukáže objekt `firebaseConfig`. Z něj zkopíruj hodnoty do souboru
   `.env` v kořeni repa (vytvoř ho z `.env.example`):

   ```bash
   cp .env.example .env
   ```

   ```env
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=hlasomat-xxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=hlasomat-xxxx
   VITE_FIREBASE_STORAGE_BUCKET=hlasomat-xxxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:abc123
   ```

   > `.env` je v `.gitignore` a **nesmí se commitovat**. (Tyto hodnoty nejsou
   > tajné v pravém slova smyslu — ochranu zajišťují bezpečnostní pravidla níže —
   > ale do gitu je stejně nedáváme.)

## 3. Authentication — Google přihlášení

1. V levém menu **Build → Authentication → Get started**.
2. Záložka **Sign-in method → Add new provider → Google → Enable**.
3. Vyber podpůrný e-mail, **Save**.
4. Záložka **Settings → Authorized domains** — pro lokální vývoj tam už je
   `localhost`. Po nasazení přidej i doménu z Hostingu
   (`hlasomat-xxxx.web.app`) a případně vlastní doménu.

> Studenti se přihlašují **anonymně** (Fáze 5). Až k tomu dojde, zapni i
> **Anonymous** provider stejným způsobem.

## 4. Firestore Database

1. **Build → Firestore Database → Create database**.
2. Vyber lokaci (např. `eur3` / `europe-west`), **potvrď**.
3. Začni v **production mode** — pravidla nahradíme níže uvedenými.

## 5. Bezpečnostní pravidla (Firestore Rules)

Pravidla jsou verzovaná v repu v souboru [`firestore.rules`](../firestore.rules).
Nahraj je buď přes Firebase CLI (doporučeno), nebo ručně:

- **Ručně:** Firestore → záložka **Rules** → vlož obsah `firestore.rules` →
  **Publish**.
- **CLI:** viz krok 6.

> ⚠️ Tato pravidla jsou **draft Fáze 1** a budou se s dalšími fázemi upřesňovat
> (zejm. zápis hlasů a agregace přes Cloud Functions). Princip: učitel (vlastník)
> řídí svou session; studenti/projektor jen čtou veřejná pole a vytvářejí vlastní
> hlas.

## 6. Firebase CLI (volitelné, ale doporučené)

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # vyber svůj projekt, dej mu alias "default"
```

Tím se vytvoří `.firebaserc` (project alias). `firebase.json` už v repu je.

Nasazení pravidel a hostingu:

```bash
npm run build                       # vytvoří dist/
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

Lokální emulátor (pro vývoj bez živé DB — využije Fáze 4 pro testy pravidel):

```bash
firebase init emulators            # vyber Firestore + Auth
firebase emulators:start
```

## 7. Ověření

```bash
npm run dev
```

Otevři `http://localhost:5173/login`, klikni **Přihlásit se přes Google**.
Po přihlášení tě to přesměruje na `/teacher` a v kolekci `users` ve Firestore
přibude dokument s tvým `uid`.

---

## Shrnutí kolekcí (co aplikace ve Firestore používá)

| Cesta | Obsah | Kdo zapisuje |
|-------|-------|--------------|
| `users/{uid}` | profil učitele | vlastník (po loginu) |
| `sessions/{id}` | hlasovací session (PIN, stav, přepínače) | vlastník |
| `sessions/{id}/questions/{qid}` | otázky | vlastník |
| `sessions/{id}/votes/{voteId}` | hlasy (1 dok = 1 hlas) | student (na sebe) |
| `sessions/{id}/participants/{voterId}` | připojení studenti, skóre | student (na sebe) |
| `sessions/{id}/results/{qid}` | agregované výsledky | server (Cloud Function) |

Detailní datový model je v `MEMORY.md` §8.
