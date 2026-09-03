# ANALYS.md — Techniczny Audyt Projektu Keto Thai App

> Dokument techniczny sporządzony w wyniku pełnego audytu plików `.js`, `.css` oraz `.md` w projekcie.
> Data audytu: 2026-09-03. Stan repozytorium: branch `main`, 38 commitów, brak niezacommitowanych zmian w kodzie źródłowym.
> Metoda: odczyt wszystkich plików źródłowych + weryfikacja narzędziowa (grep) każdego twierdzenia — bez zgadywania.

---

## 0. Zakres audytu

| Kategoria | Liczba plików | Linie |
|---|---|---|
| JavaScript (`src/`) | 12 | ~1780 |
| CSS (`src/styles/`) | 15 | ~2849 |
| Markdown (root + skills) | 8 + 3 | ~1339 |
| **Razem kod źródłowy** | — | **~4629** |

Pliki `.md` przeanalizowane: `CLAUDE.md`, `GEMINI.md`, `DESIGN.md`, `KETO_THAI_DESIGN_GUIDELINES.md`, `PLAN.md`, `STRATEGY.md`, `PRODUCT.md`, `PROGRES.md`, `skills/antislop-ui/SKILL.md`, `skills/antislop-human/SKILL.md`, `skills/antislop-layoutmobile/SKILL.md`.

---

## 1. Oceny sumaryczne (skala 0–10)

| Obszar | Ocena | Uzasadnienie |
|---|---|---|
| Architektura JS | 6/10 | Czysty podział warstw, własny router z kontraktem `cleanup`; brak warstwy stanu (`src/state/` istnieje tylko w planie), część tras nie implementuje `cleanup` |
| UI (implementacja) | 4/10 | 5 nieistniejących zmiennych CSS używanych w 6 plikach; `header.css` w ogóle niepodpięty do builda |
| Design (system wizualny) | 6/10 | Oryginalna, spójna wizja "Stealth Fighter"; rozbita przez dwa wzajemnie sprzeczne dokumenty źródłowe (`DESIGN.md` vs `KETO_THAI_DESIGN_GUIDELINES.md`) |
| Funkcjonalności | 4/10 | Onboarding → Dashboard działa end-to-end z realną reaktywnością; rdzeń SaaS (logowanie posiłków) i formularz sprzedażowy (`/camp`) nie istnieją funkcjonalnie |
| User friendly | 4/10 | `alert()` zamiast toastów, filtry w `/recipes` się wzajemnie kasują, `/knowledge` i `/contact` to puste `<h1>` mimo obecności w nawigacji |
| Dostępność (a11y) | 3/10 | `lang="en"` przy 100% polskiej treści, jeden atrybut `aria-*` w całej aplikacji, `focus-visible` zepsuty literówką w nazwie zmiennej |
| Bezpieczeństwo / stabilność zależności | 4/10 | `lucide@latest` i `chart.js` bez pinowania wersji i bez SRI — możliwa awaria bez zmiany w kodzie własnym |
| Dokumentacja i proces | 7/10 | Najmocniejsza część projektu — plany, strategia biznesowa i design guidelines na poziomie ponadprzeciętnym dla juniora; psuje ją wewnętrzna sprzeczność między dokumentami |
| Realizm planu biznesowego | 7/10 | Spójny model Product-Led Growth, przemyślana monetyzacja (mentoring 1-on-1), rozdział prawny (działalność nierejestrowana) |
| **Średnia ważona (projekt w toku)** | **≈5/10** | Solidny szkielet inżynierski i bardzo dobra strategia, słaba warstwa wykonawcza CSS i puste rdzenie kluczowych funkcji |

---

## 2. Mocne strony (ponadprzeciętne jak na etap juniorski)

1. **Własny router SPA na History API** (`src/router.js`) — Event Delegation na `document.body` (jeden listener zamiast N), zamiast nasłuchiwania na każdym linku z osobna.
2. **Kontrakt `cleanup` w definicji trasy** (`src/routes.js:15`, `dashboard.js: cleanupDashboard`) — świadome niszczenie instancji Chart.js przy opuszczeniu widoku. Większość projektów na tym poziomie w ogóle nie adresuje tego problemu.
3. **Reaktywność w Dashboardzie** — `updateMacrosUI()` (`dashboard.js:216`) jako pojedyncze źródło odświeżania UI po zmianie wagi. Zalążek wzorca „stan → render”.
4. **`calculatorService.js`** — czysta, testowalna logika biznesowa bez dotknięcia DOM; rzuca jawne błędy (`throw new Error(...)`) zamiast po cichu zwracać `undefined` przy nieznanej wartości.
5. **`utils/template.js`** (`export const html = String.raw`) — jednolinijkowe rozwiązanie dające podświetlanie składni HTML w template literals w edytorze.
6. **Dokumentacja strategiczna** (`STRATEGY.md`, `PRODUCT.md`) — segmentacja rynku, model przychodu, ścieżki konwersji i podstawy prawne opisane spójnie i realistycznie.

---

## 3. Znaleziska krytyczne (🔴)

### 3.1. Pięć zmiennych CSS używanych, ale nigdzie niezdefiniowanych

Zweryfikowane przez porównanie zbioru `var(--x)` używanych vs `--x:` zdefiniowanych w `:root` (`src/styles/base/global.css`):

| Zmienna | Pliki, w których jest używana |
|---|---|
| `--color-surface` | `banner.css:30`, `card.css:2,117`, `filters.css:49`, `header.css:73`, `modal.css:21` |
| `--color-primary` | `card.css:15`, `filters.css:62,67,69`, `form.css:34,39` |
| `--color-border` | `banner.css:29`, `card.css:3,118`, `filters.css:51`, `header.css:10,74` |
| `--text-color` | `form.css:20,29`, `modal.css:38` |
| `--color-header-bg` | `header.css:7` |

**Skutek:** deklaracje CSS z niezdefiniowaną zmienną są przez przeglądarkę po cichu odrzucane (nie ma błędu w konsoli) — właściwość wraca do wartości dziedziczonej/domyślnej. W praktyce oznacza to m.in., że:
- `.card` i `.modal__content` nie mają zdefiniowanego tła (`background-color: var(--color-surface)` nie działa),
- `form.css:39` — `outline: 3px solid var(--color-primary)` jest nieprawidłowe, a dwie linie wcześniej (`form.css:33`) stoi `outline: none` na `:focus` — efekt: **formularz onboardingu nie pokazuje żadnego widocznego focusu przy nawigacji klawiaturą**, mimo że `PRODUCT.md` (sekcja „Accessibility & Inclusion”) deklaruje to jako niepodlegające kompromisom.

**Najbardziej prawdopodobna przyczyna:** literówka/rozjazd nazewnictwa — w `global.css` zdefiniowana jest `--color-text-primary`, a w komponentach używane jest `--text-color` / `--color-primary`. Brak jednego, egzekwowanego źródła nazw tokenów.

### 3.2. `header.css` nie jest importowany do builda

`src/styles/main.css` importuje 12 plików CSS — `components/header.css` (132 linie) **nie znajduje się wśród nich**. Cały plik jest martwy — przeglądarka go nigdy nie ładuje. Jednocześnie `PROGRES.md` (sekcja „Plan Prac na Następną Sesję”, punkt 4) planuje „Nowy Design Nawigacji i Linków (Header / Navbar Redesign)” w tym samym pliku.

Nawigacja aplikacji faktycznie opiera się na `tabbar.css` (Bottom Tab Bar) — do ustalenia, czy `header.css` jest zaległym długiem do usunięcia, czy niedokończonym elementem do podpięcia.

### 3.3. Sprzeczność między dokumentami designu

Dwa pliki opisujące ten sam system wizualny wzajemnie się wykluczają:

| Zagadnienie | `DESIGN.md` | `KETO_THAI_DESIGN_GUIDELINES.md` (deklarowane jako „V3.0, Jedyne Źródło Prawdy”) |
|---|---|---|
| Cienie | „Stosujemy twarde cienie neobrutalistyczne `4px 4px 0px`” | „Zakaz używania Box-Shadow na elementach” |
| Tło kart | `--color-surface` `#181818` | „Brak tła kafelków — karty korzystają z tła układu” |
| Tło główne | `#0a0a0a` | `#050505` / `#000000` |
| Kolor białka | `#ff4b4b` (czerwień) | Tajskie Złoto `#D4AF37` |
| Obramowania | ramki obecne | „Zakaz widocznych obramowań paneli” |

Dodatkowo `PLAN.md` podaje jeszcze inny kolor tła (`#121212`), podczas gdy faktyczna implementacja w `global.css:3` używa `#050505`. Łącznie: **cztery różne wersje „prawdy” o tle aplikacji** w czterech różnych plikach. To bezpośrednie źródło ryzyka „AI-sloopu”, przed którym `CLAUDE.md` (sekcja 8) każe się chronić — agent czytający oba dokumenty projektowe nie ma jak automatycznie wybrać właściwego.

### 3.4. `initCamp()` jest pustą funkcją

`src/pages/camp.js`, ostatnia linia: `export const initCamp = () => {};`

Strona `/camp` (510 linii JS + 902 linie CSS) zawiera rozbudowany formularz kwalifikacyjny (`#apply`) będący — zgodnie z `STRATEGY.md` sekcja 3 — **głównym filarem przychodu** (12-Tygodniowy Fighter's Camp, mentoring 1-on-1). Formularz nie ma podpiętego handlera `submit`:
- kliknięcie „Wyślij Zgłoszenie do Kwalifikacji” powoduje natywny submit HTML,
- przeglądarka próbuje przeładować stronę (brak `action`/`method` = submit do bieżącego URL),
- SPA restartuje się od zera, dane z formularza nigdzie nie trafiają.

**To najpoważniejsza rozbieżność między stanem kodu a celem biznesowym projektu** — ścieżka konwersji, która ma monetyzować całą aplikację, dziś nie przechwytuje ani jednego leada.

---

## 4. Znaleziska istotne (🟠)

### 4.1. Naruszenia własnych wytycznych anti-slop (policzone narzędziowo)

Zgodnie z `KETO_THAI_DESIGN_GUIDELINES.md` sekcja 4 („Anty-wzorce do eliminacji”):

- **21 wystąpień `border-radius` > 4px**, w tym 6 pigułek `999px`:
  `camp.css:59,253,342,349,527`, `home.css:468` — wytyczne: „Zero promieniowania powyżej 4px (max 8px dla dużych kontenerów przy zdjęciach), całkowity zakaz pigułek”.
  Do tego `card.css:119` — `border-radius: 24px`.
- **5 wystąpień `outline: none`** (`button.css:24`, `filters.css:21`, `form.css:33`, `modal.css:42`, `camp.css:740`) przy zaledwie **3 wystąpieniach `focus-visible`** w całym projekcie (`button.css:27`, `form.css:38` — zepsute, patrz 3.1, `tabbar.css:63`).
- **Miękka poświata / glow** — `home.css:724,749,783` (`box-shadow: 0 0 ... rgba(--color-accent-rgb)`). Wytyczne zakazują „miękkiego glow” wprost.
- **`backdrop-filter: blur()`** — `tabbar.css:17-18`, `header.css:8-9` (choć ten drugi plik jest martwy, patrz 3.2). To definicja glassmorphismu, którego `PRODUCT.md` („Brand Commitments”) zakazuje wprost: „brak glassmorphismu i miękkich poświat”.
- **Ruch większy niż dozwolony na hover** — `translateY(-6px)` w `camp.css:217`, `translateY(-10px)` w `home.css:617`. Wytyczne dopuszczają maksymalnie `-2px` lub brak translacji.

**Pozytyw do odnotowania:** zero animacji `@keyframes ... infinite` w całym projekcie — zgodnie z `PROGRES.md` ta klasa problemu (`@keyframes float`) została już usunięta w poprzedniej sesji. Audyt anti-slop u autora realnie działa, choć nie jest jeszcze kompletny.

### 4.2. Cykl życia zasobów poza Dashboardem

`initHome()` (`home.js:390`) tworzy `IntersectionObserver` obserwujący wszystkie `.reveal`. Trasa `/` **nie ma zdefiniowanego `cleanup`** w `routes.js`. Mechanizm częściowo się sam broni — `scrollObserver.unobserve(entry.target)` jest wywoływane po zadziałaniu wpisu — ale elementy, do których użytkownik nigdy nie doscrollował, pozostają zarejestrowane w obserwatorze w momencie opuszczenia strony przez router.

Dziś prawdopodobnie zbierane przez GC (observer sam nie trzyma silnej referencji do odłączonych węzłów w sposób blokujący GC w większości przeglądarek), ale to **nadzieja, nie kontrakt** — w odróżnieniu od Dashboardu, gdzie `cleanupDashboard()` jawnie wywołuje `destroy()` na obu instancjach Chart.js.

**Zalecenie do zweryfikowania pomiarowo:** DevTools → Performance Monitor → metryka „DOM Nodes” + Memory → Heap Snapshot → filtr „Detached”, po wielokrotnym przełączaniu `/` ↔ `/dashboard`.

### 4.3. Mechanika routera — pushState nie emituje popstate

`navigateTo()` (`router.js`, `export const navigateTo`) wykonuje `window.history.pushState(...)`, a bezpośrednio po tym **ręcznie** woła `renderContent()`. Jest to konieczne, ponieważ `pushState()`/`replaceState()` nigdy nie emitują zdarzenia `popstate` — to zdarzenie odpalają wyłącznie akcje użytkownika w historii przeglądarki (przycisk wstecz/dalej, `history.back()/go()`). Router ma więc dwa niezależne wejścia do `renderContent`:
- nawigacja programowa (klik na `[data-link]`) → wywołanie ręczne w `navigateTo`,
- nawigacja przez historię przeglądarki → nasłuch na `popstate` w `initRouter`.

Kluczowy efekt uboczny tej architektury: `currentRoute` (zmienna modułowa w `router.js`) jest nadpisywana przy **każdym** wywołaniu `renderContent`, w tym przy przekierowaniach wymuszonych przez guard (`router.js:19-33`). Np. próba wejścia na `/dashboard` bez zapisanego użytkownika: `currentRoute` zostaje ustawione na trasę `/onboarding`, nie na trasę, z której user faktycznie przyszedł. Trzeba to mieć na uwadze przy każdej rozbudowie logiki `cleanup`.

### 4.4. Filtry w `/recipes` wzajemnie się wykluczają

`initRecipes()` (`recipes.js`): filtr kategorii (`btnsCategorys` click handler) i filtr kalorii (`btnSearchCalories` click handler) każdorazowo renderują siatkę **od nowa z `RECIPES_DATA`**, ignorując stan drugiego filtra. Nie da się złożyć zapytania typu „obiady do 500 kcal” — wybór kategorii kasuje wynik wyszukiwania po kaloriach i odwrotnie. Brak też mechanizmu `debounce`, mimo że `PLAN.md` (sekcja „Moduł Wyszukiwarki”, dwukrotnie) deklaruje go jako wymóg wydajnościowy.

### 4.5. Zależności zewnętrzne bez pinowania wersji

`index.html`:
```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```
Brak wersji (`@latest`) i brak atrybutu `integrity` (Subresource Integrity). Skutek: breaking change w nowej wersji Lucide lub Chart.js może wyłączyć renderowanie ikon lub wykresów **bez jakiejkolwiek zmiany w kodzie własnym projektu** — trudne do zdiagnozowania, bo historia commitów repo nie pokaże przyczyny.

---

## 5. Znaleziska drobniejsze (🟡)

| Lokalizacja | Problem |
|---|---|
| `index.html:2` | `lang="en"` przy w pełni polskojęzycznej treści — czytniki ekranu wymawiają polski tekst z angielską fonetyką |
| `dashboard.js:230,238` | `alert()` jako komunikat walidacyjny, mimo że `PLAN.md` deklaruje „Toast Notifications” jako wzorzec UX |
| `routes.js:26,32` | `/knowledge` i `/contact` renderują wyłącznie `<h1>` — obie ścieżki są jednocześnie widoczne i klikalne w `tabbar` (`index.html`), więc użytkownik trafia w pustkę z głównej nawigacji |
| `calculatorService.js:80-87` | `mockUserProfile` — martwa stała, nieużywana nigdzie w kodzie; duplikat koncepcyjny `userProfile` z `userService.js:1-8` (też nieużywany — realny profil pochodzi z `localStorage`) |
| `calculatorService.js:44-52` | `calculateKetoMacros`: przy niskiej kaloryczności celu i wysokiej wadze (duże `proteins`) wynik `fats` może wyjść ujemny — brak dolnego ograniczenia (`Math.max(0, ...)`) |
| `main.css` (ostatnia linia) | Ostatni `@import "./pages/camp.css"` bez średnika na końcu — działa wyłącznie dzięki temu, że jest to koniec pliku; dopisanie kolejnej linii bez poprawki złamie import |
| brak `vite.config.js` | Routing bazowej ścieżki dla GitHub Pages obsługiwany runtime'owo przez `utils/env.js` (`getBase()`) zamiast deklaratywnie opcją `base` w konfiguracji Vite |
| cała aplikacja | `appContainer.innerHTML = ...` z interpolacją danych w template literals — dziś bezpieczne, bo źródła danych są statyczne (`RECIPES_DATA` w kodzie); w momencie, gdy formularz `/camp` lub przyszły mini-CMS zaczną renderować treść pochodzącą od użytkownika tą samą ścieżką, powstaje wektor XSS |
| `index.html` / cały projekt | Jeden atrybut `aria-*` w całym projekcie (`aria-label="Main"` na `tabbar`) — brak `aria-expanded` na akordeonach FAQ i Meal Accordion (planowanym), brak `aria-current` na aktywnej zakładce tabbara |

---

## 6. Poprawki do wdrożenia — lista priorytetowa

### Priorytet 1 — niski koszt, wysoki wpływ (do zrobienia najpierw)

1. Zdefiniować w `global.css` brakujące zmienne albo zamienić w komponentach `--color-surface`, `--color-primary`, `--color-border`, `--text-color`, `--color-header-bg` na istniejące odpowiedniki (`--color-text-primary`, `--color-accent` itd.) — patrz 3.1.
2. Naprawić `form.css:33-39` tak, by `:focus-visible` faktycznie renderował widoczny outline.
3. Rozstrzygnąć: usunąć `DESIGN.md` (zdezaktualizowany) albo sprowadzić go do zgodności z `KETO_THAI_DESIGN_GUIDELINES.md` — patrz 3.3.
4. Zdecydować o losie `header.css`: podpiąć w `main.css` albo usunąć jako martwy kod — patrz 3.2.
5. Dodać średnik po ostatnim `@import` w `main.css`.

### Priorytet 2 — rdzeń funkcjonalny i przychodowy

6. Zaimplementować `initCamp()`: przechwycenie `submit`, `FormData`, widok potwierdzenia bez przeładowania strony — patrz 3.4.
7. Zaprojektować i wdrożyć warstwę stanu (`src/state/`) + mechanizm logowania posiłków, odejmowania makroskładników od dziennego limitu w Dashboardzie.
8. Naprawić filtry w `/recipes`, by kategoria i kalorie łączyły się w jedno zapytanie zamiast się nadpisywać — patrz 4.4.
9. Uzupełnić `/knowledge` i `/contact` realną treścią lub czasowo usunąć je z `tabbar`, dopóki nie są gotowe.

### Priorytet 3 — jakość, dostępność, odporność

10. Zredukować `border-radius` w `card.css`, `home.css`, `camp.css`, `modal.css`, `filters.css` do wytycznych (max 4px, zero pigułek 999px) — patrz 4.1.
11. Usunąć `box-shadow`/glow z `home.css` i `backdrop-filter` z `tabbar.css` zgodnie z zakazem glassmorphismu w `PRODUCT.md`.
12. Ograniczyć `translateY` na hover do max `-2px` w `card.css`, `camp.css`, `home.css`.
13. Zmienić `lang="en"` na `lang="pl"` w `index.html`.
14. Zamienić `alert()` w `dashboard.js` na komponent Toast Notifications zgodnie z `PLAN.md`.
15. Dodać `cleanup` dla `IntersectionObserver` na trasie `/` (odłączyć obserwator przy opuszczeniu strony) — patrz 4.2.
16. Przypiąć konkretne wersje `lucide` i `chart.js` w `index.html` (zamiast `@latest`), rozważyć dodanie `integrity` — patrz 4.5.
17. Zabezpieczyć `calculateKetoMacros` przed ujemną wartością `fats` (`Math.max(0, ...)`).
18. Usunąć martwy kod: `mockUserProfile` w `calculatorService.js`, nieużywany `userProfile` w `userService.js`.
19. Dodać brakujące atrybuty `aria-*` (akordeon FAQ, aktywna zakładka tabbara) — patrz 5.

---

## 7. Ocena strategii i planu rozwoju

**Warstwa biznesowa jest mocna.** Model Product-Led Growth (darmowy tracker jako lead magnet → mentoring premium 1-on-1) jest spójny i sprawdzony w branży fitness/coachingu. Rozszerzenie pozycjonowania z „sportów walki” na „archetyp wojownika” (`STRATEGY.md` sekcja 1) trafnie poszerza rynek docelowy bez rozmycia tożsamości marki. Sekcja prawna (działalność nierejestrowana, limit przychodu, docelowe przejście na inkubator) pokazuje myślenie wdrożeniowe, a nie wyłącznie projektowe.

**Ryzyko: kolejność realizacji.** `PLAN.md` deklaruje szeroki zakres pracy: wyszukiwarkę produktów z zewnętrznym API, Meal Accordion, moduł nawodnienia, Bazę Wiedzy z mini-CMS, pełne PWA z Service Workerem, Keto Readiness Score, eksport PDF. To zakres wielomiesięczny.

Tymczasem rdzeń wartości produktu — możliwość zapisania zjedzonego posiłku i zobaczenia realnego bilansu dnia — **nie istnieje w kodzie**. Dashboard dziś pokazuje jednorazowo wyliczone zapotrzebowanie z onboardingu; nie ma żadnego mechanizmu odejmowania spożytych makroskładników od dziennego limitu. Deklaracja z `STRATEGY.md` („aplikacja rozwiązuje problem CO jeść”) nie ma pokrycia funkcjonalnego.

Jednocześnie warstwa wizualna stron sprzedażowych jest już bardzo rozbudowana: `camp.css` (902 linie) + `home.css` (846 linii) = 1748 linii dopracowanego CSS wokół produktu, który jeszcze nie realizuje swojej podstawowej obietnicy. To typowy wzorzec: praca nad tym, co daje natychmiastową satysfakcję wizualną, wypiera pracę nad tym, co jest trudniejsze do zobaczenia, ale stanowi rdzeń wartości.

**Sugerowana kolejność prac** znajduje się w sekcji 6 powyżej, w formie priorytetowej listy poprawek.

---

## 8. Podsumowanie jednym akapitem

Keto Thai App to projekt o wyraźnie ponadprzeciętnej jak na etap juniorski architekturze routingu i warstwy logiki biznesowej (kalkulator, reaktywny dashboard, kontrakt cleanup), okraszony bardzo dobrą dokumentacją strategiczną. Największą słabością nie jest brak umiejętności, tylko rozjazd między trzema poziomami projektu — dokumentacją, systemem designu i faktycznym kodem CSS/JS — który objawia się konkretnie: nieistniejącymi zmiennymi CSS psującymi tła i dostępność klawiatury, martwym plikiem `header.css`, dwoma sprzecznymi źródłami prawdy o designie oraz pustą funkcją `initCamp()` blokującą jedyną realną ścieżkę monetyzacji aplikacji. Żadne z tych znalezisk nie wymaga przepisania architektury — wszystkie są punktowe i naprawialne w kolejności odwrotnej do ryzyka biznesowego, zgodnie z listą w sekcji 6.
