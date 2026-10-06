# PLAN.md: Keto Thai, architektura i plan techniczny

> **Aktualizacja 2026-10-02:** plik zsynchronizowany ze stanem kodu (wcześniej opisywał m.in. zewnętrzne API produktów, trasę `/tracker` i design „Dark Fighter”, których nie ma; `RAPORT.md` N9). Oznaczenia: ✅ wdrożone · 🟡 częściowo · 📋 zaplanowane · ❌ porzucone.
> Źródła prawdy dla innych warstw: wygląd → `DESIGN.md`, treść i sprzedaż → `MARKETING.md`, postęp sesji → `PROGRES.md`, audyt → `RAPORT.md`.

## 1. Architektura systemu

Aplikacja „Keto Thai” to **SPA (Single Page Application)** w czystym JavaScripcie, z modułem do śledzenia diety.

- **Renderowanie (✅):** cały interfejs wstrzykiwany do jednego `index.html` (Client-Side Rendering). Każda trasa to para `render()` (zwraca HTML jako string) + `init()` (podpina zdarzenia), opcjonalnie `cleanup()` (dziś tylko `/dashboard`). Szablony przez `html` z `src/utils/template.js` (`String.raw`, **nie escape'uje**, więc każdy tekst od użytkownika musi przejść przez `escapeHtml()`).
- **Routing (✅):** własny silnik na `History API` (`pushState`, `popstate`) z delegacją zdarzeń (`[data-link]` na `body`). Zmiana samej kotwicy (`#…`) nie przerysowuje strony. Trasy z parametrem przez query string (`/recipes/edit?id=…`). Brak parametrów ścieżki (`/recipes/<id>`), patrz `RAPORT.md` #7.
- **Guard Onboarding ↔ Dashboard (✅, `src/router.js`, `renderContent`):** przed renderem trasy silnik sprawdza `getUser()` (`src/services/userService.js`, odczyt `localStorage["keto_user"]`).
    - Brak profilu (`!user`) i trasa spoza listy publicznych (`/`, `/onboarding`, `/recipes`, `/knowledge`, `/contact`, `/camp`) → przekierowanie na `/onboarding`. Dotyczy `/dashboard`, `/recipes/new` i `/recipes/edit`.
    - Zapisany profil i wejście na `/onboarding` → przekierowanie na `/dashboard`.
    - Przekierowanie przez `window.history.replaceState` (bez wpisu w historii).
    - 📋 Po wdrożeniu kont (§1a) guard zostaje oparty na **profilu**, nie na koncie: zgodnie z wariantem B aplikacja działa bez logowania.
- **Deep-linki na GitHub Pages (✅):** `public/404.html` zapamiętuje ścieżkę w `sessionStorage` i odbija na stronę główną; `initRouter()` odtwarza adres przez `replaceState` przed pierwszym renderem.
- **Warstwa danych (✅ lokalnie, 📋 Supabase):** widoki nigdy nie dotykają `localStorage` bezpośrednio. Zapis i odczyt przechodzą przez serwisy (`userService`, `mealService`, `customRecipeService`), które wołają `src/state/store.js` (`saveState`/`loadState`). To jedyne miejsce do podmiany przy migracji na Supabase.
    - Klucze: `keto_user` (profil + historia wagi), `keto_meals` (`{ "RRRR-MM-DD": [wpisy] }`), `keto_custom_recipes`, szkice kreatora (`keto_meal_draft`, wygasa następnego dnia).
    - Stan pochodny nie jest zapisywany: „zostało” na Dashboardzie zawsze liczone jako `generateDietPlan(user) − sumMacros(dzień)`.
    - Data dnia w czasie lokalnym (`getDateKey()`), różnice dni przez `getDaysSince()` (`utils/date.js`), nigdy `new Date("RRRR-MM-DD")`.
    - ⚠️ `store.js` nie obsługuje błędów parsowania/zapisu i nie wersjonuje danych (`RAPORT.md` N1, `PROGRES.md` pkt 10).
- **Hosting (🟡):** dziś GitHub Pages (`base: "/keto-thai-app/"` w `vite.config.js`). **Decyzja: docelowa domena kupiona w Hostingerze** (tylko domena, bez pakietu hostingu). DNS domeny wskazuje na GitHub Pages (4 rekordy `A` na serwery GitHub + `CNAME` dla `www`), więc pliki nadal publikuje GitHub Actions, a Hostinger pełni rolę rejestratora domeny. Płatny hosting Hostingera potrzebny byłby wyłącznie przy własnym backendzie (odrzucony, patrz §1a).
    - Kolejność: **najpierw backend (Supabase), potem zakup domeny i podpięcie.**
    - Ścieżki do zasobów budowane względnie / przez `import.meta.env.BASE_URL` (`getBase()`), więc migracja wymaga zmiany `base` na `"/"` w `vite.config.js`. Sztywny adres GitHub Pages zostaje tylko w `og:image` w `index.html` (+ brakujące `og:url`/`canonical`).
    - `localStorage` jest przypisany do adresu strony: dane zapisane pod `github.io` nie przejdą na nową domenę. Dlatego domenę podpinamy przed pozyskaniem użytkowników.
- **Wdrażanie (✅ CI/CD):** `.github/workflows/deploy.yml`. Każdy `push` na `main` to `npm install` → `npm run build` (Vite + `scripts/stamp-sw.js`, który wpisuje hash commita jako wersję cache Service Workera) → publikacja `dist/` na GitHub Pages. Brak ręcznego wgrywania plików, także po podpięciu domeny.
- **Wydajność (🟡):** `IntersectionObserver` do animacji wejścia (`home.js`, `camp.js`), `loading="lazy"` na obrazach. Bez debounce'u (wyszukiwarka produktów filtruje lokalną tablicę, od 2 znaków). Wszystkie dane (produkty + przepisy) ładowane na każdej trasie (`RAPORT.md` N10).

## 1a. Backend: Supabase (decyzja architektoniczna 2026-10-02) 📋

**Wybór:** Supabase (Backend as a Service: PostgreSQL + logowanie + reguły dostępu Row Level Security), plan darmowy, region UE (Frankfurt, ze względu na RODO).
**Odrzucone:** Firebase (baza dokumentowa, brak SQL, rozliczenie od liczby odczytów), własny backend PHP/Node + MySQL na płatnym hostingu Hostingera (całe bezpieczeństwo po naszej stronie, największy skok trudności), pozostanie przy samym `localStorage` z eksportem pliku (brak synchronizacji urządzeń i wglądu trenera).
**Uzasadnienie:** nauka SQL, autentykacji/autoryzacji i pracy z siecią bez pisania i utrzymywania serwera; darmowy limit (~500 MB) z dużym zapasem na skalę projektu; relacyjny model pasuje do danych (użytkownik → posiłki, pomiary, własne przepisy); fundament pod wgląd trenera w dziennik podopiecznego z `/camp`.
**Znane ograniczenie planu darmowego:** projekt usypia po 7 dniach bez aktywności (e-mail z ostrzeżeniem tydzień wcześniej); budzi go wyłącznie właściciel w panelu („Resume project”), dane da się przywrócić do roku. W czasie uśpienia aplikacja musi pokazać komunikat błędu zamiast się wysypać.

**Ustalenia:**
- **Rejestracja, wariant B (konto później):** aplikacja działa w pełni bez konta (strona obiecuje „bez rejestracji”: `home.js`, `onboarding.js`). Zaproszenie do konta pada, gdy użytkownik ma już dane do stracenia: **po dodaniu pierwszego posiłku**, **po 5 dniach** używania i jako **stałe miejsce w dzienniku** na Dashboardzie. Po rejestracji dane z `localStorage` są przenoszone do bazy.
- **Trzy stany użytkownika:** gość bez profilu → gość z profilem (dane lokalne) → zalogowany (dane w Supabase). Nawigacja i zaproszenia zależą od stanu.
- **Metoda logowania:** e-mail + hasło **oraz** „Zaloguj przez Google”. Ekrany: logowanie, rejestracja, „nie pamiętam hasła”, ustawienie nowego hasła, strona konta (wyloguj, **usuń konto**, wymóg RODO). Google wymaga konfiguracji w Google Cloud (adresy przekierowań dla `localhost` i domeny, ekran zgody). Wbudowana poczta Supabase ma bardzo niski limit wysyłek, więc przed startem trzeba podpiąć własny serwer SMTP.
- **Potwierdzanie e-maila, wariant B (decyzja 2026-10-05):** na czas budowy **wyłączone** (Supabase → Authentication → Sign In / Providers → Email → „Confirm email”), więc rejestracja loguje od razu. ⚠️ **WARUNEK STARTU:** zanim konta zobaczą użytkownicy (flaga `ACCOUNTS_ENABLED` w `src/config.js`), włączyć „Confirm email” z powrotem razem z własnym SMTP (etap 7) i dodać w UI ekran „Sprawdź skrzynkę”. Odrzucone: A (włączone od razu, limit maili blokuje testy), C (wyłączone na stałe, konto na cudzy e-mail).
- **Ekran zgody Google, ⚠️ WARUNEK STARTU (ustalone 2026-10-06):** dziś Google pokazuje „Zaloguj się w aplikacji `xclqscyfjjmgrnsxkhzj.supabase.co`” zamiast „Keto Thai”, bo odpowiedź od Google odbiera Supabase (Callback URL), a marka nie jest zweryfikowana. Obca domena na ekranie logowania budzi nieufność. Przed startem kont: (1) **kupić domenę w Hostingerze**, (2) opublikować na niej stronę główną i **politykę prywatności** (etap 7), (3) potwierdzić domenę w Google Search Console, (4) Google Cloud → Google Auth Platform → Promowanie marki: domena, linki, logo → **zgłosić weryfikację marki** (kilka dni roboczych), (5) przełączyć aplikację z „Testowanie” na „W wersji produkcyjnej” i dopisać nową domenę do „Autoryzowanych źródeł JavaScriptu” (Google) oraz do Site URL i Redirect URLs (Supabase). Weryfikacja na `github.io` odrzucona: po zmianie domeny trzeba by ją powtarzać. Własna domena dla Supabase (`auth.…`) odrzucona na teraz: płatny plan + dodatek.
- **Wejście w nawigacji:** link „Konto” w szufladzie hamburgera (mobile) i na dole lewego sidebara (desktop). Jedna trasa konta (formularz dla gościa / strona konta dla zalogowanego); zaproszenia prowadzą na nią z informacją, dokąd wrócić.
- **Co trafia do bazy:** dane należące do użytkownika i zmieniające się (profil, historia wagi, dziennik, własne przepisy). **Zostają w plikach `src/data`:** 200 produktów USDA i 50 przepisów trenera (wspólne dla wszystkich, tylko do odczytu). Szkice kreatora mogą zostać w `localStorage`.
- **Konsekwencja w kodzie:** serwisy przechodzą z synchronicznych na asynchroniczne (`async/await`); widoki dostają stany „ładowanie” i „błąd”.
- **Konsekwencja we wdrażaniu:** kod publikuje się sam (`git push`), schemat bazy i reguły RLS zmienia się osobno w Supabase. Zasada: **najpierw baza, potem kod.**

**Etapy (każdy implementuje autor, krok po kroku):**
1. ✅ Model danych na papierze (co do bazy, jakie tabele i relacje). Wynik: `supabase/schema.sql`.
2. ✅ Konto i projekt w Supabase, region UE, klucze (publiczny `publishable` vs tajny `secret`, który nigdy nie trafia do frontendu). Wartości w `.env.local` (ignorowany przez git).
3. ✅ Tabele i reguły RLS („każdy widzi tylko swoje wiersze”): `supabase/schema.sql` uruchomiony 2026-10-05, test roli `anon` → 42501.
4. ✅ Logowanie (e-mail + hasło, Google) i trasa konta. Frontend + e-mail i hasło: 2026-10-05, Google: 2026-10-06 (`signInWithOAuth`, przepływ PKCE, powrót na `/konto?wroc=…`). Klient OAuth w Google Cloud w trybie „Testowanie” (logują się tylko użytkownicy testowi). Redirect URLs w Supabase: `localhost:5173`, `localhost:5299`, `kondzio88.github.io` (`/keto-thai-app/**`). Przetestowane w przeglądarce: rejestracja, wylogowanie, złe hasło, logowanie, usunięcie konta, logowanie Google.
5. ✅ Serwisy na `async`, po jednym; obsługa błędów sieci. **Wariant C (decyzja 2026-10-06):** odczyty synchroniczne z `localStorage` (lokalna kopia), zapis zalogowanego najpierw do bazy, lokalnie po potwierdzeniu; pobranie danych z bazy przy starcie i każdym logowaniu (`main.js` → `onAuthChange` → `pull…FromServer()` → `refreshCurrentRoute()` tylko przy zmianie). Odrzucone: A (wszystko async, 33 wywołania w 9 plikach + guard), B (local-first z kolejką: offline niepotrzebny, autor zakłada stały internet).
    - ✅ `userService` (2026-10-06): `createProfile()` (onboarding), `addWeightEntry()` (Dashboard), `pullUserFromServer()`. Przetestowane: onboarding → wiersze w `profiles` i `weight_entries`, pomiar → wiersz, „nowe urządzenie” (bez lokalnego profilu) → profil wraca z bazy.
    - ✅ `mealService` (2026-10-06): `addMeal()`, `removeMeal()`, `updateTodayMealsFromRecipe()` async, `pullMealsFromServer()` (cała historia; zawęzić do ostatnich dni, gdy urośnie). Id wpisu z `crypto.randomUUID()`, to samo lokalnie i w bazie; stare id z `Date.now()` zostają tylko lokalnie (etap 6). `getSignedInClient()` i `SAVE_FAILED` wspólne w `supabaseClient.js`. Przetestowane: dodanie z `/recipes` → wiersz w `meals`, „nowe urządzenie” → dziennik wraca z bazy, „Usuń” → wiersz znika, gość → tylko lokalnie.
    - ✅ `customRecipeService` (2026-10-06): zapis przepisu ze składnikami w **jednej transakcji** przez funkcję `save_custom_recipe()` (`supabase/002_custom_recipes.sql`, `security invoker`, upsert + podmiana składu; wariant A spośród A/B/C: odrzucone dwa zapytania z kompensacją i kolumna `jsonb`). Usunięcie zwykłym `delete` (składniki: kaskada). `pullCustomRecipesFromServer()` z zagnieżdżonym `select`. Id przepisu z `crypto.randomUUID()`; stare `user-…` zostają lokalne (etap 6). Przetestowane: tworzenie w kreatorze, edycja + „Popraw wpis” w dzienniku, `grams = 0` → cała transakcja cofnięta, „nowe urządzenie”, usunięcie. **Etap 5 zakończony dla wszystkich trzech serwisów.**
    - ⚠️ Znane luki do etapu 6: wylogowanie zostawia lokalne dane; „Skasuj dane aplikacji” u zalogowanego czyści tylko lokalną kopię (wraca przy następnym pobraniu); konto bez profilu w bazie zachowuje lokalny profil, ale nie wysyła go do bazy. `signOut()` ma domyślny `scope: "global"` (wylogowuje wszystkie urządzenia): do decyzji.
6. Przeniesienie danych z `localStorage` przy pierwszym logowaniu, w tym **scalanie** danych z dwóch urządzeń (decyzja otwarta).
7. RODO (polityka prywatności, dane o wadze), zakup domeny w Hostingerze i podpięcie, **weryfikacja marki w Google** (patrz „Ekran zgody Google” wyżej).

## 2. Stos technologiczny

Natywne technologie webowe, bez frameworka.

- **Język (✅):** Vanilla JavaScript (ES Modules): funkcje strzałkowe, `async/await` (wysyłka formularzy), metody tablicowe.
- **Środowisko (✅):** Vite (jedyna zależność w `package.json`, `devDependencies`), serwer deweloperski z HMR i build produkcyjny.
- **Stylizacja (✅):** czysty CSS: tokeny w `src/styles/base/global.css` (9 kolorów z `DESIGN.md`), Grid i Flexbox, mobile-first. Pliki: `base/`, `components/`, `pages/`, zbierane w `src/styles/main.css`. Zero `box-shadow`.
- **Fonty (✅):** Google Fonts: Big Shoulders Stencil, Martian Mono, Public Sans.
- **Dane żywieniowe (✅):** **USDA FoodData Central, SR Legacy (licencja CC0)**. 200 produktów w `src/data/productsData.js` (wartości na 100 g + miary domowe `portions` z `food_portion.csv`), generowane skryptem `scripts/build-products.js`, który przerywa przy niejednoznacznym dopasowaniu. Żadnego zewnętrznego API w czasie działania.
    - ❌ **Porzucone:** Edamam API / Open Food Facts API.
- **Przepisy (✅):** 50 przepisów w `src/data/recipesData.js`, makro i błonnik liczone z bazy USDA; zdjęcia CC0 hostowane lokalnie w `public/images/recipes/` (pobierane skryptem `scripts/fetch-recipe-image.js`).
- **Model żywieniowy (✅, `src/services/calculatorService.js`):** BMR wzorem Mifflin-St Jeor, 5 poziomów aktywności PAL (`ACTIVITY_LEVELS`: mnożnik + białko g/kg), cel kaloryczny jako % TDEE (redukcja −15%, masa +10%), podłoga kaloryczna (`FLOOR_LIMIT`), białko od masy referencyjnej (BMI 25), węgle 50 g **netto** jako sufit, tłuszcz jako reszta. Uzasadnienie: `PROGRES.md` (sesje 18.09, 25.09, 02.10).
    - ❌ Porzucone: sztywny split 70/20–25/5 i „mnożniki pod sporty walki” (pole `sport` zapisywane w profilu, bez wpływu na wynik).
- **Formularze (✅):** **Web3Forms** (`fetch` POST do `api.web3forms.com`) w `/camp` i `/contact`. Klucz publiczny z założenia, zduplikowany w dwóch plikach; brak ochrony antyspamowej (`RAPORT.md` N4).
- **Wykresy (✅):** Chart.js, tylko wykres liniowy wagi na Dashboardzie. Ładowany z CDN globalnie, bez przypiętej wersji (`RAPORT.md` #24).
- **Ikony (✅):** Lucide (UMD z CDN `lucide@latest`, renderowane przez `lucide.createIcons()` po każdym renderze trasy) + SVG marek z Simple Icons w stopce.
- **PWA (✅):** `public/manifest.webmanifest`, ikony 192/512/maskable, `public/service-worker.js` (cache-first, wersja per commit), baner instalacji (`src/utils/installPrompt.js`, zdarzenie `beforeinstallprompt`). ⚠️ SW zapisuje w cache także odpowiedzi z błędem (`RAPORT.md` N2).
- **Skrypty narzędziowe (poza bundlem, `scripts/`):** `build-products.js` (baza produktów z CSV USDA), `fetch-recipe-image.js` (lokalne zdjęcia przepisów), `screenshot-steps.js` (zrzuty do sekcji Steps; `puppeteer-core` instalowany tymczasowo `--no-save`), `stamp-sw.js` (wersja Service Workera).
- **Backend (📋):** Supabase (§1a).
- **Brak (świadomie odnotowane):** testów automatycznych (rekomendacja: Vitest dla `calculatorService`, `productService`, `utils/date.js`), lintera/formattera, analityki.

## 3. Design system

**Jedyne źródło prawdy: `DESIGN.md`** („Keto Thai: Dziennik Treningowy”: papier kraft na ciemnej macie, czerwień ołówka trenera, Big Shoulders Stencil / Martian Mono / Public Sans, detale fizyczne zamiast cieni). Kierunek wybrany metodą skilla `impeccable` (`.claude/skills/impeccable/`); hook detektora AI-slopu włączony przy edycjach UI.

- ❌ **Porzucony kierunek „Dark Fighter”** (złoto `#D4AF37`, zieleń `#2ECC71`, Oswald/Inter, tokeny `--font-size-*`) i „Stealth Minimalism”. Nie stosować.
- **Wzorce UX wdrożone (✅):** bottom tab bar (mobile) / sidebar po lewej (desktop ≥768 px) + topbar z szufladą hamburgera; toast z pieczątką (`components/toast.js`, `role="status"`, pauza przy hover/fokusie); dostępne modale (`confirmModal.js`, `submitSuccessModal.js`, modal wagi; `utils/focusTrap.js`); natywne `<details>` (zastrzeżenia w stopce); ghost buttons; płynne przewijanie do kotwic.
- 📋 **Stan ładowania (do rozważenia, wstępny wybór 2026-10-06):** wariant 3, czyli bez szkieletu, jedna pieczątka `.stamp-off` „Wczytuję dziennik…” w miejscu treści. Odrzucony shimmer z Instagrama/Facebooka (przesuwająca się poświata łamie `DESIGN.md` §3 „zero glow”). Alternatywa na stole: szkielet „niewypełniona kartka” (przerywane linie na `--paper`, powolne pulsowanie przezroczystości, statyczny przy `prefers-reduced-motion`). W wariancie C etapu 5 ładowanie występuje rzadko: odczyty idą z `localStorage`, a pusty ekran widzi tylko ktoś logujący się pierwszy raz na nowym urządzeniu. Poniżej ~0,3 s nie pokazywać niczego (mignięcie wygląda gorzej niż brak). Zapisy: przycisk „Zapisuję…” (`runAction()`).

## 4. Funkcjonalności i trasy

### `/` Strona główna ✅
- **Cel:** konwersja i autorytet (tryb Persuade).
- **Dziś:** Hero → Philosophy (3 karty) → About → Steps (zrzuty prawdziwej aplikacji) → Camp-offer → FAQ → finałowe CTA. 📋 Docelowa kolejność „Lejek” z `MARKETING.md`: Hero → Steps → About → Philosophy → Camp-offer → FAQ → CTA.
- ❌ Sekcja „Metamorfozy przed/po”: porzucona (brak podopiecznych; dowodem jest wieloletnia forma autora, `MARKETING.md`).

### `/camp` Fighter's Camp, mentoring 1-na-1 ✅
- Hero → Camp-coach (trener) → oś czasu 3 faz (12 tygodni) → 4 filary wsparcia (różne kontenery) → kwalifikacja (dla kogo / dla kogo nie) → formularz aplikacyjny (Web3Forms, notka RODO, modal potwierdzenia). Limit 5 miejsc to realne zobowiązanie.

### `/onboarding` Kalkulator ✅
- **Jeden formularz** (nie wieloetapowy kreator): płeć, wiek (18–99), wzrost, waga (`WEIGHT_LIMITS` 35–200 kg), aktywność, rodzaj sportu, cel (redukcja / utrzymanie / masa) + wymagany checkbox zastrzeżeń medycznych (niezapisywany). Logika: §2 „Model żywieniowy”.

### `/dashboard` Panel użytkownika ✅ (dawniej planowany jako `/tracker`)
- **Bilans dnia:** tabela Cel / Zjedzone / Zostało + miarki, pieczątka przy przekroczonych węglach, notka przy podłodze kalorycznej.
- **Dziennik posiłków:** wpisy z ikoną pory, makro, usuwaniem; przypomnienie o ważeniu po 7 dniach (`WEIGH_IN_INTERVAL_DAYS`).
- **Trend wagi:** wykres liniowy Chart.js + modal pomiaru z walidacją przy polu.
- „Skasuj dane aplikacji”.
- ❌ Porzucone: wykres kołowy makro (pokazywał niezmienny plan), moduł nawodnienia.
- 📋 Przełącznik dni (`getDateKey(date)` przyjmuje już dowolną datę), wejście do `/camp` (`RAPORT.md` #30), stałe miejsce zaproszenia do konta (§1a).

### `/recipes` Przepisy ✅
- Siatka 50 przepisów trenera + własne przepisy, filtry kategorii, szczegóły z instrukcjami, „Dodaj do mojego dnia” (wspólne `components/addToDay.js`, toast „Dodano” z linkiem do dnia).
- 📋 Własny adres szczegółu (`/recipes/<id>`), porcje przy dodawaniu, ulubione.

### `/recipes/new` i `/recipes/edit?id=` Kreator własnych przepisów ✅ (dawniej „Search Modal”)
- Wyszukiwarka 200 produktów lokalnych (`productService.searchProducts`, bez API, bez debounce), ilość w gramach albo w miarach domowych (łyżka, jajko M…), podgląd makro, zapis składu `{ productId, grams }`, szkic odporny na zamknięcie aplikacji, edycja zapisanego przepisu.
- 📋 „Dodaj własny produkt” (np. twaróg, brak w USDA).

### `/contact` Kontakt ✅
- Formularz (Web3Forms), karta zaufania z danymi trenera, notka RODO.

### `/knowledge` Baza wiedzy 🟡
- Dziś: uczciwy stan „W opracowaniu” (pieczątka `.stamp-off`).
- **Decyzja architektoniczna (2026-10-05): wariant C, czyli pliki Markdown w repo, najpierw tłumaczenie w przeglądarce, później przy buildzie.**
    - **Główny kanał:** linki w Stories na Instagramie i w relacjach na Facebooku (naklejka „Link”). Liczy się to, że człowiek po kliknięciu trafia prosto na artykuł. Podgląd linku dla robotów jest drugorzędny. Tempo: 1–2 artykuły tygodniowo, jedyny autor to właściciel repo (publikacja = commit + push, bez panelu admina).
    - **Treść:** jeden plik `.md` na artykuł. Frontmatter (tytuł, adres, zdjęcie, krótki opis…; lista pól do ustalenia) zasila kartę w siatce, a treść pokazuje się w widoku artykułu.
    - **Widoki:** `/knowledge` to siatka kart (duży tytuł, zdjęcie, krótki opis; tryb Read z `DESIGN.md`), a `/knowledge/<slug>` to pełny artykuł z CTA do `/camp`.
    - **Etap 1 (📋):** pliki `.md` wczytywane przez Vite jako tekst (każdy artykuł ładowany dopiero przy otwarciu, żeby nie powiększać `RAPORT.md` N10), frontmatter oddzielany od treści, parser Markdown → HTML w przeglądarce (biblioteka czy własny parser: decyzja otwarta). Działa dla ludzi, ale robot nic nie widzi (brak podglądów i SEO), a wejście z linku przechodzi przez `404.html` (podwójne ładowanie).
    - **Etap 2 (📋, gdy artykułów będzie kilkanaście):** skrypt po `vite build` (jak `stamp-sw.js`) generuje `dist/knowledge/<slug>/index.html` z własnymi znacznikami Open Graph. Pliki `.md` się nie zmieniają. Do wyboru: B1 (samodzielna strona statyczna) lub B2 (strona statyczna przejmowana przez SPA, czyli ręczna hydratacja).
    - **Warunki konieczne już w etapie 1:**
        - **Adres artykułu to ścieżka** (`/knowledge/<slug>`), **nie query** (`?a=<slug>`). GitHub Pages ignoruje query, więc przy query etap 2 wymagałby zmiany adresów, a linki ze starych Stories przestałyby działać.
        - **Router z parametrem ścieżki** (dziś `routes[path]` dopasowuje tylko dokładne klucze, a nieznana ścieżka cicho pokazuje `/`). Przyda się też dla `/recipes/<id>`.
        - **Poprawiony guard:** dziś porównuje ścieżkę z listą dokładnych napisów, więc gość wchodzący na `/knowledge/<slug>` trafia na `/onboarding`. Linki z Instagrama i Facebooka otwierają się we wbudowanej przeglądarce z pustym `localStorage`, czyli **każdy klikający w Story jest gościem bez profilu**.
    - ❌ **Odrzucone:** W1 (artykuły w Supabase i panel admina): przy 1–2 wpisach tygodniowo panel się nie zwraca, a darmowy Supabase usypia po 7 dniach bez aktywności (link ze Story pokazałby błąd). Odrzucone też B od razu (za dużo nowych mechanizmów naraz przy kanale, w którym roboty są drugorzędne).
    - 📋 **Później:** kłódka 80/20 ze `STRATEGY.md` (treść premium w Supabase za RLS, publiczna zajawka w pliku, czyli rozwinięcie w stronę wariantu W3), parametry UTM w linkach ze Stories (`404.html` zachowuje query string), analityka.

### Trasa konta 📋
- Logowanie / rejestracja (e-mail + hasło, Google) dla gościa; e-mail, wyloguj, usuń konto dla zalogowanego. Szczegóły w §1a.

### `/treningi-tychy` 📋 (ustalone 2026-09-09)
Osobna trasa dla lokalnej oferty treningów personalnych Muay Thai na macie w Tychach i okolicach (`STRATEGY.md` §3 „Dominacja Lokalna”). Świadomie **nie** jest sekcją na `/`: mieszanie intencji „kalkulator makro” (produkt) z „trener personalny Tychy” (usługa lokalna) na jednej stronie rozmywałoby temat dla obu fraz w wyszukiwarce, a realne lokalne SEO i tak napędza Google Business Profile + dedykowany URL, nie treść na home. Home odsyła tu tylko jednym zdaniem z linkiem. To mały, dodatkowy lejek na lokalnego klienta, nie główna ścieżka produktu. Treść (lokalizacja, forma zajęć, dla kogo, kontakt) do dostarczenia. Pełne uzasadnienie decyzji w `MARKETING.md` i `PROGRES.md` (sesja 2026-09-09 cz. 2).

**Lokalne SEO pod tę trasę (do zrobienia przy wdrożeniu):**
- **Google Business Profile (GBP):** darmowy profil firmy w Google/Google Maps. Dla usługi lokalnej to zwykle większa dźwignia rankingowa niż sama treść strony, więc warto założyć go jako pierwszy krok.
- **Spójność NAP** (Name, Address, Phone): identyczne dane wszędzie (strona, GBP, Facebook, Instagram).
- **Docelowo:** znacznik `LocalBusiness` (JSON-LD), gdy adres, godziny i forma zajęć będą ustalone.

## 5. Struktura folderów (stan na 2026-10-02)

```text
keto-thai-app/
├── index.html                  # szkielet: topbar, szuflada, tabbar, #app, stopka (zastrzeżenia)
├── vite.config.js              # base: "/keto-thai-app/" → "/" po podpięciu domeny
├── package.json
├── .github/workflows/deploy.yml   # CI/CD: build + publikacja na GitHub Pages
├── scripts/                    # narzędzia poza bundlem (produkty, zdjęcia, zrzuty, wersja SW)
├── public/                     # kopiowane 1:1 do dist/: 404.html, manifest, service-worker.js,
│                               # ikony, logo SVG, zdjęcia, images/recipes/, images/steps/
└── src/
    ├── main.js                 # start: router, aktywny tab, szuflada, SW, zastrzeżenia
    ├── router.js               # History API + guard profilu
    ├── routes.js               # mapa tras → render/init/cleanup
    ├── components/             # addToDay, confirmModal, submitSuccessModal, toast
    ├── data/                   # productsData.js (USDA), recipesData.js
    ├── pages/                  # home, camp, onboarding, dashboard, recipes, mealBuilder, contact
    ├── services/               # calculator, user, meal, customRecipe, product
    ├── state/store.js          # jedyny dostęp do localStorage (przyszła podmiana na Supabase)
    ├── styles/                 # main.css + base/ components/ pages/
    └── utils/                  # date, env, escapeHtml, focusTrap, installPrompt, template
```
⚠️ `src/assets/` (stare makiety i kopie zdjęć, 5,2 MB) nie jest nigdzie używany: do usunięcia (`RAPORT.md` N7). 📋 Przy Supabase dojdzie klient bazy (np. `src/services/supabaseClient.js` lub `src/api/`).

## 6. Dalszy rozwój (Post-MVP / roadmap)

### 1. PWA ✅ wdrożone (2026-09-24)
Manifest, ikony, Service Worker z wersją per commit, baner instalacji. Do poprawy: cache tylko poprawnych odpowiedzi (`RAPORT.md` N2), test na fizycznym telefonie.

### 2. Książka przepisów 🟡
- ✅ Szczegóły z instrukcją krok po kroku, „Dodaj do mojego dnia”, pora posiłku z kategorii przepisu.
- 📋 Przelicznik porcji (1×, 2×, 0,5×), wybór pory posiłku przy dodawaniu, własny URL przepisu.

### 3. Dynamiczny bilans w Dashboardzie ✅
Cel z kalkulatora − zjedzone, węgle netto, ostrzeżenie o przekroczeniu węgli, natychmiastowe przeliczenie po dodaniu posiłku.

### 4. Konta i synchronizacja (Supabase) 📋
Patrz §1a. Odblokowuje: dane na wielu urządzeniach, wgląd trenera w dziennik podopiecznego Campu, artykuły tylko dla podopiecznych.

### 5. Narzędzia konwersji i analityki (mentoring upsell) 📋
- **Keto Readiness Score (poranny test gotowości):** 3 pytania (sen, energia, regeneracja); przy powtarzających się spadkach formy kontekstowa sugestia konsultacji na `/camp`.
- **Raport postępów (Fighter's Metabolic Report):** podsumowanie (trendy wagi, średni bilans makro) do PDF / druku dla analizy z trenerem.
- Przechwyt e-maila dla niezdecydowanych i analityka bez ciasteczek (`RAPORT.md` #29).
