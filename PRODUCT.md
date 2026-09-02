# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Vanilla JavaScript (ES6+ Modules), Vite, czysty CSS3 (zmienne CSS, Grid, Flexbox), Edamam API, Chart.js. Złożony routing oparty na History API (SPA).

## Users
Osoby aktywne fizycznie (sporty walki, sporty wytrzymałościowe, trening siłowy) posiadające mentalność wojownika. Osoby szukające dyscypliny, optymalizacji wydolności, przełamania stagnacji sylwetkowej oraz klinicznego podejścia do diety.

## Product Purpose
Darmowy, wysoce funkcjonalny Lead Magnet (SaaS / tracker makro). Rozwiązuje podstawowy problem użytkownika ("co jeść"), zyskując jego zaufanie, aby w odpowiednim momencie nienachalnie zaoferować zakup usługi premium – 12-tygodniowego "Fighter's Camp" (mentoring 1-on-1).

## Positioning
Unikalne połączenie 15 lat twardego doświadczenia w sportach walki (mentalność z tajskich campów) z ekspercką wiedzą z zakresu dietetyki klinicznej (hormony, ketoza, oporność na insulinę). 

## Operating Context
Aplikacja ma pełnić rolę codziennego centrum dowodzenia dla użytkownika (tracking diety na telefonie/desktopie), bazy wiedzy (budowanie FOMO za pomocą zamkniętych artykułów) oraz wirtualnej, luksusowej wizytówki do pozyskiwania klientów na lokalnym rynku (Śląsk).

## Capabilities and Constraints
Czysty CSR (Client-Side Rendering) renderowany w `index.html`. Stan przetrzymywany w `localStorage` (później Supabase). Maksymalna wydajność na telefonach (60 FPS, debounce, intersection observer). Docelowo aplikacja ma zostać w pełni przekształcona w PWA.

## Brand Commitments
Restrykcyjny system wizualny "Dark Fighter" zdefiniowany w `DESIGN.md`. 
Tło: Głęboki grafit (`#121212`, `#1E1E1E`). 
Akcenty: Tajskie Złoto (`#D4AF37`), Żywa Zieleń (`#2ECC71`), Agresywna Czerwień (`#ff4b4b`). 
Fonty: `Oswald` (nagłówki) oraz `Inter` (UI). 
Surowość: Ostre formy, `border-radius` max 4px, twarde neobrutalistyczne cienie, brak glassmorphismu i miękkich poświat. Ruch powiązany tylko z fizycznym działaniem (kliknięcie = wciśnięcie elementu).

## Evidence on Hand
Brak na ten moment gotowych zdjęć, jednak w `PLAN.md` uwzględniono siatki metamorfoz podopiecznych, zdjęcia z tajskiego campu (Hero Section) oraz artykuły powołujące się na badania naukowe. Przyszłe prace nie mogą zakładać użycia miękkich zdjęć ze stocka niepasujących do estetyki walki.

## Product Principles
1. Dyscyplina UI: Odzwierciedlenie rygoru sportowego w ascezie i precyzji interfejsu.
2. Edukacja jako sprzedaż: Użytkownik kupuje mentoring premium po tym, jak aplikacja sama udowodni mu swoją wartość (PLG - Product-Led Growth).
3. Brak kompromisów technicznych: Płynność działania i natywne rozwiązania (Vanilla JS) nad przerośniętymi frameworkami.

## Accessibility & Inclusion
Dostępność z klawiatury jest nienaruszalna – każdy element interaktywny musi posiadać ostre podświetlenie w `focus-visible`. Zachowany musi być ekstremalny kontrast dla głównego tekstu na ciemnym tle.
