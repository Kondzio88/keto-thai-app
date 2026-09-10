# Koncepcje przebudowy struktury dla /camp

Dokument zawiera 5 propozycji architektury dla strony `/camp`. 
Wszystkie warianty zachowują zatwierdzony w `DESIGN.md` styl fizycznego dziennika treningowego (papier kraft, ciemna mata, fonty stencil, czerwone akcenty).

Każdy wariant ma dwa materiały wizualne i **nie wolno ich mylić**:

| Materiał | Co to jest | Jak czytać |
|---|---|---|
| **Mockup** (`.impeccable/mocks/decision/*.png`) | Szkic generatywny z sesji `impeccable`. Treść angielska, obce marki i nazwiska, fonty i cienie spoza naszego systemu. Łamie §3, §4, §5 i §9 z `DESIGN.md`. | Wyłącznie jako **układ blokowy** — co gdzie leży i w jakiej kolejności się to czyta. Nic poza tym. |
| **Makieta** (artifact) | Ten sam układ zbudowany na realnych tokenach z `src/styles/base/global.css`, z copy skorygowanym wg `MARKETING.md`. Desktop 1440 px i mobile 390 px, razem z chrome aplikacji (sidebar 5rem / dolny tabbar). | Jako **referencja wizualna** przy wyborze wariantu. |

Copy w makietach jest wstępne — służy ocenie architektury, nie jest zatwierdzoną treścią. Każda makieta kończy się notatką, które reguły z `DESIGN.md` naprawia względem swojego szkicu.

## Wariant 1: The Timeline Flow (Podróż)
- **Koncepcja:** Strona to jedna ciągła oś czasu od Dnia 1 do Dnia 84.
- **Widok:** Potężna pionowa oś po lewej stronie. Przewijanie odkrywa kolejne fazy programu (Week 1-12) i przypięte do nich wartości.
- **Ryzyko:** Wymaga długiego scrollowania, ukrywa formularz na samym dole.
- **Mockup:** `.impeccable/mocks/decision/opt1.png`
- **Makieta (nasz styl, desktop + mobile):** [Oś Czasu Campu](https://claude.ai/code/artifact/127f1df0-5de2-4a43-9fe4-c1af108e2d79)

## Wariant 2: The Coach's Dossier (Autorytet)
- **Koncepcja:** Strona jako otwarta teczka trenera z informacjami o programie.
- **Widok:** Zablokowana lewa kolumna z profilem trenera (foto, kwalifikacje). Prawa kolumna przewija się przez dokumenty programu.
- **Ryzyko:** Mocno dzieli uwagę na desktopie; trudniejsze do ułożenia na aplikacji mobilnej.
- **Blokada treści:** wymaga nazwiska, portretu i realnych zdjęć z Lamai Camp (`MARKETING.md`, Część IV). W makiecie te braki są jawnie oznaczone.
- **Mockup:** `.impeccable/mocks/decision/opt2.png`
- **Makieta (nasz styl, desktop + mobile):** [Teczka Trenera](https://claude.ai/code/artifact/f0f76f84-5f57-46a0-b2e2-96c64ce52402)

## Wariant 3: The Qualification Gate (Filtr)
- **Koncepcja:** Odwrócona psychologia. Zaczynamy od wymagań. Użytkownik musi się sam zakwalifikować psychologicznie.
- **Widok:** Hero pyta "Czy jesteś gotowy?". Poniżej widoczne są twarde zasady współpracy, a dopiero potem korzyści i formularz.
- **Ryzyko:** Może odrzucić zbyt wielu zimnych odwiedzających na samym starcie.
- **Mockup:** `.impeccable/mocks/decision/opt3.png`
- **Makieta (nasz styl, desktop + mobile):** [Bramka Kwalifikacyjna](https://claude.ai/code/artifact/fa1dc709-ca9b-4b70-9d91-e484cd0772c4)

## Wariant 4: The Deliverables Grid (Produkt)
- **Koncepcja:** Gęsty "dashboard" korzyści skupiony wyłącznie na namacalnej wartości.
- **Widok:** Brak długiego czytania. Sekcja hero to siatka (bento-grid) z kartami: Wideo-Analiza, Kontakt 24/7, Protokół. Wszystko widoczne od razu.
- **Ryzyko:** Krótsza narracja może nie zbudować wystarczających emocji i motywacji przed zakupem.
- **Uwaga o §9:** siatka bento to naturalne miejsce na złamanie zakazu identycznych kart — w makiecie każdy kafel dostał inny typ pojemnika.
- **Mockup:** `.impeccable/mocks/decision/opt4.png`
- **Makieta (nasz styl, desktop + mobile):** [Siatka Konkretów](https://claude.ai/code/artifact/182dbda6-b51a-4fc7-a623-4242d799aa12)

## Wariant 5: The Embedded Form (Akcja)
- **Koncepcja:** Strona JEST wieloetapowym formularzem aplikacyjnym.
- **Widok:** Formularz zajmuje środek od samego początku. Teksty sprzedażowe żyją na marginesach, objaśniając kolejne pola (np. dlaczego pytamy o cel).
- **Ryzyko:** Bardzo agresywne podejście; zakłada, że klient jest w 100% gotowy na zakup przy wejściu.
- **Warunek działania:** cała perswazja musi zdarzyć się wcześniej — na Home i w bloku `camp-offer`.
- **Mockup:** `.impeccable/mocks/decision/opt5.png`
- **Makieta (nasz styl, desktop + mobile):** [Kopia Zgłoszeniowa](https://claude.ai/code/artifact/cebf9ec0-f5af-420c-bbb1-af5863b42f9e)

---

## Poprawki wspólne dla wszystkich pięciu makiet

Niezależnie od wybranego wariantu, te zmiany wobec obecnego `src/pages/camp.js` są wpisane w każdą makietę:

| Co | Skąd wymóg |
|---|---|
| Usunięcie `VIP ACCESS`, `BATCH #04 • SEZON 2026`, `#KT-8842-PRO`, `ELITE BODY & PERFORMANCE` | `MARKETING.md` Cz. II §5 — `BATCH #04` twierdzi, że odbyły się trzy poprzednie edycje przy zerowej liczbie podopiecznych |
| Zastąpienie ich komunikatem „Pierwsza grupa · 5 miejsc” | `MARKETING.md` Cz. I §5D — dowód przez transparentność; limit 5 osób jest realnym zobowiązaniem |
| Likwidacja wszystkich kickerów nad nagłówkami (`camp-hero__kicker`, `camp-phases__kicker`, `camp-features__kicker`, `camp-qual__kicker`, `camp-apply__kicker`) | `DESIGN.md` §4 — zakaz bez wyjątków; obecny `camp.js` łamie go pięć razy |
| Usunięcie metafory „piec do spalania tłuszczu” (`camp.js:136`) | `MARKETING.md` Cz. II §3 — zmiana osi obietnicy z redukcji na mechanizm (stabilna energia, wydolność) |
| Oznaczenie każdej liczby przykładowej (makro, waga, wykres) | `DESIGN.md` §7 |
| Zero `box-shadow`, zero glow, jedna deklaracja elewacji na element | `DESIGN.md` §5 |
| `--red` wyłącznie jako wypełnienie CTA, obramowanie pieczątki, duża liczba lub element nietekstowy | `DESIGN.md` §3, zasada twarda |
| Zdjęcia jako duotone placeholder z taśmą i podpisem „do dostarczenia”, nigdy stock | `DESIGN.md` §6 + `PRODUCT.md` §Evidence |
| Muay Thai wyłącznie w zdaniach, których podmiotem jest autor | `MARKETING.md` Cz. II §4 |
| Dietetyka kliniczna opisana jako **w trakcie**, nigdy jako ukończona | `MARKETING.md` Cz. I §5 — wzmocnienie fałszywego autorytetu jest gorsze niż jego brak |
