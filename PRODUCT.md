# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vanilla JavaScript (ES6+ Modules), Vite, CSS3 (CSS Grid/Flexbox, Variables), Chart.js.

## Users

Osoby aktywne fizycznie, podzielone na trzy główne segmenty (lejek TAM):
1. **Sporty walki:** Szukający siły, dynamiki i metod zbijania wagi bez utraty energii.
2. **Sporty wytrzymałościowe:** Eliminacja "odcięć prądu" na długich dystansach dzięki adaptacji do tłuszczu.
3. **Trening siłowy / sylwetkowy:** Przełamywanie stagnacji, opornej tkanki, problemów metabolicznych.
Wspólny mianownik: archetyp Wojownika – poszukiwanie rygoru, dyscypliny i wiedzy klinicznej, a nie generycznego "wellness".

## Product Purpose

Produkt działa w modelu Product-Led Growth jako zaawansowany darmowy "Lead Magnet". Aplikacja jest asystentem do codziennego śledzenia diety ketogenicznej (SaaS). Rozwiązuje problem "CO jeść" na co dzień, automatycznie budując zaufanie i edukując użytkownika. Celem jest ocieplenie leada i konwersja na produkt premium (High-Ticket): 12-tygodniowy "Fighter's Camp" (Mentoring 1-on-1 oparty na analityce i odpowiedzialności).

## Positioning

Unikalne połączenie 15 lat twardego doświadczenia sportowego (mentalność z tajskich campów Muay Thai) z twardą wiedzą z zakresu dietetyki klinicznej (hormony, ketoza, insulinooporność). Aplikacja nie coachuje miękko, lecz "rejestruje" wyniki. Przenosi rygor sportowy (sędziowska karta punktacji, fizyczny dziennik) na dyscyplinę żywieniową.

## Operating Context

Środowisko to wirtualna "mata treningowa". Aplikacja używana jest nawykowo, do szybkiego wprowadzania danych (np. między posiłkami czy treningami). Interfejs nie krzyczy powiadomieniami – cierpliwie rejestruje dane pomiarowe. Kontekstowy system rekomendacji inteligentnie sugeruje płatny mentoring w momentach wykrycia stagnacji użytkownika.

## Capabilities and Constraints

- Czysty JavaScript (SPA) z autorskim routingiem (History API).
- Zależność od `localStorage` (tymczasowo) oraz zewnętrznego API do wyszukiwania makroskładników (np. Edamam).
- Rygor wydajnościowy: stałe 60 FPS (Debounce, Intersection Observer).
- Brak frameworków JS, brak UI-toolkitów (np. Tailwind, Bootstrap).
- Bezwzględny zakaz ad-hoc kolorów, cieni, bluru – dopuszczalne tylko 9 ścisłych tokenów kolorystycznych i zadeklarowane fonty.

## Brand Commitments

- **Wizualna szczerość:** Papier kraft, ciemna mata, ołówek trenera, kreda, atrament urzędowy. Detale fizyczne (perforacja, pieczątka, taśma) wygrywają z dekoracyjnym gradientem.
- **Odrzucenie standardów:** Świadome odejście od pastelowych trendów health & wellness na rzecz surowości. Całkowite odcięcie od "AI-slopu" (brak podświetleń box-shadow).
- **Ton komunikacji:** Zdecydowany, zwięzły, autorytatywny – mówiący do użytkownika jak trener na macie.

## Evidence on Hand

- Spisana i spójna strategia konwersji / lejka (`STRATEGY.md`).
- Dokładny zakodowany blueprint wizualny (`DESIGN.md`).
- Baza wiedzy (artykuły) i zasoby graficzne (Lucide, Simple Icons) oparte o własne ikony SVG.

## Product Principles

1. **Edukacja jako Kwalifikacja:** Darmowe narzędzie udowadnia kompetencje i izoluje klientów gotowych na płatną współpracę.
2. **Kliniczny Rygor:** Pomiar, tracking i analityka to świętość – dane ważniejsze niż animacja czy ekran startowy.
3. **Fizyczność i Materia:** Dziennik ma fizyczne właściwości (papier, taśma) oddając hołd autentycznemu doświadczeniu campów sportów walki.
4. **Twarde limity (Constraints):** Ograniczona liczba tokenów, kategoryczne unikanie popularnych błędów estetycznych, absolutna kontrola nad jakością kodu.
