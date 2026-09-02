# KETO THAI - AI AGENT DESIGN & ARCHITECTURE GUIDELINES (V3.0: STEALTH MINIMALISM)

Poniższy dokument to ostateczne "Jedyne Źródło Prawdy" (Single Source of Truth) dla każdego programisty pracującego nad front-endem aplikacji Keto Thai. Odrzucamy wszystkie poprzednie kompromisy i kierujemy się w 100% stylem **Taktycznego Minimalizmu (Stealth UI)**. 

**Nadrzędna dyrektywa dla AI:** Interfejs jest "niewidzialny". Odrzucamy generyczne karty, widoczne obramowania i wszelkiego rodzaju "AI-Slop". Granice elementów wyznacza pustka (negative space), a uwaga użytkownika jest skupiona na danych dzięki ekstremalnemu kontrastowi na czerni.

---

## 1. TOŻSAMOŚĆ WIZUALNA (THE STEALTH FIGHTER)

*   **Archetyp:** Wojownik premium. Bezkompromisowy, cichy profesjonalista.
*   **Cel Biznesowy:** Aplikacja działa w modelu *Product-Led Growth*, będąc lejkiem do ekskluzywnego mentoringu (sekcja `/camp`). Wygląd interfejsu musi natychmiastowo budować postrzeganą wartość (Perceived Value) na poziomie luksusowym.
*   **Wyraz Wizualny:** Brak zbędnych ozdobników, sterylność i mrok. Zamiast krzykliwych krawędzi – filmowe podświetlenia i perfekcyjna asymetria.

---

## 2. ZŁOTE REFERENCJE (GOLDEN FIXTURES)

Poniższe obrazy stanowią absolutny fundament wizualny. Wszelkie decyzje kodowe muszą dążyć do odtworzenia tego klimatu.

### Dashboard (Operate)
![Dashboard Stealth](/C:/Users/jacos/.gemini/antigravity-cli/brain/83be4e92-79a7-4835-9f73-21414aa164ac/dashboard_stealth_1788336025293.jpg)

### Strona Główna (Persuade)
![Home Stealth](/C:/Users/jacos/.gemini/antigravity-cli/brain/83be4e92-79a7-4835-9f73-21414aa164ac/home_stealth_1788336058828.jpg)

### Przepisy (Meals & Recipes)
![Recipes Stealth](/C:/Users/jacos/.gemini/antigravity-cli/brain/83be4e92-79a7-4835-9f73-21414aa164ac/recipes_stealth_1788336424202.jpg)

### Baza Wiedzy (Knowledge Base / Deep Reading)
![Knowledge Stealth](/C:/Users/jacos/.gemini/antigravity-cli/brain/83be4e92-79a7-4835-9f73-21414aa164ac/knowledge_stealth_1788336435827.jpg)

### Kalkulator (Onboarding)
![Onboarding Stealth](/C:/Users/jacos/.gemini/antigravity-cli/brain/83be4e92-79a7-4835-9f73-21414aa164ac/onboarding_stealth_1788336446678.jpg)

---

## 3. ARCHITEKTURA CSS I ZMIENNE GLOBALNE (`global.css`)

### Kolorystyka i Światło
*   **Tło absolutne (Background):** `--color-background` musi oscylować wokół smolistej czerni (`#050505` lub `#000000`).
*   **Brak tła kafelków:** W przeciwieństwie do tradycyjnego Bento Grid, nie wypełniamy kart innym kolorem tła. Karty (Bento) korzystają z tła układu, oddzielone wyłącznie marginesem.
*   **Filmowa Głębia (Cinematic Light):** Zamiast obramowań używamy ledwo zauważalnych, bardzo delikatnych gradientów radialnych wyłaniających się z czerni (np. `radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.03), transparent 60%)`).
*   **Dane i Akcenty:** Kolor `--color-accent` (Tajskie Złoto `#D4AF37`) oraz kolory makroskładników (np. Zieleń `#34D399`) służą **wyłącznie** do wizualizacji danych (wykresy, liczby) oraz głównych przycisków CTA. Zakaz stosowania ich w ramkach i dekoracjach.

### Fluid Spacing (Przestrzeń definiująca układ)
Układ opiera się na matematycznym skalowaniu `clamp()` w `:root`. W układzie Stealth odstępy odgrywają najważniejszą rolę, ponieważ zastępują linie.
*   `--spacing-md: clamp(1rem, 3vw, 1.5rem)`
*   `--spacing-xl: clamp(3rem, 6vw, 6rem)`

---

## 4. ANTY-WZORCE DO ELIMINACJI (ANTI-AI-SLOP)

Aby interfejs pozostał Stealth, każda linijka CSS łamiąca te zasady to bug krytyczny:
1. **Zakaz używania Box-Shadow na elementach:** Żadnych "miękkich", płynnych cieni, które powodują, że panele wyglądają jak unoszący się w powietrzu plastik.
2. **Zakaz widocznych obramowań paneli:** `border: 1px solid rgba(...)` na kartach niszczy efekt niewidzialności. 
3. **Pigułkowe kształty (Pill Shapes):** Zero promieniowania `border-radius` powyżej `4px` (lub maksymalnie `8px` dla bardzo określonych, dużych elementów kontenerowych przy zdjęciach).
4. **Styl Nagłówków Sekcji (Tactical Terminal):** Nagłówki w sekcjach (np. "Twój Plan Działania", "Historia i Filozofia") muszą być czysto białe i pozbawione gradientów. Wyróżniamy je dodając przedrostek z dwóch ukośników w kolorze złotym (`// `) w pseudoelemencie `::before`. Tworzy to surowy, inżynieryjny klimat. 
5. **Animacje layoutu (Layout Thrashing):** Zakaz zmiany wartości `width`, `height`, `margin` czy `padding` w transakcjach hover (płynność). Używamy wyłącznie `transform` (np. `translateY`) oraz `opacity`.

---

## 5. UI KOMPONENTY I INTERAKCJE

*   **Typografia:** Kontrast wielkości. Nagłówki ogromne i eleganckie. Wartości liczbowe ostre, techniczne i asymetrycznie duże w stosunku do malutkich etykiet (labels).
*   **Formularze i Inputy:** Odrzucamy zamknięte prostokąty (boxy). Input to tylko linia bazowa (bottom-border) lub mikroskopijne podświetlenie tła przy aktywacji, dające wrażenie wprowadzania komendy w terminalu.
*   **Przyciski:** Mają twardy, zdecydowany charakter. Brak latania na hoverze (zero Ambient Motion). Wciśnięcie musi dawać fizyczne, matematyczne odczucie. 
*   **Nawigacja (Mobile-First):** Odrzucamy klasyczny górny header na smartfonach. Głównym wzorcem nawigacyjnym jest dolny pasek (Bottom Tab Bar) umieszczony w tzw. "strefie kciuka". Zapewnia to 100% natywne odczucie (PWA). Na ekranach Desktopowych (powyżej określonego breakpointu) dolny pasek transformuje się w boczny Sidebar po lewej stronie.
*   **Zasada Dostępności (Focus-Visible):** Dla klawiatur, aktywne elementy używają `outline: 2px solid var(--color-accent); outline-offset: 4px;`, aby chronić widok myszki i zachować bezpieczeństwo dla klawiatury.
