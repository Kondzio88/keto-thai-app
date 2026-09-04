# DESIGN.md — Keto Thai: Dziennik Treningowy

**Status:** jedyne i ostateczne źródło prawdy dla warstwy wizualnej aplikacji. Zastępuje w całości poprzednie, wzajemnie sprzeczne dokumenty (`DESIGN.md` „Controlled Sharpness / Dark Fighter" w wersji sprzed tej, oraz `KETO_THAI_DESIGN_GUIDELINES.md` „Stealth Minimalism" — usunięty) i zbadany wcześniej, odrzucony kierunek „Ring".

**Wizualna referencja (mockup wszystkich stron, mobile + desktop):**
https://claude.ai/code/artifact/f333e0b5-e184-492b-bc51-dca8bf77d819

Kierunek wybrany metodą `new-work` ze skilla `impeccable` (`.claude/skills/impeccable/`). Przy każdej kolejnej pracy nad UI/UX w tym projekcie: wczytaj ten dokument jako `DESIGN.md` (robi to automatycznie `context.mjs` skilla), trzymaj się jego reguł co do joty i konsultuj `.claude/skills/impeccable/reference/craft-floor.md` przed edycją UI.

---

## 1. Koncepcja (THESIS)

**Jedna idea, którą ta powierzchnia broni:** aplikacja to fizyczny dziennik treningowy trenera i zawodnika — nie kolejny generyczny panel „wellness". Dane wpisuje się tak, jak trener wpisuje wyniki do dziennika na macie: ołówkiem, w tabeli, na papierze, między rundami.

**Mechanizm produktu:** przenosi dyscyplinę sportową (waga, karta zawodnika, sędziowska tabela punktacji) na dyscyplinę żywieniową (keto). Aplikacja nie „coachuje miękko" — ona *rejestruje* wyniki, tak jak rejestruje się je w boksie.

**Świat kulturowy audytorium:** tajskie campy Muay Thai, sędziowskie karty punktacji rundowej, dzienniki treningowe trenerów, karty/licencje zawodników, bandaże i etykiety sprzętu na macie.

**Co ten pierwszy widok musi udowodnić:** że aplikacja rozumie rygor sportowca, a nie tylko liczy kalorie w ładnym kółku.

**Odrzucony domyślny kategorii (ruch, którego świadomie unikamy):** ciepły, kremowy grunt + wysokokontrastowa serif display + terakotowy/oksbloodowy akcent. To dokładnie to, co zrobił poprzedni kierunek „Ring" — i dokładnie to `impeccable` nazywa wprost jako jedną z trzech najczęstszych „kalibracji AI-slopu" (obok: near-black + neon, oraz pastelowy wellness). Świadomie budujemy trzecią, rzadziej używaną drogę: papier kraft na ciemnej macie treningowej, dane jak w oficjalnym formularzu, autorskie detale fizyczne (taśma, dziurkacz, pieczątka) zamiast dekoracji.

---

## 2. Tryby (modes)

Nazwa trybu opisuje, co znaczy sukces odwiedzającego na danej stronie (metodologia `impeccable`):

| Strona | Tryb | Co ma się udać |
|---|---|---|
| `/` Home | **Persuade** | Odwiedzający rozumie ofertę i podejmuje jedną z dwóch decyzji (start za darmo / Camp) |
| `/camp` | **Persuade** | Odwiedzający wypełnia formularz aplikacyjny |
| `/dashboard` (Tracker) | **Operate** | Odwiedzający sprawdza dzisiejszy bilans i dodaje pomiar — skanowalność wygrywa z ekspresją |
| `/recipes` | **Operate** | Odwiedzający znajduje przepis i dodaje go do dnia |
| `/onboarding` | **Operate** | Odwiedzający wypełnia krótki formularz i dostaje wynik |
| `/knowledge` | **Read** | Odwiedzający rozumie temat, structure i wayfinding nad ekspresją |

W trybach Operate/Read forma nigdy nie przesłania zadania — autorskie detale (taśma, pieczątka) żyją w marginesach kompozycji, nie na drodze do celu.

---

## 3. Paleta kolorów

**Strategia koloru:** Committed — jeden nasycony kolor (czerwień ołówka trenera) niesie 30–60% powierzchni jako CTA/akcent/dane pierwszego rzędu; reszta to neutralna mata (`--ground`) i kraft papier (`--paper`).

| Token | Hex | Rola | Kontrast (WCAG) |
|---|---|---|---|
| `--ground` | `#15130F` | Tło główne — mata treningowa | baza |
| `--ground2` | `#1D1A14` | Panele na ciemnym (sidebar, promo-bloki) | baza |
| `--paper` | `#E7DFC6` | Karty / „strony dziennika" — jedyna elewacja w systemie | tekst `--ink` → **13.0:1** |
| `--paper-dim` | `#C9BFA0` | Zakładki teczek, drugorzędne elementy papierowe | — |
| `--ink` | `#1D1A14` | Tekst na papierze | **13.0:1** na `--paper` |
| `--bone` | `#EFE9D8` | Tekst podstawowy na ciemnym tle | **18.9:1** na `--ground` |
| `--bone-dim` | `#A79E88` | Tekst drugorzędny na ciemnym tle | **6.97:1** na `--ground` — AA |
| `--red` | `#C23B2E` | Ołówek trenera: białko, CTA (wypełnienie przycisku), duże liczby-wyróżnienia, pieczątki, obramowania | **3.5:1** — patrz zasada twarda niżej |
| `--amber` | `#D98C2B` | Kreda: tłuszcz, aktywne taby/etykiety, drugorzędny akcent | **6.83:1** na `--ground` — AA nawet w małym tekście |
| `--blue` | `#3E6E86` | Atrament urzędowy: węgle, linie/marginesy, notatki | **3.34:1** — patrz zasada twarda niżej |

**Zasada twarda — kolor jako tekst:** `--red` i `--blue` **nigdy** jako kolor małego tekstu (etykiety, liczby poniżej ~18px). Oba mieszczą się tylko w progu „duży tekst" (3:1), nie w progu tekstu normalnego (4.5:1) — ani na `--ground`, ani na `--paper`. Wolno ich używać jako:
- wypełnienie przycisku (z jasnym tekstem na wierzchu),
- duża liczba-wyróżnienie (≥ 24px / display),
- obramowanie, linia, pieczątka, kropka-wskaźnik — elementy nietekstowe (próg 3:1, oba go spełniają).

Do każdej małej etykiety/tagu/liczby danych używaj `--bone-dim` (na ciemnym) lub `--ink` (na papierze) — jeśli potrzebne rozróżnienie makro w drobnym tekście, użyj `--amber` (jedyny akcent bezpieczny w małym rozmiarze na obu tłach) albo samego słowa/skrótu zamiast koloru.

**Zakaz:** więcej niż te 9 tokenów na stronie. Żadnych ad-hoc hexów wewnątrz komponentów — jeśli potrzebny nowy odcień, dodaj go tutaj jako token, nie wpisuj wartości w locie.

---

## 4. Typografia

| Rola | Font | Wagi | Klasa | Uzasadnienie |
|---|---|---|---|---|
| Nagłówki (display) | **Big Shoulders Stencil** | 700, 900 | `.stencil` | Litery jak szablon malowany na sprzęcie siłowni / skrzyni transportowej — nie kolejna edytorska serif (Fraunces/Playfair/Instrument Serif zakazane jako domyślny wybór modelu) |
| Dane, liczby, etykiety, tagi | **Martian Mono** | 400–700 | `.mono` / `.tag` | Uzasadnione, bo to **pomiar**, nie kostium „techniczności" — makra, kalorie, daty, nawigacja |
| Długi tekst czytelny | **Public Sans** | 400–600 | (domyślny `body`) | Workhorse sans dla artykułów Wiedzy i opisów — czytelność ponad charakter |

**Skala i zasady:**
- Display max `6rem` (96px), na mobile skalowany w dół proporcjonalnie do ramki.
- Tracking (letter-spacing) nigdy poniżej `-0.02em` na nagłówkach display (floor: `-0.04em` to za dużo, `-0.02` do `-0.03em` czyta się lepiej).
- Tagi/etykiety mono: `letter-spacing: .06em`, uppercase, `font-size: 10–11px`.
- Waga (measure) akapitu: 65–75 znaków w linii.

**Zakaz bezwzględny — bez wyjątków:** żaden kicker/nadnagłówek nad nagłówkiem (`.tag` lub `.mono` bezpośrednio nad `.stencil`). Etykieta kontekstowa zawsze idzie **pod** nagłówkiem albo obok niego, nigdy nad. To jeden z niewielu zakazów w `craft-floor.md`, którego „żaden brief nie odkupuje" — dotyczy to również pozornie uzasadnionych przypadków („data wpisu nad tytułem strony dziennika" też się nie liczy jako wyjątek).

---

## 5. Elewacja i głębia

- **Jedna deklaracja elewacji na element** — kolor papieru (`--paper`) ALBO ciemny panel (`--ground2`) ALBO cienka linia/obramowanie. Nigdy dwa naraz na tym samym elemencie (karta z tłem `--paper` nie dostaje dodatkowo `border`).
- **Zero `box-shadow`** w całym systemie — to świat papieru i maty, nie neobrutalizmu ani glassmorphizmu.
- **Zero glow, zero blur jako dekoracji, zero gradientu jako wypełnienia tekstu.**
- Fizyczna głębia przez **autorskie detale świata**, nigdy przez cień:
  - taśma (`.tape`) na zdjęciach zamiast ramki obrazka,
  - dziurki po segregatorze (`.hole`, para kółek Ø12–14px) na kartach danych,
  - pieczątka (`.stamp` / `.stamp-off`) obrócona -6°/+4°, obramowanie 3px, zamiast pigułki/badge'a,
  - linia perforacji (`border-top: 1px dashed`, cienka, jeden brzeg) na formularzach typu „kopia zgłoszeniowa",
  - linie liniatury (`repeating-linear-gradient`, opacity ~0.04–0.05) **tylko** tam, gdzie strona faktycznie reprezentuje pomiar (Tracker) — nigdy jako czysta dekoracja tła.

---

## 6. Komponenty

**Przyciski**
- Primary: wypełnienie `--red`, tekst `--bone`, brak promienia lub max 2px, etykieta Martian Mono uppercase 700, `letter-spacing: .04em`.
- Ghost: bez wypełnienia, obramowanie `--bone-dim` (na ciemnym) lub `--ink` (na papierze), sama etykieta niesie hierarchię.
- Brak „latania" na hover. Kliknięcie = fizyczne wciśnięcie (`transform`, nigdy zmiana `width`/`height`/`padding`).

**Karty danych („strony dziennika")**
- Tło `--paper`, bez obramowania. Jedyna dopuszczalna ozdoba: para dziurek w rogu, zakładka teczki (`.folder .tab`), albo pieczątka.
- Trzy różne elementy „3 filary"/cechy na stronie muszą mieć **różne** kontenery (podarty fragment karty punktacji / pieczątka / notatka na marginesie) — nigdy identyczny rząd kart ikona+nagłówek+tekst.

**Nawigacja**
- Bottom tab bar na mobile, sidebar po lewej na desktop (architektura odziedziczona z `PLAN.md` — zmienia się tylko skórka, nie struktura nawigacji).
- Stan aktywny: etykieta w pełnej jasności `--bone` + kropka-wskaźnik `--red` Ø4px pod spodem (nigdy sam mały czerwony tekst — łamie próg kontrastu).

**Ikonografia**
- Wyłącznie rysowane SVG, jeden spójny `stroke-width` (1.4–1.8px), nigdy emoji ani unicode-glify jako zamiennik ikony.

**Zdjęcia**
- Traktowane jak wklejone odbitki: dwa paski taśmy (`.tape`, obrócone -8°/+7°) na przeciwległych rogach, duotone ciemny placeholder (`.snap`, gradient `#3A342A → #211D17 → #15130F`) do czasu podmiany na realne zdjęcie, podpis Martian Mono 10px pod spodem („FOTO 01 — [opis] (do uzupełnienia)").
- Home w sekcji hero ma **dedykowane, opisane miejsce na zdjęcie** — wymóg produktowy potwierdzony w mockupie (mobile i desktop).

---

## 7. Dane, placeholdery i uczciwość treści

- Każda liczba na mockupie, która nie pochodzi z realnej logiki aplikacji, jest oznaczona jako przykładowa (np. `[PRZYKŁAD]`) — nigdy podana jako fakt.
- Widoki, które nie istnieją jeszcze w kodzie (szczegóły przepisu, cała `/knowledge`), są jawnie podpisane „propozycja / kolejny krok, dziś niedokończone w kodzie" w samym mockupie.
- Puste, ładujące i błędne stany nazywają przyczynę i następny krok — nigdy generyczne „Brak danych".

---

## 8. Dostępność (A11Y)

- WCAG AA jako twardy próg wszędzie — patrz tabela kontrastu w sekcji 3, zasada `--red`/`--blue` tylko w dużym tekście lub jako element nietekstowy.
- `:focus-visible` — widoczny obrys w każdym stanie, nigdy `outline: none` bez zamiennika.
- Tap targety min. 44×44px na mobile, z odstępem między sąsiednimi celami.
- Status/feedback nigdy tylko kolorem — zawsze też tekst lub ikona.
- `lang` dokumentu zgodny z realną treścią (polski).

---

## 9. Czego unikamy — zakazy z `craft-floor.md`

- Kicker/nadnagłówek nad nagłówkiem (zakaz bez wyjątków — patrz sekcja 4).
- Identyczne karty ikona+nagłówek+tekst powtórzone 3×+ w rzędzie.
- `box-shadow` poza światem, który go świadomie wybrał (my go nie wybraliśmy).
- Gradient jako wypełnienie tekstu; glass/blur jako czysta dekoracja.
- Numery sekcji 01/02/03 bez informacyjnej kolejności (numer „WPIS 01" w dzienniku ma sens sekwencyjny — czysto dekoracyjna numeracja nie).
- Monospace jako kostium „techniczności" tam, gdzie nie ma pomiaru/danych.
- Emoji i unicode-glify jako ikony.
- Więcej niż jedna deklarowana elewacja na element.
- System font (Arial/Impact/domyślny sans platformy) jako głos display.

---

## 10. Zakres tego dokumentu i dalsze kroki

Ten dokument opisuje kierunek **zatwierdzony w mockupie** (referencja w nagłówku). Wdrożenie do faktycznego kodu (`src/styles/`, `global.css`, komponenty) to osobny, następny krok — nieopisany tu celowo, bo `impeccable`'s `new-work.md` zastrzega: DESIGN.md dokumentuje **zbudowany świat**, nie intencję sprzed budowy. Gdy realny kod strony zacznie realizować ten kierunek, `document`/`audit` ze skilla `impeccable` powinny zweryfikować zgodność i skorygować ten plik, jeśli rzeczywistość code'u się od niego odchyli.
