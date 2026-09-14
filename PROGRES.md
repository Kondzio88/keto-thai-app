# Podsumowanie Postępów – Keto Thai App

## Stan obecny (Single Source of Truth)

Aplikacja Keto Thai to Vanilla JS SPA. Jedyne i ostateczne źródło prawdy dla warstwy wizualnej to `DESIGN.md` („Keto Thai: Dziennik Treningowy", metodyka `impeccable`, mockup referencyjny podlinkowany w nagłówku dokumentu). **Jedyne i ostateczne źródło prawdy dla warstwy sprzedażowej i językowej (konwersja, struktura lejka, copywriting) to od dziś `MARKETING.md`** — analogiczna rola do `DESIGN.md`, tylko dla treści i struktury sprzedażowej zamiast wizualnej.
- **Koncepcja wizualna:** fizyczny dziennik treningowy trenera na macie Muay Thai (papier kraft `--paper`, mata `--ground`/`--ground2`, ołówek trenera `--red`, kreda `--amber`, atrament `--blue`). Zero `box-shadow`, zero glow, zero AI-slopu — detale fizyczne (taśma, dziurki, pieczątka, linia perforacji) zamiast dekoracji.
- **Typografia:** Big Shoulders Stencil (nagłówki), Martian Mono (dane/tagi/nawigacja), Public Sans (tekst ciągły).
- **Nawigacja:** mobile = górny `topbar` (logo + hamburger z **6 realnymi linkami**, wcześniej tylko 2) + dolny `tabbar` z 4 pozycjami core; desktop ≥768px = `topbar` chowa się, `tabbar` rozszerza się w lewy sidebar.
- **Migracja tokenów CSS:** kierunek „usuń stare zmienne, wstaw prosto 9 tokenów z `DESIGN.md`" — bez aliasów-mostków. **Zrobione i potwierdzone mechanicznie (zero martwych `--color-*`, zero `box-shadow`, zero duplikatów selektorów):** `button.css`, `tabbar.css`, `topbar.css`, oraz **cały `home.css`** (Hero, Philosophy, About, Steps, Camp-offer, FAQ). **W kolejce:** `camp.css`, `card.css`, `filters.css`, `form.css`, `modal.css`, `banner.css`, `layout.css`.
- **Footer:** istnieje od dziś, `src/styles/components/footer.css` — nowy plik, od razu na docelowych tokenach (nic do migracji).
- **Narzędzie:** skill `impeccable` (`.claude/skills/impeccable/`) używany do audytów i jako checklista (`craft-floor.md`) przy każdej edycji UI. Hook detektora **włączony**.
- **Audyt całościowy:** `RAPORT.md` (2026-09-14) — pierwszy pełny audyt architektury/layoutu/designu/UI-UX/a11y/wydajności/SEO/copywritingu całej aplikacji naraz (nie pojedynczej strony). 30 znalezisk z tabelą metryk stanu do porównań w kolejnych sesjach. Odtąd punkt odniesienia do priorytetyzacji pracy, obok `MARKETING.md`/`DESIGN.md`.
- **Przechwytywanie leadów:** formularz `/camp` wysyła realnie przez **Web3Forms** (klucz w `camp.js`, `initCamp()`) — pierwsza zewnętrzna integracja sieciowa w projekcie (wcześniej appka rozmawiała wyłącznie z `localStorage`).

---

### Co zrobiliśmy w sesji Steps → Camp-offer → FAQ → Reveal → Footer:

1. **Steps — nowy koncept „wpisy dziennika":** usunięty w całości świecący, animowany timeline (`box-shadow`, `rgba(--color-accent-rgb)`, `@keyframes nodeLightUp/lineLightUp`, `animation-timeline: view()`) — klasyczny AI-slop wzorzec. Zastąpiony linią perforacji (`border-top: 1px dashed`) między wpisami. Naprawiony kicker stojący nad nagłówkiem (`DESIGN.md` §4, zakaz bez wyjątków) — `Krok N` przeniesiony pod `<h3>`. Zdjęcia telefonów: `.tape` zamiast `drop-shadow`-glow. Wszystkie martwe tokeny wymienione.
2. **Camp-offer — Kierunek A „Karta kwalifikacyjna":** świadomie odwrócona wcześniejsza decyzja „sekcja oddycha mrokiem" — karta dostała `--paper` (jedyna elewacja w tej sekcji). Odznaka-pigułka → reużyty komponent `.stamp`. Duży czerwony „12 Tygodni". **Naprawiony realny, znany od poprzedniej sesji bug:** gradient jako wypełnienie tekstu na `.camp-offer__title` (tymczasowy ignore w `.impeccable/config.json` — usunięty, bo naprawa jest trwała). Nowe copy (opis + 3 punkty z różnymi ikonami zamiast trzykrotnie tego samego `shield-check`).
3. **FAQ:** dodane 2 pytania („Czym jest dieta ketogeniczna?" oraz „Czy aplikacja jest płatna?" jako most do Campu). Usunięta karta z martwym tłem (`--color-surface`), zahardkodowanym `rgba(255,255,255,...)` i `box-shadow` na aktywności — zastąpiona tą samą linią perforacji co w Steps.
4. **Nawigacja mobile:** drawer hamburgera rozszerzony z 2 do 6 realnych linków (wcześniej dublował tylko Wiedzę/Kontakt). Po drodze: błąd we własnej poprawce (`grid-template-rows` zamiast `max-height` na sugestię hooka o wydajności) spowodował realną regresję w przeglądarce użytkownika — cofnięty do sprawdzonego `max-height` + sankcjonowany ignore w hooku (`layout-transition`, uzasadnienie w configu).
5. **Reveal (scroll-in) — spójność:** tytuły sekcji (`philosophy__title`, `steps__title`, `faq__title`) stały jako rodzeństwo *przed* elementem `.reveal`, więc nigdy się nie animowały — naprawione (każdy tytuł dostał własny `.reveal`). Philosophy: 3 karty dostały indywidualne `.reveal` ze staggered `transition-delay` (0 / 0.15 / 0.3s) zamiast jednego wspólnego revala na cały grid.
6. **Footer — zbudowany od zera (wcześniej nie istniał nigdzie w projekcie):** globalny element w `index.html`, poza `#app` (widoczny na każdej trasie). Styl `.paper` + linia perforacji, realny `mailto:KetoThai@o2.pl`, linki social Instagram/Facebook. Lucide nie ma ikon marek (sprawdzone bezpośrednio w paczce) — użyte prawdziwe SVG z Simple Icons.
7. **Audyt martwego kodu `home.js` + `home.css`:** znaleziony i naprawiony realny bug — `.philosophy__mockup--stamped` (CSS) nigdy nie było zaaplikowane w markupie przez rozjazd nazw klas (`.philosophy__card--stamp` zamiast tego). Potwierdzone mechanicznie: zero martwych tokenów, zero duplikatów selektorów w `home.css`.
8. **`PLAN.md`:** udokumentowany mechanizm guard Onboarding ↔ Dashboard w `router.js` (`getUser()`, przekierowania, `replaceState`).

---

### Sesja 2026-09-09 — Audyt marketingowy strony `/` + dług CSS w `home.css`

1. **Audyt marketingowy `home.js`** przeprowadzony w dwóch przejściach (struktura i lejek, potem copywriting i pozycjonowanie) i zapisany w całości w nowym pliku **`MARKETING.md`** — od teraz jedyne i ostateczne źródło prawdy dla warstwy sprzedażowej i językowej, analogicznie do roli `DESIGN.md` dla warstwy wizualnej. Kluczowe ustalenia: brak finałowego CTA na końcu strony (wymóg z `STRATEGY.md` §4, niewdrożony), zdjęcia ze stocka podpisane jako własne w sekcji About, obiecana w mockupie funkcja „streak" nieistniejąca nigdzie w kodzie, sprzeczność między copy skupionym niemal wyłącznie na spalaniu tłuszczu a onboardingiem, który realnie obsługuje 3 cele (redukcja/utrzymanie/przybranie wagi), sfabrykowany dowód społeczny `BATCH #04` w `camp.js` przy zerowej liczbie podopiecznych, brak jakiegokolwiek sygnału geograficznego (Tychy/Śląsk) w całej aplikacji. Pełna lista 22 twardych ustaleń, priorytetów wdrożenia i otwartych decyzji — w `MARKETING.md`.
2. **Decyzje architektoniczne dla strony `/`:** wybrany Wariant B („Lejek") — przebudowa kolejności sekcji na Hero → Steps → About → Philosophy → Camp-offer → Tychy → FAQ → finałowe CTA (sekwencja co → kto → dlaczego → ile). Sekcja Philosophy zostaje przy 3 kartach — cofnięta wcześniejsza, błędnie uargumentowana rekomendacja redukcji do 2 (rzeczywistym problemem była zepsuta karta 2 obiecująca nieistniejącego streaka, nie liczba kart). Sekcja o treningach w Tychach: pełnoprawna sekcja na home, świadomie przyjęte ryzyko rozmycia pozycjonowania keto vs trener personalny.
3. **⚠️ Do zrobienia w kolejnej sesji — jeszcze jedna, szczegółowa runda audytu copywritingu**, tym razem zdanie po zdaniu w `home.js` i `camp.js` (dziś ustalone kierunki i reguły ogólne — np. zmiana osi obietnicy z „spalanie tłuszczu" na „stabilna energia", reguła Muay Thai jako dowód a nie wymóg — ale bez pełnego przepisania każdego zdania). `MARKETING.md` pozostaje dokumentem determinującym wszystkie decyzje marketingowe i copywriterskie — każda przyszła zmiana treści na `/` i `/camp` ma być z nim zgodna.
4. **Naprawa długu technicznego w `home.css`:** dwa zahardkodowane `rgba()` będące ręcznymi kopiami tokenów `--bone` i `--paper` (linie 76, 101 — `PROGRES.md` pkt 9 z poprzedniej sesji) zastąpione przez `color-mix(in srgb, var(--token) X%, transparent)`, co usuwa ryzyko cichego rozjazdu przy przyszłej zmianie wartości tokenu. Rozstrzygnięty też rozjazd rotacji taśmy (`PROGRES.md` pkt 2 z poprzedniej sesji, `DESIGN.md` §5 vs kod): kod zaktualizowany z `-15°/+17°` na `-8°/+7°`. Trzeci `rgba()` (`.streak-box`, linia 288, biały przy 6%) świadomie odłożony — żyje w mockupie funkcji „streak", która i tak zniknie lub zostanie przebudowana przy wdrażaniu poprawki karty 2 w Philosophy z `MARKETING.md`.

---

### Sesja 2026-09-09 (cz. 2) — Wdrożenie Hero/About + decyzje Tychy i Camp-offer

Kontynuacja tego samego dnia, po audycie z cz. 1 — realne przepisanie copy w `home.js` zamiast tylko ustalenia reguł, plus dwie ważne korekty faktów od użytkownika.

1. **Hero przepisany:** tag pod H1 przestał być żargonem („system metaboliczny") i mówi wprost co/dla kogo („kalkulator makro i przepisy keto — dla aktywnych i dla tych, którzy dopiero zaczynają"); opis zmienia oś obietnicy ze „spalania tłuszczu" na „stabilną energię" (obsługuje redukcję/utrzymanie/masę naraz, zgodnie z tym, że onboarding realnie oferuje 3 cele); dodany mikrotekst „bez rejestracji". CTA secondary zmienione z „Fighter's Camp" (drugi płatny produkt w 3. sekundzie) na „Zobacz, jak to działa" — scroll do `#steps` przez czysty anchor (bez `data-link`, bez JS), Camp zostaje osiągalny niżej w Camp-offer.
2. **⚠️ Ważna korekta faktu (od użytkownika):** „15 lat" dotyczy stażu treningowego Muay Thai w ogóle — w samej Tajlandii autor spędził łącznie ok. 3 miesiące w 4 wyjazdach do Lamai Camp. Poprzednie sformułowanie „15 lat doświadczeń z tajskich ringów" (i identyczny błąd w `STRATEGY.md` §1 — patrz punkt 6 niżej) było nieprawdziwe. Poprawione w hero.
3. **Karta 2 „Umysł Wojownika" naprawiona, nie usunięta:** zdanie „nie poddaje się na macie" zakładało, że czytelnik trenował Muay Thai — zmienione tak, by Muay Thai był podmiotem tylko w zdaniach o autorze (reguła z `MARKETING.md`). Mockup „OBECNA SERIA" (funkcja streak nieistniejąca w kodzie) oznaczony jako `SERIA [PRZYKŁAD]` zgodnie z `DESIGN.md` §7.
4. **About:** podpis „Konrad / Keto Thai" → pełne imię i nazwisko „Konrad Jacoszek" + realna rola „Instruktor Muay Thai (MEN) · dietetyka kliniczna (w trakcie)". **Ważne rozróżnienie ustalone z użytkownikiem:** instruktor Muay Thai (MEN) jest ukończony, dietetyka kliniczna to kurs **w trakcie** — copy musi to odróżniać, nie wolno pisać jako ukończone ani używać nazwy „doradca żywieniowy" zamiast tego, dopóki kurs faktycznie się nie skończy.
5. **Nowy komponent `years-proof` w About:** pasek 5 kafelków-placeholderów (`.snap`, gradient wg `DESIGN.md` §"Zdjęcia") z podpisem „FOTO 0X — [ROK] (do uzupełnienia)", przewijany poziomo przez natywny `scroll-snap` (zero JS/biblioteki na sam scroll) + osobny listener `wheel→scrollLeft` w `initHome()`, żeby zwykła mysz (bez trackpada) też mogła przewijać poziomo. Zastępuje pierwotny pomysł „metamorfoza w kg" — użytkownik nie ma takiej historii, tylko wieloletnią, utrzymaną formę bez efektu jo-jo; to nowy, uczciwy typ dowodu osobistego (korekta wcześniejszego założenia w `MARKETING.md` Część I §5A). Czeka na realne zdjęcia i daty/lokalizacje od użytkownika.
6. **🚩 Camp-offer — kotwica wartości ODRZUCONA po weryfikacji:** `MARKETING.md` rekomendował przeniesienie „Limit: 5 miejsc" z `camp.js` na home jako „najtańszą wygraną" — **potwierdzone przez użytkownika, że to fikcja wpisana na sztywno**, nie realne ograniczenie. Nie wdrożone nigdzie. `camp.js` (BATCH #04, VIP ACCESS, Limit: 5 miejsc) wymaga osobnego przeglądu uczciwości treści przy najbliższej sesji poświęconej tej stronie. **Lekcja ogólna:** istniejące copy na stronie (nawet pochwalone we wcześniejszym audycie jako "dobry przykład transparentności") nie jest automatycznie faktem — zawsze weryfikować z użytkownikiem przed powieleniem.
7. **Decyzja: sekcja Tychy jako osobna trasa, nie sekcja na home** — odwraca wcześniejszą decyzję z cz. 1 tej samej sesji. Powód: lokalne SEO napędza Google Business Profile + dedykowana strona, nie treść na home; mieszanie intencji („kalkulator makro" vs „trener personalny Tychy") rozmywa temat strony głównej dla obu fraz. Ustalone: nowa trasa `/treningi-tychy` (pełna treść, docelowo dane NAP/`LocalBusiness`), a na home tylko jedno zdanie z linkiem (nie sekcja) — bez ryzyka dla pozycjonowania keto. Treść samej podstrony zablokowana brakiem materiału (ta sama kategoria co zdjęcia w About). Zaktualizowano `PLAN.md` (mapa tras) i `STRATEGY.md` (§3/§4) o tę decyzję.

---

### Sesja 2026-09-09 (cz. 3) — Finałowe CTA, fix przewijania na mobile, audyt i plan `/camp`

1. **🐛 Naprawiony bug: strona „wyjeżdżała" w bok przy przewijaniu palcem na mobile.** Diagnoza: `overflow-x: hidden` było ustawione **wyłącznie na `body`**, a fizykę gestu przeciągania przeglądarki mobilne liczą względem `<html>` (`documentElement`); dodatkowo klasa `.reveal` (`transform: translateY(40px)`) tworzy własny kontekst pozycjonowania, przez co przycinanie na poziomie `body` nie domykało się. Poprawka w `global.css`: `overflow-x: hidden` **oraz** `overscroll-behavior-x: none` na `html` i na `body`. **Rozróżnienie warte zapamiętania:** `overflow` przycina treść *wizualnie*, `overscroll-behavior` steruje *fizyką gestu* (rubber-band i propagacja scrolla do rodzica) — to dwie różne rzeczy i tu potrzebne były obie.

2. **✅ Finałowe CTA wdrożone** — domyka priorytet 🔴1 z `MARKETING.md` i niezrealizowany od dawna wymóg `STRATEGY.md` §4. Nowa sekcja `final-cta` na końcu `home.js` (między FAQ a `</main>`): pełnoszerokościowa elewacja `.paper` (ten sam wzorzec co hero), para dziurek `.hole` — **pierwsze użycie tej klasy w projekcie**, była zdefiniowana w `global.css` i nigdzie niezastosowana — pieczątka `.stamp`, H2 „Zacznij dziś, albo idź na całość", kicker **pod** nagłówkiem (`DESIGN.md` §4), oraz dwie ścieżki: „Rozpocznij za darmo" → `/dashboard` i „Zobacz pełny program mentoringowy" → `/camp`, obie z `data-link`. `.reveal` na wewnętrznym kontenerze, nie na `<section>` (wzorzec z `about__layout` / `years-proof`). **Konieczny okazał się override `.final-cta .btn--secondary` na `--ink`** — domyślny `.btn--secondary` jest zaprojektowany pod ciemne tło (`--bone`/`--bone-dim`) i na papierze byłby prawie niewidoczny; identyczny problem był już wcześniej rozwiązany dla `.hero .btn--secondary`. Desktopowy układ przycisków w rzędzie dopisany do istniejącego media query.

3. **Przechwytywanie leada (Web3Forms) — omówione koncepcyjnie, świadomie odłożone.** Ustalony zakres na dziś: same dwie ścieżki CTA tak, formularz e-mail nie. `MARKETING.md` traktuje to jako dwa osobne priorytety (🔴1 i 🔴4), mimo że poprzedni wpis w `PROGRES.md` zlepiał je w jeden punkt.

4. **Korekta faktów w dokumentach źródłowych** (domyka punkt 6 z poprzedniej listy): `PRODUCT.md` §Positioning i `STRATEGY.md` §1 — „15 lat twardego doświadczenia sportowego (mentalność z tajskich campów)" → „15 lat treningu Muay Thai, dopracowanego w tajskich campach". Ten sam wzorzec, który wcześniej zastosowaliśmy w hero.

5. **Decyzja: rezygnujemy z notacji `[PRZYKŁAD]` w interfejsie.** Karta 3 „Pełna Kontrola" **nie** dostaje dopisku (wbrew wcześniejszemu planowi), a istniejące `SERIA [PRZYKŁAD]` na Karcie 2 do zmiany — użytkownik ocenił formę jako „wyglądającą śmiesznie". **Zasada z `DESIGN.md` §7 (oznaczanie danych niepochodzących z realnej logiki) zostaje w mocy — zmienia się tylko forma.** Konkretny wariant nierozstrzygnięty: usunąć sam dopisek / zmienić na subtelniejszy / usunąć cały mockup streaka (źródłem problemu jest to, że funkcja „streak" nie istnieje nigdzie w kodzie).

6. **Zdanie „maszyną do spalania tłuszczu" w Kroku 3 — rekomendacja zakwestionowana przez użytkownika, decyzja odłożona.** Ustalone rozróżnienie: problemem **nie jest prawdziwość** zdania (ketoza faktycznie przestawia organizm na tłuszcz), tylko to, czy adresuje ono wszystkie 3 cele z onboardingu — osoba na utrzymaniu wagi lub masie czyta to jako „ta sekcja nie jest dla mnie". Dwa warianty zamienne na stole, oryginał na razie zostaje.

7. Literówka FAQ „kilku letnie" → „kilkuletnie" — poprawiona samodzielnie przez użytkownika.

8. **🔍 Pełny audyt strony `/camp` + zatwierdzony plan przebudowy — w kodzie `camp.js`/`camp.css` NIC jeszcze nie zmienione.** Najważniejsze znaleziska:
    - **`camp.css` (902 linie) odwołuje się 56× do zmiennych CSS, które nie istnieją w żadnym pliku projektu** (`--color-accent`, `--color-surface`, `--color-text-primary`, `--color-border`, `--font-size-kicker`…). Zweryfikowane: 75 wystąpień w 6 plikach, **zero definicji**. Skutek wg specyfikacji CSS (*invalid at computed-value time*): `background-color` → `transparent`, czyli **wszystkie karty na `/camp` renderują się bez tła**, a akcenty dziedziczą kolor tekstu. To nie „dług do posprzątania", tylko działająca usterka wizualna.
    - **Sfabrykowany dowód społeczny:** `BATCH #04 • SEZON 2026` (sugeruje trzy wcześniejsze edycje przy zerowej liczbie podopiecznych), `#KT-8842-PRO`, `VIP ACCESS`, `ELITE BODY & PERFORMANCE` — do usunięcia.
    - **Formularz aplikacyjny nic nie wysyła:** `initCamp` (`camp.js:510-527`) buduje `dataObject` z `FormData` i **porzuca go** — brak `fetch`, brak zapisu — po czym pokazuje „Sukces!". 100% zgłoszeń do jedynego płatnego produktu jest traconych.
    - **Złamania `DESIGN.md`:** 5× kicker nad nagłówkiem (zakaz „bez wyjątków" z §4), 8 elementów z podwójną elewacją (tło + border naraz), hovery typu „unosząca się karta", zero `.reveal` (klasy żyją wyłącznie w `home.css`, nie globalnie).
    - **Brak przedstawienia trenera** na stronie sprzedającej mentoring 1-na-1 — zero nazwiska, zero kwalifikacji. Stąd w planie nowa sekcja `camp-coach` na pozycji 2.
    - **Decyzje właściciela:** (1) `fighter-card` → przebudowa na kartę deliverables (12 tygodni, 1-na-1, raport co 7 dni, wideo-analiza, protokół wyjścia); (2) **„Limit: 5 miejsc" uczyniony PRAWDĄ** — świadome zobowiązanie do max 5 osób naraz, co **unieważnia ustalenie z cz. 2 o fikcji** (kluczowe rozróżnienie: limit pojemności to twierdzenie o przyszłości, które można uczynić prawdziwym decyzją; „BATCH #04" to twierdzenie o przeszłości, którego uczynić prawdziwym się nie da); (3) bez ceny, ale z jednym zdaniem wyjaśniającym zasadę („cena po kwalifikacji"); (4) naprawa formularza poza zakresem planu — osobna sesja.
    - Plan 5-etapowy zapisany w `C:\Users\jacos\.claude\plans\zrobi-em-to-sam-przechodzimy-sequential-moon.md`.

---

### Plan Prac na Następną Sesję (Do Zrobienia):

1. 🔴 **`/camp` Etap 1 — uczciwość treści** (plan zatwierdzony, zero wdrożone): usunięcie `BATCH #04` / `#KT-8842-PRO` / `VIP ACCESS` / `ELITE BODY & PERFORMANCE`, przebudowa `fighter-card` na kartę deliverables, zdanie o cenie, czyszczenie copy (znaki `│` w liniach 224/242/259, cudzysłowy wokół 4 opisów bento, interpunkcja w 211 i 331, Title Case w H1).
2. 🔴 **Naprawa wysyłki formularza `/camp`** — najwyższy priorytet biznesowy całego projektu. Wzorzec gotowy w kodzie: nazwana funkcja `handleCampApplySubmit` (jak `handleOnboardingSubmit` w `onboarding.js:48`) + nowy serwis w `src/services/`. Do wyboru wariant odbioru leada (usługa zewnętrzna vs. własny backend).
3. **`/camp` Etapy 2–5** — kicker pod nagłówkiem w 5 sekcjach, nowa sekcja `camp-coach`, migracja 56 martwych zmiennych w `camp.css` na tokeny, przeniesienie `.reveal` z `home.css` do `global.css`, świat dziennika w `camp.css`.
4. **About — dokończyć, gdy przyjdą materiały:** realne zdjęcia z Tajlandii do galerii (3 sloty) i do paska `years-proof` (5 kafelków + realne lata/miejsca zamiast placeholderów). Dochodzi zdjęcie do nowej sekcji `camp-coach`.
5. **`/treningi-tychy` — zbudować szkielet trasy** (routing w `routes.js`, strona analogiczna do `/camp`/`/recipes`) + jedno zdanie z linkiem na home. Treść (lokalizacja, forma zajęć, dla kogo, kontakt) czeka na materiał od użytkownika.
6. **Przechwytywanie leada na home (Web3Forms)** — priorytet 🔴4 z `MARKETING.md`, świadomie odłożone; finałowe CTA już jest, ale nadal nie ma trzeciej ścieżki dla kogoś, kto dziś nie zakłada konta i nie aplikuje.
7. **Dwie niedokończone decyzje z tej sesji:** (a) Karta 2 „Umysł Wojownika" — co zrobić z `SERIA [PRZYKŁAD]` (3 warianty na stole); (b) Krok 3 — czy zostawić „maszyną do spalania tłuszczu", czy zamienić na wariant obsługujący wszystkie 3 cele.
8. **Pozostałe drobiazgi w `home.js`:** stempel „SEZON 01" bez znaczenia sekwencyjnego (`DESIGN.md` §9); `aria-expanded` na przyciskach akordeonu FAQ.
9. **Reorder sekcji na home (Wariant B z `MARKETING.md`)** — nadal odłożone, wymaga korekt CSS pod nowe sąsiedztwo sekcji.
10. **Meta description + Open Graph w `index.html`.**
11. **Migracja reszty CSS ze starych zmiennych:** `card.css`, `filters.css`, `form.css`, `modal.css`, `banner.css`, `layout.css` (`camp.css` objęty planem `/camp`, punkt 3). Uwaga: to ten sam problem martwych zmiennych, który na `/camp` okazał się realną usterką wizualną — te pliki też warto sprawdzić pod tym kątem, nie tylko „posprzątać".
12. **Rozstrzygnąć rozjazd nawigacji** (wciąż otwarty od kilku sesji) — kropka `--red` Ø4px vs obecny kolor `--amber` w stanie aktywnym tabbara — i ewentualnie zaktualizować `DESIGN.md`.
13. **Finalny wybór logo** — Karta Ważenia jest w topbarze; `.tabbar__logo` na desktopie wciąż ma tekst „KT" zamiast finalnego znaku.
14. **`ROADMAP.md` Faza 0 — pozostałe punkty:** naprawa deep-linków (`404.html`), treść `/knowledge` i `/contact`.
15. **Dashboard — pętla posiłków:** `dashboard.js` nie importuje `mealService.js` — dopiąć `getTodayMeal()`, listę zjedzonych posiłków, `deleteMeal()`, Date Controller.
16. **Podmienić placeholdery w footerze** — `href="#"` na Instagram/Facebook w `index.html` czeka na realne linki od użytkownika.
17. **`.streak-box` (`home.css`)** — hardkodowany `rgba(255,255,255,0.06)` wciąż nienaprawiony — prosta, izolowana zamiana na `color-mix` (powiązane z decyzją o Karcie 2, punkt 7a).

---

### Sesja 2026-09-10 — Wizualizacje 5 wariantów struktury `/camp`

1. **Stworzone 5 makiet w pełnej wierności stylu `DESIGN.md`** (osobne artifacty, desktop 1440 px + mobile 390 px każda) na bazie istniejącego `CAMP_VARIANTS.md` — dokumentu z 5 propozycjami architektury `/camp`, do którego wcześniej istniały tylko generatywne szkice (`.impeccable/mocks/decision/opt1-5.png`).
2. **Ważne rozróżnienie ustalone i zapisane w `CAMP_VARIANTS.md`:** szkice generatywne (`.png`, mimo rozszerzenia faktycznie JPEG) mają obcą treść (angielski, fikcyjne nazwiska typu „Mike Thompson", koszykówka/NBA zamiast Muay Thai/keto) i łamią §3/§4/§5/§9 `DESIGN.md` (box-shadow, glow, kicker nad nagłówkiem, identyczne karty w rzędzie, `--red` jako mały tekst). Czytać je wolno **wyłącznie jako układ blokowy**, nigdy jako referencję wizualną. Nowe makiety zbudowane na realnych tokenach z `src/styles/base/global.css` i realnym copy z `src/pages/camp.js`, skorygowanym wstępnie wg `MARKETING.md`.
3. **Linki do wszystkich 5 makiet zapisane w `CAMP_VARIANTS.md`** obok odpowiadających im szkiców, wraz z tabelą rozróżniającą „mockup" od „makiety" i sekcją zbiorczą **10 poprawek wspólnych dla wszystkich wariantów** (usunięcie `BATCH #04`/`VIP ACCESS`/`#KT-8842-PRO`, zamiana na „Pierwsza grupa · 5 miejsc", likwidacja kickerów, zmiana osi obietnicy z „spalania tłuszczu" na mechanizm/wydolność, oznaczanie liczb przykładowych, reguła Muay Thai jako dowód nie wymóg, status „w trakcie" dla dietetyki klinicznej).
4. **Skala wariantów:**
   - **Wariant 1 (Oś Czasu Campu)** — cała strona jako ciągła oś czasu Tydzień 1→12, karta zawodnika zamiast fikcyjnego „VIP ACCESS".
   - **Wariant 2 (Teczka Trenera)** — lewa kolumna z profilem (sticky na desktopie), prawa z dokumentami. Portret i nazwisko **jawnie oznaczone jako brakujące** — nie wymyślone. Makieta mobilna pokazuje realną wadę: lepkość znika, mechanizm wariantu przestaje działać.
   - **Wariant 3 (Bramka Kwalifikacyjna)** — odwrócona kolejność: 4 warunki wstępne i lista „Odpadasz, jeśli" przed jakimkolwiek opisem korzyści.
   - **Wariant 4 (Siatka Konkretów)** — bento-grid, ale z 5 **różnymi** typami pojemników (arkusz z dziurkami, panel wideo, notatka, teczka z zakładką, blok na macie) zamiast identycznych kart z cieniem ze szkicu.
   - **Wariant 5 (Kopia Zgłoszeniowa)** — strona jako 4-etapowy formularz, sprzedaż przeniesiona na marginesy jako wyjaśnienia „po co pytam o to pole".
5. **Nic nie wdrożone w `camp.js`/`camp.css`** — to etap decyzyjny, nie implementacja. Wybór wariantu i finalne copy wciąż czekają na decyzję użytkownika.

---

### Do zrobienia w kolejnej sesji (dopisane do listy z poprzedniej sesji):

18. **Decyzja: który z 5 wariantów struktury `/camp` wdrażamy** — makiety gotowe, patrz `CAMP_VARIANTS.md`. Otwarte pytanie do rozstrzygnięcia z użytkownikiem: czy wybieramy wariant działający przy dzisiejszym stanie home (np. Wariant 1, 3 lub 4), czy wariant zależny od wdrożenia Wariantu B „Lejek" na home (Wariant 5 zakłada, że cała perswazja zdarzyła się już wcześniej na `/`).

---

### Sesja 2026-09-10 (cz. 2) — Przebudowa `/camp`, pełny audyt i naprawa CSS w całej aplikacji, `/recipes`, `/dashboard`, `/onboarding`

1. **`/camp` przebudowany od zera — wybrany miks Wariantu 1 + Wariantu 5** (nie pojedynczy wariant z `CAMP_VARIANTS.md`, tylko świadome połączenie dwóch): oś czasu (12 tygodni, 3 fazy) jako główny nośnik perswazji na samej stronie, zamiast zakładać (jak czysty Wariant 5), że przekonanie zdarzyło się wcześniej na home. Finalna struktura: Hero → **Camp-coach** (nowa sekcja: Konrad Jacoszek, staż, `w trakcie` przy dietetyce, placeholder na zdjęcie) → Oś czasu 3 faz → 4 filary wsparcia (4 różne typy kontenerów: kartka z dziurkami / panel wideo / notatka na marginesie / pieczątka — zgodnie z zakazem identycznych kart z `DESIGN.md` §9) → Kwalifikacja (dla kogo / dla kogo NIE, bez twardej bramki) → Formularz w stylu Wariantu 5 (każde pole ma notatkę na marginesie "dlaczego pytamy"). Usunięte w całości: `BATCH #04`, `VIP ACCESS`, `#KT-8842-PRO`, `ELITE BODY & PERFORMANCE`, wszystkie kickery nad nagłówkami, metafora "piec do spalania tłuszczu". Zastąpione realnym `Pierwsza grupa · 5 miejsc`. **Formularz świadomie bez realnej wysyłki** — UI/walidacja/stan sukcesu działają, `fetch` zostaje na osobną sesję (priorytet biznesowy #1, patrz niżej).
2. **Audyt copywritingu `/camp` wobec `MARKETING.md`/`STRATEGY.md`** — znalezisko: hero deklaruje 3 segmenty (walka/siłownia/wytrzymałość), ale oś czasu i "protokół wyjścia" (reverse dieting, "docięcie", "zero jojo") mówiły wyłącznie do segmentu redukcyjnego. Naprawione (wybrany **Wariant B — podniesienie na mechanizm**): "protokół wyjścia" → "protokół stabilizacji" wszędzie, neutralne sformułowania tygodni (np. "kalibracja tempa zmiany wagi pod Twój cel" zamiast "tempo redukcji"), placeholder formularza pokazuje teraz 3 kierunki celu. Dodatkowo: "Komunikator 24/7" → "Codzienny komunikator" (zgodnie z realnym opisem formatu w `STRATEGY.md` §3, nie z całodobową dostępnością, której nikt nie obiecywał).
3. **🔍 Pełny audyt CSS całego projektu (16 plików) — znalezione i naprawione 56+ odwołań do nieistniejących zmiennych** w `card.css`, `filters.css`, `form.css`, `modal.css`, `banner.css`, `layout.css` (dokładnie ten sam mechanizm usterki co wcześniej na `/camp` — niewidoczne tła/obramowania na `/recipes`, `/dashboard`, `/onboarding`). **Stan na koniec sesji: 0 martwych tokenów, 0 `box-shadow`, 0 zduplikowanych selektorów w całym `src/styles`** (zweryfikowane mechanicznie skryptem porównującym zdefiniowane i używane zmienne).
4. **`/recipes` przebudowany:** karty na `--ground2`, mapowanie kolorów makro (białko `--red` / tłuszcz `--amber` / węgle `--blue`) ujednolicone z `home.css`. **Nowy plik `recipes.css`** — widok szczegółowy pojedynczego przepisu (`.recipe`/`.recipe__*`) nie miał wcześniej **żadnego** CSS. Naprawiony realny bug: `.btn--outline` (przycisk powrotu) nigdzie nie istniał → zamieniony na `.btn--secondary`. Naprawiony placeholder pola "kalorie" ucięty na mobile (za długi tekst przy `max-width: 140px`) → skrócony do "Max kalorii".
5. **`/dashboard` przebudowany:** bento-grid na tokenach, kolory wykresów Chart.js (JS, nie CSS — Chart.js nie czyta `var()`) scalone w stałą `CHART_COLORS` odpowiadającą tokenom (wykres wagi miał zielony spoza całej palety 9 tokenów). Naprawione: modal wpisywania wagi (był bez `.modal__title`/`.reminder-icon` w CSS w ogóle), reminder-banner, `.btn-delete` (dwukrotnie — raz martwe tokeny, raz brakujący `padding` po mojej własnej wcześniejszej "uproszczonej" poprawce). Karta "Historia Wagi": usunięty emoji `➕` (zakaz z `DESIGN.md` §9), przycisk przeniesiony do nagłówka karty (`.bento-card__header`), finalnie jako `.btn-icon-text` (ikona + widoczny tekst "Pomiar") — użytkownik odrzucił wersję z samą ikoną jako niejasną.
6. **`/onboarding` przebudowany:** formularz na tych samych tokenach co reszta appki (mono-etykiety, pola na `--ground2`), dopisany `.page-header` (wcześniej gołe pola bez żadnego kontekstu — zgodne z ustaleniem #20 z `MARKETING.md`). **Nowe pole "Rodzaj sportu"** — te same 4 kategorie co formularz aplikacyjny na `/camp` (`combat`/`gym`/`endurance`/`recreation`), zapisywane do `userProfile`, **świadomie bez wpływu na `calculatorService.js`** (to osobna, większa decyzja — `PLAN.md` wspomina o "specyficznych mnożnikach pod sporty walki", które dziś nigdzie nie istnieją).
7. **Nowy, realny fakt od użytkownika:** udokumentowane osiągnięcia trenerskie — **mistrz świata WBC wśród dzieci (2026)** oraz **dwaj brązowi medaliści**. Zapisane w pamięci projektu, świadomie **nie** dodane do `/camp` ani `/` — zarezerwowane dla przyszłej `/treningi-tychy` (Wariant B z wyboru użytkownika), żeby nie mieszać dwóch różnych ofert.
8. **Drobne realne bugi naprawione po drodze:** martwy import `getBase` w `camp.js`, martwa klasa `.macro__label` (nigdy nieużywana), potrójna duplikacja `.is-hidden` (trzy pliki → jedna definicja), side-tab accent border na `.page-header` wykryty przez hook `impeccable` i usunięty (nie stłumiony), martwe zduplikowane `data.backgroundColor` w konfiguracji doughnut-a Chart.js (biblioteka czyta kolory z `datasets[0]`, nie z `data`).
9. **⚠️ Nierozwiązane:** w trakcie sesji na dysku zniknęła ikona `flame` ze środka wykresu kołowego makro na `/dashboard` (`chart-center-icon`) — zmiana wykryta jako zewnętrzna (nie moja edycja), niewyjaśniona z użytkownikiem, zostawiona bez ruszania.
10. **Cała sesja pracowała bez wizualnej weryfikacji w przeglądarce** (użytkownik odmówił instalacji Claude in Chrome) — każda zmiana potwierdzona wyłącznie przez `npm run build` i przegląd kodu. Żadna z dzisiejszych stron nie została jeszcze obejrzana na żywo.

---

### Do zrobienia w kolejnej sesji:

#### Kolejność priorytetów (ustalona 2026-09-10, cz. 2 — zasada "jak na produkcji")

Zasada: **najpierw to, co blokuje pieniądze, potem to, co jest widocznie zepsute dla użytkownika, dopiero na końcu polish i wzrost.** Reszta listy niżej (punkty od "About" w dół) to praca nad jakością i wzrostem produktu, który formalnie jeszcze nie działa biznesowo — dopóki punkt 1 nie jest zrobiony, wszystko inne optymalizuje coś, co i tak nie zarabia.

1. 🔴 **Naprawa wysyłki formularza `/camp`.** Jedyna rzecz na stronie generująca przychód — dziś 100% zgłoszeń ginie bezpowrotnie (`FormData` budowany i porzucany, zero `fetch`). Bez tego reszta pracy nie ma znaczenia biznesowego, niezależnie jak spójna wizualnie jest strona. Wzorzec gotowy: nazwana funkcja `handleCampApplySubmit` + serwis w `src/services/`, do wyboru dostawca (Web3Forms vs własny backend).
2. 🔴 **Wizualna weryfikacja w prawdziwej przeglądarce** wszystkiego, co powstało dziś (`/camp`, `/recipes`, `/dashboard`, `/onboarding`) — desktop + mobile. Cała dzisiejsza sesja była potwierdzana wyłącznie przez `npm run build` i czytanie kodu (brak Claude in Chrome) — build, który się kompiluje, nie gwarantuje braku wizualnych regresji w realnej przeglądarce. Zero-kosztowy krok, zaraz po punkcie 1, zanim dokłada się cokolwiek nowego.
3. 🔴 **Meta description + Open Graph w `index.html`.** Bez tego każdy link wrzucony na social media (główne źródło ruchu wg `STRATEGY.md`) pokazuje pustą, szarą ramkę — zabija konwersję z kanału, zanim ktokolwiek trafi na stronę.

#### Reszta — jakość i wzrost działającego produktu

4. Wyjaśnić z użytkownikiem zniknięcie ikony `flame` z wykresu makro na `/dashboard` (patrz sesja 2026-09-10 cz. 2, punkt 9) — czy zamierzone.
5. Przechwytywanie leada na home (Web3Forms) — priorytet 🔴4 z `MARKETING.md`, wciąż odłożone.
6. Reorder sekcji na home (Wariant B „Lejek" z `MARKETING.md`) — wciąż nie wdrożony (mniej pilne niż wcześniej, bo miks 1+5 na Campie ominął zależność od tego kroku, ale nadal warty zrobienia dla samego home).
7. About (home) — dokończyć gdy przyjdą realne zdjęcia z Tajlandii i lata/miejsca do `years-proof`.
8. `/treningi-tychy` — zbudować szkielet trasy; teraz ma też czekać na nią najmocniejszy dostępny dowód autorytetu (osiągnięcia trenerskie — mistrz świata WBC dzieci 2026, dwaj brązowi medaliści).
9. Dwie niedokończone decyzje copywriterskie z home: Karta 2 „SERIA [PRZYKŁAD]" (wariant formy nierozstrzygnięty), Krok 3 „maszyną do spalania tłuszczu" (czy zamienić na wariant obsługujący wszystkie 3 cele — ta sama klasa problemu, którą naprawiliśmy dziś na Campie, nie przeniesiona jeszcze na home).
10. Rozjazd nawigacji — kropka `--red` Ø4px vs obecny `--amber` w stanie aktywnym tabbara.
11. Finalny wybór logo — `.tabbar__logo` na desktopie nadal ma tekst „KT".
12. `ROADMAP.md` Faza 0 — `404.html`, treść `/knowledge` i `/contact`.
13. Dashboard — pętla posiłków: `dashboard.js` nadal nie importuje `mealService.js`.
14. Placeholdery w footerze — `href="#"` na Instagram/Facebook czeka na realne linki.
15. `.streak-box` (`home.css`) — hardkodowany `rgba(255,255,255,0.06)`, powiązane z niedokończoną decyzją o Karcie 2 (punkt 9).
16. Stempel „SEZON 01" bez znaczenia sekwencyjnego, `aria-expanded` na akordeonie FAQ (`home.js`).

---

### Sesja 2026-09-14 — Pełny audyt (`RAPORT.md`) + naprawa buildu zdjęć + realna wysyłka formularza `/camp` (Web3Forms) + klauzula RODO

1. **Stworzony `RAPORT.md`** — pierwszy pełny audyt architektury, layoutu, designu, UI/UX, dostępności, wydajności, SEO i copywritingu całej aplikacji naraz (dotychczasowe audyty obejmowały pojedyncze strony). 30 znalezisk, w tym 19 nowych względem tego, co było już śledzone w tym pliku i w `ROADMAP.md`. Zawiera tabelę metryk stanu (do porównań w przyszłości) i rekomendowaną kolejność napraw — pełna treść w pliku, nieprzepisywana tutaj.

2. **🔴 Naprawiony realny bug: build produkcyjny gubił wszystkie lokalne zdjęcia.** Przyczyna: ścieżki w `home.js` były sklejane w runtime (`${getBase()}/src/assets/...`), a Vite kopiuje/hashuje wyłącznie zasoby wykrywalne statycznie (`import`, `url()` w CSS) — string budowany przez wywołanie funkcji jest dla bundlera niewidoczny (zero wykonywania kodu podczas builda). Naprawa: zdjęcia przeniesione do `public/` (kopiowane 1:1 do `dist/`, bez przetwarzania), ścieżki w `home.js` skrócone do `${getBase()}/nazwa.jpg`. **`getBase()` świadomie zostawiony** — odwołania nadal są budowane w JS w runtime, nie przez `import`, więc Vite nie doklei automatycznie prefiksu `/keto-thai-app` wymaganego na GitHub Pages; bez tego prefiksu zdjęcia działałyby lokalnie i psuły się dopiero na produkcji (ścieżka absolutna `/coś` zawsze liczy się od korzenia domeny, nie od aktualnego adresu). Zweryfikowane realnym `npm run build`, nie tylko czytaniem kodu — `dist/` zawiera teraz wszystkie zdjęcia, zero odwołań do `/src/assets` w zbudowanym JS.

3. **🔴 Naprawiona wysyłka formularza `/camp` — pierwsza działająca ścieżka przychodu w całej aplikacji.** Wybrany dostawca: **Web3Forms**, spośród 3 rozważonych wariantów (usługa zewnętrzna / własna funkcja serverless / `mailto:`) — serverless odrzucony jako zbyt duży skok trudności na teraz (nowe środowisko wykonania, sekrety po stronie serwera, CORS, osobny pipeline wdrożenia), `mailto:` jako zbyt słabe UX. `initCamp()` w `camp.js`: `fetch()` POST do `api.web3forms.com/submit` z `access_key`, stan `disabled` + „Wysyłanie..." na przycisku w trakcie, `try/catch` z realnym komunikatem błędu zamiast zawsze-sukcesu (stary kod budował `FormData` i porzucał ją, pokazując fałszywe potwierdzenie niezależnie od wyniku). Zweryfikowane przez wyszukiwanie w dokumentacji Web3Forms, nie zgadywane: rejestracja wymaga tylko e-maila (bez URL-a strony — istotne, bo aplikacja nigdzie jeszcze nie jest hostowana), CORS otwarty domyślnie dla dowolnej domeny — działa identycznie na `localhost` i po wdrożeniu na GitHub Pages.

4. **Poprawka po drodze:** użytkownik pierwotnie założył klucz Web3Forms na prywatnym Gmailu zamiast `KetoThai@o2.pl` — naprawione założeniem drugiego klucza z właściwym adresem (Web3Forms nie ma udokumentowanego samoobsługowego sposobu zmiany adresu e-mail na istniejącym kluczu).

5. **Dodana klauzula RODO** pod formularzem — rozwijana notka (gwiazdka + link), reużywająca mechanizm akordeonu FAQ z `home.js` (`grid-template-rows` 0fr→1fr), ale **z `aria-expanded` ustawianym poprawnie od razu** (czego nie ma jeszcze akordeon FAQ — patrz `RAPORT.md` #22, punkt 16 niżej). Umieszczona jako element siostrzany `</form>`, nie wewnątrz — bo handler sukcesu podmienia `form.innerHTML` w całości, co skasowałoby notkę, gdyby żyła w środku. Treść: Konrad Jacoszek jako administrator, podstawa prawna art. 6 ust. 1 lit. b RODO (czynności przedumowne — **nie wymaga checkboxa zgody**, bo to nie jest przetwarzanie na podstawie zgody, wystarczy informacja), Web3Forms jako podmiot przetwarzający (Indie, transfer zabezpieczony SCC), okres przechowywania 12 miesięcy od zakończenia rekrutacji (moja propozycja, zaakceptowana przez użytkownika). **Zastrzeżenie zapisane wprost dla użytkownika:** treść klauzuli nie jest zweryfikowana przez prawnika — to dobrze uzasadniony szkic pod wymogi art. 13 RODO, nie ostateczna porada prawna; `web3forms.com/privacy` i `/dpa` były niedostępne (403) zarówno dla narzędzia do przeglądania stron, jak i dla samego użytkownika, więc szczegóły o transferze danych nie zostały zweryfikowane od źródła — do sprawdzenia, gdy ich strona znów będzie dostępna.

6. **Po drodze wytłumaczone użytkownikowi** (ugruntowana wiedza, nie do tłumaczenia od zera w przyszłości): różnica build time vs runtime i analiza statyczna Vite (dlaczego `import` się kopiuje do `dist/`, a sklejany w runtime string nie); różnica między ścieżką absolutną (`/coś`, liczoną od korzenia domeny) a względną (liczoną od aktualnego adresu) i dlaczego GitHub Pages jako „project page" łamie założenie „działa lokalnie = zadziała wszędzie"; co dzieje się z listenerem zdarzeń przy `innerHTML` na elemencie, na którym on wisi (przeżywa, jeśli wisi na tym samym elemencie co podmieniany `innerHTML`; ginie, jeśli wisiał na jego dziecku) — z odniesieniem do wzorca delegacji zdarzeń już istniejącego w projekcie (`recipes.js`, `gridLayout.addEventListener` zamiast listenera na każdej karcie).

7. **Build zweryfikowany czysto po każdej zmianie** (`npx vite build`) — zero błędów kompilacji przez całą sesję.

8. **Zatrzymane w trakcie, do dokończenia na starcie kolejnej sesji:** punkt #3 z `RAPORT.md` (meta description + Open Graph + favicon). Dwie konkretne, nierozstrzygnięte rzeczy: (a) **brak finalnego URL-a** — strona nigdzie jeszcze nie jest hostowana, więc `og:url`/`canonical` czekają na decyzję (GitHub Pages czy własna domena); (b) **favicon** — odkryty nieużywany dotąd plik `ketoThaiLogoPatchBone.svg` (240×240, kwadratowa „naszywka" z literami KT, wcześniej martwy zasób niepodpięty nigdzie w kodzie) jako gotowy kandydat, ale ma przezroczyste tło i potrzebuje dopisania jednej warstwy tła w kolorze `--ground`, żeby był czytelny niezależnie od jasnej/ciemnej karty przeglądarki.

---

### Do zrobienia w kolejnej sesji (stan na 2026-09-14, po audycie)

Pełny rejestr wszystkich 30 znalezisk z audytu, z lokalizacją w kodzie i rekomendowaną kolejnością wdrożenia — w `RAPORT.md` §7–8. Poniżej tylko esencja, żeby nie duplikować całego dokumentu.

**Zaraz na starcie — dokańczamy przerwany punkt:**

1. 🔴 **Meta description + Open Graph + favicon** (`RAPORT.md` #3) — zatrzymane dziś na dwóch pytaniach: (a) jaki będzie finalny URL strony — potrzebny do `og:url`/canonical; (b) dopisać tło `--ground` pod `ketoThaiLogoPatchBone.svg` przed użyciem jako favicon.

**Priorytety wg zasady „najpierw to, co blokuje pieniądze" (kolejność z `RAPORT.md` §8):**

2. 🔴 Deep-linki gubią ścieżkę — `404.html` przekierowuje zawsze na `/`, nie zachowuje celu (`RAPORT.md` #4).
3. 🔴 Weryfikacja wizualna w prawdziwej przeglądarce, desktop + mobile — praca od kilku sesji potwierdzana wyłącznie przez `npm run build` i czytanie kodu, nigdy nieobejrzana na żywo.
4. 🟠 `/knowledge` i `/contact` — nadal gołe `<h1>`, linkowane z każdej strony aplikacji (`RAPORT.md` #5, 3 warianty naprawy do wyboru).
5. 🟠 Dostępność klawiatury: karty przepisów nieklikalne bez myszy (`RAPORT.md` #6), modal wagi na `/dashboard` bez roli/pułapki fokusu (#20), linki w zamkniętej szufladzie mobilnej wciąż fokusowalne (#21), akordeon FAQ bez `aria-expanded` (#22 — wzorzec poprawnej implementacji mamy już dziś w notce RODO na `/camp`, wystarczy przenieść).
6. 🟠 Kontrast poniżej WCAG AA w 4 miejscach, w tym `.hero__tag` — zdanie sprzedające na home (`RAPORT.md` #8).
7. 🟠 Bug: aktywny tab w nawigacji nie aktualizuje się po kliknięciu CTA spoza tabbara (`RAPORT.md` #10).

**Nadal otwarte z poprzednich sesji, potwierdzone jako wciąż aktualne w audycie:**

8. 3 kickery nad nagłówkami na `/camp` (fazy 1–3) — uznane wcześniej za naprawione, w kodzie jednak zostały (`RAPORT.md` #13).
9. `/treningi-tychy` — szkielet trasy czeka na materiał (lokalizacja, forma zajęć) i na najmocniejszy dowód autorytetu (mistrz świata WBC dzieci 2026, dwaj brązowi medaliści).
10. About (home) — realne zdjęcia z Tajlandii do galerii i `years-proof`, gdy przyjdą od użytkownika.
11. Rozjazd nawigacji — kropka `--red` Ø4px z `DESIGN.md` vs obecny `--amber` w stanie aktywnym tabbara.
12. Finalny wybór logo — `.tabbar__logo` desktop nadal tekst „KT" zamiast finalnego znaku (mamy już `ketoThaiLogoPatchBone.svg`, patrz punkt 1b).
13. Dashboard — pętla posiłków: `mealService.js` nadal niezaimportowany w `dashboard.js`.
14. Placeholdery social w stopce (`href="#"`) czekają na realne linki.
15. `.streak-box` (`home.css`) — hardkodowany `rgba(255,255,255,0.06)`, powiązane z nierozstrzygniętą decyzją o Karcie 2 „SERIA".
16. Stempel „SEZON 01" bez znaczenia sekwencyjnego.

**Nowe z dzisiejszego audytu, jeszcze nieplanowane wcześniej:**

17. Brak zastrzeżenia medycznego mimo twierdzeń zdrowotnych w treści (`RAPORT.md` #27).
18. Brak walidacji zakresów w kalkulatorze — możliwe ujemne gramy tłuszczu przy skrajnych danych wejściowych (`RAPORT.md` #28).
19. `/dashboard` bez jakiejkolwiek ścieżki do `/camp` — jedyny wyeksponowany przycisk to „Skasuj dane aplikacji" (`RAPORT.md` #30).
20. Zero przechwytywania leada dla kogoś, kto nie jest gotowy aplikować do Campu od razu, i zero analityki na całej stronie (`RAPORT.md` #29).
