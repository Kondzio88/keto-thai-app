## 1. Architektura Systemu (System Architecture)

Aplikacja "Keto Thai" to nowoczesna aplikacja typu **SPA (Single Page Application)** z wbudowanym modułem SaaS (Software as a Service) do śledzenia diety.

- **Renderowanie:** Cały interfejs jest wstrzykiwany dynamicznie do jednego pliku `index.html` przez czysty JavaScript (Client-Side Rendering).
- **Routing:** Własny silnik oparty na `History API` (`window.history.pushState` i zdarzeniu `popstate`), wykorzystujący zjawisko Event Delegation do przechwytywania nawigacji.
- **Zarządzanie Stanem (State Management):** Ścisłe oddzielenie warstwy danych od interfejsu. Historia wagi, zjedzone posiłki i ustawienia użytkownika będą przetrzymywane w globalnym obiekcie stanu, zapisywanym do `localStorage` (a docelowo w chmurze Supabase). Zmiana danych automatycznie wywołuje funkcję odświeżającą powiązane elementy na ekranie.
- **Wydajność (Performance):** Zastosowanie techniki _Debounce_ przy wyszukiwaniu oraz _Intersection Observer_ do animacji, aby aplikacja działała w stałych 60 FPS.

## 2. Stos Technologiczny (Tech Stack)

Używamy wyłącznie natywnych, nowoczesnych technologii webowych, unikając narzutu wielkich frameworków.

- **Język:** Vanilla JavaScript (ES6+ Modules) – nowoczesne funkcje strzałkowe, asynchroniczność (`async/await`), metody tablicowe (`map`, `filter`, `reduce`).
- **Środowisko:** Vite – bundler zapewniający błyskawiczny serwer deweloperski (HMR) i optymalizację plików produkcyjnych.
- **Stylizacja:** Czysty CSS3 z architekturą opartą na zmiennych (`variables.css`), CSS Grid i Flexbox. Podejście Mobile-First.
- **Dane Zewnętrzne (APIs):** Edamam API lub Open Food Facts API (do pobierania bazy surowych produktów i ich makroskładników).
- **Wizualizacja Danych:** Chart.js (natywne rysowanie wykresów na elemencie `<canvas>`).
- **Zasoby:** Lucide Icons (wektorowe SVG renderowane w locie) oraz zdjęcia CC0 z platformy Unsplash.

## 3. Design System ("Dark Fighter")

Wizualna tożsamość łączy surowość sportów walki z klinicznym podejściem do zdrowia.

- **Kolorystyka:**
    - Tło (Background): Głęboki grafit `#121212` oraz panele `#1E1E1E`.
    - Akcent Główny (Primary): Tajskie Złoto `#D4AF37` (przyciski CTA, nagłówki, wykresy białka).
    - Akcent Sukcesu (Success/Keto): Żywa Zieleń `#2ECC71` (wykresy tłuszczu, potwierdzenia, cele).
- **Typografia:** `Oswald` (dynamiczne, rzucające się w oczy nagłówki) oraz `Inter` (maksymalnie czytelny tekst ciągły i interfejs trackera).
    - System _Fluid Typography_ oparty na tokenach CSS (`clamp()`): `--font-size-hero`, `--font-size-h2`, `--font-size-h3`, `--font-size-lead`, `--font-size-kicker`.
- **Wzorce UX (User Experience):**
    - Skeleton Loaders (ekrany ładowania udające docelowy interfejs).
    - Toast Notifications (powiadomienia wysuwające się z rogu ekranu).
    - Natywny element `<details>` dla rozwijanych list.
    - Ghost Buttons dla akcji drugorzędnych.
    - Płynna nawigacja wewnątrzstronowa (`scroll-behavior: smooth`, `scroll-padding-top: 80px`).

## 4. Funkcjonalności i Ścieżki (Features & Routing)

Oto kompletna mapa Twojej aplikacji.

### Ścieżka `/` (Strona Główna / Landing Page)

- **Cel:** Konwersja użytkownika i budowa autorytetu w sporcie i diecie keto.
- **Struktura:**
    1. **Hero Section:** Pełnoekranowe, przyciemnione zdjęcie z campu Muay Thai, mocny nagłówek H1 i jeden główny przycisk CTA: "Oblicz swoje Keto-Makro".
    2. **3 Filary (Grid):** Trzy karty z ikonami SVG (Muay Thai, Ketosis, Mindset).
    3. **Metamorfozy (Social Proof):** Siatka zdjęć "Przed i Po" podopiecznych.
    4. **Bio:** Asymetryczna sekcja z Twoim zdjęciem i krótką historią.

### Ścieżka `/camp` (Fighter's Camp – Mentoring 1-on-1 / Sales Page)

- **Cel:** Główna ścieżka monetyzacji premium (High-Ticket) – kompleksowy, 12-tygodniowy program transformacji sylwetki i wydolności dla osób aktywnych.
- **Struktura i moduły:**
    1. **Hero Section:** Dynamiczny nagłówek z obietnicą formy życia, podwójne CTA ("Aplikuj do programu" oraz anchor do szczegółów) i tło oparte na `radial-gradient`.
    2. **3 Fazy Transformacji (`.camp-phases`):** Przejrzysty podział 12 tygodni (Adaptacja -> Rekompozycja -> Szczyt Formy) ze wskaźnikami postępu, znakami wodnymi w tle i kolorystycznymi poświatami.
    3. **Bento Grid Wsparcia (`.camp-features`):** 4 kluczowe filary opieki trenerskiej w asymetrycznym układzie (Indywidualny Protokół, Wideo-Analiza, Komunikator 24/7, Protokół Reverse Dieting / gwarancja braku jojo).
    4. **Kwalifikacja:** Zestawienie kontrastowych kart ("Dla kogo jest ten program" vs "Dla kogo NIE jest").
    5. **Formularz Aplikacyjny (`#apply`):** Kwalifikacja zgłoszenia (sport, parametry, cel) z obsługą wysyłki i widokiem potwierdzenia (Success State).

### Ścieżka `/onboarding` (Kalkulator BMR)

- **Cel:** Precyzyjne wyliczenie zapotrzebowania i zaplanowanie celu.
- **Mechanika:** Multi-step Wizard (formularz krokowy). Użytkownik płynnie przechodzi przez pytania (Cel -> Metryka -> Aktywność Sportowa).
- **Logika:** Wykorzystanie wzoru Mifflin-St Jeor oraz specyficznych mnożników pod sporty walki. Wynik dzielony na sztywny Keto-Split (ok. 70% tłuszczy, 20-25% białka, 5% węglowodanów).

### Ścieżka `/tracker` (Panel Użytkownika / SaaS)

- **Cel:** Codzienne centrum dowodzenia i zarządzanie makroskładnikami.
- **Elementy interfejsu:**
    1. **Date Controller:** Nawigacja między dniami z aktualizacją stanu.
    2. **Daily Intake (Donut Chart):** Dynamiczny wykres kołowy Chart.js pokazujący pozostałe kalorie oraz rozkład B/T/W.
    3. **Weight Trend (Line Chart):** Wykres liniowy śledzący progresję wagi na przestrzeni tygodni.
    4. **Meal Accordion:** Lista zjedzonych posiłków z podziałem na pory dnia. Wykorzystanie `<details>`, gdzie kliknięcie rozwija szczegółową listę składników i opcję usuwania.
    5. **Hydration Module:** Klikalne ikony wody/elektrolitów.

### Moduł Wyszukiwarki (Search Modal - dla trackera)

- **Cel:** Dodawanie produktów do dziennika z dbałością o wydajność przeglądarki.
- **Mechanika:**
    - Pasek wyszukiwania z opóźnieniem (Debounce), odpytujący zewnętrzne API.
    - Wyniki wyświetlane tekstowo (bez zdjęć), z ikonami kategorii i "pigułkami" (badges) makroskładników.
    - Wybór gramatury, który w czasie rzeczywistym przelicza makro na bazie wybranej wagi produktu.
    - Opcja "Add Custom" pozwalająca wpisać własny produkt ręcznie.

### Ścieżki Dodatkowe (Wartość Dodana)

- `/recipes`: Galeria dopracowanych dań keto. Posiada przycisk "Add to my day", który wysyła pełne makro potrawy prosto do obiektu dzisiejszego dnia w trackerze.
- `/knowledge`: Baza Wiedzy & Dynamiczny Blog / CMS:
    1. **Widok Siatki (Articles Grid):**
        - Karty artykułów z miniaturą (cover image), pigułką kategorii (Ketoza, Wydolność, Elektrolity, Regeneracja), czasem czytania, tytułem, abstraktem i CTA "Czytaj artykuł".
        - Pasek filtrów po kategoriach oraz pole wyszukiwarki z opóźnieniem (Debounce).
    2. **Widok Pojedynczego Artykułu (Single Article View):**
        - Dynamiczny routing (`/knowledge?article=slug` lub routing z parametrem).
        - Pełna treść z formatowaniem, cytatami badań naukowych, sekcją "Kluczowe Wnioski" oraz dolnym banerem CTA kierującym do `/camp`.
        - Elementy FOMO (artykuły z kłódką dostępne wyłącznie dla podopiecznych Fighter's Camp).
    3. **Dynamiczny System Zarządzania Artykułami (Hybryda Data-Driven + Panel Twórcy):**
        - **Warstwa Danych:** Baza wpisów w `src/data/articles.js` jako punkt startowy.
        - **Formularz Dodawania Postów (Mini-CMS):** Interaktywny modal / widok umożliwiający dodanie nowego artykułu (tytuł, kategoria, treść, zdjęcie, tagi), który zapisuje wpis do `localStorage` (docelowo API/baza danych) i w locie łączy się z bazą statyczną, natychmiast odświeżając widok siatki.
- `/contact`: Profesjonalny formularz do zapytań o indywidualną współpracę trenerską.

## 5. Struktura Folderów

```text
keto-thai-app/
├── index.html
├── package.json
├── public/
│   └── manifest.webmanifest
└── src/
    ├── api/
    ├── assets/
    ├── components/
    ├── data/
    │   └── articles.js
    ├── pages/
    │   ├── camp.js
    │   ├── dashboard.js
    │   ├── home.js
    │   ├── knowledge.js
    │   ├── onboarding.js
    │   └── recipes.js
    ├── services/
    ├── state/
    ├── styles/
    │   ├── base/
    │   ├── components/
    │   └── pages/
    ├── utils/
    ├── main.js
    ├── router.js
    └── routes.js
```

## 6. Dalszy Rozwój Aplikacji (Post-MVP / Roadmap)

Sekcja gromadząca zaawansowane funkcjonalności planowane do wdrożenia po ukończeniu i przetestowaniu wersji podstawowej (MVP).

### 1. Moduł PWA (Progressive Web App – Instalowalność Mobilna)

- **Cel:** Przekształcenie SPA w aplikację instalowalną bezpośrednio na ekranie głównym smartfona (iOS / Android) w trybie pełnoekranowym (`display: standalone`).
- **Web App Manifest (`public/manifest.webmanifest`):** Definicja ikon (192x192, 512x512, maskable), kolorów motywu (`theme_color: #121212`) i nazwy.
- **Service Worker (`service-worker.js`):** Buforowanie kluczowych zasobów w Cache API dla wsparcia trybu **Offline-First**.
- **Install Prompt:** Dedykowany baner zachęcający do instalacji po wykryciu zdarzenia `beforeinstallprompt`

### 2. Interaktywna Książka Przepisów (`/recipes`)

- **Widok Szczegółowy / Modal Przepisu:**
    - Składniki z gramaturami i przelicznikiem porcji (1x, 2x, 0.5x).
    - Instrukcja przygotowania krok po kroku (numerowane etapy).
    - Przycisk _"Dodaj do mojego dnia"_: Wybór posiłku (Śniadanie / Obiad / Kolacja) i automatyczny transfer makro do dziennika.

### 3. Zaawansowany Dynamiczny Bilans w Dashboardzie (`/tracker`)

- **Wykres Pozostałego Limitu (Macro & Calorie Remaining):**
    - Wizualizacja w czasie rzeczywistym: _Zapotrzebowanie z Onboardingu - Zjedzone posiłki_.
    - Dokładny licznik pozostałych kalorii oraz gramatury makroskładników (Białko, Tłuszcz, Węglowodany netto).
- **Keto Threshold Alert:** Wizualne ostrzeżenie przed przekroczeniem dziennego limitu węglowodanów (ochrona przed wypadnięciem z ketozy).
- **Reaktywna Integracja:** Każdy posiłek dodany z bazy lub z `/recipes` natychmiastowo przelicza bilans w Dashboardzie.

### 4. Narzędzia Inteligentnej Konwersji & Analityki (Mentoring Upsell)

- **Keto Readiness Score (Poranny Test Gotowości):**
    - 3 szybkie pytania diagnostyczne (Jakość snu, Poziom energii, Regeneracja/Nawodnienie).
    - Kontekstowy system rekomendacji: w przypadku powtarzających się spadków formy lub stagnacji system wyświetla inteligentną sugestię konsultacji i audytu parametrów z mentorem na ścieżce `/camp`.
- **Eksport Raportu Postępów (Fighter's Metabolic Report):**
    - Możliwość wygenerowania i pobrania estetycznego raportu podsumowującego (trendy wagi, średni bilans makro, nawodnienie) do formatu PDF / podglądu do druku, ułatwiającego analizę postępów z trenerem.
