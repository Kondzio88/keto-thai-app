# Podsumowanie Postępów – Keto Thai App

## Stan obecny (Single Source of Truth)

Aplikacja Keto Thai to Vanilla JS SPA. Jedyne i ostateczne źródło prawdy dla warstwy wizualnej to `DESIGN.md` („Keto Thai: Dziennik Treningowy", metodyka `impeccable`, mockup referencyjny podlinkowany w nagłówku dokumentu).
- **Koncepcja wizualna:** fizyczny dziennik treningowy trenera na macie Muay Thai (papier kraft `--paper`, mata `--ground`/`--ground2`, ołówek trenera `--red`, kreda `--amber`, atrament `--blue`). Zero `box-shadow`, zero glow, zero AI-slopu — detale fizyczne (taśma, dziurki, pieczątka, linia perforacji) zamiast dekoracji.
- **Typografia:** Big Shoulders Stencil (nagłówki), Martian Mono (dane/tagi/nawigacja), Public Sans (tekst ciągły).
- **Nawigacja:** mobile = górny `topbar` (logo + hamburger z **6 realnymi linkami**, wcześniej tylko 2) + dolny `tabbar` z 4 pozycjami core; desktop ≥768px = `topbar` chowa się, `tabbar` rozszerza się w lewy sidebar.
- **Migracja tokenów CSS:** kierunek „usuń stare zmienne, wstaw prosto 9 tokenów z `DESIGN.md`" — bez aliasów-mostków. **Zrobione i potwierdzone mechanicznie (zero martwych `--color-*`, zero `box-shadow`, zero duplikatów selektorów):** `button.css`, `tabbar.css`, `topbar.css`, oraz **cały `home.css`** (Hero, Philosophy, About, Steps, Camp-offer, FAQ). **W kolejce:** `camp.css`, `card.css`, `filters.css`, `form.css`, `modal.css`, `banner.css`, `layout.css`.
- **Footer:** istnieje od dziś, `src/styles/components/footer.css` — nowy plik, od razu na docelowych tokenach (nic do migracji).
- **Narzędzie:** skill `impeccable` (`.claude/skills/impeccable/`) używany do audytów i jako checklista (`craft-floor.md`) przy każdej edycji UI. Hook detektora **włączony**.

---

### Co zrobiliśmy w dzisiejszej sesji (Steps → Camp-offer → FAQ → Reveal → Footer):

1. **Steps — nowy koncept „wpisy dziennika":** usunięty w całości świecący, animowany timeline (`box-shadow`, `rgba(--color-accent-rgb)`, `@keyframes nodeLightUp/lineLightUp`, `animation-timeline: view()`) — klasyczny AI-slop wzorzec. Zastąpiony linią perforacji (`border-top: 1px dashed`) między wpisami. Naprawiony kicker stojący nad nagłówkiem (`DESIGN.md` §4, zakaz bez wyjątków) — `Krok N` przeniesiony pod `<h3>`. Zdjęcia telefonów: `.tape` zamiast `drop-shadow`-glow. Wszystkie martwe tokeny wymienione.
2. **Camp-offer — Kierunek A „Karta kwalifikacyjna":** świadomie odwrócona wcześniejsza decyzja „sekcja oddycha mrokiem" — karta dostała `--paper` (jedyna elewacja w tej sekcji). Odznaka-pigułka → reużyty komponent `.stamp`. Duży czerwony „12 Tygodni". **Naprawiony realny, znany od poprzedniej sesji bug:** gradient jako wypełnienie tekstu na `.camp-offer__title` (tymczasowy ignore w `.impeccable/config.json` — usunięty, bo naprawa jest trwała). Nowe copy (opis + 3 punkty z różnymi ikonami zamiast trzykrotnie tego samego `shield-check`).
3. **FAQ:** dodane 2 pytania („Czym jest dieta ketogeniczna?" oraz „Czy aplikacja jest płatna?" jako most do Campu). Usunięta karta z martwym tłem (`--color-surface`), zahardkodowanym `rgba(255,255,255,...)` i `box-shadow` na aktywności — zastąpiona tą samą linią perforacji co w Steps.
4. **Nawigacja mobile:** drawer hamburgera rozszerzony z 2 do 6 realnych linków (wcześniej dublował tylko Wiedzę/Kontakt). Po drodze: błąd we własnej poprawce (`grid-template-rows` zamiast `max-height` na sugestię hooka o wydajności) spowodował realną regresję w przeglądarce użytkownika — cofnięty do sprawdzonego `max-height` + sankcjonowany ignore w hooku (`layout-transition`, uzasadnienie w configu).
5. **Reveal (scroll-in) — spójność:** tytuły sekcji (`philosophy__title`, `steps__title`, `faq__title`) stały jako rodzeństwo *przed* elementem `.reveal`, więc nigdy się nie animowały — naprawione (każdy tytuł dostał własny `.reveal`). Philosophy: 3 karty dostały indywidualne `.reveal` ze staggered `transition-delay` (0 / 0.15 / 0.3s) zamiast jednego wspólnego revala na cały grid.
6. **Footer — zbudowany od zera (wcześniej nie istniał nigdzie w projekcie):** globalny element w `index.html`, poza `#app` (widoczny na każdej trasie). Styl `.paper` + linia perforacji, realny `mailto:KetoThai@o2.pl`, linki social Instagram/Facebook. Lucide nie ma ikon marek (sprawdzone bezpośrednio w paczce) — użyte prawdziwe SVG z Simple Icons.
7. **Audyt martwego kodu `home.js` + `home.css`:** znaleziony i naprawiony realny bug — `.philosophy__mockup--stamped` (CSS) nigdy nie było zaaplikowane w markupie przez rozjazd nazw klas (`.philosophy__card--stamp` zamiast tego). Potwierdzone mechanicznie: zero martwych tokenów, zero duplikatów selektorów w `home.css`.
8. **`PLAN.md`:** udokumentowany mechanizm guard Onboarding ↔ Dashboard w `router.js` (`getUser()`, przekierowania, `replaceState`).

---

### Plan Prac na Następną Sesję (Do Zrobienia):

1. **Zaktualizować `PRODUCT.md`** — sekcja „Brand Commitments" wciąż opisuje stary „Dark Fighter", koliduje z `DESIGN.md`.
2. **Rozstrzygnąć rozjazd rotacji taśmy w hero** (`-15°/+17°` w kodzie vs `-8°/+7°` w `DESIGN.md`) — zaktualizować dokument albo kod.
3. **Migracja reszty CSS ze starych zmiennych:** `camp.css`, `card.css`, `filters.css`, `form.css`, `modal.css`, `banner.css`, `layout.css`.
4. **Rozstrzygnąć rozjazd nawigacji** (wciąż otwarty od kilku sesji) — kropka `--red` Ø4px vs obecny kolor `--amber` w stanie aktywnym tabbara — i ewentualnie zaktualizować `DESIGN.md`.
5. **Finalny wybór logo** — Karta Ważenia jest w topbarze; `.tabbar__logo` na desktopie wciąż ma tekst „KT" zamiast finalnego znaku.
6. **`ROADMAP.md` Faza 0 — pozostałe punkty:** formularz leada (Web3Forms), naprawa deep-linków (`404.html`), meta/SEO/Open Graph, treść `/knowledge` i `/contact`. (Stopka social media — zrobiona dziś, zdjęta z tej listy.)
7. **Dashboard — pętla posiłków:** `dashboard.js` nie importuje `mealService.js` — dopiąć `getTodayMeal()`, listę zjedzonych posiłków, `deleteMeal()`, Date Controller.
8. **Podmienić placeholdery w footerze** — `href="#"` na Instagram/Facebook w `index.html` (linie w bloku `.site-footer__socials`) czeka na realne linki od użytkownika.
9. **3 zahardkodowane `rgba(...)` w Hero/Philosophy** (`home.css`, linie ok. 76, 101, 277) zamiast tokenów — znalezione przy dzisiejszym audycie martwego kodu, nie tknięte (spoza dzisiejszego zakresu).
