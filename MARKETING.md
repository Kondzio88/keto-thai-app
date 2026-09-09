# MARKETING.md — Keto Thai: Audyt konwersji i copywritingu

**Status:** źródło prawdy dla warstwy sprzedażowej i językowej aplikacji.
**Data audytu:** 2026-09-09
**Zakres:** `src/pages/home.js` (główny), `src/pages/camp.js`, `src/pages/onboarding.js`, `index.html`

## Miejsce tego dokumentu wśród pozostałych

| Dokument | Odpowiada za |
|---|---|
| `STRATEGY.md` | model biznesowy, lejek, monetyzacja |
| `PRODUCT.md` | produkt, użytkownicy, pozycjonowanie |
| `DESIGN.md` | warstwa wizualna — jedyne źródło prawdy dla UI |
| **`MARKETING.md`** | **konwersja, struktura sprzedażowa, copywriting** |
| `PROGRES.md` | dziennik sesji |

## Jak czytać ten dokument

- **Część I** — audyt struktury strony i lejka sprzedażowego
- **Część II** — audyt copywritingu i pozycjonowania
- **Część III** — twarde ustalenia zweryfikowane w kodzie (z numerami linii)
- **Część IV** — decyzje, otwarte pytania, treści do dostarczenia

Oznaczenia priorytetów: 🔴 krytyczne · 🟠 wysokie · 🟡 średnie

---
---

# CZĘŚĆ I — AUDYT STRUKTURY I LEJKA

## 1. Werdykt

> Strona jest **dobrze zbudowana produktowo i słabo sprzedażowo** — świetnie
> tłumaczy *czym jest aplikacja*, ale nie domyka ani jednej pętli: nie ma
> finałowego CTA, nie ma przechwytywania leada, a jedyny posiadany autorytet
> (osoba autora) jest zilustrowany zdjęciami ze stocka.

## 2. Co działa — nie ruszać

| Element | Dlaczego to mocne |
|---|---|
| **Sekcja Steps (3 kroki + zrzuty telefonu)** | Najlepsza sekcja na stronie. Pokazuje produkt, zamiast o nim mówić. Realne zrzuty = dowód, że aplikacja istnieje |
| **Camp-offer jako blok pośredni** | Poprawna mechanika lejka: darmowy produkt → dopiero potem oferta płatna. Zgodne ze `STRATEGY.md` |
| **Konkret w opisie Campu** | „Codzienny kontakt, cotygodniowa analiza wideo, korekta makro" — weryfikowalne deliverables, nie obietnice |
| **FAQ #7 i #8** | Adresują dwie najważniejsze obiekcje (po co to zamiast licznika kalorii / czy płatne). Problem to ich pozycja, nie treść |
| **Spójność z `DESIGN.md`** | Kierunek „dziennik treningowy" jest rzadki i broni się — nie wygląda jak generyczna apka wellness. To przewaga, nie ozdoba |

## 3. Krytyczne braki — wg wpływu na konwersję

### 🔴 1. Strona kończy się ślepym zaułkiem

Ostatnia sekcja to FAQ. Użytkownik przewija 8 pytań i trafia w stopkę.
**Nie ma finałowego CTA.**

`STRATEGY.md` §4 wymaga tego wprost:

> „Finałowe CTA na Home Page (/): Jasny wybór na końcu strony — »Rozpocznij za
> darmo« (dla mas) vs »Zobacz pełny program mentoringowy« (dla zdecydowanych)"

Zaplanowane, niewdrożone. Osoba, która doczytała FAQ do końca, to **najcieplejszy
lead na całej stronie** — przeczytała wszystko, ma odpowiedzi na obiekcje, jest
w szczycie gotowości. I dokładnie w tym momencie nie dostaje nic do kliknięcia.

### 🔴 2. Zdjęcia ze stocka podpisane jako własne

`home.js:153, 162, 171` — trzy zdjęcia z Unsplash w sekcji **„Historia
i filozofia"**, podpisane `FOTO 02 — TRENING, LAMAI CAMP` oraz
`FOTO 04 — WALKA W RINGU`.

To obcy ludzie przedstawieni jako własna historia. Teza sekcji brzmi „byłem tam,
sprawdziłem na własnej skórze" — a ilustruje ją dowód, że autora tam nie było.

`PRODUCT.md` §Evidence zakazuje tego wprost: *„Przyszłe prace nie mogą zakładać
użycia miękkich zdjęć ze stocka niepasujących do estetyki walki."*

> **Zasada:** jedno prawdziwe, przeciętne zdjęcie z telefonu bije trzy idealne
> ze stocka. Ludzie rozpoznają stock podświadomie — i to, co czują, to nie
> „ładne zdjęcie", tylko „ten człowiek coś ściemnia". W sekcji budującej
> zaufanie to najdroższy możliwy błąd.

*Zdjęcia potraw w bazie przepisów też są ze stocka — to inna kategoria. Nikt nie
zakłada, że autor fotografował każdy omlet. Zostawiamy.*

### 🔴 3. Hero nie mówi, czym to jest

```
TWOJE CIAŁO
TWOJA WALKA
KETO THAI — SYSTEM METABOLICZNY
```

Zimny użytkownik ma ~3 sekundy i musi odpowiedzieć sobie na trzy pytania:
**Co to jest? Dla kogo? Co z tego mam?** Obecny `<h1>` nie odpowiada na żadne.
„System metaboliczny" to żargon bez znaczenia dla osoby spoza tematu — a grupa
docelowa wg `STRATEGY.md` to *nie tylko* zawodnicy, ale też siłownia, bieganie
i rekreacja.

Nie chodzi o wyrzucenie „TWOJE CIAŁO / TWOJA WALKA" — to dobry znak marki.
Chodzi o to, że **znak marki nie może być jedyną warstwą informacyjną pierwszego
ekranu.**

### 🔴 4. Zero przechwytywania leada

Cała strona ma **dokładnie dwa wyjścia**: `/dashboard` i `/camp`. Brak trzeciej
opcji dla kogoś zainteresowanego, kto dziś nie zakłada konta i nie aplikuje.

Najdroższy brak przy obecnej sytuacji: **zero podopiecznych i zero historii
ruchu.** Każda osoba wychodząca bez zostawienia kontaktu jest stracona
bezpowrotnie — a na tym etapie to dosłownie pierwsi klienci.

`ROADMAP.md` ma to jako zadanie Fazy 0 (Web3Forms). Priorytet do podniesienia.

### 🟠 5. Sekcja „O mnie" nie buduje autorytetu

Sprzedawany jest mentoring 1-on-1. Ludzie kupują **człowieka**, nie aplikację.
A sekcja o autorze zawiera:

- ❌ imię bez nazwiska („Konrad")
- ❌ zero zdjęć twarzy
- ❌ zero weryfikowalnych danych (ile walk, od kiedy trenuje, jakie kwalifikacje)
- ❌ podpis „Konrad / Keto Thai" — firma podpisuje się sama sobą

To najsłabsze możliwe wykonanie zamiaru „mocny social proof mojej osoby".

⚠️ **Osobno:** `PRODUCT.md` §Positioning deklaruje „ekspercką wiedzę z zakresu
dietetyki klinicznej (hormony, ketoza, insulinooporność)". Przy kwalifikacjach
typu kursy/certyfikaty copy **nie może** używać języka klinicznego. W Polsce
„dietetyk" nie jest zawodem regulowanym, ale formułowanie twierdzeń zdrowotnych
i sugerowanie kwalifikacji, których się nie posiada, to realne ryzyko prawne
i reputacyjne. **Wzmocnienie fałszywego autorytetu jest gorsze niż jego brak.**

### 🟠 6. Obietnica funkcji, która nie istnieje

Karta „Umysł Wojownika" pokazuje mockup **„OBECNA SERIA"** — siatkę streaka
z 5 zapalonymi polami. Słowo `streak` nie występuje nigdzie w kodzie poza
`home.js` i `home.css`. **Funkcja nie istnieje.**

Użytkownik przychodzi po streak, zakłada profil, nie znajduje go → złamana
obietnica dokładnie w momencie aktywacji. Ta sama uwaga dotyczy `2450 KCAL`
i `-0.8 KG/TYDZ` (`DESIGN.md` §7 wymaga oznaczenia `[PRZYKŁAD]`), a `-0.8 kg/tydz`
to dodatkowo niejawna obietnica wyniku.

### 🟠 7. Udostępnienie linku = pusty prostokąt

`index.html`: `<title>Keto Thai App</title>`, **brak meta description, brak Open
Graph, brak obrazka OG.** Ruch będzie w ~90% z social mediów — każdy link
wrzucony na Facebooka, Instagram czy WhatsAppa pokaże się jako szara ramka.

Dodatkowo: aplikacja to czysty CSR (vanilla SPA). **Crawlery social mediów nie
wykonują JavaScriptu** — tagi OG muszą być statycznie w `index.html`, inaczej
nie zadziałają nigdy.

### 🟡 8. Brak analityki

Bez niej każda zmiana po tym audycie jest zgadywanką. Minimum: **które CTA jest
klikane, głębokość scrolla, ukończenie onboardingu.** Plausible albo Umami —
lekkie, RODO-friendly, wpinają się w vanilla JS jednym skryptem.

### 🟡 9. Treść startuje z `opacity: 0`

`home.css:770`. Jeśli JS się nie wykona (błąd, wolne łącze, blokada skryptów),
**większość strony pozostaje niewidoczna**. Brak też obsługi
`prefers-reduced-motion` w całym `src/styles`. Ryzyko techniczne z konsekwencją
czysto marketingową: biała strona zamiast oferty.

### 🟡 10. CTA „Oblicz swoje makro" prowadzi w złe miejsce

Link celuje w `/dashboard`, obiecuje kalkulator. Guard w `router.js:19-29`
przekierowuje na `/onboarding` — *działa*, ale przez przekierowanie. Copy
obiecuje kalkulator, więc link powinien celować tam, gdzie obietnica jest
spełniana.

## 4. Ocena sekcja po sekcji

| # | Sekcja | Ocena | Główny problem |
|---|---|---|---|
| 1 | Hero | 5/10 | Nastrój zamiast propozycji wartości; dwa CTA rozpraszają zimny ruch |
| 2 | Philosophy | 5/10 | Abstrakcja **przed** wyjaśnieniem produktu; karta 2 obiecuje nieistniejącą funkcję |
| 3 | About | 3/10 | Stock zamiast dowodu, brak nazwiska i twarzy — najsłabsze ogniwo |
| 4 | Steps | 8/10 | Najlepsza sekcja. Za nisko na stronie |
| 5 | Camp-offer | 7/10 | Brak kotwicy wartości; to samo zdjęcie co w hero |
| 6 | FAQ | 6/10 | Dobra treść, zła kolejność, brak CTA po niej |
| — | **Finałowe CTA** | **0/10** | **Nie istnieje** |

**Szczegóły:**

- **Kolejność jest odwrócona.** Sekcja realnie tłumacząca produkt (Steps) jest
  czwarta. Abstrakcyjna filozofia jest druga. Zimny użytkownik dostaje metaforę,
  zanim dowie się, co dostaje.
- **Dwa CTA w hero konkurują.** Lejek PLG to: darmowy produkt → zaufanie → Camp.
  Wysyłanie zimnego użytkownika na płatną stronę sprzedażową w 3. sekundzie
  działa wbrew własnemu lejkowi.
- **To samo zdjęcie dwa razy** (`homePicture.jpg`, `home.js:32` i `home.js:298`).
  Wizualnie zmniejsza ilość posiadanych dowodów.
- **FAQ #2**: *„Tak, o ile jest prowadzona z głową. Mam w tym kilku letnie
  doświadczenie."* — literówka (`kilkuletnie`) plus sprzeczność: hero mówi
  o **15 latach**, FAQ o **kilku**. Różnica jest realna (15 lat sportu vs kilka
  lat keto), ale czytelnik jej nie zna i odbiera jako chwianie się autorytetu.
- **Brak `aria-expanded`** na przyciskach akordeonu — czytnik ekranu nie wie,
  czy pozycja jest otwarta.
- **Stempel „SEZON 01"** — dekoracyjna numeracja bez znaczenia sekwencyjnego,
  czyli dokładnie to, czego zakazuje `DESIGN.md` §9.

## 5. Social proof, gdy nie ma ani jednego podopiecznego

> **„Brak klientów" ≠ „brak dowodu społecznego".** Testimoniale to jeden z sześciu
> typów dowodu i jedyny, którego dziś nie ma.

### A. Dowód osobisty — najsilniejszy dostępny

Własna metamorfoza autora. Konkretne liczby: ile kg zbite, w ile tygodni, przy
jakiej mocy na treningu. „Zbiłem 7 kg w 8 tygodni przed walką bez spadku mocy"
**jest** metamorfozą. Dziś schowana w mglistym „sprawdzone na własnej skórze".
Do wyciągnięcia na wierzch z liczbami.

> Uwaga: to działa **nawet bez zdjęć przed/po**. Samo zdanie z konkretną liczbą
> jest dowodem.

### B. Dowód autorytetu (Cialdini: authority, nie consensus)

Lamai Muay Thai Camp, Koh Samui to **nazwana, weryfikowalna instytucja** —
działa jak logo w pasku zaufania. Wymaga realnego zdjęcia stamtąd, inaczej wraca
problem #2.

### C. Dowód pracy (proof of work)

Konkretne liczby produktu zamiast przymiotników:

- **30 przepisów** w bazie (10 śniadań / 10 obiadów / 10 kolacji)
- kalkulator makro
- tracker wagi
- **0 zł**
- **bez zakładania konta**

30 to skromna liczba — ale **prawdziwa**, a prawdziwa liczba bije każdy
przymiotnik. „30 przepisów, 0 zł" jest mocniejsze niż „bogata baza sprawdzonych
przepisów".

### D. Dowód przez transparentność — niedoceniona przewaga

Zamiast udawać setki podopiecznych: powiedzieć wprost, że to start. „Startuję
z pierwszą grupą. Biorę 5 osób, bo więcej nie obsłużę uczciwie." Jednocześnie
uczciwe, wiarygodne i tworzy niedobór, którego nie trzeba udawać. Strona `/camp`
**już to robi** („Limit: 5 miejsc") — home o tym milczy.

### E. Dowód pożyczony

Odwołania do badań przy twierdzeniach o ketozie. Adaptacja tłuszczowa i sporty
wytrzymałościowe mają realną literaturę.

### F. Dowód rzemiosła

Sama aplikacja. Zbudowane, działające narzędzie oddawane za darmo — dowód
kompetencji i zaangażowania, którego 95% trenerów na Instagramie nie ma.

> ⛔ **Czego nie robić pod żadnym pozorem:** zmyślone testimoniale, zdjęcia
> obcych ludzi jako „podopiecznych", liczby typu „setki zadowolonych klientów".
> Wpadka kosztuje całą markę, a przy skali rynku lokalnego (Tychy) rozejdzie się
> pocztą pantoflową w tydzień.

## 6. Tychy i treningi personalne

**Decyzja: pełna sekcja na home** (patrz Część IV).

**Argumenty za:**
- W całej aplikacji **nie ma ani jednego sygnału geograficznego** — zero
  wystąpień „Tychy", „Śląsk" w `home.js`, `camp.js`, `index.html`. Google nie ma
  jak połączyć marki z zapytaniami lokalnymi. Darmowy, niewykorzystany kanał.
- Zapytania lokalne („trener personalny Tychy", „Muay Thai Tychy") mają
  **znikomą konkurencję** wobec „dieta keto" — to jedyne frazy, na które można
  się wybić bez budżetu.

**Argument przeciw (przyjęte ryzyko):**
- Home to lejek do prowadzenia dietetycznego. Duża sekcja o treningach na macie
  konkuruje o tę samą uwagę i rozmywa pozycjonowanie: *czy on jest dietetykiem,
  czy trenerem?* Rozmyta oferta konwertuje gorzej niż wąska.

**Mitygacja ryzyka (obowiązkowa przy wdrożeniu):**
- sekcja stoi **nisko** — pozycja 6, po Campie
- wizualnie i copywritersko **wyraźnie oddzielona oferta**, nie część produktu keto
- docelowo treść pod SEO trafia też na osobną trasę (`/treningi` lub `/contact`)

### Przewartościowanie strategiczne

> Blokerem numer jeden nie jest strona — jest **brak pierwszego podopiecznego**.
> Dopóki go nie ma, nie ma metamorfozy, testimonialu ani zdjęcia „przed/po".
> Cały lejek online jest zablokowany na braku dowodu.
>
> **Klient lokalny konwertuje nieporównanie szybciej niż online** — zaufanie
> buduje się na macie w 45 minut, nie przez 6 tygodni czytania strony. I ten sam
> klient produkuje dokładnie te aktywa (zdjęcia, wyniki, opinię), które odblokują
> sprzedaż Campu online.
>
> **Treningi lokalne to nie rozproszenie od lejka — to jego rozruch.**

## 7. Porównanie z liderami kategorii

| Wzorzec | Kto tak robi | Stan Keto Thai |
|---|---|---|
| **Liczba jako dowód w hero** | MyFitnessPal („14M+ foods"), Cronometer | ❌ 30 przepisów niewykorzystane |
| **Produkt widoczny na 1. ekranie** | MacroFactor, Carbon, Zero | ❌ Zrzuty są 4 sekcje niżej (a już istnieją) |
| **Jasny model cenowy od razu** | MacroFactor, Carbon | ❌ „Darmowe" ukryte w FAQ #8 — a to **największa przewaga** nad płatną konkurencją |
| **Twarz + pełne nazwisko + kwalifikacje** | Jeff Nippard, RP, każdy trener premium | ❌ „Konrad", bez twarzy |
| **Wideo z twórcą** | Standard w fitness od 2020 | ❌ Brak — 30 sekund na macie zrobi więcej niż trzy akapity copy |
| **Pasek zaufania / logotypy** | Wszędzie | ⚠️ „Lamai Camp" ma potencjał, wymaga realnego zdjęcia |
| **Finałowe CTA z wyborem ścieżki** | Absolutny standard | ❌ Brak |

> **Wniosek:** trzy z tych braków to rzeczy **już posiadane, tylko nieeksponowane**
> — zrzuty aplikacji, liczba przepisów, darmowość (i brak rejestracji).
> To najtańsze możliwe wygrane.

## 8. Warianty architektury

### Wariant A — „Chirurgiczny"
Kolejność bez zmian, naprawa copy hero + zdjęć + dodanie CTA i sekcji Tychy.
✅ Najmniejsze ryzyko, prawie zero pracy w CSS · ❌ Nie rozwiązuje „abstrakcja
przed produktem".

### ✅ Wariant B — „Lejek" — **WYBRANY**
```
1. HERO        propozycja wartości + 30 przepisów + 0 zł + bez konta + 2 CTA
2. STEPS       CO dostajesz            (awans z pozycji 4)
3. ABOUT       KTO to daje             (foto z Tajlandii, nazwisko, certyfikaty)
4. PHILOSOPHY  DLACZEGO to działa      (3 karty, naprawiona karta 2)
5. CAMP-OFFER  dla zdecydowanych       (+ kotwice: 5 miejsc, zero opłat)
6. TYCHY       pełna sekcja            (oferta wyraźnie oddzielna)
7. FAQ         kolejność sprzedażowa   (+ aria-expanded)
8. CTA         2 ścieżki + przechwytywanie e-maila
```
✅ Zgodne z sekwencją decyzyjną **co → kto → dlaczego → ile** · ✅ Dowód (osoba
autora) trafia na pozycję 3, gdzie użytkownik już wie, o czym mowa · ✅ Realizuje
`STRATEGY.md` §4 · ❌ Więcej pracy, część CSS wymaga korekty pod nowe sąsiedztwo.

### Wariant C — „Dwie bramy"
Hero rozdziela ruch na „Działam sam" / „Chcę prowadzenia".
❌ **Bardzo ryzykowne przy zerowym ruchu** — segmentacja opłaca się, gdy wiadomo,
jak dzielą się użytkownicy. Do rozważenia dopiero po zebraniu danych z analityki.

---
---

# CZĘŚĆ II — COPYWRITING I POZYCJONOWANIE

## 1. Philosophy: 3 karty zostają — korekta wcześniejszej rekomendacji

W pierwszym raporcie padła rekomendacja redukcji do 2 kart. **Została wycofana
jako źle uargumentowana.**

Faktycznym powodem nie było „trzy karty to za dużo", tylko to, że **karta 2
obiecuje nieistniejącego streaka** — i zamiast naprawić kartę, zaproponowano jej
usunięcie. To leniwa poprawka: usunięcie objawu zamiast przyczyny.

Reguła z `DESIGN.md` §6 („nigdy identyczny rząd kart ikona+nagłówek+tekst") jest
**spełniona** — karty mają różne kontenery (`--scorecard`, `--note`, zwykła).
Nie było podstawy do redukcji.

Dodatkowy argument **za** trzema: trzy filary to naturalne miejsce, by pokazać,
że system obsługuje trzy różne cele (patrz §3 tej części).

**Do naprawy w karcie 2, nie do usunięcia:**
- mockup „OBECNA SERIA" → element, który realnie istnieje w aplikacji
- copy „…nie poddaje się **na macie** ani w życiu" → złamanie reguły Muay Thai (§4)

> **Lekcja metodyczna:** gdy pada propozycja usunięcia elementu, właściwe pytanie
> brzmi „usuwasz to, bo jest złe, czy bo jest zepsute?". Jeśli zepsute —
> poprawną odpowiedzią jest naprawa.

## 2. CTA w hero — korekta i warianty napisów

Teza „jedno CTA" była nieprecyzyjna. Dwa przyciski w hero to standard i nie są
problemem same w sobie. **Problem jest z tym, czym jest ten drugi przycisk.**

| Przycisk | Zaangażowanie wymagane |
|---|---|
| „Oblicz swoje makro" | niskie — 6 pól formularza |
| „Fighter's Camp" | **maksymalne** — płatny mentoring 1-on-1 |

Obie opcje to przyciski konwersji na przeciwnych krańcach skali zaangażowania
i **nie ma nic pomiędzy**. Użytkownik, który w 3. sekundzie nie jest gotowy na
formularz, ale jest ciekawy, nie ma gdzie kliknąć poza wyjściem.

> **Wzorzec:** primary = akcja, której chcesz. Secondary = **najtańsza możliwa
> akcja, która zatrzymuje na stronie**. Nie druga oferta.

**Rekomendacja:** zostają dwa przyciski, secondary zmienia się z „Fighter's Camp"
na akcję o zerowym koszcie („Zobacz, jak to działa" → scroll do Steps). Camp nic
nie traci — jest dostępny z tabbara, z sekcji 5 i z finałowego CTA. **Trzy inne
wejścia.**

### Problem z obecnym napisem primary

„Oblicz swoje makro" używa żargonu. Osoba, która chce zrzucić 5 kg i dopiero
zaczyna — największa grupa — może nie wiedzieć, co to „makro". Opisuje też
funkcję (liczenie), nie wynik.

### Niewykorzystany atut: brak rejestracji

`onboarding.js` — 6 pól, zapis do `localStorage`, **zero e-maila, zero hasła,
zero konta**. W kategorii, w której każda apka żąda konta przed pokazaniem
czegokolwiek, „bez zakładania konta" usuwa największe tarcie, jakie istnieje.
Nigdzie nie jest to komunikowane.

### Warianty napisów

| Wariant | Primary | Secondary | Mikrotekst |
|---|---|---|---|
| **A. Bez żargonu** | Poznaj swoje zapotrzebowanie | Zobacz, jak to działa | Za darmo, bez zakładania konta |
| **B. Z kosztem czasu** | Oblicz swój plan — 2 minuty | Zobacz, jak to działa | Bez rejestracji. Bez e-maila. |
| **C. Zachowuje żargon** | Oblicz swoje makro | Zobacz, jak to działa | Za darmo, bez konta — wynik od razu |

> **Mechanizm:** przycisk obiecuje wynik, mikrotekst zdejmuje ryzyko. Największy
> hamulec przed kliknięciem to nie „czy chcę", tylko „co mnie to będzie
> kosztowało" — czas, dane, spam. Mikrotekst odpowiada, zanim pytanie się pojawi.

⚠️ **Warunek wdrożenia:** `/onboarding` to dziś goły formularz bez nagłówka,
bez zdania wprowadzającego, bez wyjaśnienia, po co te dane. Podkręcenie obietnicy
w hero przy surowym lądowaniu **zwiększy porzucenia**. Obietnica i lądowanie
muszą urosnąć razem.

⚠️ **Do rozstrzygnięcia osobno:** dane siedzą w `localStorage`, więc znikają przy
zmianie przeglądarki. „Bez konta" jest prawdą, ale docelowo trzeba uczciwie
napisać, że wynik żyje na tym urządzeniu.

## 3. Redukcja vs siła i wytrzymałość — zmiana osi obietnicy

### Własny kod obala własne copy

`onboarding.js:38-42` — cele oferowane przez aplikację:

```
Redukcja  •  Utrzymanie wagi  •  Przybranie wagi
```

> **Produkt obsługuje trzy cele po równo. Marketing sprzedaje jeden.**

To nie kwestia gustu — to wewnętrzna sprzeczność. Użytkownik, który chce budować
masę, czyta na home „maszyna do spalania tłuszczu", wychodzi — i nigdy się nie
dowiaduje, że kalkulator ma dla niego dedykowaną opcję. **Odpychanie człowieka
od funkcji, która już dla niego istnieje.**

### Rozkład języka w kodzie

| Plik | Charakter |
|---|---|
| `camp.js` | **Zbalansowany.** „transformacja sylwetki **i wydolności**", „przekładam na Twój sport – siłownię, bieganie, sporty walki czy rekreację", „wyższy poziom wydolności" |
| `home.js` | **Prawie wyłącznie redukcja.** „Protokół spalania tłuszczu" (l. 18), „Przeprogramuj organizm na spalanie tłuszczu" (l. 56), „maszyna do spalania tłuszczu" (l. 243), „-0.8 KG/TYDZ" (l. 109) |

> **Strona sprzedażowa jest lepiej napisana niż strona wejściowa.** Camp mówi do
> trzech segmentów, home do jednego. Odwrotnie, niż powinno być — home ma być
> szerokim wejściem, camp wąskim filtrem.

### Dwie osie wykluczania

```
OŚ 1 — obietnica:   "spalanie tłuszczu"  →  odpada ten, kto buduje
OŚ 2 — tożsamość:   "wojownik, mata"     →  odpada początkujący
```

Cel brzmi: ludzie aktywni **„lub tacy, którzy chcą zacząć"**. Osoba, która chce
zacząć, nie czuje się wojownikiem — czuje się kimś, kto się wstydzi, że dawno
nie ćwiczył. **Oś 2 wycina ją bezlitośniej niż oś 1.** A to prawdopodobnie
największy segment na rynku.

### Rozwiązanie: zmiana osi, nie rozcieńczanie

❌ **Zła odpowiedź:** „mniej o tłuszczu, dopiszmy coś o sile". Efektem będzie
copy, które nie mówi nic do nikogo. **Obietnica rozcieńczona jest gorsza niż wąska.**

✅ **Dobra odpowiedź: wyjść o poziom wyżej — na mechanizm, nie na wynik.**

Prawdziwy uniwersalny efekt ketozy to **stabilna energia**, nie chudnięcie.
Chudnięcie jest jednym z jego skutków. Stabilna energia obsługuje wszystkich naraz:

| Segment | Co znaczy „stabilna energia" |
|---|---|
| Sporty walki | zbicie wagi bez utraty mocy |
| Wytrzymałość | brak „odcięcia prądu" na długim dystansie |
| Siłownia | brak zjazdu po południu, lepsza rekompozycja |
| Początkujący | koniec z sennością po obiedzie i napadami na słodkie |

**To już jest w `STRATEGY.md`** — punkt o sportach wytrzymałościowych mówi wprost
o „odcięciach prądu". Zdiagnozowane, nieprzeniesione na home.

> **Zasada do samodzielnego stosowania:** jedna obietnica u góry, wiele
> zastosowań niżej. Hero obiecuje mechanizm (energia i kontrola). Sekcja niżej
> pokazuje, co ten mechanizm daje przy każdym z 3-4 celów. Nikt nie jest
> wykluczony, a większość przychodząca po redukcję nadal widzi siebie — bo
> redukcja jest po prostu pierwsza na liście.

### Konkretne zdania do przepisania

| Miejsce | Teraz | Co jest nie tak |
|---|---|---|
| `home.js:18` | „Protokół **spalania tłuszczu** oparty na 15 latach…" | Pierwsze zdanie opisowe zamyka ofertę na jeden cel |
| `home.js:243` | „…staje się **maszyną do spalania tłuszczu**" | Metafora maszyny + jeden cel. Agresywne dla początkującego |
| `home.js:109` | „**-0.8 KG/TYDZ**" | Wyeksponowana metryka mówi „to apka do chudnięcia" + niejawna obietnica wyniku |
| `home.js:56` | „**Przeprogramuj organizm na spalanie tłuszczu.** Stabilna energia…" | Kolejność odwrotna — mechanizm (stabilna energia) powinien być pierwszy |
| `camp.js:136` | „…staje się **piecem do spalania tłuszczu**" | Ta sama metafora, druga wersja |
| `home.js:129` | „…budowanie formy i **zbijanie wagi przed startami**" | ✅ **Tu jest OK** — to historia autora, nie obietnica dla użytkownika |

## 4. Reguła Muay Thai: dowód, nie wymóg

> **Muay Thai może występować wyłącznie w zdaniach, w których podmiotem jest
> autor. Nigdy w zdaniach, w których podmiotem jest użytkownik.**

Muay Thai jest **źródłem metody**, nie **warunkiem wstępu**. Gramatycznie:
pojawia się w zdaniach o pochodzeniu („metodę wykułem w…", „tak rozliczam
zawodników…", „przywiozłem z…"), nigdy w zdaniach o aktywności czytelnika.

### Audyt istniejących zdań

| Zdanie | Podmiot | Werdykt |
|---|---|---|
| `camp.js:16` „…tajskich campów Muay Thai **przekładam na Twój sport**" | autor | ✅ **Wzorzec.** Tak ma wyglądać każde zdanie |
| `home.js:279` „…dokładnie tak, **jak rozliczam zawodników** na macie" | autor | ✅ Poprawne — mata należy do autora, nie do czytelnika |
| `home.js:134` „…szlifowałem trenując w Lamai Muay Thai Camp" | autor | ✅ Czysty dowód autorytetu |
| `home.js:75` „Budujemy charakter, który nie poddaje się **na macie** ani w życiu" | **użytkownik** | ❌ **Złamanie.** Zakłada, że czytelnik stoi na macie |
| `home.js:14` „**TWOJA** WALKA" | użytkownik | ⚠️ „Walka" po polsku jest szeroką metaforą — ale w otoczeniu tajskich zdjęć i ringu czyta się dosłownie |
| `home.js:73` „Umysł Wojownika" (tytuł skierowany do czytelnika) | użytkownik | ⚠️ Graniczne — do rozstrzygnięcia |

> **Wniosek:** problem jest mniejszy, niż się wydaje. Trzy z sześciu miejsc są
> już poprawne. Do naprawy jest w zasadzie **jedno zdanie** (`home.js:75`)
> i jedna decyzja o haśle w hero.

**Test do samodzielnego stosowania na każdym zdaniu:**
> „Czy 42-letnia osoba, która chce schudnąć 8 kg i nigdy nie była na macie,
> czuje się tu **zaproszona** czy **oceniana**?"

## 5. 🚩 Znalezisko: sfabrykowany dowód społeczny

`camp.js:49`:

```
BATCH #04 • SEZON 2026
```

Komunikuje, że **odbyły się już trzy poprzednie edycje**. Liczba podopiecznych
wynosi zero.

To nie ozdoba — to twierdzenie o faktach, wprost sprzeczne z rzeczywistością.
Dokładnie ta kategoria, przed którą ostrzega §5 Części I. Przy skali rynku
lokalnego jeden klient, który zapyta „a jak poszło poprzednim grupom?", wywróci
markę.

W tym samym bloku: `VIP ACCESS` (l. 43), `#KT-8842-PRO` (l. 54),
`ELITE BODY & PERFORMANCE` (l. 53). Pusta gamifikacja, która niczego nie
obiecuje i nic nie dowodzi, a podpina się pod ten sam problem wiarygodności.

**Uczciwa i mocniejsza alternatywa:** `PIERWSZA GRUPA • 5 MIEJSC`. Prawdziwa,
tworzy realny niedobór i daje coś, czego „BATCH #04" nigdy nie da — **powód,
żeby dołączyć teraz**.

## 6. Kotwica wartości — czym jest i po co

**Intuicyjna idea.** Nieopisana butelka wina w sklepie. Nie wiadomo, czy to 20 zł
czy 400 zł. Mózg nie potrafi zawiesić oceny — więc zgaduje. I zgaduje **na swoją
niekorzyść**: albo „pewnie za drogie", albo „skoro nie piszą, to coś tu nie gra".

> **Kotwica wartości** to dowolny punkt odniesienia, który daje mózgowi skalę.
> **Bez skali nie ma oceny — jest domysł.**

**Co dzieje się pod maską.** Efekt zakotwiczenia (Tversky i Kahneman): pierwsza
liczba, jaką człowiek zobaczy, staje się punktem odniesienia dla wszystkich
kolejnych ocen — nawet gdy jest przypadkowa. Przy braku jakiejkolwiek liczby
mózg podstawia własną, zwykle pesymistyczną.

**Stan obecny.** Blok Camp na home nie ma **żadnej** informacji o skali. Ani
ceny, ani liczby miejsc, ani porównania. Jest „12 tygodni" — kotwica czasu, więc
coś jest, ale nic, co pozwala ocenić wartość.

### Typy kotwic

| Typ | Mechanizm | Dostępne dziś? |
|---|---|---|
| Cenowa | „od X zł" | Wymaga decyzji o cenie |
| Porównawcza | „tyle, co N wizyt u dietetyka" | Tak, jeśli znane stawki lokalne |
| Jednostkowa | „to mniej niż X zł dziennie" | Wymaga ceny |
| Stos wartości | co kosztowałoby osobno: plan + konsultacje + kontakt | Tak |
| **Dostępu / niedoboru** | **„5 miejsc"** | ✅ **Już jest na `/camp`** |
| **Transparentności** | **„Zero opłat przed kwalifikacją"** | ✅ **Już jest na `/camp`** |

> **Kluczowe:** nie trzeba publikować ceny. Model aplikacyjny (najpierw
> kwalifikacja, potem cena) jest sensowny przy usłudze premium. Ale **trzeba dać
> cokolwiek, co pozwala umieścić ofertę na skali** — inaczej segment odpada na
> niezadanym pytaniu.

**Najtańsza wygrana w całym audycie:** dwie kotwice już napisane leżą na `/camp`
i nie ma ich na home. „5 miejsc" i „zero opłat przed kwalifikacją". Przeniesienie
dwóch zdań, zero nowej treści.

---
---

# CZĘŚĆ III — USTALENIA ZWERYFIKOWANE W KODZIE

Wszystkie pozycje potwierdzone bezpośrednio w plikach — nie są to domysły.

| # | Ustalenie | Dowód |
|---|---|---|
| 1 | Brak finałowego CTA — strona kończy się na FAQ | `home.js:436-437` |
| 2 | Zdjęcia ze stocka (Unsplash) podpisane jako własne foto z Lamai Camp | `home.js:153, 162, 171` |
| 3 | Funkcja „streak" nie istnieje w aplikacji, a jest obiecana w mockupie | grep → tylko `home.js` + `home.css` |
| 4 | Liczby `2450 KCAL` / `-0.8 KG/TYDZ` podane jako fakt | `home.js:105, 109` — łamie `DESIGN.md` §7 |
| 5 | To samo zdjęcie użyte 2× (hero + camp-offer) | `home.js:32` i `home.js:298` |
| 6 | Baza przepisów = **30** (10 śniadań / 10 obiadów / 10 kolacji) | `src/data/recipesData.js` |
| 7 | Cała treść startuje z `opacity: 0` | `home.css:770` |
| 8 | Brak obsługi `prefers-reduced-motion` | grep w `src/styles` → 0 trafień |
| 9 | Brak meta description i Open Graph | `index.html:3-14` |
| 10 | CSR = crawlery social nie wykonają JS, tagi OG muszą być statyczne | `index.html`, `src/main.js` |
| 11 | Zero sygnału geograficznego (Tychy/Śląsk) w całej aplikacji | grep w `home.js`, `camp.js`, `index.html` |
| 12 | CTA „Oblicz swoje makro" → `/dashboard`, guard przekierowuje na `/onboarding` | `home.js:22`; `router.js:19-29` |
| 13 | Brak `aria-expanded` na przyciskach akordeonu FAQ | `home.js:315+`, `initHome` |
| 14 | Sprzeczność: „15 lat" (hero) vs „kilku letnie" (FAQ #2, literówka) | `home.js:18-19` vs `home.js:337` |
| 15 | **Onboarding nie wymaga rejestracji** — 6 pól → `localStorage`, zero konta | `onboarding.js:7-45, 57-69` |
| 16 | **Produkt obsługuje 3 cele, copy sprzedaje 1** | `onboarding.js:38-42` vs `home.js:18, 56, 243` |
| 17 | **`BATCH #04` sugeruje 3 poprzednie edycje przy zerowej liczbie klientów** | `camp.js:49` |
| 18 | `camp.js` jest zbalansowany segmentowo, `home.js` nie | `camp.js:15-16` vs `home.js:18` |
| 19 | Reguła Muay Thai: 3 miejsca poprawne, 1 złamane, 2 graniczne | ✅ `camp.js:16`, `home.js:279, 134` · ❌ `home.js:75` · ⚠️ `home.js:14, 73` |
| 20 | `/onboarding` to goły formularz bez nagłówka i kontekstu | `onboarding.js:7-45` |
| 21 | Onboarding nie pyta o rodzaj sportu, choć `STRATEGY.md` §4 tego wymaga | `onboarding.js:36-43` |
| 22 | Dekoracyjny stempel „SEZON 01" bez znaczenia sekwencyjnego | `home.js:9` — łamie `DESIGN.md` §9 |

---
---

# CZĘŚĆ IV — DECYZJE I OTWARTE PYTANIA

## Decyzje podjęte (2026-09-09)

| Temat | Decyzja |
|---|---|
| Architektura strony | **Wariant B — Lejek** (przebudowa kolejności sekcji) |
| Kwalifikacje | **Kursy / certyfikaty** — copy wymienia je z nazwy, **bez** języka „dietetyka kliniczna" |
| Materiały wizualne | **Tylko zdjęcia z Tajlandii** — brak portretu, brak własnej metamorfozy |
| Tychy | **Pełna sekcja** na home (świadome przyjęcie ryzyka rozmycia pozycjonowania) |
| Philosophy | **3 karty zostają** — naprawiamy kartę 2, nie usuwamy |
| CTA w hero | **2 przyciski**, secondary zmienia się z „Fighter's Camp" na akcję o zerowym koszcie |

## Otwarte pytania

1. **Wariant napisów CTA** — A (bez żargonu) / B (z kosztem czasu) / C (zachowuje żargon)
2. **Czy „TWOJE CIAŁO / TWOJA WALKA" zostaje w hero** — i w jakiej roli
3. **Co robimy z `BATCH #04`, `VIP ACCESS`, `#KT-8842-PRO`** w `camp.js`
4. **Kotwica wartości Campu** — która z sześciu opcji

## Treści do dostarczenia (blokują copy)

1. Pełne imię i nazwisko
2. Nazwy certyfikatów / ukończonych kursów
3. Zdjęcia z Lamai Camp → `src/assets/`
4. Liczby własnej metamorfozy (ile kg, w ile tygodni, przy jakiej formie)
5. Treść oferty Tychy (lokalizacja, forma zajęć, dla kogo, kontakt)
6. Decyzja o kotwicy wartości Campu
7. **Zalecane osobno:** portret twarzy — brak jest realną luką przy sprzedaży
   mentoringu 1-on-1, a zdobycie zajmuje jedno popołudnie

## Kolejność wdrożenia

| Prio | Zadanie | Pliki |
|---|---|---|
| 🔴 1 | Finałowe CTA (2 ścieżki) | `home.js`, `home.css` |
| 🔴 2 | About: wymiana stocka na foto z Tajlandii + nazwisko + certyfikaty | `home.js` |
| 🔴 3 | Hero: warstwa informacyjna + zmiana osi obietnicy + nowe CTA | `home.js` |
| 🔴 4 | Przechwytywanie leada (Web3Forms) | `home.js` |
| 🟠 5 | Uczciwość treści: streak, `[PRZYKŁAD]`, `BATCH #04`, spójność „15 lat" | `home.js`, `camp.js` |
| 🟠 6 | Przebudowa kolejności sekcji (Wariant B) | `home.js`, `home.css` |
| 🟠 7 | Sekcja Tychy | `home.js`, `home.css` |
| 🟠 8 | Meta description + Open Graph | `index.html` |
| 🟠 9 | Korekta `PRODUCT.md` §Positioning (usunięcie „dietetyki klinicznej") | `PRODUCT.md` |
| 🟡 10 | Analityka (Plausible / Umami) | `index.html` |
| 🟡 11 | Fallback `.reveal` + `prefers-reduced-motion` + `aria-expanded` | `home.css`, `home.js` |
| 🟡 12 | Kotwice wartości w camp-offer, osobne zdjęcie, kolejność FAQ | `home.js` |

## Ograniczenia obowiązujące przy wdrożeniu

- **`CLAUDE.md`** — tryb mentorski, metoda sokratejska, bez generowania kodu
  bez jednej z 5 komend-wyjątków
- **`DESIGN.md`** — zakaz kickera nad nagłówkiem (§4), zero `box-shadow` (§5),
  9 tokenów kolorów (§3), `--red`/`--blue` nigdy jako mały tekst, oznaczanie
  danych przykładowych (§7), jedna deklaracja elewacji na element (§5)
- **`PRODUCT.md`** — zakaz miękkich zdjęć ze stocka

## Weryfikacja po wdrożeniu

1. `npm run dev` — przejście przez stronę na mobile (375px) i desktop (1440px)
2. **Test 5 sekund** na pierwszym ekranie: czy odpowiada na „co / dla kogo / ile"
3. Klikalność każdego CTA — czy `/onboarding` i `/camp` faktycznie się otwierają
4. Wyłączenie JS w DevTools — czy treść strony pozostaje widoczna
5. Karta OG w debuggerze Facebooka po wdrożeniu meta tagów
6. Kontrast WCAG AA dla nowych sekcji (`DESIGN.md` §3 i §8)
7. Nawigacja klawiaturą przez FAQ — `:focus-visible` + `aria-expanded`
8. Sprawdzenie, czy żadna sekcja nie obiecuje funkcji nieistniejącej w kodzie

## Ćwiczenie kontrolne — zasięg copy

> Przejść przez **każde zdanie w `home.js` skierowane do użytkownika** (ze słowem
> „Twój/Twoje/Ty" albo w trybie rozkazującym). Przy każdym zapisać:
>
> - **R** — czy zakłada konkretny cel? (redukcja / masa / wytrzymałość / żaden)
> - **T** — czy zakłada konkretną tożsamość? (zawodnik / aktywny / początkujący / żadna)
>
> Liczba zdań z „żaden" w obu kolumnach = realny zasięg strony. Zmierzyć **przed**
> wdrożeniem i **po**, żeby wiedzieć, czy faktycznie się poszerzył.
