# KETO THAI - AI AGENT DESIGN & ARCHITECTURE GUIDELINES (V2.0)

Poniższy dokument to ostateczne, rozszerzone "Jedyne Źródło Prawdy" (Single Source of Truth) dla każdego Agenta AI oraz programisty pracującego nad front-endem aplikacji Keto Thai. Dokument integruje strategię biznesową (`STRATEGY.md`), plan architektury (`PLAN.md`) oraz twarde reguły przeciwdziałania generycznym interfejsom (`skills/antislop-*`).

**Nadrzędna dyrektywa dla AI:** Każda wygenerowana linia kodu CSS/HTML musi przejść przez filtr tego dokumentu. Zakaz generowania tzw. "AI-Slop" (słodkich, generycznych, pływających UI).

---

## 1. TOŻSAMOŚĆ BIZNESOWA I ARCHETYP (The Fighter)

*   **Archetyp:** Wojownik (Dyscyplina, Surowość, Kliniczna Precyzja).
*   **Cel Biznesowy:** Aplikacja działa w modelu *Product-Led Growth*. Rozwiązuje darmowy problem ("co jeść") i służy jako rozbudowany Lead Magnet do konwersji użytkowników na High-Ticket mentoring (sekcja `/camp`).
*   **Target:** Osoby trenujące sztuki walki, sporty wytrzymałościowe oraz osoby w stagnacji sylwetkowej.
*   **Wyraz Wizualny:** Interfejs nie jest "przyjaznym asystentem". To narzędzie treningowe, kokpit inżyniera. Brak zaokrąglonych, uśmiechniętych kształtów, brak pastelowych kolorów. Form follow function.

---

## 2. ARCHITEKTURA CSS I ZMIENNE GLOBALNE (`global.css`)

Baza stylów aplikacji opiera się na matematycznym skalowaniu. Agencie AI: Nigdy nie nadpisuj i nie używaj twardych miar wielkości (pikseli) dla dużych struktur.

*   **Fluid Spacing (Architektura Oddechu):**
    Cała aplikacja korzysta z wdrożonego systemu `clamp()` w `:root`. Odstępy dynamicznie dopasowują się do urządzenia:
    *   `--spacing-xs: clamp(0.25rem, 1vw, 0.5rem)`
    *   `--spacing-sm: clamp(0.5rem, 2vw, 0.75rem)`
    *   `--spacing-md: clamp(1rem, 3vw, 1.5rem)`
    *   `--spacing-lg: clamp(1.5rem, 4vw, 3rem)`
    *   `--spacing-xl: clamp(3rem, 6vw, 6rem)`
    *Zasada:* Zamiast pisać `padding: 100px;` (co niszczy widok mobilny), używaj `padding: var(--spacing-xl);`.
*   **Responsywność i Wysokość Ekranu:**
    Całkowity zakaz używania `min-height: 100vh`. Powoduje to powstawanie ukrytych stref na smartfonach przez paski przeglądarki. **Zawsze używamy `100dvh` (Dynamic Viewport Height).**
*   **Fixed Elements Offset:**
    Jeśli na stronie znajduje się Fixed Header (jak nawigacja Keto Thai), kontener główny musi omijać ten nagłówek za pomocą matematyki: `padding-top: calc(80px + var(--spacing-xl));`.

---

## 3. ESTETYKA, ŚWIATŁO I KOLOR (Antislop-UI)

*   **Kolorystyka Bazowa:**
    *   Tło: `var(--color-background)` (`#121212`)
    *   Panele/Karty: `var(--color-surface)` (`#1E1E1E`)
    *   Główny Akcent: `var(--color-accent)` (`#D4AF37` - Tajskie Złoto)
    *   Akcent Sukcesu: `var(--color-success)` (`#2ECC71`)
*   **ZAKAZ używania gradientów na tekstach:** Fioletowo-niebieskie, płynne gradienty na nagłówkach to główny wyznacznik "AI-Slopu". Nagłówki muszą być jednolitych, surowych barwach.
*   **Premium Dark Backgrounds:** Chcąc wyróżnić sekcje premium (np. stronę `/camp`), stosujemy ciemne, subtelne `radial-gradient` wyłącznie jako tła, aby uzyskać filmową głębię bez psucia czytelności tekstu.
*   **Cienie i Głębia (Neobrutalizm):** 
    Zakaz stosowania miękkich, wielkich, rozmytych cieni typu `box-shadow: 0 10px 20px rgba(0,0,0,0.5)`. Przyciski i aktywne panele używają twardych, klinicznych cieni offsetowych (np. `4px 4px 0px rgba(255,255,255,0.15)`), imitując fizyczne mechanizmy.

---

## 4. UI KOMPONENTY I INTERAKCJE

*   **Typografia:** Kontrast wielkości (Asymetria Skali). Nagłówki (`Oswald`) powinny zdecydowanie dominować nad interfejsem (`Inter`).
*   **Przyciski (`.btn`):**
    *   Główne CTA (`.btn--primary`): Muszą imitować uderzenie. Na hoverze przycisk nie może latać (`translateY(-2px)` to zakazany anty-wzorzec). Zamiast tego wciska się w ekran, niszcząc rzucany twardy cień.
    *   Przyciski Drugorzędne (`.btn--secondary`): Projektowane jako "Ghost Buttons" z twardą obwódką, wykorzystujące agresywne efekty zalewania kolorem ze środka ("Fill from center" przez `.btn--secondary::before` z użyciem `transform: scaleX(0)` do `scaleX(1)`).
*   **Animacje (Zero Ambient Motion):** 
    Absolutny zakaz dodawania nieskończonych CSS-owych pętli (typu `@keyframes float`). Zużywa to GPU, kradnie uwagę i obniża jakość produktu. Ruch odbywa się wyłącznie jako reakcja na interakcję użytkownika (Hover, Click, Scroll Reveal).

---

## 5. DOSTĘPNOŚĆ (A11Y) I UX (Antislop-Human)

*   **Kontekstowe Akcje (Zakaz stosowania izolowanych FAB):**
    Akcje użytkownika nie mogą być zawieszone w próżni. Floating Action Buttons (FAB) w rogu ekranu, oparte o hover, są zakazane. Akcje lądują dokładnie tam, gdzie na ekranie znajdują się powiązane dane (np. przycisk "Dodaj Pomiar" osadzony strukturalnie pod wykresem `Historia Wagi`).
*   **Ochrona Użytkowników Klawiatury (Focus-Visible):**
    Złamanie zasady używania wyłącznie `outline: none;` na elementach `:focus`. Każdy interaktywny formularz (`.form__input`) i przycisk (`.btn`) musi implementować regułę:
    ```css
    :focus-visible { outline: 3px solid var(--color-accent); outline-offset: 4px; }
    ```
    Dzięki temu projekt chroni minimalizm dla użytkowników myszek/smartfonów, zapewniając pełną celność nawigacji dla klawiatur.
*   **Elementy natywne:** Tam gdzie to możliwe (np. Q&A, FAQ, sekcje posiłków), używać wydajnych, wbudowanych elementów HTML (`<details>` i `<summary>`) zamiast pisania skomplikowanych bibliotek rozwijających.

---

## 6. JAVASCRIPT: LOGIKA I DOM

*   **Identyfikatory (ID):** Pod żadnym pozorem Agent AI nie może zmieniać atrybutów `id="..."` istniejących komponentów w plikach HTML (szablonach), nawet przy zmianie klas lub położenia. Pliki JS (np. `dashboard.js`) bazują na `document.getElementById` i zmiana spowoduje fatalne błędy.
*   **Reaktywność bez Frameworka (SPA):**
    Keto Thai korzysta z Vanilla JS opisanego w `PLAN.md`. Aplikacja nie przeładowuje stron. Modyfikacja danych (np. dodanie nowej wagi z formularza) musi natychmiastowo aktualizować obiekt danych (`userProfile`) w pamięci lokalnej oraz ręcznie wywołać metody odświeżające UI w locie (np. `updateMacrosUI()`, aktualizujące wartości DOM i wykresy Chart.js).
