# Podsumowanie Postępów – Keto Thai App

## Stan obecny (Single Source of Truth)

Aplikacja Keto Thai to Vanilla JS SPA. Zgodnie z najnowszą rewizją systemu, **jedyne i ostateczne źródło prawdy dla warstwy wizualnej stanowi plik `DESIGN.md`** („Keto Thai: Dziennik Treningowy” oparty na metodyce `impeccable`). Zastępuje on wcześniejsze szkice i wytyczne (`KETO_THAI_DESIGN_GUIDELINES.md`).
- **Koncepcja wizualna:** Fizyczny dziennik treningowy trenera na macie Muay Thai (papier kraft `--paper`, podłoże maty `--ground`, ołówek trenera `--red`, kreda `--amber`, atrament urzędowy `--blue`). Zero `box-shadow`, zero AI-slopu, surowe detale fizyczne (taśma, dziurki segregatora, pieczątki).
- **Typografia:** Big Shoulders Stencil (nagłówki), Martian Mono (pomiary, makro, tagi), Public Sans (tekst ciągły).
- **Tryby ekranów:** Home i Camp w trybie *Persuade*, Dashboard, Recipes i Onboarding w trybie *Operate*, Knowledge w trybie *Read*.
- **Migracja tokenów CSS:** świadomie **odrzucono** podejście "alias tymczasowy" (mapowanie starych nazw zmiennych na nowe). Kierunek: usuwać stare, nieistniejące nazwy (`--color-accent`, `--color-text-primary` itd.) i zastępować je bezpośrednio dziewięcioma tokenami z `DESIGN.md` sekcja 3, plik po pliku, zaczynając od tych najbardziej widocznych (`button.css` zrobiony, reszta w kolejce).

---

### Co zrobiliśmy w dzisiejszej sesji:

1. **Raport strategiczny biznesowo-marketingowy (`ROADMAP.md`, nowy plik w katalogu głównym):**
   - Audyt aplikacji wobec `STRATEGY.md`: mocne/słabe strony, synergia z social mediami (Instagram/Facebook), budowa social proof, pozyskiwanie klientów online (diety) i lokalnie (treningi w Tychach).
   - Zidentyfikowano krytyczne luki lejka sprzedażowego: formularz `/camp` nie wysyła danych donikąd, zero social proof, brak linków do social mediów w całej aplikacji, zepsute deep-linki na GitHub Pages, brak SEO/Open Graph.
   - Rozpisana mapa drogowa naprawy w fazach (0–3), z priorytetem na odblokowanie lejka przed rozwojem nowych funkcji.

2. **Diagnoza niespójności tokenów CSS (`global.css` vs `home.css`/`camp.css`/`button.css`):**
   - Znaleziono 18 zmiennych CSS używanych w kodzie, ale nigdzie niezdefiniowanych (`--color-accent`, `--color-text-primary`, `--cinematic-glow` i inne) — przeglądarka po cichu odrzuca takie deklaracje (`var()` do niczego), bez błędu w konsoli.
   - Podjęto decyzję architektoniczną: **bez aliasów-mostków**, migracja bezpośrednia, plik po pliku.

3. **`global.css` — dodanie trzech reużywalnych klas "świata" (`DESIGN.md` sekcja 5–6):**
   - `.paper`, `.stamp`, `.hole` — wartości (obramowanie, obrót, wymiary) zweryfikowane bezpośrednio względem zatwierdzonego mockupu referencyjnego (`DESIGN.md:6`), nie wymyślone od zera.

4. **Naprawa struktury sekcji Hero (`src/pages/home.js`, `src/styles/pages/home.css`):**
   - Zdiagnozowano i naprawiono błąd architektoniczny: `.hero__container` niósł jednocześnie `page-container` (ograniczenie szerokości treści) i `.paper` (skóra wizualna) — kolizja dwóch odpowiedzialności dawała niezamierzoną ciemną "obramówkę" wokół jasnej karty.
   - Rozwiązanie: `.paper` przeniesiony na zewnętrzny `<section class="hero paper">`, `page-container` wrócił do jednej roli (szerokość treści). Hero renderuje się teraz jako pełnowymiarowa "okładka dziennika" zgodnie z referencją.

5. **Przebudowa `src/styles/components/button.css` zgodnie z dokładną specyfikacją z mockupu:**
   - Font zmieniony z Big Shoulders Stencil na Martian Mono, `font-size: 13px`, `letter-spacing: .04em` (po drodze złapany i poprawiony błąd jednostki `rem` zamiast `em`).
   - `.btn--primary`: płaskie wypełnienie `--red` (usunięty gradient ze "lśnieniem" i ad-hoc hex), tekst `--bone`.
   - `.btn--secondary`: proste obramowanie `1px solid --bone-dim` (usunięty gradientowy `border-image`), asymetryczny padding (`14px/24px` vs `13px/24px`) kompensujący grubość obramowania.
   - Dodany wariant `.hero .btn--secondary` pod przycisk stojący na papierze (`--ink`/`opacity: .7`) — zweryfikowane, że nie koliduje z przyciskami na `/camp` (inna nazwa sekcji).
   - Dodany wspólny efekt kliknięcia `:active { transform: scale(0.96) rotate(-1.5deg) }` ("przybicie pieczątki", nawiązanie do `.stamp`), świadomie bez animacji na `:hover` (zakaz "latania" z `DESIGN.md` sekcja 6).
   - `border-radius` ujednolicony do `2px` (górna granica z `DESIGN.md`).

6. **Zdiagnozowane, ale jeszcze niewdrożone poprawki kolorów w Hero** — `.hero__title`, `.hero__tag`, `.hero__desc`, `.hero__caption` nadal mają twarde jasne kolory (`--bone`/`--amber`/`--bone-dim`) sprzed zmiany tła na papier. Ustalony mechanizm naprawy (`--ink` + `opacity` per element, wartości `.55`/`.75`/`.5` z referencji) — czeka na wdrożenie.

---

### Plan Prac na Następną Sesję (Do Zrobienia):

1. **Dokończenie kolorów w Hero (`src/styles/pages/home.css`):**
   - `.hero__tag` → `color: var(--ink); opacity: .55`
   - `.hero__desc` → `color: var(--ink); opacity: .75`
   - `.hero__caption` → `color: var(--ink); opacity: .5`
   - `.hero__title` → posprzątać martwe `color: var(--bone)` (realnie nieaktywne, bo `.hero__title-sub` nadpisuje własnym `--ink`, ale wprowadza w błąd przy czytaniu kodu)

2. **Decyzje otwarte w Hero:**
   - Czy `.hero__photo-card` (ciemne tło `--ground2`) zostaje jako świadomy wygląd "zdjęcia oprawionego w ciemny passe-partout", czy wymaga przemyślenia teraz, gdy hero jest papierem
   - Czy tytuł H1 ma zostać przy 2 liniach ("TWOJE CIAŁO" / "TWOJA WALKA"), czy wraca 3-liniowa wersja z "TWOJE PALIWO"
   - Dodanie plakietki `.stamp` "Sezon 01" w rogu hero (element z referencji, jeszcze nieobecny w markupie)

3. **Hover przycisków — decyzja niepodjęta:** trzy warianty na stole (wzmocnienie obramowania ghost / brak hover w ogóle / delikatny `filter: brightness()` na primary) — czeka na wybór kierunku.

4. **Decyzja architektoniczna — `color` + `opacity` vs token `color-mix()` w `global.css`:** otwarta rozmowa o tym, czy centralizować powtarzające się pary kolor+przezroczystość w jeden token, czy zostać przy dwóch osobnych właściwościach jak w referencji. Do rozstrzygnięcia, gdy pojawi się więcej takich przypadków w kodzie.

5. **Migracja pozostałych plików CSS ze starych nazw zmiennych** (`camp.css`, `card.css`, `form.css`, `modal.css`, `banner.css`, `filters.css`, `tabbar.css`, `header.css`) — `button.css` zrobiony jako pierwszy, reszta wciąż odwołuje się do tych samych 18 nieistniejących zmiennych.

6. **"3 Filary" na Home (`src/pages/home.js`):** trzy identyczne karty ikona+nagłówek+tekst zamiast trzech różnych kontenerów wymaganych przez `DESIGN.md` (postrzępiona karta papieru / pieczątka / notatka na marginesie) — jeszcze nietknięte.

7. **Sekcja About — zdjęcia:** galeria wciąż korzysta ze zdjęć stockowych z Unsplash (w tym jeden zduplikowany URL) zamiast własnych zdjęć autora.

8. **Zaległości z `ROADMAP.md` (warstwa biznesowa, poza samym designem):** formularz `/camp` nie wysyła danych, brak stopki z linkami social media, zepsute deep-linki na GitHub Pages, brak Open Graph/SEO, `/knowledge` i `/contact` to puste zaślepki mimo obecności w nawigacji.

9. Wciąż nieukończone od poprzedniej sesji: `getTodayMeal()` w Dashboardzie, lista zjedzonych posiłków, `deleteMeal()`, Date Controller.
