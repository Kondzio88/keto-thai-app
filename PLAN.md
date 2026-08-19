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
- **Wzorce UX (User Experience):**
    - Skeleton Loaders (ekrany ładowania udające docelowy interfejs).
    - Toast Notifications (powiadomienia wysuwające się z rogu ekranu).
    - Natywny element `<details>` dla rozwijanych list.
    - Ghost Buttons dla akcji drugorzędnych.

## 4. Funkcjonalności i Ścieżki (Features & Routing)

Oto kompletna mapa Twojej aplikacji.

### Ścieżka `/` (Strona Główna / Landing Page)

- **Cel:** Konwersja użytkownika i budowa autorytetu.
- **Struktura:**
    1. **Hero Section:** Pełnoekranowe, przyciemnione zdjęcie z campu Muay Thai, mocny nagłówek H1 i jeden główny przycisk CTA: "Oblicz swoje Keto-Makro".
    2. **3 Filary (Grid):** Trzy karty z ikonami SVG (Muay Thai, Ketosis, Mindset).
    3. **Metamorfozy (Social Proof):** Siatka zdjęć "Przed i Po" podopiecznych.
    4. **Bio:** Asymetryczna sekcja z Twoim zdjęciem i krótką historią.

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
- `/knowledge`: Blog działający na bazie pliku JSON. Wykorzystuje metodę `map()` do dynamicznego generowania artykułów z badaniami klinicznymi (sortowanych po dacie).
- `/contact`: Profesjonalny formularz do zapytań o indywidualną współpracę trenerską.

    STRUKTURA FOLDERI :

- keto-thai-app/
  ├── index.html
  ├── package.json
  ├── public/
  └── src/
  ├── api/
  ├── assets/
  ├── components/
  ├── data/
  ├── pages/
  ├── state/
  ├── styles/
  ├── utils/
  ├── main.js
  ── router.js
