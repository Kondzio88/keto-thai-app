# ROADMAP.md — Lista zadań do zrobienia

> Dokument roboczy powstały z audytu aplikacji pod kątem `STRATEGY.md`.
> Data: 2026-09-05. Stan repozytorium: branch `main`, HEAD `70865c7`.
> Zakres: **wyłącznie to, co jest do zrobienia** — bez analizy mocnych i słabych stron.

**Zasada porządkująca:** najpierw naprawić lejek → potem zdobyć dowody → dopiero potem rozwijać funkcje.

**Legenda:** 🔧 praca w kodzie · 📷 praca poza kodem (zdjęcia, konta, treść, ludzie)

---

## FAZA 0 — Odblokowanie pieniędzy i mostu do social mediów

> Dopóki to nie jest zrobione, każda promocja aplikacji to wlewanie wody do dziurawego wiadra.

### 0.1 🔧 Formularz `/camp` ma realnie wysyłać leada
**Plik:** `src/pages/camp.js:513-526`
**Stan:** `FormData` → `Object.fromEntries` → zmienna `dataObject`, która nigdzie nie trafia i umiera na końcu callbacka. Brak `fetch`, brak `mailto:`, brak nawet `localStorage`. Użytkownik widzi komunikat sukcesu, Ty nie dostajesz nic.

Do zrobienia:
- realna wysyłka zgłoszenia
- obsługa stanu błędu (brak sieci) — dziś nie istnieje
- blokada podwójnego wysłania
- checkbox zgody RODO / przetwarzania danych
- uczciwy success state — dziś jest deweloperskie „Sukces! Wszystko zadziałało jak należy." bez next-stepu
- guard clause na `form` (dziś `addEventListener` bez sprawdzenia, czy element istnieje)

**Decyzja do podjęcia — sposób odbioru leada:**

| Wariant | Plus | Minus |
|---|---|---|
| **A. Usługa formularzowa** (Formspree / Web3Forms) | zero backendu, działa na GitHub Pages, darmowy limit, wdrożenie w jedną sesję | zależność od zewnętrznego dostawcy i jego limitów |
| **B. Supabase** | docelowy kierunek z `PLAN.md`, własna baza leadów, fundament pod konta i panel trenera | najwięcej pracy teraz, nauka nowego narzędzia |
| **C. `mailto:` z prefill** | zero zależności, zero kosztu, działa od razu | fatalny UX na telefonie, realnie stracisz część zgłoszeń |

### 0.2 🔧 Naprawić deep-linki
**Plik:** `404.html`
`window.location.replace("/keto-thai-app")` gubi oryginalną ścieżkę. Link do `/camp` wklejony w bio na Instagramie ląduje na stronie głównej. Każda kampania kierująca na podstronę traci tu ruch.

### 0.3 🔧 Warstwa meta
**Pliki:** `index.html`, `public/` (dziś pusty katalog)
- `lang="pl"` zamiast `lang="en"` (100% treści jest po polsku)
- `meta description`
- **Open Graph** — bez tego link wklejony na FB/Messengerze to goły URL bez tytułu, opisu i miniatury
- favicon, `theme-color`
- sensowny `<title>` z frazami (dziś generyczne „Keto Thai App")
- `robots.txt`, `sitemap.xml`

### 0.4 🔧 Stopka z linkami do Instagrama i Facebooka + dane kontaktowe
**Stan:** w całym projekcie nie ma `<footer>` na żadnej stronie i **ani jednego linku do Twoich social mediów**. Nie ma też żadnych danych kontaktowych (zero `mailto:`, zero telefonu). Komuś aplikacja się spodoba i nie ma jak Cię zaobserwować ani się z Tobą skontaktować.

### 0.5 🔧 `/knowledge` i `/contact`
**Pliki:** `src/routes.js:26,33`, `index.html:31,39`
Obie trasy to dosłownie `<h1>Knowledge Base</h1>` i `<h1>Contact Coach</h1>` — a obie siedzą w tabbarze. Ruch z Instagrama kliknie „Wiedza", zobaczy pusty ekran i wyjdzie.
Decyzja: ukryć z nawigacji **albo** dać minimalną, uczciwą treść.

### 0.6 📷 Podmienić stockowe zdjęcia w sekcji Bio na własne
**Plik:** `src/pages/home.js:142-163`
Cztery zdjęcia w sekcji budującej Twój autorytet to hotlinki do Unsplash, z czego **dwa to ten sam URL** (`photo-1555597673-b21d5c935865`). Sprzedajesz „15 lat na tajskiej macie" ilustrowane obcymi ludźmi ze stocka. `PRODUCT.md:35` sam tego zakazuje.

**Zero kodu, około godzina pracy, największy zysk wiarygodności w całym projekcie.**

---

## FAZA 1 — Dowód, lokalność, pomiar

| # | Zadanie | Uwaga |
|---|---|---|
| 1.1 | 🔧 **Sekcja social proof na `/`** — zbudowana na dowodzie kompetencji (staż, walki, certyfikat, prawdziwe zdjęcia), z gotowym miejscem na przyszłe metamorfozy | dziś nie istnieje w żadnej postaci — grep po `testimonial\|metamorf\|opini` w `src/` daje zero trafień |
| 1.2 | 🔧 **Przechwytywanie e-maila na końcu onboardingu** | jedyne pole `type="email"` w całym `src/` to `camp.js:389`; bez listy mailowej jesteś w 100% zależny od zasięgów IG |
| 1.3 | 📷 **Google Business Profile dla Tychów** | najsilniejszy kanał lokalny, mocniejszy niż Instagram, darmowy — zrobić **przed** pracą w kodzie |
| 1.4 | 🔧 **Ścieżka `/tychy`** pod frazy lokalne („trening personalny Tychy", „muay thai Tychy", „dietetyk keto Śląsk") | uwaga: SPA renderuje treść JS-em do pustego `<div id="app">` — bez prerenderu Google tej podstrony nie zobaczy |
| 1.5 | 🔧 **Meta Pixel + analityka** | bez Pixela nie ma remarketingu ani grup podobnych odbiorców; bez analityki nie wiesz, który post przyniósł leada |
| 1.6 | 🔧 **Usunąć fikcyjne dane** albo oznaczyć jako przykład | `home.js:68-75` — 7 zahardkodowanych `<div>` udających streak, statyczne „2450 KCAL" / „-0.8 KG/TYDZ"; `camp.js` hero — `BATCH #04 • SEZON 2026`, `#KT-8842-PRO`. Łamie `DESIGN.md` sekcja 7 |
| 1.7 | 📷 **Znaleźć 3 beta-testerów** — 12 tygodni za darmo w zamian za zgodę na publikację metamorfozy i opinii | bez tego sprzedaż programu premium od nieznanej osoby jest praktycznie niemożliwa |
| 1.8 | 📷 Własna domena + 🔧 kompresja assetów | `kondzio88.github.io/keto-thai-app` w bio zabija wiarygodność premium; 3 pliki PNG po 1,3–1,7 MB przy ruchu mobilnym z LTE |
| 1.9 | 🔧 **Cena lub widełki na `/camp`** | zero wystąpień `zł` / `PLN` / `cena` w całym `src/` — kwalifikacja bez rzędu wielkości generuje zgłoszenia od osób, których nie stać |

---

## FAZA 2 — Rdzeń produktu i silnik contentu

| # | Zadanie | Uwaga |
|---|---|---|
| 2.1 | 🔧 **Domknąć pętlę posiłków w dashboardzie** — `getTodayMeal()`, `.reduce()`, bilans „limit minus zjedzone", lista posiłków, `deleteMeal()`, Date Controller | `dashboard.js` **nie importuje** `mealService.js`, więc posiłek dodany z `/recipes` zapisuje się do `localStorage.keto_meals` i nigdzie się nie pojawia. Już zaplanowane w `PROGRES.md` |
| 2.2 | 📷 **Przepisać przepisy na realne treści** | 28 z 30 ma identyczne instrukcje („Przygotuj wszystkie składniki na blacie", „Główny składnik: X"). 10 prawdziwych jest warte więcej niż 30 wypełniaczy |
| 2.3 | 🔧 **`/knowledge` realnie** — 3–5 artykułów wystarczy na start | jedyny organiczny kanał SEO i paliwo do postów; dziś artykułów jest zero, `src/data/articles.js` nie istnieje |
| 2.4 | 🔧 **Karta wyniku do udostępnienia** po onboardingu — makro w estetyce dziennika + logo + adres + przycisk „Pobierz / Udostępnij" | jedyny mechanizm w tym planie, który rośnie sam: użytkownik publikuje Twój branding na swoim Story. Koszt pozyskania: zero |
| 2.5 | 🔧📷 **Widok karty przepisu 1080×1350** (proporcja IG) → zrzut ekranu → gotowy post | zamienia pracę nad produktem w kalendarz contentowy; design „dziennik treningowy" jest gotowym szablonem |
| 2.6 | 📷 **Wyzwanie „7-Dniowy Keto Reset"** — IG zbiera zapisy, aplikacja daje narzędzie, grupa FB daje accountability, finał = oferta Campu | jedno działanie naprawia naraz: brak listy mailowej (1.2), brak metamorfoz (1.7) i brak leadów (0.1) |

---

## FAZA 3 — Skalowanie

| # | Zadanie |
|---|---|
| 3.1 | 🔧 **Keto Readiness Score** + kontekstowy upsell przy stagnacji wagi (`PLAN.md:164`, `STRATEGY.md:46`) — najlepszy mechanizm konwersji w Twoim planie, bo działa w momencie frustracji użytkownika. Wart priorytetu **wyżej niż PWA** |
| 3.2 | 🔧 PWA — manifest, service worker, install prompt |
| 3.3 | 🔧 Supabase — konta użytkowników, dane przeżywające zmianę urządzenia (dziś wszystko ginie przy wyczyszczeniu danych witryny) |
| 3.4 | 🔧 Panel trenera (wielu podopiecznych) — narzędzie operacyjne dla Ciebie i argument sprzedażowy: „mam system, nie prowadzę Cię w Excelu" |
| 3.5 | 🔧 Raport PDF „Fighter's Metabolic Report" — funkcja i jednocześnie artefakt do udostępnienia |

---

## Porządki (do zrobienia przy okazji)

| # | Zadanie |
|---|---|
| P.1 | `CLAUDE.md` sekcja 8 każe czytać katalog `skills/`, usunięty w commicie `5f41391`. Aktywny zestaw reguł to `.claude/skills/impeccable/` — martwa instrukcja do poprawienia |
| P.2 | `PLAN.md` i `PRODUCT.md` opisują paletę „Dark Fighter" (`#121212`, złoto `#D4AF37`), a obowiązujący `DESIGN.md` — „Dziennik Treningowy" (kraft `#E7DFC6` na macie `#15130F`). Dwa nieaktualne dokumenty będą mylić przy każdej sesji |
| P.3 | `PLAN.md` mówi o ścieżce `/tracker`, w kodzie jest `/dashboard` |
| P.4 | Długi techniczne z `ANALYS.md`: 5 niezdefiniowanych zmiennych CSS (`--color-surface`, `--color-primary`, `--color-border`, `--text-color`, `--color-header-bg`), `header.css` niepodpięty do builda, `alert()` zamiast toastów, filtry w `/recipes` kasujące się nawzajem, `lucide@latest` i `chart.js` bez pinowania wersji i SRI |

---

## Weryfikacja

| Zadanie | Jak sprawdzić |
|---|---|
| 0.1 | Wypełnić formularz danymi testowymi i potwierdzić, że zgłoszenie **fizycznie dotarło** do skrzynki/bazy. Sprawdzić stan offline i blokadę podwójnego kliknięcia |
| 0.2 | Po deployu otworzyć bezpośrednio adres `…/camp` w trybie prywatnym — musi wylądować na stronie Campu, nie na Home |
| 0.3 | Wkleić adres w wiadomość na Messengerze i w edytor posta na FB — podgląd musi pokazać tytuł, opis i obraz. Dodatkowo Meta Sharing Debugger |
| 0.4 / 0.5 | Przejść cały tabbar na telefonie — żaden przycisk nie prowadzi do pustego ekranu, linki social otwierają właściwe profile |
| Faza 1 | Lighthouse na `/` (mobile) — performance i accessibility; `lang`, kontrasty i `focus-visible` zgodnie z `DESIGN.md` sekcja 8 |
| 2.1 | Dodać przepis z `/recipes`, przejść na `/dashboard` — posiłek widoczny na liście, kalorie odjęte od limitu, usuwanie działa |
| Ogólne | `npm run build` + `npm run preview`, przeklikanie wszystkich tras przy szerokości 375 px |

---

## Uwaga na kolejność

Znaczna część Fazy 0 i Fazy 1 to **nie jest praca w kodzie** (oznaczone 📷): zdjęcia do Bio, Google Business Profile, własna domena, trzej beta-testerzy, grupa na Facebooku, przepisanie przepisów.

To można zacząć od razu, równolegle do nauki programowania — i to zdecyduje o pierwszych klientach szybciej niż jakakolwiek nowa funkcja w aplikacji.
