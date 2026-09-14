# RAPORT Z AUDYTU APLIKACJI KETO THAI — 14.09.2026

> **Zakres:** architektura, build/deployment, design system, layout, UI/UX, dostępność, wydajność, SEO, copywriting vs strategia marketingowa.
> **Metoda:** statyczna analiza całego `src/`, `index.html`, `dist/`, konfiguracji i dokumentów źródłowych (`DESIGN.md`, `STRATEGY.md`, `PRODUCT.md`, `PLAN.md`, `MARKETING.md`, `ROADMAP.md`, `PROGRES.md`).
> **Ograniczenie:** audyt bez weryfikacji wizualnej w przeglądarce (brak sesji live). Wszystkie znaleziska są potwierdzone w kodzie, ale wygląd na realnych urządzeniach nie był oglądany. To ten sam dług, który zgłasza `PROGRES.md` (sesja 2026-09-10, pkt 10).
> **Cel dokumentu:** punkt odniesienia do porównania za jakiś czas. Sekcja „Metryka stanu" jest po to, żeby dało się zmierzyć różnicę, nie tylko ją poczuć.

---

## 0. METRYKA STANU (snapshot do porównań)

| Wskaźnik | Wartość 14.09.2026 |
|---|---|
| Pliki JS w `src/` | 15 |
| Pliki CSS w `src/styles/` | 16 |
| Linie kodu (JS + CSS, bez danych) | ~3 000 |
| Linie danych (`recipesData.js`) | 691 |
| Rozmiar buildu (`dist/`) | 96 KB JS + 43 KB CSS |
| Trasy zadeklarowane w `routes.js` | 7 |
| Trasy realnie zaimplementowane | 5 (`/knowledge`, `/contact` to gołe `<h1>`) |
| Przepisy w bazie | 30 (10 śniadań / 10 obiadów / 10 kolacji) |
| Zdjęcia przepisów hostowane lokalnie | 0 / 30 (100% hotlink do Unsplash) |
| Tokeny kolorów zdefiniowane | 9 + 3 pochodne (`--ink-dim`, `--ink-faint`, `--bone-faint`) |
| `box-shadow` w projekcie | 0 ✅ |
| Hexy ad-hoc poza `global.css` | 2 (ten sam gradient `.snap` × 2 pliki) |
| `rgba()` ad-hoc | 1 (`.streak-box`) |
| Martwe zmienne CSS | 0 ✅ |
| Zależności produkcyjne w `package.json` | 0 (Chart.js i Lucide z CDN, poza `package.json`) |
| Testy automatyczne | 0 |
| Linter / formatter w repo | brak konfiguracji |
| Formularze realnie wysyłające dane | 0 / 2 |

### Ocena obszarowa (skala 1–10)

| Obszar | Ocena | Komentarz jednym zdaniem |
|---|---|---|
| Dyscyplina design systemu | **8/10** | Zero cieni, zero martwych tokenów, świat wizualny konsekwentny — rzadka jakość. |
| Architektura kodu | **6/10** | Czysty podział warstw, ale router bez lifecycle'u i bez stanu widoku. |
| Build / deployment | **2/10** | Build produkcyjny gubi wszystkie lokalne zdjęcia — patrz #1. |
| Layout / responsywność | **7/10** | Mobile-first zrobiony świadomie; dwa realne pęknięcia na skrajnych szerokościach. |
| UI / UX | **6/10** | Silny język wizualny, słabe stany brzegowe (`alert()`, brak empty states, martwe trasy). |
| Dostępność (a11y) | **4/10** | Fokus i tap-targety pomyślane, ale karty przepisów nieklikalne z klawiatury, 4 miejsca poniżej progu kontrastu. |
| Wydajność | **6/10** | Lekki bundle, ale Chart.js ładowany na każdej trasie i 3 rodziny fontów blokujące render. |
| SEO / dystrybucja | **2/10** | Brak meta description, brak Open Graph, deep-linki gubią ścieżkę. |
| Copywriting vs strategia | **7/10** | Uczciwość treści naprawiona, ale lejek nie ma ani jednego punktu przechwytu leada. |
| **Średnia ważona** | **~5,5/10** | Produkt dopracowany wizualnie, niedomknięty operacyjnie. |

---

## 1. PODSUMOWANIE WYKONAWCZE

**Werdykt jednym zdaniem:** to jest projekt z nieprzeciętnie dobrą warstwą wizualną i nieprzeciętnie dobrą dokumentacją decyzji, który **nie działa jako biznes** — ani nie potrafi przyjąć zgłoszenia, ani nie potrafi się pokazać na zewnątrz, ani nie wyświetla własnych zdjęć po zbudowaniu.

Trzy rzeczy są prawdziwe naraz:

1. **Rzemiosło wizualne jest powyżej poziomu typowego projektu juniorskiego.** Zero `box-shadow`, dziewięć tokenów trzymanych z dyscypliną, trzy różne typy kontenerów zamiast trzech identycznych kart, perforacje i taśma zamiast dekoracyjnych gradientów. To dokładnie ta odwrotność „AI-slopu", o którą chodziło w `DESIGN.md`. Ten kapitał jest realny i trzeba go chronić.
2. **Warstwa operacyjna nie istnieje.** Formularz `/camp` — jedyne źródło przychodu w całej strategii — buduje obiekt z `FormData` i go porzuca. Build produkcyjny nie zawiera ani jednego zdjęcia. Link wrzucony na Instagram pokaże szarą ramkę bez opisu i wyląduje na home niezależnie od tego, co było w URL-u.
3. **Dystans między dokumentacją a kodem rośnie.** `STRATEGY.md` opisuje kontekstowy upsell w dashboardzie, segmentację w onboardingu i mechanizm FOMO w bazie wiedzy. W kodzie nie ma żadnej z tych trzech rzeczy. `PLAN.md` opisuje trasę `/tracker`, `/fighters-camp` i multi-step wizard — kod ma `/dashboard`, `/camp` i jeden płaski formularz.

**Co to znaczy praktycznie:** wysiłek wkładany dziś w polerowanie UI optymalizuje produkt, którego nikt nie zobaczy w komplecie i który nie umie odebrać zgłoszenia. Kolejność z `PROGRES.md` („najpierw to, co blokuje pieniądze") jest słuszna — ten audyt dokłada do tej listy jeden punkt, którego tam nie było, i stawia go najwyżej: **build gubi zdjęcia**.

---

## 2. ZNALEZISKA KRYTYCZNE (🔴 blokują biznes)

### 🔴 #1 — Build produkcyjny nie zawiera żadnego lokalnego zdjęcia (NOWE)

**Dowód:** `dist/assets/` zawiera wyłącznie dwa pliki: `index-BkXJDwbg.css` i `index-bx2pcTeB.js`. Katalog `public/` jest **pusty**. W zbudowanym JS-ie ścieżki pozostały dosłowne:

```
/src/assets/homePicture.jpg
/src/assets/iphonMobileDashboard.png
/src/assets/iphonMobileOnboarding.png
/src/assets/iphonMobileRecipes.png
/src/assets/kopniak w tarcze.jpg
```

**Mechanizm:** Vite przepisuje i hashuje tylko te zasoby, które potrafi wykryć statycznie — przez `import` w module albo przez `url()` w CSS. Ścieżki sklejane w czasie działania (`src="${getBase()}/src/assets/..."` w `home.js`) są dla bundlera zwykłym tekstem w stringu. Nie trafiają do grafu zależności, więc nie są kopiowane do `dist/`.

**Skutek na produkcji:** zdjęcie hero, zdjęcie w sekcji „O mnie" i **trzy makiety telefonu ilustrujące działanie aplikacji** (sekcja Steps — czyli cały dowód, że produkt istnieje) zwracają 404. Zostają puste ramki `alt`. To silniejsze uderzenie w wiarygodność niż jakikolwiek błąd copywriterski na tej stronie.

**Dodatkowo:** plik `kopniak w tarcze.jpg` ma spacje w nazwie, wstawiane do `src` bez enkodowania. Nawet po naprawie ścieżek to osobne źródło problemów na części serwerów.

**Kierunek do przemyślenia (nie gotowiec):** są dwie klasy rozwiązania — przenieść zasoby tam, gdzie bundler kopiuje je bez pytania, albo zaimportować je jako moduły, żeby bundler je zobaczył. Każda ma inne konsekwencje dla hashowania i cache'owania. Warto rozstrzygnąć świadomie, bo ta sama decyzja obejmie przyszłe zdjęcia z Tajlandii.

---

### 🔴 #2 — Formularz `/camp` nadal nic nie wysyła

**Dowód:** `src/pages/camp.js:517-537`. `FormData` → `Object.fromEntries` → `dataObject` nigdy nie użyty. Zaraz potem `form.innerHTML` podmieniany na „Zgłoszenie przyjęte". W kodzie stoi komentarz przyznający się do tego wprost.

**Skutek:** 100% zgłoszeń do jedynego płatnego produktu ginie, a użytkownik widzi potwierdzenie sukcesu. To gorsze niż brak formularza — brak formularza nie kłamie.

**Status:** znane, opisane w `ROADMAP.md` Faza 0.1 i w `PROGRES.md` jako priorytet #1 od trzech sesji. Nadal niewdrożone.

**Dodatkowy wymiar, którego nie ma w żadnym dokumencie:** formularz zbiera imię, nazwisko, e-mail i telefon — dane osobowe w rozumieniu RODO. W projekcie nie ma polityki prywatności, nie ma informacji o administratorze danych ani zgody na przetwarzanie. Zdanie „bez spamu i bez przekazywania danych dalej" jest deklaracją, nie realizacją obowiązku informacyjnego. Działalność nierejestrowana (`STRATEGY.md` §5) **nie zwalnia** z RODO. To trzeba domknąć w tej samej sesji, co wysyłkę — nie później.

---

### 🔴 #3 — Aplikacja jest niewidoczna dla wyszukiwarek i social mediów

**Dowód:** `index.html` — w `<head>` jest wyłącznie `charset`, `viewport`, `<title>Keto Thai App</title>`, preconnect do fontów i arkusz stylów.

Brakuje: `meta description`, kompletu Open Graph (`og:title`, `og:description`, `og:image`, `og:url`), Twitter Card, `canonical`, `favicon`, `robots.txt`, `sitemap.xml`, danych strukturalnych.

**Skutek dla strategii:** `STRATEGY.md` zakłada social media jako główne źródło ruchu. Każdy link wrzucony na Instagram czy Facebook renderuje się dziś jako pusty szary prostokąt z tekstem „Keto Thai App". Konwersja z kanału umiera przed kliknięciem.

**Drugi wymiar:** tytuł „Keto Thai App" nie zawiera żadnej frazy, której ktoś mógłby szukać. Nie ma w nim ani „kalkulator", ani „makro", ani „przepisy" w użytecznym układzie.

---

### 🔴 #4 — Deep-linki gubią ścieżkę

**Dowód:** `404.html` wykonuje `window.location.replace("/keto-thai-app")` — bezwarunkowo, bez zachowania oryginalnej ścieżki.

**Skutek:** ktoś, komu wyślesz link do `/camp`, ląduje na stronie głównej. Ten sam mechanizm psuje odświeżenie strony (F5) na dowolnej podstronie i powrót z zakładki. Dla strony sprzedażowej, do której linkujesz z biogramu na Instagramie, to bezpośrednia strata.

**Do zrozumienia przed naprawą:** standardowy trik SPA na GitHub Pages polega na tym, że `404.html` **koduje** oryginalną ścieżkę (np. do query stringa), a skrypt startowy odtwarza ją przez `history.replaceState`. Obecny kod robi tylko pierwszą połowę — przekierowuje, ale nie przenosi informacji o celu.

---

## 3. ZNALEZISKA WYSOKIE (🟠 widocznie zepsute dla użytkownika)

### 🟠 #5 — Dwie trasy w nawigacji głównej prowadzą do gołego `<h1>`

**Dowód:** `src/routes.js:25-34` — `/knowledge` renderuje `"<h1>Knowledge Base</h1>"`, `/contact` renderuje `"<h1>Contact Coach</h1>"`.

Obie trasy są linkowane **z każdej strony w aplikacji**: w tabbarze desktopowym, w szufladzie mobilnej i w stopce. Łącznie sześć wejść na każdej trasie.

**Skutek:** użytkownik o najwyższej intencji zakupowej — ten, który klika „Kontakt" — dostaje białą literę na czarnym tle, po angielsku, bez layoutu, bez drogi powrotnej poza nawigacją. Nie ma gorszego momentu na taką awarię.

**Decyzja do podjęcia (trzy warianty, nie wybieram za Ciebie):**
- **A.** Usunąć oba linki z nawigacji do czasu zbudowania treści — najtańsze, natychmiastowe, ale zmniejsza postrzegane bogactwo produktu.
- **B.** Zostawić trasy, dać im stan „w przygotowaniu" utrzymany w języku dziennika (kartka z pieczątką „W OPRACOWANIU", data, jedno zdanie co tu będzie i kiedy) — uczciwe, zgodne z `DESIGN.md` §7, ale nadal nie konwertuje.
- **C.** Zbudować `/contact` od razu jako realny formularz kontaktowy (ten sam mechanizm wysyłki co `/camp`, więc koszt krańcowy niski po naprawie #2), a `/knowledge` zostawić w wariancie B.

### 🟠 #6 — Karty przepisów są niedostępne z klawiatury

**Dowód:** `src/pages/recipes.js:34` — karta to `<article class="card" data-id="...">`, obsługiwana przez delegację `click` na `.grid-layout` (`recipes.js:125`). `card.css:8` dokłada `cursor: pointer`.

**Skutek:** `<article>` nie jest fokusowalny, nie ma roli interaktywnej i nie reaguje na Enter/Spację. Cała baza 30 przepisów — czyli rdzeń darmowej wartości produktu — jest dostępna wyłącznie myszą i dotykiem. Czytnik ekranu nie zapowie karty jako klikalnej.

**Pytanie naprowadzające:** co dokładnie sprawia, że `<button>` i `<a>` reagują na Enter, a `<div>` nie? I dlaczego dodanie samego `tabindex="0"` **nie wystarczy**, żeby to naprawić?

### 🟠 #7 — Widok szczegółu przepisu nie ma własnego URL-a

**Dowód:** `recipes.js:125-142` — kliknięcie karty podmienia `innerHTML` w `#recipe-detail` i przełącza klasy `is-hidden`. Historia przeglądarki nie jest ruszana.

**Skutki, wszystkie realne:**
- Przycisk „wstecz" w przeglądarce nie wraca do listy, tylko wyrzuca z `/recipes` na poprzednią trasę. Na mobile to gest, nie przycisk — użytkownicy używają go odruchowo.
- Nie da się udostępnić linku do konkretnego przepisu. Dla treści, która ma być magnesem na ruch z social mediów, to utrata najnaturalniejszego mechanizmu dystrybucji.
- Google nigdy nie zaindeksuje żadnego przepisu — a 30 przepisów to 30 potencjalnych stron wejścia.
- Odświeżenie strony kasuje widok.

### 🟠 #8 — Cztery miejsca w interfejsie są poniżej progu kontrastu WCAG AA

`--ink-faint` to `--ink` przy 55% krycia na papierze. Realny kolor to ok. `rgb(120,115,100)` na `#E7DFC6` — **kontrast 3,56:1**. Próg dla tekstu normalnego to 4,5:1. Wszystkie cztery użycia to tekst 11–12 px, czyli najdalej od progu „dużego tekstu".

| Miejsce | Plik | Co to jest |
|---|---|---|
| `.hero__tag` | `home.css:44` | **Zdanie niosące całą propozycję wartości** na stronie głównej |
| `.fighter-card__fact dt` | `camp.css:124` | Etykiety „Czas trwania", „Miejsc w grupie", „Cena" na stronie sprzedażowej |
| `.phase-marker__unit` | `camp.css:269` | „/ 12 tygodni" przy wskaźnikach faz |
| `.site-footer__copyright` | `footer.css:110` | Stopka na każdej stronie |

**Gorzka ironia pierwszego wiersza:** najważniejsze zdanie marketingowe na stronie („Kalkulator makro i przepisy keto — dla aktywnych i dla tych, którzy dopiero zaczynają") jest jednocześnie najsłabiej czytelnym elementem strony. To znalezisko łączy warstwę designu z warstwą konwersji — nie jest kosmetyczne.

**Dodatkowo, na tej samej zasadzie:** `--red` jako kolor tekstu łamie własną „zasadę twardą" z `DESIGN.md` §3 w dwóch miejscach — `.btn-delete` (`layout.css:73`, czerwony tekst ~13 px, 3,5:1 na macie) oraz `.site-footer__nav a:hover` i `.site-footer__email:hover` (`footer.css:54,76` — czerwień na papierze daje 3,98:1). Stan hover nie jest zwolniony z progu kontrastu.

### 🟠 #9 — Stan aktywny nawigacji jest komunikowany wyłącznie kolorem

**Dowód:** `tabbar.css:159-161` — `.tabbar__link--active { color: var(--amber) }`. Nic więcej.

Dwa problemy naraz:
- `DESIGN.md` §6 specyfikuje coś innego: etykieta w `--bone` + kropka-wskaźnik `--red` Ø4px pod spodem. Rozjazd wisi otwarty od kilku sesji (`PROGRES.md`, pkt 10/12).
- `DESIGN.md` §8 mówi wprost: „Status/feedback nigdy tylko kolorem". Obecna implementacja łamie własną regułę, a przy tym hover ma **identyczny** kolor co stan aktywny (`tabbar.css:154`), więc najechanie myszą tworzy dwa „aktywne" taby naraz.

### 🟠 #10 — Podświetlenie aktywnej zakładki rozjeżdża się po nawigacji wewnątrz strony (NOWE)

**Dowód:** `main.js:61-67` — `updateActiveTab()` jest wywoływane przy starcie, przy `popstate` i przy kliknięciu **w obrębie `#tabbar`**. `router.js:56-59` — `navigateTo()` nie wywołuje go w ogóle.

**Skutek:** każde przejście linkiem spoza tabbara zostawia stary podświetlony tab. Klikasz „Aplikuj do Campu" w sekcji camp-offer na home → jesteś na `/camp`, a nawigacja nadal twierdzi, że jesteś na „Home". To samo dla obu przycisków w finałowym CTA, dla przycisku hero, dla wszystkich linków w stopce i w szufladzie mobilnej.

**Przyczyna architektoniczna, nie literówka:** aktualizacja stanu nawigacji mieszka w `main.js`, a zmiana trasy w `router.js`. Dwa źródła prawdy o tym samym. Pytanie do przemyślenia: gdzie **powinna** mieszkać wiedza o tym, która trasa jest aktywna, żeby nie dało się jej rozjechać?

### 🟠 #11 — `IntersectionObserver` nie jest sprzątany przy zmianie trasy

**Dowód:** `home.js:493` i `camp.js:521` tworzą obserwatory. `routes.js` definiuje `cleanup` **wyłącznie** dla `/dashboard` (`cleanupDashboard` niszczy wykresy — to zrobione dobrze). Router wywołuje `currentRoute?.cleanup?.()` (`router.js:9`), ale dla home i camp nie ma czego wywołać.

**Skutek:** każde wejście na `/` lub `/camp` tworzy nowy obserwator trzymający referencje do węzłów, które zaraz potem znikają przez `innerHTML`. Przy typowej sesji to nieduży wyciek, ale to ta sama klasa problemu, którą już raz naprawiałeś w routerze (commit `ea8d512 fix(router): fix leak memory`) — wróciła bocznymi drzwiami wraz z nowymi stronami.

**Uwaga systemowa:** `cleanup` jest opcjonalny w kontrakcie trasy. Opcjonalne sprzątanie to sprzątanie, o którym się zapomina. Warto rozważyć, czy `init` nie powinien **zwracać** funkcji sprzątającej, zamiast liczyć na to, że ktoś pamięta o osobnym eksporcie.

### 🟠 #12 — Treść startuje z `opacity: 0` i zależy od JS-u

**Dowód:** `home.css:896-902` — `.reveal { opacity: 0 }`. Widoczność przywraca wyłącznie `IntersectionObserver`.

**Skutek:** jeśli JS się nie wykona (błąd w dowolnym miejscu bundla, wolne łącze, blokada skryptów), użytkownik dostaje pustą stronę zamiast niesformatowanej — ale czytelnej — treści. Dla robotów social mediów, które nie uruchamiają JS-u, strona jest po prostu pusta.

Do tego **nie ma nigdzie obsługi `prefers-reduced-motion`** — ani dla `.reveal`, ani dla `scroll-behavior: smooth` (`reset.css:10`). Dla części użytkowników (migreny, zaburzenia przedsionkowe) to nie preferencja estetyczna, tylko dostępność.

---

## 4. ZNALEZISKA ŚREDNIE (🟡 jakość i spójność)

### 🟡 #13 — Trzy kickery nad nagłówkami na `/camp`

`DESIGN.md` §4 nazywa to „zakazem bezwzględnym — bez wyjątków". `PROGRES.md` (2026-09-10 cz. 2) raportuje usunięcie „wszystkich kickerów nad nagłówkami". W kodzie zostały trzy:

| Plik | Kicker | Nagłówek pod nim |
|---|---|---|
| `camp.js:119-120` | „Faza 1 · Tygodnie 1–4" | `<h3>Adaptacja metaboliczna` |
| `camp.js:154-155` | „Faza 2 · Tygodnie 5–8" | `<h3>Rekompozycja sylwetki` |
| `camp.js:190-191` | „Faza 3 · Tygodnie 9–12" | `<h3>Szczyt formy i stabilizacja` |

Ten sam komponent na home (`home.js:234-235, 257-258, 280-281`) ma kolejność **poprawną** — nagłówek, potem etykieta. Czyli reguła jest rozumiana, tylko nierówno wyegzekwowana. Warto zapamiętać jako wzorzec: rozjazd między dwoma użyciami tego samego komponentu prawie zawsze oznacza, że regułę trzyma dyscyplina autora, a nie sam komponent.

### 🟡 #14 — Nagłówek FAQ wypada z systemu typograficznego (NOWE)

**Dowód:** `home.css:665-672` — `.faq__title` ustawia `text-transform`, rozmiar, kolor i wyrównanie, ale **nie ustawia `font-family`**. Każdy inny nagłówek sekcji na stronie (`.philosophy__title`, `.about__title`, `.steps__title`, `.final-cta__title`, `.camp-*__title`) deklaruje `var(--font-heading)`.

**Skutek:** „Najczęściej zadawane pytania" renderuje się w Public Sans w rozmiarze do 3,5 rem, wielkimi literami, podczas gdy wszystkie sąsiednie nagłówki są w Big Shoulders Stencil. Jedna sekcja mówi innym głosem niż cała reszta strony — i to akurat ta, do której ludzie scrollują z konkretnym pytaniem.

### 🟡 #15 — Kicker w sekcji Philosophy wisi w powietrzu (NOWE)

**Dowód:** kolejność w DOM to `.philosophy__title` → `.philosophy__kicker` (poprawnie, zgodnie z §4). Ale `home.css:139` daje tytułowi `margin-bottom: var(--spacing-xl)` (do 6 rem), a `home.css:133` daje kickerowi `margin-bottom: var(--spacing-xs)` (do 0,5 rem).

**Skutek:** między nagłówkiem „Dlaczego Keto Thai?" a jego własną etykietą „3 filary systemu" powstaje przepaść do 96 px, a etykieta przykleja się do siatki kart pod spodem. Wizualnie etykieta przestaje należeć do nagłówka i zaczyna wyglądać na podpis siatki. Reguła z `DESIGN.md` jest spełniona formalnie (etykieta jest pod nagłówkiem), a złamana w odbiorze.

**Pytanie kontrolne:** która z dwóch wartości `margin-bottom` opisuje tu „odstęp między nagłówkiem a jego etykietą", a która „odstęp między blokiem nagłówkowym a treścią sekcji"? Co się stanie, jeśli odstęp sekcyjny przeniesiesz z tytułu na kicker?

### 🟡 #16 — Podwójna elewacja na dziewięciu komponentach

`DESIGN.md` §5: „jedna deklaracja elewacji na element — kolor papieru ALBO ciemny panel ALBO cienka linia. Nigdy dwa naraz."

Elementy z tłem `--ground2` **i** obramowaniem jednocześnie: `.card` (`card.css:1-3`), `.bento-card` (`card.css:132-134`), `.modal__content` (`modal.css:15-19`), `.hero__photo-card` (`home.css:74-78`), `.years-proof__photo-card` (`home.css:465-469`), `.camp-hero__badge`, `.camp-coach__photo`, `.support-card--video` (`camp.css`), `.reminder-banner` (`banner.css:37-39`).

**Uczciwe zastrzeżenie:** pola formularzy (`.form__input`, `.camp-form__input`, `.filters__input`) też mają tło i ramkę, ale tam ramka pełni funkcję afordancji („to jest pole do wpisania"), nie elewacji. Tych nie liczę jako naruszenie — i warto to rozróżnienie dopisać do `DESIGN.md`, bo dziś reguła brzmi bardziej absolutnie, niż powinna.

### 🟡 #17 — Dane przykładowe podane jako fakt

`DESIGN.md` §7: „Każda liczba, która nie pochodzi z realnej logiki aplikacji, jest oznaczona jako przykładowa — nigdy podana jako fakt."

Nieoznaczone w kodzie:
- `home.js:107-114` — „2450 KCAL" i „−0.8 KG/TYDZ" pod etykietą „METRYKA". Czytelnik ma prawo odczytać to jako realny wynik z aplikacji.
- `home.js:81-89` — siatka „SERIA": 5 z 7 pól zapalonych. Funkcja streak **nie istnieje nigdzie w kodzie**.
- `home.js:60-64` — pasek makro 70/20/10. Akurat ten jest zgodny z realną logiką `calculatorService.js`, więc obroniony.

Decyzja z 2026-09-09 (odrzucenie formy `[PRZYKŁAD]` w nawiasach) jest zapisana i słuszna — forma faktycznie wyglądała źle. Ale **zasada została bez formy zastępczej**, więc w praktyce przestała obowiązywać. To najgorszy stan pośredni: reguła wciąż w dokumencie, nigdzie nieegzekwowana.

Trzy kierunki do rozważenia: (a) wpleść oznaczenie w język świata — dziennik trenera naturalnie zawiera wzór wpisu („WZÓR WPISU", „PRZYKŁADOWY ODCZYT"); (b) usunąć mockup streaka w całości, bo źródłem problemu jest nieistniejąca funkcja, nie etykieta; (c) podmienić liczby na realne wyliczenia z `calculatorService.js` dla domyślnego profilu — wtedy przestają być przykładem.

### 🟡 #18 — Stockowe zdjęcia podpisane jak własna dokumentacja

**Dowód:** `home.js:164-179` — dwa zdjęcia z Unsplash w galerii „O mnie", opisane w idiomie dziennika:
- „FOTO 03 — KUCHNIA KETO"
- „FOTO 04 — WALKA W RINGU"

Trzecie zdjęcie w tej galerii (`kopniak w tarcze.jpg`) jest własne. Sąsiedztwo wzmacnia przekaz, że wszystkie trzy są autentyczne.

**Dlaczego to poważniejsze niż zwykły placeholder:** cała sekcja to dowód autorytetu w pierwszej osobie („Przez lata trenowałem…", „szlifowałem trenując w Lamai Muay Thai Camp"). Podpis „FOTO 04 — WALKA W RINGU" w tym kontekście czyta się jako „to ja w ringu". To nie jest to samo co neutralne zdjęcie ilustracyjne. `MARKETING.md` zgłosił to jako 🔴2 — nadal nienaprawione.

To samo dotyczy 30/30 zdjęć przepisów. Tam ryzyko jest mniejsze (nikt nie zakłada, że trener fotografował każdą potrawę), ale hotlink do Unsplash dla całej bazy to też ryzyko operacyjne: zero kontroli nad dostępnością i cache'em, brak `srcset` i zdjęcia `w=800` wyświetlane w kontenerach ~300 px.

### 🟡 #19 — Natywne `alert()` w interfejsie o silnym języku wizualnym

**Dowód:** `dashboard.js:221` i `dashboard.js:268`.

Zbudowałeś świat kraftowego papieru, taśmy i pieczątek — i walidację obsługujesz systemowym oknem Windowsa z ikoną i przyciskiem „OK". To najtwardsze możliwe wyjście z zaprojektowanego świata. Dodatkowo `alert()` blokuje wątek, nie da się go ostylować i nie jest zapowiadany przez czytniki tak jak komunikat inline przy polu.

### 🟡 #20 — Modal wagi bez podstawowej mechaniki modala

**Dowód:** `dashboard.js:101-110` + `modal.css`.

Brakuje: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, pułapki fokusu, zamykania Escapem, zamykania kliknięciem w tło, przeniesienia fokusu na pole po otwarciu i powrotu na przycisk po zamknięciu.

Przy otwartym modalu cała strona pod spodem pozostaje fokusowalna i scrollowalna. Użytkownik klawiatury może „wyjść" z modala Tabem i nie mieć jak wrócić.

### 🟡 #21 — Linki w zamkniętej szufladzie mobilnej są fokusowalne (NOWE)

**Dowód:** `topbar.css:69-83` — szuflada chowa się przez `max-height: 0` + `overflow: hidden`. To ukrywa wizualnie, ale **nie usuwa elementów z kolejności tabulacji**.

**Skutek:** użytkownik klawiatury na mobile, tabując przez stronę, wpada w sześć niewidocznych linków. Fokus znika z ekranu, nawigacja staje się nieprzewidywalna.

### 🟡 #22 — Akordeon FAQ bez `aria-expanded`

**Dowód:** `home.js:355-358` i dalej — osiem `<button class="accordion__header">`, żaden nie ma `aria-expanded` ani `aria-controls`. Stan jest trzymany wyłącznie w klasie CSS na rodzicu (`home.js:512`).

Czytnik ekranu ogłosi „przycisk: Czy dieta keto jest bezpieczna?" bez informacji, czy odpowiedź jest rozwinięta. Ciekawe, że `topbar__toggle` w `index.html:33-34` **ma** komplet atrybutów i aktualizuje je w JS (`main.js:36,41`) — czyli wzorzec istnieje w projekcie i jest zrozumiany, tylko nieprzeniesiony.

### 🟡 #23 — Siatka przepisów przelewa się na wąskich telefonach (NOWE)

**Dowód:** `layout.css:49-53` — `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))` wewnątrz `.page-container`, który ma `width: 90%`.

**Arytmetyka:** na ekranie 320 px (iPhone SE, nadal realny udział) kontener ma 288 px, a minimalna szerokość kolumny to 300 px. Kolumna wychodzi 12 px poza kontener. Poziomy scroll jest tłumiony przez `overflow-x: hidden` na `html` i `body` (`global.css:61,70`), więc zamiast przewijania użytkownik dostaje **ucięte** karty.

To dobra ilustracja pewnej pułapki: `overflow-x: hidden` naprawiło realny bug z przewijaniem na mobile (`PROGRES.md`, 2026-09-09 cz. 3, pkt 1), ale przy okazji **zamaskowało** tę klasę błędów. Od tej pory żadne przepełnienie w poziomie nie zgłosi się samo.

### 🟡 #24 — Chart.js ładowany na każdej trasie

**Dowód:** `index.html` ładuje `chart.js` i `lucide` przez `<script>` z CDN, globalnie.

Chart.js jest używany **wyłącznie** na `/dashboard` (`dashboard.js:137,170`). Ładuje się na home, na `/camp`, na `/recipes`, na `/onboarding` — na czterech trasach z pięciu jest martwym balastem.

Dodatkowo:
- `lucide@latest` — wersja **nieprzypięta**. Każdy deploy bierze to, co akurat jest na CDN. Zmiana breaking po stronie biblioteki psuje ikony bez żadnej zmiany w Twoim kodzie. To zarazem ryzyko dostępności, jak i ryzyko łańcucha dostaw.
- Żadna z tych bibliotek nie jest w `package.json`, więc `npm install` na czystej maszynie nie odtwarza środowiska. Twój manifest zależności kłamie: deklaruje zero zależności produkcyjnych, a aplikacja bez nich nie działa.

### 🟡 #25 — Trzy rodziny fontów z pełnymi zakresami, blokujące render

**Dowód:** `index.html:8-11` — Big Shoulders Stencil (700, 900), Martian Mono (zmienna 400..700), Public Sans (kursywa + prosta, 400..600).

To arkusz blokujący renderowanie, ładowany z zewnętrznej domeny, przed jakąkolwiek treścią. `display=swap` jest ustawiony (dobrze), ale zakresy są szerokie — szczególnie Public Sans z kursywą, której w kodzie nie widziałem w użyciu.

Dodatkowo żaden `<img>` w projekcie **nie ma atrybutów `width`/`height`** (0 z 10). Część obrazów ma `aspect-ratio` w CSS i jest zabezpieczona, ale makiety telefonu w sekcji Steps (`home.css:557-561`) nie mają ani jednego, ani drugiego — to bezpośrednie źródło skoków layoutu (CLS) podczas ładowania. Te same trzy obrazy nie mają też `loading="lazy"`, mimo że są daleko poniżej pierwszego ekranu (5 z 10 obrazów ma lazy, te trzy nie).

---

## 5. COPYWRITING I ZGODNOŚĆ ZE STRATEGIĄ

### 5.1 Co jest zrobione dobrze i powinno zostać

- **Uczciwość faktów o autorze jest domknięta.** „15 lat treningu Muay Thai, dopracowanego w tajskich campach" — poprawne (staż treningowy ogółem, nie 15 lat w Tajlandii). „Instruktor Muay Thai (MEN) · dietetyka kliniczna (w trakcie)" — poprawnie rozróżnia ukończone od trwającego. Ta dyscyplina to realna przewaga; większość stron w tej kategorii jej nie ma.
- **Sfabrykowany dowód społeczny usunięty.** Brak `BATCH #04`, `VIP ACCESS`, `#KT-8842-PRO`. „Pierwsza grupa · 5 miejsc" jest jednocześnie uczciwe i buduje niedobór, bo jest twierdzeniem o przyszłości, do którego można się zobowiązać.
- **Sekcja kwalifikacji „dla kogo NIE"** (`camp.js:290-320`) to najsilniejszy element perswazyjny w całej aplikacji. Odrzucanie klientów działa jak sygnał pewności siebie i jednocześnie odsiewa złe dopasowania.
- **Notatki „dlaczego pytam o to pole"** w formularzu `/camp` — nietypowe, obniżają tarcie, wzmacniają wrażenie ręcznej selekcji zamiast masowego naboru.
- **Zmiana osi obietnicy** ze „spalania tłuszczu" na „stabilną energię" obsługuje wszystkie trzy cele z onboardingu (redukcja / utrzymanie / masa). Spójne z tym, co robi kod.

### 5.2 Mechanizmy ze `STRATEGY.md`, których w kodzie nie ma

| Mechanizm (`STRATEGY.md` §4) | Status w kodzie | Konsekwencja |
|---|---|---|
| Kontekstowy upsell w dashboardzie przy stagnacji wagi | **Brak** | `/dashboard` nie ma **ani jednego** linku do `/camp`. Użytkownik, który codziennie wraca do aplikacji, nigdy nie zobaczy oferty. |
| Segmentacja w onboardingu: „Działasz sam czy potrzebujesz eksperta?" | **Brak** | Brak kwalifikacji leada na wejściu. |
| FOMO w `/knowledge` (80% darmowe / 20% z kłódką) | **Brak trasy** | Cały filar edukacyjny nie istnieje. |
| Afiliacja w module Wiedza | **Brak trasy** | Trzeci filar przychodu nieuruchomiony. |
| `/treningi-tychy` | **Brak trasy** | Lokalny lejek nieistniejący; blokowany brakiem materiału, nie kodem. |
| Pole `sport` z onboardingu wpływa na wyliczenia | **Zapisywane, nieużywane** | `calculatorService.js` ignoruje `sport`. Obietnica personalizacji bez pokrycia. |

**Najcięższy wniosek:** `/dashboard` to według `STRATEGY.md` miejsce, w którym dzieje się nawykowy kontakt z produktem i w którym ma zapadać decyzja o mentoringu. Dziś jest to ślepy zaułek — kalkulator, dwa wykresy i przycisk „Skasuj dane aplikacji". Jedyny wyeksponowany przycisk destrukcyjny w całej aplikacji znajduje się na stronie, która ma sprzedawać.

### 5.3 Dziura w lejku: zero punktów przechwytu leada

Dziś istnieją dokładnie dwie ścieżki wyjścia dla odwiedzającego:

1. **Załóż lokalny profil** (`/onboarding` → `localStorage`) — nie zostawia Ci żadnego kontaktu. Dane żyją w przeglądarce użytkownika. Nie wiesz, że ktoś w ogóle był.
2. **Aplikuj do Campu** — wysoki próg zaangażowania (imię, nazwisko, telefon, opis problemu), a do tego zgłoszenie i tak ginie (#2).

Nie ma nic pomiędzy. Osoba, która jest ciekawa, ale jeszcze nie gotowa — czyli większość ruchu — nie ma jak zostawić samego e-maila. `MARKETING.md` 🔴4 opisuje to od kilku sesji.

Dodatkowo: aplikacja **nie mierzy niczego**. Zero analityki. Nie wiesz, ilu ludzi dociera do sekcji Camp-offer, ilu zaczyna wypełniać formularz, ilu porzuca go na którym polu. Każda przyszła decyzja copywriterska będzie podejmowana na wyczucie.

### 5.4 Konkretne usterki w treści

| Miejsce | Tekst | Problem |
|---|---|---|
| `recipes.js:9` | „Tluste smaki ,metaboliczna dyscyplina" | Brak ogonka („Tłuste"), spacja przed przecinkiem, brak spacji po. Trzy błędy w pięciu słowach — w nagłówku strony. |
| `dashboard.js:103` | „Podaj aktualną wage" | Brak ogonka („wagę"). |
| `home.js:381` | „Tak , o ile jest prowadzona z głową." | Spacja przed przecinkiem. Do tego to **najkrótsza odpowiedź w całym FAQ** — a dotyczy najpoważniejszej obiekcji (bezpieczeństwo diety). |
| `home.js:404` | „Dla kogo jest aplikacja" | Brak znaku zapytania w pytaniu FAQ. |
| `home.js:410` | „Dla każdego kto chce…, zgubić tkanke tłuszczową" | Brak przecinka po „każdego", brak ogonka („tkankę"). Do tego odpowiedź „dla każdego" **znosi** całą pracę nad segmentacją i kwalifikacją zrobioną na `/camp`. |
| `dashboard.js:34` | „Dashboard" | Angielskie słowo w polskim interfejsie o mocnym, spójnym głosie. Do tego trzy nazwy dla jednej rzeczy: tabbar mówi „Tracker", nagłówek „Dashboard", `PLAN.md` „/tracker". |
| `dashboard.js:57-73` | „Białko / 145", „Tłuszcz / 180" | **Brak jednostek.** Kalorie mają kontekst w tytule („Dzienny limit kalorii"), makra nie mają nic. Użytkownik widzi gołe liczby i musi zgadywać, czy to gramy, czy procenty, czy kalorie. Na stronie, której obietnicą jest „kliniczny rygor pomiaru", brak jednostki przy pomiarze to poważniejsza usterka niż literówka. |
| `home.js:9` | pieczątka „SEZON 01" | `DESIGN.md` §9 zakazuje numeracji bez znaczenia sekwencyjnego. Nie ma sezonu 02. |

### 5.5 Brak zastrzeżenia medycznego

Aplikacja formułuje twierdzenia zdrowotne: że keto jest bezpieczne „prowadzone z głową", że po adaptacji nie ma spadków mocy, że ok. 2 g białka/kg w nadwyżce daje „optymalne środowisko anaboliczne", wylicza deficyt 500 kcal bez żadnego dolnego progu kalorycznego. Autor jest w trakcie kursu dietetyki klinicznej, nie po nim.

Nigdzie — ani w kalkulatorze, ani w FAQ, ani w stopce — nie ma zdania w rodzaju „to narzędzie edukacyjne, nie zastępuje konsultacji lekarskiej; przy chorobach metabolicznych, ciąży lub przyjmowaniu leków skonsultuj zmianę diety z lekarzem".

To nie jest tylko higiena prawna. W tej kategorii **dodanie zastrzeżenia podnosi wiarygodność**, a nie ją obniża — lekkomyślność brzmi amatorsko, ostrożność brzmi klinicznie. To jest zgodne z pozycjonowaniem z `PRODUCT.md`, nie wbrew niemu.

### 5.6 Brak walidacji danych wejściowych kalkulatora

`onboarding.js:22-32` — pola wiek, wzrost, waga to `type="number"` z `required`, bez `min`, `max` ani `step`. Można wpisać wiek 5, wzrost 12, wagę 0 lub wartość ujemną.

`calculatorService.js` policzy z tego wynik i pokaże go jako fakt. Przy skrajnie niskiej kaloryczności `calculateKetoMacros` może zwrócić **ujemną liczbę gramów tłuszczu** (wzór odejmuje kalorie z białka i węgli od celu i dzieli przez 9 — nic nie pilnuje, żeby reszta była dodatnia).

Osobna kwestia merytoryczna, warta Twojej decyzji: białko liczone jest jako 2 g × **masa całkowita**. Dla osoby z wysokim poziomem tkanki tłuszczowej — a to jeden z trzech deklarowanych segmentów („problemy metaboliczne", „oporna tkanka") — standardem klinicznym jest liczenie od masy beztłuszczowej albo od masy należnej. Przy 120 kg obecny wzór zamawia 240 g białka dziennie. To nie jest błąd kodu, tylko wybór modelu — ale wybór, którego strona nie komunikuje, a który stoi w napięciu z obietnicą „klinicznego rygoru".

---

## 6. MOCNE STRONY (do ochrony przy każdej refaktoryzacji)

1. **Dyscyplina design systemu jest wyjątkowa.** Zero `box-shadow` w 16 plikach CSS. Zero martwych zmiennych (po naprawie z 2026-09-10). Dwa hexy ad-hoc w całym projekcie, oba to ten sam udokumentowany gradient placeholdera. To poziom kontroli, którego nie ma większość projektów komercyjnych.
2. **Świat wizualny jest autorski i konsekwentny.** Taśma, perforacja, dziurki po segregatorze, pieczątki, `clip-path` udający oderwany fragment karty punktacji. To nie są ozdoby — to przenoszenie metafory dziennika trenera na każdy poziom interfejsu. Dokładnie to, o co chodziło w odrzuceniu „AI-slopu".
3. **Zakaz identycznych kart jest egzekwowany.** Trzy filary na home to kartka z perforacją, notatka na marginesie i ostemplowana metryka. Cztery filary na `/camp` to cztery różne pojemniki. Większość projektów robi tu trzy identyczne kafelki z ikoną.
4. **Podział warstw jest czysty.** `pages/` (widok) → `services/` (logika) → `state/` (trwałość) → `utils/`. `calculatorService.js` to funkcje czyste, testowalne bez DOM-u. `store.js` jest cienką, poprawną abstrakcją nad `localStorage`. Na tym da się budować.
5. **`cleanupDashboard` istnieje i jest poprawny.** Niszczenie instancji Chart.js przy zmianie trasy to problem, o którym większość juniorów dowiaduje się z wycieku pamięci na produkcji.
6. **Dokumentacja decyzji jest najlepszym aktywem projektu.** `PROGRES.md` zapisuje nie tylko co zrobiono, ale dlaczego odrzucono alternatywy, i zawiera korekty własnych wcześniejszych ustaleń. `MARKETING.md` zawiera sekcję z rekomendacją **wycofaną** po weryfikacji. To dojrzalsze niż dokumentacja w wielu zespołach.
7. **`CHART_COLORS` z komentarzem wyjaśniającym, dlaczego wartości są zduplikowane** (`dashboard.js:9-18`) — świadome, udokumentowane odstępstwo od reguły zamiast cichego złamania.
8. **Reakcja na przycisk (`btn:active`) to fizyczne wciśnięcie z lekką rotacją**, a nie „unoszenie się" karty. Zgodne z `DESIGN.md` §6 i rzadko spotykane.

---

## 7. REJESTR ZNALEZISK — TABELA ZBIORCZA

| # | Waga | Obszar | Znalezisko | Lokalizacja | Znane wcześniej? |
|---|---|---|---|---|---|
| 1 | 🔴 | Build | Build gubi wszystkie lokalne zdjęcia | `home.js` + `dist/` | **NOWE** |
| 2 | 🔴 | Biznes | Formularz `/camp` nic nie wysyła + brak RODO | `camp.js:517` | znane / RODO **NOWE** |
| 3 | 🔴 | SEO | Brak meta description i Open Graph | `index.html` | znane |
| 4 | 🔴 | Routing | Deep-linki gubią ścieżkę | `404.html` | znane |
| 5 | 🟠 | UX | `/knowledge` i `/contact` to gołe `<h1>` | `routes.js:25-34` | znane |
| 6 | 🟠 | a11y | Karty przepisów niedostępne z klawiatury | `recipes.js:34` | **NOWE** |
| 7 | 🟠 | UX/SEO | Szczegół przepisu bez URL-a | `recipes.js:125` | **NOWE** |
| 8 | 🟠 | a11y | 4 miejsca poniżej 4,5:1 + czerwień jako tekst | `home.css:44`, `camp.css:124,269`, `footer.css:110` | **NOWE** |
| 9 | 🟠 | Design | Stan aktywny tylko kolorem, rozjazd z `DESIGN.md` | `tabbar.css:159` | znane |
| 10 | 🟠 | Bug | Aktywny tab nie aktualizuje się po nawigacji | `main.js:61` / `router.js:56` | **NOWE** |
| 11 | 🟠 | Wyciek | `IntersectionObserver` bez sprzątania | `home.js:493`, `camp.js:521` | **NOWE** |
| 12 | 🟠 | Odporność | Treść startuje z `opacity: 0`, brak reduced-motion | `home.css:896` | częściowo |
| 13 | 🟡 | Design | 3 kickery nad nagłówkami na `/camp` | `camp.js:119,154,190` | **NOWE** (uznane za naprawione) |
| 14 | 🟡 | Design | `.faq__title` bez `font-family` | `home.css:665` | **NOWE** |
| 15 | 🟡 | Layout | Kicker Philosophy oderwany od nagłówka | `home.css:133,139` | **NOWE** |
| 16 | 🟡 | Design | Podwójna elewacja na 9 komponentach | wiele | znane |
| 17 | 🟡 | Uczciwość | Dane przykładowe podane jako fakt | `home.js:81,107` | znane, forma nierozstrzygnięta |
| 18 | 🟡 | Uczciwość | Stock podpisany jak własna dokumentacja | `home.js:164,175` | znane |
| 19 | 🟡 | UI | Natywne `alert()` × 2 | `dashboard.js:221,268` | **NOWE** |
| 20 | 🟡 | a11y | Modal bez roli, pułapki fokusu i Escape | `dashboard.js:101` | **NOWE** |
| 21 | 🟡 | a11y | Linki w zamkniętej szufladzie fokusowalne | `topbar.css:69` | **NOWE** |
| 22 | 🟡 | a11y | Akordeon FAQ bez `aria-expanded` | `home.js:355+` | znane |
| 23 | 🟡 | Layout | Siatka przepisów ucięta przy 320 px | `layout.css:49` | **NOWE** |
| 24 | 🟡 | Perf | Chart.js na każdej trasie, `lucide@latest` nieprzypięty, biblioteki poza `package.json` | `index.html` | **NOWE** |
| 25 | 🟡 | Perf | 3 rodziny fontów blokujące, 0/10 obrazów z `width`/`height` | `index.html`, `home.js` | **NOWE** |
| 26 | 🟡 | Treść | Literówki i brak jednostek przy makrach | patrz §5.4 | **NOWE** |
| 27 | 🟡 | Treść | Brak zastrzeżenia medycznego | całość | **NOWE** |
| 28 | 🟡 | Logika | Brak walidacji zakresów w kalkulatorze | `onboarding.js:22`, `calculatorService.js` | **NOWE** |
| 29 | 🟡 | Strategia | Brak przechwytu leada i analityki | całość | znane |
| 30 | 🟡 | Strategia | `/dashboard` bez jakiejkolwiek ścieżki do `/camp` | `dashboard.js` | **NOWE** |

**Bilans:** 30 znalezisk, w tym **19 nowych** względem tego, co jest zapisane w `PROGRES.md` i `ROADMAP.md`.

---

## 8. REKOMENDOWANA KOLEJNOŚĆ

Zasada zostaje ta sama, którą sam zapisałeś 2026-09-10: *najpierw to, co blokuje pieniądze, potem to, co jest widocznie zepsute, na końcu polish i wzrost.* Ten audyt dokłada jedną poprawkę do tej kolejności — **#1 wchodzi przed #2**, bo naprawa formularza na stronie, która pokazuje pięć pustych ramek zamiast zdjęć, sprzedaje słabiej niż powinna.

**Tydzień 1 — odblokowanie (nic innego)**
1. Zdjęcia w buildzie (#1) — bez tego każdy deploy jest wybrakowany.
2. Wysyłka formularza `/camp` (#2), **razem z** polityką prywatności i obowiązkiem informacyjnym.
3. Meta description + Open Graph + favicon (#3).
4. Deep-linki (#4).
5. **Weryfikacja wizualna w prawdziwej przeglądarce**, desktop + mobile, wszystkich pięciu tras. Dług z 2026-09-10, rośnie z każdą sesją pracy na ślepo.

**Tydzień 2 — to, co widzi użytkownik**
6. Decyzja i realizacja dla `/knowledge` i `/contact` (#5) — wariant A, B lub C z §3.
7. Dostępność klawiatury: karty przepisów (#6), modal (#20), szuflada (#21), akordeon (#22).
8. Kontrast: `--ink-faint` i czerwień jako tekst (#8) — zacząć od `.hero__tag`, bo to zdanie sprzedające.
9. Literówki i jednostki przy makrach (#26). Godzina pracy, natychmiastowy zwrot w postrzeganej staranności.
10. Bug aktywnego taba (#10) — widoczny przy każdym kliknięciu CTA.

**Tydzień 3+ — spójność i wzrost**
11. Przechwyt leada na home + analityka (#29).
12. Ścieżka z `/dashboard` do `/camp` (#30) — najtańszy dostępny wzrost konwersji, bo działa na ruchu, który już masz.
13. Zamknięcie długów designu: kickery (#13), FAQ font (#14), spacing kickera (#15), elewacje (#16), dane przykładowe (#17).
14. URL dla szczegółu przepisu (#7) — otwiera 30 stron wejścia dla SEO.
15. Wydajność: Chart.js warunkowo, przypięcie wersji, biblioteki do `package.json` (#24), wymiary obrazów (#25).
16. Zastrzeżenie medyczne i walidacja kalkulatora (#27, #28).
17. Własne zdjęcia zamiast stocka w sekcji „O mnie" (#18) — czeka na materiał, nie na kod.

---

## 9. DŁUG ARCHITEKTONICZNY — trzy rzeczy do przemyślenia przed dalszą rozbudową

Nie są to bugi. To decyzje, które dziś jeszcze nie bolą, a zaczną boleć przy kolejnych trzech trasach.

**A. Router nie ma pojęcia stanu widoku.** Każda trasa to `render()` zwracający string + `init()` podpinający słuchacze. Nie ma miejsca na „widok szczegółu przepisu", „krok 2 formularza" ani „otwarty artykuł". Dlatego szczegół przepisu musiał zostać zaimplementowany przez przełączanie klas poza routerem (#7). Przy `/knowledge` z pojedynczymi artykułami ten sam problem wróci w większej skali. *Pytanie: czy trasa powinna być mapą `ścieżka → widok`, czy raczej `wzorzec ścieżki → widok(parametry)`?*

**B. `init()` nie zwraca sposobu na posprzątanie po sobie.** `cleanup` jest osobnym, opcjonalnym eksportem (`routes.js:15`). Opcjonalne sprzątanie jest pomijane — stąd #11. *Pytanie: co się zmienia, jeśli `init()` zwraca funkcję sprzątającą, a router zawsze ją zapamiętuje i zawsze wywołuje przy wyjściu?*

**C. Widok jest budowany ze stringów wstawianych przez `innerHTML`.** Dziś bezpieczne, bo wszystkie dane są statyczne i pochodzą z Twojego repozytorium. Przestanie być bezpieczne w momencie, w którym `PLAN.md` §4 zostanie zrealizowany: mini-CMS zapisujący artykuły do `localStorage`, „Add Custom" dla produktów, wyniki z zewnętrznego API makroskładników. Każde z tych trzech wprowadza dane spoza Twojej kontroli do tej samej ścieżki `innerHTML`. *Pytanie: co konkretnie robi przeglądarka z ciągiem `<img src=x onerror=...>` wstawionym przez `innerHTML`, a czego nie zrobi z tym samym ciągiem ustawionym przez `textContent`?*

---

## 10. PYTANIA KONTROLNE (do samodzielnej odpowiedzi przed kolejną sesją)

1. Dlaczego Vite kopiuje do `dist/` obrazek zaimportowany w module, a ignoruje ten sam obrazek wskazany stringiem w `src`? Co bundler musi „wiedzieć" na etapie budowania, żeby zasób trafił do wyniku?
2. `--ink-faint` to `--ink` przy 55% krycia. Dlaczego kontrast wyliczony z takiego koloru zależy od tego, **co jest pod spodem**, i dlaczego ten sam token na `--ground` dałby zupełnie inny wynik niż na `--paper`?
3. `overflow-x: hidden` naprawiło realny problem z przewijaniem na mobile i jednocześnie zamaskowało #23. Jak sprawdzić, czy w layoucie jest przepełnienie w poziomie, skoro przeglądarka przestała je pokazywać?
4. Stan „która trasa jest aktywna" jest dziś trzymany w dwóch miejscach (`main.js` i URL). Ile jest możliwych stanów niespójnych i który z nich widzi użytkownik w #10?
5. `checkWeightReminder` (`dashboard.js:20`) czyta ostatni element `weightHistory` bez sprawdzenia, czy tablica nie jest pusta. W jakim scenariuszu ta tablica **może** być pusta, mimo że onboarding zawsze wpisuje do niej pierwszy pomiar?

---

## 11. ZAKRES I METODA

**Objęte audytem:** `index.html`, `404.html`, `package.json`, `dist/`, wszystkie pliki w `src/` (15 JS + 16 CSS + dane), `DESIGN.md`, `STRATEGY.md`, `PRODUCT.md`, `PLAN.md`, `ROADMAP.md`, `MARKETING.md`, `PROGRES.md`, `CAMP_VARIANTS.md`, historia Git.

**Nieobjęte:**
- Weryfikacja wizualna w przeglądarce (desktop i mobile) — brak sesji live.
- Pomiary wydajności na realnym urządzeniu (Lighthouse, Core Web Vitals) — oceny w §0 pochodzą z analizy kodu, nie z pomiaru.
- Audyt czytnikiem ekranu — znaleziska a11y wynikają z analizy struktury i wyliczeń kontrastu, nie z testu z NVDA/VoiceOver.
- Merytoryczna weryfikacja treści dietetycznych przez specjalistę.

**Wyliczenia kontrastu** wykonane wg formuły WCAG 2.1 (luminancja względna, sRGB) dla kolorów po zmieszaniu `color-mix` z tłem docelowym.

---

*Raport wygenerowany 14.09.2026. Kolejny audyt warto zrobić po domknięciu Tygodnia 1 z §8 — wtedy tabela z §0 będzie miała sens porównawczy.*
