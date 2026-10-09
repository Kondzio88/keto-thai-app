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
- ⚠️ **DECYZJA DO PODJĘCIA przed startem kont (zapisane 2026-10-08): jak nie dopuścić do uśpienia bazy.** Za aktywność Supabase uznaje zapytania do bazy, API i Edge Functions ([dokumentacja](https://supabase.com/docs/guides/platform/free-project-pausing): „kilka zapytań dziennie” przez tydzień wystarcza). **U nas ruch generują wyłącznie zalogowani:** gość nie dotyka bazy wcale, a zalogowany czyta z lokalnej kopii (wariant C), więc do bazy idą tylko zapisy i pobranie przy starcie/logowaniu. Przy kilku podopiecznych tydzień przerwy wystarczy, żeby projekt zasnął, a następna osoba zobaczy błąd, dopóki właściciel nie kliknie „Resume project”.
    - Warianty: **A** automatyczny „ping” raz dziennie (np. zaplanowany GitHub Actions z prostym zapytaniem; popularne obejście, darmowe, ale to obchodzenie zasad planu darmowego); **B** płatny plan Pro (projekty nie usypiają; koszt miesięczny); **C** zostawić i reagować na e-mail z ostrzeżeniem (zero kosztu, ryzyko przestoju, gdy mail umknie).
    - **Powiązany problem w UI:** uśpiony projekt zwraca błąd jak brak sieci, więc użytkownik widzi „Sprawdź internet” (`SAVE_FAILED` w `supabaseClient.js`, `toMessage()` w `authService.js`), choć wina jest po naszej stronie. Do rozważenia: rozróżnienie po `navigator.onLine` (czy wystarczy?) i komunikat „Serwer chwilowo nie odpowiada”. Pobieranie z bazy (`pull…FromServer()`) przy błędzie milczy: użytkownik nie wie, że widzi starą kopię.

**Ustalenia:**
- **Rejestracja, wariant B (konto później):** aplikacja działa w pełni bez konta (strona obiecuje „bez rejestracji”: `home.js`, `onboarding.js`). Zaproszenie do konta pada, gdy użytkownik ma już dane do stracenia: **po dodaniu pierwszego posiłku**, **po 5 dniach** używania i jako **stałe miejsce w dzienniku** na Dashboardzie. Po rejestracji dane z `localStorage` są przenoszone do bazy.
- **Trzy stany użytkownika:** gość bez profilu → gość z profilem (dane lokalne) → zalogowany (dane w Supabase). Nawigacja i zaproszenia zależą od stanu.
- **Metoda logowania:** e-mail + hasło **oraz** „Zaloguj przez Google”. Ekrany: logowanie, rejestracja, „nie pamiętam hasła”, ustawienie nowego hasła, strona konta (wyloguj, **usuń konto**, wymóg RODO). Google wymaga konfiguracji w Google Cloud (adresy przekierowań dla `localhost` i domeny, ekran zgody). Wbudowana poczta Supabase ma bardzo niski limit wysyłek, więc przed startem trzeba podpiąć własny serwer SMTP.
- **Potwierdzanie e-maila, wariant B (decyzja 2026-10-05):** na czas budowy **wyłączone** (Supabase → Authentication → Sign In / Providers → Email → „Confirm email”), więc rejestracja loguje od razu. ⚠️ **WARUNEK STARTU:** zanim konta zobaczą użytkownicy (flaga `ACCOUNTS_ENABLED` w `src/config.js`), włączyć „Confirm email” z powrotem razem z własnym SMTP (etap 7) i dodać w UI ekran „Sprawdź skrzynkę”. Odrzucone: A (włączone od razu, limit maili blokuje testy), C (wyłączone na stałe, konto na cudzy e-mail).
- **Ekran zgody Google, ⚠️ WARUNEK STARTU (ustalone 2026-10-06):** dziś Google pokazuje „Zaloguj się w aplikacji `xclqscyfjjmgrnsxkhzj.supabase.co`” zamiast „Keto Thai”, bo odpowiedź od Google odbiera Supabase (Callback URL), a marka nie jest zweryfikowana. Obca domena na ekranie logowania budzi nieufność. Przed startem kont: (1) **kupić domenę w Hostingerze**, (2) opublikować na niej stronę główną i **politykę prywatności** (etap 7), (3) potwierdzić domenę w Google Search Console, (4) Google Cloud → Google Auth Platform → Promowanie marki: domena, linki, logo → **zgłosić weryfikację marki** (kilka dni roboczych), (5) przełączyć aplikację z „Testowanie” na „W wersji produkcyjnej” i dopisać nową domenę do „Autoryzowanych źródeł JavaScriptu” (Google) oraz do Site URL i Redirect URLs (Supabase). Weryfikacja na `github.io` odrzucona: po zmianie domeny trzeba by ją powtarzać. Własna domena dla Supabase (`auth.…`) odrzucona na teraz: płatny plan + dodatek.
- **Wejście w nawigacji:** link „Konto” w szufladzie hamburgera (mobile) i na dole lewego sidebara (desktop). Jedna trasa konta (formularz dla gościa / strona konta dla zalogowanego); zaproszenia prowadzą na nią z informacją, dokąd wrócić.
- **Co trafia do bazy:** dane należące do użytkownika i zmieniające się (profil, historia wagi, dziennik, własne przepisy). **Zostają w plikach `src/data`:** 200 produktów USDA i 50 przepisów trenera (wspólne dla wszystkich, tylko do odczytu). Szkice kreatora mogą zostać w `localStorage` (czyszczone przy wylogowaniu, patrz etap 5).
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
    - **Wylogowanie czyści dane lokalne (decyzja 2026-10-06, 📋 do wdrożenia):** przy „Wyloguj” usuwamy **wszystkie pięć kluczy**: `keto_user`, `keto_meals`, `keto_custom_recipes`, `keto_meal_draft`, `keto_meal_edit_draft` (szkice też, bo zdradzają, co ktoś je). Czyścimy **nawet gdy `signOut()` zwróci błąd** (np. brak sieci). Powód: dane o zdrowiu (art. 9 RODO) nie mogą zostać dla następnej osoby przy wspólnym komputerze. W wariancie C nic nie ginie, bo oryginał danych zalogowanego jest w bazie i wraca przy logowaniu. Odrzucone: B (zostawiamy: dane widoczne dla następnej osoby, a puste konto „przejmuje” cudze dane, `mealService.js` warunek `data.length === 0`), C (zostawiamy z podpisem właściciela: najbardziej złożony, cudze dane i tak leżą w przeglądarce).
    - **`signOut()` tymczasowo globalne (ustalone 2026-10-06):** „Wyloguj” kończy sesję na wszystkich urządzeniach (domyślne `scope: "global"` w `authService.js`). ⏳ Decyzja ostateczna **na końcu, gdy aplikacja będzie działać na domenie**: zostawić globalne albo rozdzielić na „Wyloguj” (to urządzenie, `scope: "local"`) i „Wyloguj ze wszystkich urządzeń” (wzorzec Google/Netflix).
    - ⚠️ **Znane luki i łatki (zebrane 2026-10-06):**
        1. **Dane gościa nie trafiają do bazy.** Rejestracja przy pustej bazie zostawia je tylko lokalnie (`pull…FromServer()` przy `data.length === 0`). Po wdrożeniu czyszczenia przy wylogowaniu **znikną bezpowrotnie**. Łatka: etap 6. ⚠️ **WARUNEK STARTU kont.**
        2. **Logowanie na konto z danymi nadpisuje dane gościa** (np. tydzień wpisów na laptopie bez konta). Łatka: etap 6, wzorzec scalania do wyboru (patrz pkt 6 niżej).
        3. **Wspólny komputer bez kliknięcia „Wyloguj”:** zamknięcie karty zostawia sesję i dane (Supabase trzyma sesję w przeglądarce). Łatka do rozważenia: automatyczne wylogowanie po bezczynności (wzorzec bankowy).
        4. **„Skasuj dane aplikacji” u zalogowanego** czyści tylko lokalną kopię, dane wracają przy następnym pobraniu. Gorzej: kasowanie odsyła do onboardingu, a `createProfile()` robi `upsert`, więc **nowy profil nadpisuje stary w bazie, a stare posiłki, waga i przepisy zostają** — po odświeżeniu powstaje mieszanka nowego celu ze starym dziennikiem. Okno obiecywało „Tej operacji nie można cofnąć”.
            - ✅ **Łatka 2026-10-07 — wariant C:** zalogowany nie widzi przycisku (`initDeleteData()` w `dashboard.js` usuwa go po potwierdzeniu sesji przez `getSession()`). Gość ma go bez zmian. Zalogowany ma „Usuń konto i dane” w `/konto`, a wyjściem z zepsutych danych lokalnych jest „Wyloguj” (też czyści `localStorage`). Odrzucone: **A** (sam inny tekst okna — przestaje kłamać, ale ścieżka z mieszanką danych zostaje), **B** (kasowanie też w bazie, konto zostaje — prawdziwa funkcja, nie łatka; odłożona).
            - 📋 **Luka funkcjonalności do rozważenia — „Zacznij od nowa” dla zalogowanego (wariant B):** dziś zalogowany, który chce wyzerować dziennik i profil (np. zmiana celu z redukcji na masę po długiej przerwie), musi usunąć całe konto i założyć nowe. Do decyzji: czy ta potrzeba istnieje (zapytać pierwszych podopiecznych), a jeśli tak — co kasujemy (profil + waga + posiłki + własne przepisy, czy np. bez przepisów) i jak: **jedna funkcja w bazie w transakcji** (wzorem `save_custom_recipe()`), żeby awaria w połowie nie zostawiła resztek. Osobno: czy samą zmianę celu załatwia raczej edycja profilu bez kasowania historii.
        5. **Konto bez profilu w bazie** zachowuje lokalny profil, ale nie wysyła go do bazy. Łatka: etap 6.
        6. **Stare id** (`Date.now()` w dzienniku, `user-…` w przepisach) nie pasują do kolumn `uuid`. Przy przenoszeniu nowy uuid przepisu musi trafić też do `recipeId` wpisów w dzienniku, inaczej „Popraw wpis” zgubi powiązanie. Łatka: etap 6.
        7. **Brak odświeżania między urządzeniami w trakcie:** dane z bazy pobierane tylko przy starcie i logowaniu; zmiana na telefonie pojawi się na laptopie dopiero po przeładowaniu. Na razie akceptowalne (jeden użytkownik, brak trenera w dzienniku).
        8. Z testów 2026-10-06: ~~zgody z rejestracji nigdzie się nie zapisują~~ ✅ 2026-10-08: tabela `consents` + bramka zgód (`PRAWO.md` §14); „Sprawdź skrzynkę” w czerwonej ramce błędu; ~~po Google powrót zawsze na `/konto`, `?wroc=` niewykonane~~ ✅ naprawione 2026-10-06 (wariant A: znacznik `google=1` w adresie powrotu, `initAccount` przekierowuje z `replace`, `/onboarding` → `/dashboard`; prawdziwe przejście przez Google do potwierdzenia przez autora); baner instalacji PWA zasłania dół Dashboardu.
        9. **Wylogowanie globalne z innego urządzenia nie czyści danych lokalnych.** „Wyloguj” na telefonie (`scope: "global"`) kończy sesję laptopa, ale `clearLocalData()` (`src/services/localDataService.js`) woła tylko przycisk „Wyloguj”/„Usuń konto” na danym urządzeniu, więc profil i dziennik zostają w przeglądarce laptopa. Łatka: w `onAuthChange` (`main.js`) przy zdarzeniu `SIGNED_OUT` wywołać `clearLocalData()`. Wraca razem z decyzją o `signOut()` globalnym vs lokalnym.
        10. **Kilka otwartych kart przy logowaniu (znalezione w testach 2026-10-08).** Supabase powiadamia o logowaniu wszystkie karty tej samej strony, a każda uruchamia przenoszenie danych gościa (`accountMergeService.js`). Blokada `running ??=` działa tylko w obrębie jednej karty, więc przy dwóch kartach w S2 pokażą się dwa okna; [Dodaj] w obu może dwa razy wysłać pomiary wagi (posiłki i przepisy chroni id, wagę nie). Łatki do wyboru: blokada między kartami (`navigator.locks`), unikalność `(user_id, measured_on)` w bazie albo okno tylko w karcie, w której kliknięto „Zaloguj”.
            - ⏸️ **Odłożone (decyzja autora 2026-10-08):** na razie mało istotne. Warianty wytłumaczone: **1** `navigator.locks` (karta B czeka, aż A ustawi `keto_owner`, więc drugie okno w ogóle się nie pokaże); **2** `unique (user_id, measured_on)` (siatka w bazie, ale zmienia zasadę: dziś `addWeightEntry()` pozwala na kilka pomiarów dziennie, więc trzeba by przejść na „nowy pomiar z dnia nadpisuje poprzedni”, nie usuwa dwóch okien, wymaga SQL); **3** znacznik w `sessionStorage` (łamie „pytamy ponownie przy następnym starcie”, odrzucone na starcie rozmowy). Wzorzec seniorski: 1 + 2. Pytanie otwarte przy wariancie 2: czy podopieczni ważą się kilka razy dziennie (np. tydzień ścinania wagi przed walką)?
            - 📌 **Ten sam problem bez kilku kart (audyt 2026-10-09):** `addWeightEntry()` zawsze dopisuje pomiar, więc dwa pomiary jednego dnia w jednej karcie to dwa punkty z tą samą etykietą na wykresie wagi (po skróceniu dat do „DD.MM” — dwa razy „09.10” obok siebie). Plan liczy się z ostatniego pomiaru, więc kalorie są poprawne; problem jest tylko wizualny. Rozwiąże go ta sama decyzja co wariant 2 („nowy pomiar z dnia nadpisuje poprzedni”). Odłożone razem z luką nr 10.
        11. **Nieaktualny ekran przy kilku kartach po synchronizacji (znalezione w testach 2026-10-09).** Objaw: zalogowany, pusta lokalna kopia posiłków, odświeżenie strony → dane wracają z bazy do `localStorage`, ale Dashboard pokazuje „Zjedzone 0”, dopóki nie wciśnie się F5 drugi raz. Diagnoza (log w `main.js`, usunięty po teście): obie synchronizacje (`SIGNED_IN` i `INITIAL_SESSION`) zwróciły `changed: false`. Prawdopodobna przyczyna: **druga otwarta karta aplikacji** dostała zdarzenie logowania, zsynchronizowała się pierwsza i zapisała dane do wspólnego `localStorage`, a ta karta porównała bazę z już uzupełnioną kopią, uznała „bez zmian” i nie zawołała `refreshCurrentRoute()`. Sedno: `changed` mówi, czy zmieniła się **kopia w `localStorage`**, a nie czy **ekran tej karty** pokazuje aktualne dane. Przy jednej karcie (nowy telefon, incognito) nie powinno wystąpić. ⚠️ **Hipoteza do potwierdzenia:** jedna karta, logowanie w oknie incognito; posiłki widoczne od razu = przyczyna potwierdzona. Kierunki łatki (bez decyzji): przerysowanie po każdej udanej synchronizacji, a nie tylko po `changed`; nasłuch zdarzenia `storage` (inna karta zmieniła `localStorage`); wspólna blokada z luką nr 10 (`navigator.locks`). Nie dotyczy przełącznika dni (wybrany dzień jest w adresie i przetrwa przerysowanie — sprawdzone).
6. ✅ **Zrobione 2026-10-08** (`4369bc4`, `src/services/accountMergeService.js`; przetestowane w Chrome: S1, S2 + Esc / Dodaj / Odrzuć, F5, wylogowanie i powrót, usunięcie konta). Zamyka luki nr 1, 2, 5 i 6. Przeniesienie danych z `localStorage` przy pierwszym logowaniu, w tym **scalanie** danych z dwóch urządzeń (wzorzec odłożony 2026-10-06). Kandydaci: (1) **scalanie jak koszyk w sklepie** (profil z konta, jeśli istnieje, listy łączone; ryzyko duplikatów), (2) **pytanie użytkownika** „Dodać wpisy z tego urządzenia do konta?” [Dodaj] / [Odrzuć], (3) **konto anonimowe od pierwszej wizyty** (`signInAnonymously()`, bez migracji, ale dane o zdrowiu w bazie przed rejestracją i obietnica „bez rejestracji” do przeformułowania). Wstępne zdanie autora: profil wygrywa ten z konta. Przypomnienie „Masz konto? Zaloguj się” (flaga w przeglądarce) tylko jako miękki dodatek: nie działa na nowym urządzeniu, a twarda blokada łamie „bez rejestracji”.
    - **Decyzja 2026-10-08: wariant 2 (pytanie), a w S1 automatycznie.** S1 = konto bez żadnych danych (profil, waga, posiłki, przepisy) → dane gościa przenoszone bez pytania. S2 = konto ma jakiekolwiek dane → okno „Dodać dane z tego urządzenia do konta?” [Dodaj do konta] / [Odrzuć]. Powód: wspólny komputer; dane o zdrowiu (art. 9 RODO) nie mogą trafić na cudze konto bez zgody. Odrzucone: 1 (koszyk: cudze dane w koncie bez pytania), 3 (konto anonimowe: nie rozwiązuje S2, dane o zdrowiu w bazie przed zgodą, największa przebudowa).
    - **Ustalenia szczegółowe:** profil z konta wygrywa (profil gościa trafia do bazy tylko, gdy konto go nie ma); okno dotyczy list (posiłki, pomiary wagi, własne przepisy); [Odrzuć] kasuje dane gościa od razu; pomiar wagi z dnia, który konto już ma: wygrywa konto; zamknięcie okna bez wyboru (Esc, zamknięta karta) → pytamy ponownie przy następnym starcie, do tego czasu nic nie jest pobierane ani wysyłane.
    - ⚠️ **Świadomie zaakceptowane ryzyko w S1:** gość na wspólnym komputerze zostawił dane, a ktoś inny zakłada konto → obce dane trafiają do nowego konta bez pytania. Uznane za rzadkie (zaproszenie do konta pada zwykle zaraz po wpisie tej samej osoby).
    - **Kartka gościa vs kopia zalogowanego:** w `localStorage` wyglądają identycznie, a nazwa zdarzenia nie wystarcza (`SIGNED_IN` przychodzi też np. po powrocie do karty). Rozróżnia je znacznik właściciela `keto_owner` (id użytkownika), zapisywany po przeniesieniu/pobraniu i kasowany przez `clearLocalData()`. Brak znacznika = dane gościa; obcy znacznik = kopia innego konta (kasujemy, nigdy nie scalamy).
7. RODO (polityka prywatności, dane o wadze), zakup domeny w Hostingerze i podpięcie (**wariant B, decyzja 2026-10-06:** domena dopiero w etapie 7, razem z polityką i SMTP; kolejność: domena → polityka prywatności → SMTP z rekordami SPF/DKIM w DNS domeny → włączenie „Confirm email” → weryfikacja marki Google), **weryfikacja marki w Google** (patrz „Ekran zgody Google” wyżej). ⚠️ Zmiana adresu z `github.io` na domenę kasuje `localStorage` gości (inny adres = inny magazyn), więc nie zwlekać z nią po pojawieniu się pierwszych użytkowników.

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
- ✅ **„Zmień dane planu” (2026-10-09, wariant A):** modal z celem, aktywnością i wiekiem, otwierany przyciskiem pod bilansem z jednym zdaniem informacji („Plan liczymy z Twojego celu, aktywności i wieku…”). Waga zostaje poza modalem (własna historia, „+ Pomiar”). Zapis: `updatePlanSettings()` w `userService.js` (zalogowany: `upsert` do `profiles`). Opcje celu i aktywności wspólne z onboardingiem: `components/planFields.js`. Odrzucone: pola wprost na Dashboardzie (B), osobna strona profilu (C). **Nie testowane:** ścieżka zalogowanego (zapis do Supabase).
- 📋 **Nowe funkcje do zaprojektowania (przegląd konkurencji 2026-10-09: Carb Manager, MacroFactor, Cronometer, KetoDiet, Lose It).** Wybrane przez autora, architektura i wdrożenie od następnej sesji:
    1. **Postęp od startu:** „Start 92,4 kg → teraz 85 kg (−7,4 kg), średnio X kg/tydz.” — z `weightHistory`, bez nowego zapisu. Do rozważenia przy okazji: wygładzony trend wagi (średnia krocząca jak w MacroFactor; ważne przy ścinaniu wagi przed walką).
    2. **Przełącznik dni** (punkt wyżej): dane z poprzednich dni są zapisane, UI pokazuje tylko dziś. Do ustalenia: plan dnia z przeszłości (dziś `refreshDay()` liczy plan z bieżącego profilu, bez daty).
    3. **Post przerywany (timer):** nowy zapis (start/koniec postu) → nowa tabela w Supabase przy kontach; ostrożnie z obietnicami zdrowotnymi (`PRAWO.md`, UOKiK).
    4. **Seria / konsekwencja** — do przemyślenia, jak ugryźć; wiąże się z mockupem „SERIA” na stronie głównej (`PROGRES.md`, punkt 23: zbudować albo usunąć mockup). Uwaga na gamifikację wbrew antyslop.
    - Odłożone / odrzucone na razie: adaptacyjne TDEE (wymaga rzetelnego dziennika), woda i elektrolity (baza produktów ma tylko makro), ketony i glukoza (interpretacja = ryzyko MDR), dzień treningowy vs odpoczynku (nisza sportów walki — pomysł na później). Eksport danych to nie pomysł, tylko obowiązek RODO (`PRAWO.md` §13).
- ⚠️ **Luka: wiek zapisany jako liczba, nie data** (2026-10-09). Profil nie „starzeje się”, więc za rok kalkulator liczy BMR ze starego wieku (ok. 8 kcal na rok, ~0,3% planu). Na razie świadomie zostaje liczba, edytowalna w „Zmień dane planu”. Do rozważenia: rok urodzenia zamiast wieku (zmiana kolumny `profiles.age` w Supabase, migracja profili, zmiana pola w onboardingu) — im później, tym więcej kont do migracji.

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

### 6. Chatbot keto (Gemini, darmowy próg) 📋 do rozważenia (2026-10-06)
Wstępny kierunek autora: **chatbot keto** (rozmowa, nie sam „słownik”) na **darmowym kluczu Gemini API** z Google AI Studio. Nic nie wdrożone, temat po starcie kont.
- **Architektura:** przeglądarka → **Supabase Edge Function** (trzyma klucz w sekretach, sprawdza zalogowanego, liczy dzienny limit na osobę) → Gemini API. Klucz nigdy w paczce JS (ta sama zasada co `secret` w Supabase).
- **Warunki Gemini API (sprawdzone 2026-10-06, [terms](https://ai.google.dev/gemini-api/terms)):** w EOG/CH/UK darmowy próg ma zasady danych jak płatny (bez użycia rozmów do rozwoju produktów Google). ⚠️ Ale: „Do not submit sensitive, confidential, or personal information to the Unpaid Services”, więc bot na darmowym progu **nie może dostawać profilu, wagi, bilansu ani danych o zdrowiu** (art. 9 RODO), a nad czatem musi stać ostrzeżenie, żeby ich nie wpisywać. Wymóg 18+ (u nas spełniony: kalkulator od 18 lat). Limit zapytań jest na klucz, wspólny dla wszystkich użytkowników (liczby tylko w panelu AI Studio).
- **Odrzucone:** podpięcie subskrypcji Claude (Pro/Max to dostęp osobisty, nie do obsługi innych; łamałoby warunki). Bot znający profil wymaga płatnego progu (Gemini albo Claude, np. Haiku 4.5: $1/$5 za 1 mln tokenów, szacunek ~2 gr na wiadomość) + umowy powierzenia + zgody RODO.
- **Do decyzji przed wdrożeniem:** rola wobec `/camp` (lejek „to pytanie do trenera” vs konkurencja z płatnym mentoringiem); odmowa pytań medycznych (lista przeciwwskazań ze stopki), bot nie podaje się za dietetyka (dietetyka kliniczna autora **w trakcie**); oznaczenie „rozmawiasz z AI” (AI Act, obowiązek przejrzystości — potwierdzić z prawnikiem razem z etapem 7); co zrobić, gdy wspólny limit się wyczerpie.
- **Alternatywy z rozmowy:** model w przeglądarce (WebLLM: za darmo i prywatnie, ale GB do pobrania i słaby polski), asystent bez AI (wyszukiwarka `/knowledge` + „Zapytaj trenera” jako lead do `/camp`).
