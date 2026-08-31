# KETO THAI - OSTATECZNY DESIGN SYSTEM (UI/UX)

    Wersja: Zgodna z bieżącą architekturą JS (Bento Grid) oraz estetyką "Controlled Sharpness" (adaptacja referencji wizualnych UI do filozofii Fighter).

    ## 1. GŁÓWNA FILOZOFIA WIZUALNA (CONTROLLED SHARPNESS)
    Keto Thai to aplikacja zbudowana w motywie "Dark Fighter". Przypomina surowy, inżynieryjny kokpit sportowy, zrywając z trendem "obłych, plastikowych" aplikacji z Dribbble.
    - **Mikro-zaokrąglenia:** Globalna zasada. Sztywny `border-radius: 4px` dla wszystkich kafelków w `bento-grid`, formularzy i przycisków. Całkowity zakaz używania okrągłych krawędzi typu "pill shape" (99px).
    - **Cienie i Głębia (Neobrutalizm):** Żadnego miękkiego "glow" ani rozmytego światła (glassmorphismu). Stosujemy twarde, asymetryczne cienie odcinające się od tła, np. `box-shadow: 4px 4px 0px rgba(255,255,255, 0.

05);` dające odczucie fizycznych, stalowych bloków. - **Zero Ambient Motion:** Brak pętli animacji bez przyczyny. Ruch odbywa się wyłącznie na kliknięcie (wciśnięcie przycisku w dół - niszczące cień).

    ## 2. GLOBALNY SYSTEM KOLORYSTYCZNY (Zgodny z global.css)
    Opieramy interfejs na wysokim kontraście ciemnego tła z agresywnymi akcentami dla makroskładników:
    - **Tło Główne (Background):** `--color-background` (`#0a0a0a`) - Prawdziwa głęboka czerń.
    - **Tło Kafelków (Cards/Bento):** `--color-surface` (`#181818`) - Delikatnie jaśniejszy szary wyodrębniający logikę.
    - **Makroskładniki i Akcenty:**
      - Białko (Protein): `--color-protein` (`#ff4b4b` - Agresywna czerwień)
      - Tłuszcze (Fats): `--color-fats` (`#f59e0b` - Bursztyn/Złoto)
      - Węglowodany (Carbs): `--color-carbs` (`#34d399` - Zieleń)
      - Akcent/Primary: Zmienna `--color-accent` (Pomarańcz) i `--color-primary` (Zieleń) w zależności od wagi i znaczenia (primary na potwierdzenia, accent na alerty).

    ## 3. KOMPONENTY I ARCHITEKTURA INFORMACJI (DASHBOARD)
    Odzwierciedlenie kodu `dashboard.js` w ujęciu docelowego interfejsu (UX adaptowany ze zrzutów UI).

    ### A. Header & Weight Reminder Banner
    - **Header:** Oparty o typografię `Oswald`, bez dodatkowego tła. Prosty, surowy tekst "Dashboard" (H1) i opisowy "Twój dzienny cel Keto".
    - **Reminder Banner:** Gdy minie 7 dni, ukazuje się pasek na pełną szerokość gridu. Tło paska powinno mieć stłumiony, ostrzegawczy kolor (`rgba(255, 115, 0, 0.15)` - z `--color-accent`), z ostrą ramką. Przycisk

"Zapisz" (Ghost Button) przyklejony do prawej, z twardym konturem.

    ### B. Bento Grid (Siatka Kafelków Kokpitu)
    Każdy `.bento-card` korzysta z tła `--color-surface` i ostrego `border: 1px solid #2d2d2d;`. Ikony z biblioteki Lucide umieszczane są intuicyjnie na wzór zrzutów.

    1. **Card: Dzienny limit kalorii (`bento-card--accent`):**
       - Typografia liczby potężna (asymetria skali), dominująca nad resztą kafelków. Subtelne podświetlenie lewej lub górnej, 2-pikselowej krawędzi kolorem `--color-accent`.
    2. **Cards: Makro (Białko / Fats / Węglowodany):**
       - 3 oddzielne kafelki, ułożone w jednym rzędzie (lub w gridzie obok siebie).
       - Ikona i wartość liczbowa powiązana wprost z dedykowanym kolorem CSS (Czerwony / Bursztyn / Zielony). Tło ikon minimalnie "zalane" rgba (10% opacity) swojego koloru dla podniesienia czytelności.
    3. **Card: Rozkład Makroskładników (Doughnut Chart):**
       - Szeroki kafelek. Wykres renderowany przez Chart.js pozbawiony jest obłych przerw (cutouts) używanych w "miękkich" designach. Ostre, geometryczne zakończenia segmentów (`#ff4b4b`, `#f59e0b`, `#34d399`). Ikona

"flame" na stałe wyśrodkowana w okręgu. 4. **Card: Historia Wagi (Line Chart):** - Wykres punktowo-liniowy, rysujący surową łamaną (Zero wygładzania `tension: 0.3` do usunięcia, lub do mocnego zredukowania na `0`), na kolor `--color-primary` (Zieleń). Wypełnienie (Fill) twardo zanikające w  
 czerń. - Przycisk "Dodaj pomiar" osadzony precyzyjnie w lewym/prawym górnym rogu kafelka.

    ### C. Modale i Ostrzeżenia (Weight Input Modal)
    - Wywołany modal (`#modal-overlay`) to twardy prostokąt osadzony centralnie na maksymalnie zamazanym (`backdrop-filter: blur(8px)`) tłach.
    - Input numeryczny przypomina konsolę. Ostry border. Kliknięcie dodaje `focus-visible` (3px obwódki).

     Układ kafelkowy inspirowany referencyjnymi zrzutami ekranu (maksymalne upakowanie danych):

    2. **Sekcja Intake (Karta 1 - Full Width):**
       - Lewa strona: `Concentric Macro Rings`.
       - Prawa strona: Twardo ułożona kolumna z legendą i cyframi (P: 86/120g (Czerwień), F: 42/72g (Bursztyn), C: 142/220g (Zieleń)).
       - Pasek "Segmented Bar" dla spalania aktywności.
    4. **Meal Plan / Daily Log (Blok Akordeonu):**
       - Lista posiłków z użyciem natywnego `<details>`. Kafelki Śniadanie/Obiad/Kolacja.
       - Kontekstowy, kwadratowy przycisk `+` przypięty do linii wzroku z kaloriami posiłku.
    5. **Floating / Bottom Nav:** (Zamiast hamburger menu) Płaski pasek u dołu ze stricte liniowymi, niepogrubionymi ikonami (Home, Activity, Nutrition, Coach).

    ## 4. ONBOARDING WIZARD (Kalkulator)
    Na podstawie `onboarding.js`:
    - Elementy `.form__input` (Inputy i Selecty) to bloki o ciemnym tle (`#121212`) z mocną ramką (`#2d2d2d`). Zamiast chować input, akcentujemy jego surowość i techniczną powierzchowność.
    - Główny przycisk CTA "Oblicz kaloryczność" z użyciem `--color-primary`, działający na mechanice wciśnięcia (brak miękkich hoverów podnoszących element, za to aktywacja wciśnięcia przez `transform: translateY(2px)`

oraz anulowanie cienia przy `:active`).

    ## 5. REGUŁY DOSTĘPNOŚCI WIZUALNEJ (A11Y)
    - Zachowujemy ekstremalny kontrast dla tekstów `--color-text-primary` (`#f9fafb`).
    - Dostępność przez klawiaturę jest świętością. Wszelkie elementy interaktywne muszą w css wykorzystywać:
      `*:focus-visible { outline: 3px solid var(--color-primary); outline-offset: 4px; }`
