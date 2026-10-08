# PRAWO.md: wymagania prawne Keto Thai

> **Utworzone 2026-10-08.** Mapa obowiązków prawnych aplikacji i rozterek z rozmów. Źródła prawdy dla innych warstw: architektura → `PLAN.md`, wygląd → `DESIGN.md`, treść i sprzedaż → `MARKETING.md`.
>
> ⚠️ **To nie jest porada prawna.** Plik zbiera wymagania z przepisów i publicznie dostępnych omówień, żeby do prawnika przyjść przygotowanym (płacimy za przegląd, nie za pisanie od zera). Przy danych o zdrowiu (art. 9 RODO) i płatnym Campie **przegląd przez prawnika od RODO i prawa konsumenckiego jest obowiązkowym krokiem przed startem kont.**
>
> Oznaczenia: ✅ spełnione · 🟡 częściowo · ❌ brak · ❓ do ustalenia · ⏸️ odłożone.

---

## 0. Najważniejsze w pięciu punktach

1. **Waga, wzrost, cel i dziennik diety to dane o zdrowiu (art. 9 RODO).** Według Europejskiej Rady Ochrony Danych (EROD) nawet „neutralne” informacje, np. o diecie, są danymi o zdrowiu, jeśli coś mówią o stanie zdrowia. Jedyna rozsądna podstawa w naszym modelu: **wyraźna zgoda** (art. 9 ust. 2 lit. a), którą **musimy umieć udowodnić** (art. 7 ust. 1).
2. **Polityka prywatności nie zabezpiecza sama.** Zabezpiecza komplet: polityka + regulamin + poprawnie zbierane i zapisywane zgody + dokumenty wewnętrzne (rejestr czynności, procedura naruszeń) + kod, który robi dokładnie to, co obiecują dokumenty.
3. **Trzy błędy w kodzie do naprawy przed startem kont:** „Zaloguj przez Google” na ekranie logowania zakłada konto bez zgód, zgody nigdzie się nie zapisują, Google Fonts i biblioteki z CDN wysyłają IP odwiedzających do firm trzecich bez podstawy (§2.3). ✅ Dwa pierwsze naprawione 2026-10-08 (§14).
4. **Aplikacja ma być narzędziem edukacyjnym/lifestyle, nie medycznym.** Inaczej grozi kwalifikacja jako wyrób medyczny (MDR) i zarzut nieuczciwej praktyki „leczy choroby” (§6, §5.3).
5. **Brakuje regulaminu**, a checkbox przy rejestracji już się do niego odwołuje (§4).

---

## 1. Mapa danych (stan kodu na 2026-10-08)

| Dane | Kto / skąd | Gdzie trafiają | Kategoria |
|---|---|---|---|
| Profil gościa: płeć, wiek, wzrost, waga, aktywność, sport, cel; historia wagi; dziennik; własne przepisy | gość | **tylko `localStorage`** przeglądarki (nie dotyka naszych serwerów) | zdrowie (art. 9) |
| To samo u zalogowanego + e-mail + id konta | zalogowany | **Supabase** (projekt w regionie UE, Frankfurt, na AWS; firma Supabase Inc., USA) | zdrowie (art. 9) + zwykłe |
| Dane z logowania Google (e-mail, identyfikator, ew. imię i zdjęcie) | zalogowany przez Google | **Google** → Supabase | zwykłe |
| Formularz `/camp`: imię, e-mail, telefon, sport, cel, wiadomość | kandydat na Camp | **Web3Forms** (Web3Creative, Kerala, Indie; serwery USA-East; nie przechowuje zgłoszeń, logi do ok. 2 mies.) → e-mail autora | zwykłe, w wiadomości mogą pojawić się dane o zdrowiu |
| Formularz `/contact` | każdy | **Web3Forms** → e-mail autora | zwykłe |
| Adres IP, przeglądarka, adres podstrony | każdy odwiedzający | **GitHub Pages** (logi serwera), **Google Fonts** (`index.html:19-22`), **unpkg** (Lucide, `index.html:235`), **jsDelivr** (Chart.js, `index.html:236`) | zwykłe |
| Pliki zapisywane w przeglądarce: `keto_*`, `keto_owner`, sesja Supabase `sb-…`, cache Service Workera | każdy | urządzenie użytkownika | — (Prawo komunikacji elektronicznej, §3) |
| 📋 Przyszłość: SMTP (maile z kontem), chatbot (Gemini), analityka, newsletter | — | do wyboru | patrz §8, §3 |

**Zasada:** każda nowa usługa zewnętrzna lub nowe pole w formularzu = aktualizacja tej tabeli, polityki prywatności i rejestru czynności.

---

## 2. RODO

### 2.1 Administrator ❓
Administrator to Ty (osoba albo firma), który decyduje o celach i sposobach przetwarzania.
- ❓ **Forma działalności:** jednoosobowa działalność (nazwa, adres, NIP) czy działalność nierejestrowana / osoba prywatna? Od tego zależą dane w polityce, regulaminie i na fakturach (§9).
- ❓ **E-mail do spraw danych:** najlepiej na docelowej domenie (`kontakt@…`), etap 7 w `PLAN.md`.

### 2.2 Podstawy prawne, osobno dla każdego celu
| Cel | Podstawa | Uwagi |
|---|---|---|
| Konto, logowanie, synchronizacja | art. 6 ust. 1 lit. b (umowa o świadczenie usługi) | |
| Dane o zdrowiu na koncie (profil, waga, dziennik, przepisy) | **art. 9 ust. 2 lit. a: wyraźna zgoda** | bez zgody nie wolno ich wysłać do bazy, także w etapie 6 (przeniesienie danych gościa) |
| Formularz `/camp` | art. 6 ust. 1 lit. b (działania przed zawarciem umowy) | jeśli kandydat opisze zdrowie w wiadomości → rozważyć zgodę art. 9 przy formularzu albo prośbę, by tego nie robić |
| Formularz `/contact` | art. 6 ust. 1 lit. f (uzasadniony interes: odpowiedź) | |
| Faktury i księgowość Campu | art. 6 ust. 1 lit. c (obowiązek prawny) | |
| Bezpieczeństwo, logi, dochodzenie roszczeń | art. 6 ust. 1 lit. f | |
| Gość (dane tylko w `localStorage`) | dane nie trafiają do administratora | i tak opisać w polityce: co, gdzie, jak usunąć („Skasuj dane aplikacji”) |

### 2.3 Wyraźna zgoda na dane o zdrowiu: wymagania
- **Aktywna:** checkbox niezaznaczony domyślnie ✅ (dziś `required`, niezaznaczony).
- **Oddzielona** od innych oświadczeń (art. 7 ust. 2): osobny checkbox od regulaminu ✅.
- **Konkretna:** jakie dane i po co. Obecny tekst „Zgadzam się na przechowywanie na koncie danych o mojej wadze i diecie (to dane o zdrowiu)” 🟡 → do przeglądu przez prawnika (np. dopisać cel: wyliczanie planu i prowadzenie dziennika, oraz możliwość cofnięcia).
- **Udowadnialna (art. 7 ust. 1):** ✅ **od 2026-10-08 tabela `consents`** (`supabase/003_consents.sql`, uruchomiona w Supabase) i `consentService.js`; wcześniej zgody nigdzie się nie zapisywały (`PLAN.md` §1a, luka nr 8). Potrzebny zapis: kto (`user_id`), na co (rodzaj zgody), **na którą wersję tekstu**, kiedy, skąd (formularz e-mail / Google).
- **Odwoływalna w każdej chwili, tak łatwo jak wyrażona (art. 7 ust. 3):** 🟡 dziś tylko „Usuń konto”. Do decyzji: osobny przycisk „Cofnij zgodę” (= usunięcie danych o zdrowiu z bazy i powrót do trybu gościa) czy cofnięcie = usunięcie konta (do potwierdzenia u prawnika, czy wystarczy).
- **Obowiązuje przy KAŻDEJ drodze założenia konta:** ✅ Formularz rejestracji sprawdzał oba checkboxy także przed „Kontynuuj z Google” (`initRegister()`), ale stały one pod przyciskiem i nic się nie zapisywało. **Furtka: „Zaloguj przez Google” na ekranie logowania** zakłada konto bez żadnej zgody (Supabase tworzy konto przy pierwszym logowaniu OAuth). Po etapie 6 (S1) dane gościa trafiałyby wtedy do bazy automatycznie. **Decyzja 2026-10-08: wariant C** (§14), wdrożony i przetestowany 2026-10-08 (bez przejścia przez nowe konto Google na ekranie logowania — brak drugiego konta do testu).

### 2.4 Obowiązek informacyjny: zawartość polityki prywatności (art. 13)
1. Administrator: tożsamość i dane kontaktowe.
2. Inspektor ochrony danych: brak (uzasadnienie §2.7) + kontakt w sprawach danych.
3. Cele i podstawy prawne: tabela z §2.2.
4. Prawnie uzasadnione interesy (tam, gdzie art. 6 ust. 1 lit. f).
5. Odbiorcy: Supabase, Google, Web3Forms, GitHub, (📋 SMTP, dostawca chatbota) z nazwy i z rolą.
6. Przekazanie poza Europejski Obszar Gospodarczy i zabezpieczenia (§2.9).
7. Okresy przechowywania, osobno dla celów (§2.5).
8. Prawa: dostęp, sprostowanie, usunięcie, ograniczenie, **przenoszenie**, sprzeciw, **cofnięcie zgody**, skarga do **Prezesa UODO** (ul. Stawki 2, 00-193 Warszawa).
9. Czy podanie danych jest dobrowolne i skutki niepodania (bez wagi kalkulator nie policzy planu).
10. Zautomatyzowane decyzje: kalkulator liczy plan automatycznie, ale **nie podejmuje decyzji wywołujących skutki prawne** (art. 22) — napisać wprost.
11. Pliki zapisywane w przeglądarce (§3).
12. Wiek: usługa dla osób 18+.
13. Dane Google: jak aplikacja pobiera, używa i przechowuje dane z konta Google (wymóg weryfikacji marki Google, §10).
14. Data i wersja polityki, zasady zmian i informowania o nich.

Polityka musi być: na stronie (stały link w stopce i przy zgodach), **na tej samej domenie co strona główna** (wymóg Google), prostym językiem.

### 2.5 Okresy przechowywania (propozycja do potwierdzenia)
| Dane | Okres |
|---|---|
| Konto i dane o zdrowiu | do usunięcia konta albo cofnięcia zgody |
| Zapis zgód (dowód) | czas trwania konta + okres przedawnienia roszczeń (do ustalenia z prawnikiem) |
| Zgłoszenia `/camp` bez współpracy | np. 12 miesięcy, potem usunięcie ze skrzynki e-mail |
| Zgłoszenia `/contact` | do zakończenia sprawy + np. 12 miesięcy |
| Faktury | 5 lat od końca roku podatkowego |
| Logi (GitHub, Supabase, Web3Forms) | według dostawcy (Web3Forms ok. 2 miesiące) |

⚠️ Okres przechowywania dotyczy też **skrzynki e-mail autora**, do której Web3Forms przesyła zgłoszenia. Potrzebny nawyk albo filtr kasujący stare zgłoszenia.

### 2.6 Prawa użytkownika: co musi umieć aplikacja
| Prawo | Stan |
|---|---|
| Usunięcie (art. 17) | ✅ „Usuń konto i dane” (kaskada w bazie, przetestowane 2026-10-08) |
| Cofnięcie zgody (art. 7 ust. 3) | 🟡 tylko przez usunięcie konta (§2.3) |
| Dostęp i przenoszenie (art. 15, 20) | ❌ brak eksportu. Minimum: obsługa na prośbę mailem w ciągu miesiąca; docelowo przycisk „Pobierz moje dane” (JSON / CSV). Dotyczy też prawa konsumenckiego (§5.1) |
| Sprostowanie (art. 16) | 🟡 profil da się zmienić tylko przez ponowny kalkulator; edycja pojedynczego pomiaru wagi niemożliwa |
| Sprzeciw (art. 21) | dotyczy celów z art. 6 ust. 1 lit. f, obsługa mailem |

### 2.7 Inspektor ochrony danych (art. 37) ⏸️ najpewniej niewymagany
Obowiązek powstaje, gdy główna działalność to **przetwarzanie danych szczególnych kategorii na dużą skalę**. Wytyczne EROD oceniają skalę po liczbie osób, zakresie danych i czasie przetwarzania. Przy kilku–kilkudziesięciu użytkownikach to nie jest „duża skala”. **Zapisać w dokumentacji wewnętrznej krótkie uzasadnienie**, dlaczego IOD nie jest wyznaczony, i wrócić do tego przy wzroście (np. tysiące kont).

### 2.8 Rejestr czynności przetwarzania (art. 30) ❌ **obowiązkowy**
Zwolnienie dla firm poniżej 250 osób **nie działa**, gdy przetwarzane są dane szczególnych kategorii (art. 30 ust. 5). Dokument wewnętrzny (nie publikujemy go), pokazywany na żądanie UODO. Zawartość: cele, kategorie osób i danych, odbiorcy, transfery, terminy usunięcia, opis zabezpieczeń. Tabela z §1 i §2.2 to gotowy szkielet.

### 2.9 Podmioty przetwarzające i transfery poza EOG
| Dostawca | Rola | Umowa powierzenia | Transfer poza EOG | Stan |
|---|---|---|---|---|
| Supabase Inc. (USA) | przetwarza dane kont | DPA do zaakceptowania (supabase.com/legal) | dane w UE (AWS Frankfurt), ale firma z USA; Supabase publikuje DPA i ocenę skutków transferu (TIA) | ❌ zaakceptować DPA; ❓ sprawdzić certyfikat Data Privacy Framework na dataprivacyframework.gov |
| Web3Forms / Web3Creative (Indie, serwery USA) | przekazuje formularze | DPA na web3forms.com/dpa | **Indie i USA** | ❌ zaakceptować DPA; ❓ rozważyć dostawcę z UE (prościej w polityce i bez transferu) |
| Google | logowanie OAuth (osobny administrator dla swoich danych); Google Fonts | warunki Google | USA | ❌ fonty → hostować u siebie (§2.10) |
| GitHub (Microsoft, USA) | hosting, logi IP | warunki GitHub | USA | opisać w polityce (art. 6 ust. 1 lit. f: bezpieczeństwo) |
| unpkg, jsDelivr | CDN bibliotek | brak | różne | ❌ → paczka Vite (§2.10) |
| Hostinger | tylko rejestrator domeny | — | — | nie przetwarza danych użytkowników, o ile nie będzie tam poczty |
| 📋 dostawca SMTP | wysyłka maili z kontem | DPA | wybrać dostawcę z UE, jeśli się da | etap 7 |

### 2.10 Privacy by design (art. 25) i bezpieczeństwo (art. 32)
- ✅ RLS (każdy widzi tylko swoje wiersze), region UE, HTTPS (GitHub Pages), klucz `secret` nigdy we frontendzie, usuwanie konta z kaskadą, czyszczenie danych lokalnych przy wylogowaniu (wspólny komputer).
- ✅ Gość nie wysyła danych o zdrowiu nigdzie (minimalizacja).
- ❌ **Google Fonts, Lucide i Chart.js z zewnętrznych serwerów.** Każde wejście wysyła IP odwiedzającego do firm trzecich bez podstawy prawnej. Sąd w Monachium (LG München I, 20.01.2022, 3 O 17493/20) przyznał za to odszkodowanie, bo fonty da się trzymać lokalnie. **Rozwiązanie:** fonty (licencja OFL pozwala) i biblioteki w paczce Vite. Dodatkowo naprawia przypiętą wersję Chart.js (`RAPORT.md` #24) i `lucide@latest`.
- 📋 Rozważyć automatyczne wylogowanie po bezczynności (`PLAN.md` §1a, luka nr 3).
- 📋 Pole `sport` w profilu nie wpływa na wynik kalkulatora (`PLAN.md` §2): minimalizacja danych mówi, żeby nie zbierać tego, czego nie używamy. Do decyzji: usunąć albo zacząć używać.

### 2.11 Ocena skutków (DPIA, art. 35) ⏸️
Przy danych o zdrowiu warto mieć **choćby krótką notatkę z analizy ryzyka**: jakie dane, jakie ryzyka (wyciek, wspólny komputer, błędny plan), jakie zabezpieczenia i dlaczego pełna DPIA nie jest wymagana przy obecnej skali (sprawdzić wykaz UODO operacji wymagających oceny skutków). Przy chatbocie albo wglądzie trenera w dzienniki podopiecznych wrócić do pełnej oceny.

### 2.12 Naruszenia ochrony danych (art. 33–34) ❌
- Zgłoszenie do Prezesa UODO **do 72 godzin** od wykrycia (przez biznes.gov.pl), chyba że ryzyko dla osób jest mało prawdopodobne. Przy wysokim ryzyku: powiadomić też użytkowników.
- **Każde naruszenie** (także niezgłaszane) wpisać do wewnętrznego rejestru naruszeń.
- Potrzebna krótka procedura „co robię, gdy…”: wyciek klucza `secret`, włamanie na konto Supabase/GitHub/e-mail, błąd RLS, zgubiony telefon z dostępem do panelu. Kroki: odciąć dostęp (rotacja kluczy), ocenić skalę, zapisać, zgłosić w 72 h.
- Ze względu na dane o zdrowiu: **2FA** na Supabase, GitHub, Google Cloud i skrzynce e-mail.

### 2.13 Wiek
Aplikacja jest dla 18+ (kalkulator: wiek 18–99, `onboarding.js`). Dzięki temu nie dotyczy nas zgoda rodzica z art. 8 RODO (próg w Polsce: źródła są sprzeczne, 13 albo 16 lat, u nas bez znaczenia). Wpisać 18+ także do regulaminu.

---

## 3. Prawo komunikacji elektronicznej (PKE, od 10.11.2024)

### 3.1 Pliki i dane w przeglądarce (art. 399): „cookies” w szerokim sensie
Dotyczy też `localStorage` i cache Service Workera.
- **Niezbędne do usługi, o którą prosi użytkownik** → **bez zgody**, ale z jasną informacją (cel, jak kontrolować): `keto_*`, `keto_owner`, sesja Supabase, cache SW. ✅ Dziś nie mamy nic poza niezbędnymi, więc **baner cookies nie jest potrzebny** — wystarczy sekcja w polityce.
- **Analityka, piksele reklamowe, osadzone filmy itp. → wymagają zgody** (aktywnej, nie domyślnej). 📋 Dodanie analityki (`RAPORT.md` #29) = baner zgody albo analityka bez plików i bez danych osobowych (do sprawdzenia z prawnikiem).

### 3.2 Marketing (art. 398) 📋
Newsletter, maile z ofertą Campu, przypomnienia sprzedażowe = **osobna, aktywna zgoda marketingowa** (jedna zgoda obejmuje e-mail i inne kanały), oddzielona od regulaminu i zgody na dane o zdrowiu. Maile **transakcyjne** (potwierdzenie konta, reset hasła) zgody nie wymagają. Dotyczy przyszłego „przechwytu leada” (`PLAN.md` §6.5).

---

## 4. Ustawa o świadczeniu usług drogą elektroniczną (UŚUDE): regulamin ❌

**Obowiązkowy** dla każdej usługi online (art. 8). Udostępniony **przed** zawarciem umowy, w formie do zapisania i wydrukowania. Postanowienia, których nie udostępniono w ten sposób, nie wiążą użytkownika.

Minimum z ustawy:
1. Rodzaje i zakres usług (kalkulator, dziennik, przepisy, konto, kreator, formularze).
2. Warunki świadczenia, w tym **wymagania techniczne** (nowoczesna przeglądarka z JavaScriptem, `localStorage`, e-mail lub konto Google do konta) i **zakaz dostarczania treści bezprawnych** (np. własne przepisy, wiadomości).
3. Warunki zawarcia i rozwiązania umowy (założenie konta, usunięcie konta).
4. Tryb postępowania reklamacyjnego (jak, gdzie, w jakim terminie odpowiadamy, np. 14 dni).

Dodatkowo (dobra praktyka i ochrona autora):
- **Zastrzeżenie medyczne:** kalkulator to narzędzie edukacyjne, nie porada lekarza ani dietetyka; przeciwwskazania (lista ze stopki `#zastrzezenia`); 18+. ✅ Treść już istnieje w stopce i onboardingu.
- Ograniczenie odpowiedzialności w granicach prawa konsumenckiego (wobec konsumenta nie można wyłączyć wszystkiego).
- Własność treści: przepisy trenera, zdjęcia, kod; licencja na własne przepisy użytkownika (tylko na potrzeby działania usługi).
- Zasady zmian regulaminu (z wyprzedzeniem, informacja e-mailem dla kont).
- Dane usługodawcy (art. 5 UŚUDE): imię i nazwisko / firma, adres, e-mail; przy działalności także NIP / numer w rejestrze.
- Pozasądowe rozwiązywanie sporów (rzecznik konsumentów, inspekcja handlowa).

Regulamin Campu (usługa płatna) może być **osobnym dokumentem** (§5.2).

---

## 5. Prawo konsumenckie

### 5.1 Darmowa aplikacja jako „usługa cyfrowa” (ustawa o prawach konsumenta, rozdz. 5b) ❓
Przepisy o treściach i usługach cyfrowych obejmują też umowy, w których konsument „płaci” danymi osobowymi. **Wyjątek:** gdy dane służą **wyłącznie** do świadczenia usługi lub spełnienia wymogów prawnych. Dopóki nie używamy danych do marketingu czy analityki, jesteśmy najpewniej w wyjątku. Gdy to się zmieni, dochodzą m.in. prawa do zgodności usługi z umową i do **odzyskania treści stworzonych przez konsumenta** (własne przepisy, dziennik) po zakończeniu umowy → kolejny argument za eksportem danych (§2.6). Do potwierdzenia u prawnika.

### 5.2 Fighter's Camp (płatny mentoring zawierany na odległość) ❌
- **Informacje przed zawarciem umowy:** dane usługodawcy, cena całkowita, sposób płatności, czas trwania (12 tygodni), zakres usługi, procedura reklamacji, prawo odstąpienia.
- **Odstąpienie w 14 dni** od zawarcia umowy, bez podania przyczyny. Jeśli konsument **wyraźnie zażąda** rozpoczęcia usługi przed upływem 14 dni, przy odstąpieniu płaci **proporcjonalnie** za zrealizowaną część. Potrzebne: pouczenie o prawie odstąpienia + wzór formularza odstąpienia + checkbox „żądam rozpoczęcia przed upływem 14 dni” przy zawieraniu umowy.
- **Potwierdzenie umowy na trwałym nośniku** (e-mail z treścią warunków).
- Faktury / rachunki: §9.
- Dziś formularz `/camp` to tylko zgłoszenie (bez płatności), a umowa zawierana jest później. Ten proces też trzeba opisać w regulaminie Campu.

### 5.3 Nieuczciwe praktyki rynkowe (ustawa o przeciwdziałaniu nieuczciwym praktykom rynkowym, „czarna lista” art. 7)
- **Art. 7 pkt 17:** fałszywe twierdzenie, że produkt **może leczyć choroby, dysfunkcje lub wady rozwojowe** → zawsze nieuczciwe. UOKiK regularnie wydaje takie decyzje. ⚠️ Przegląd copy na `/` i `/camp` pod kątem „leczy / wyleczysz / cofa insulinooporność / terapia” (powiązane z `PROGRES.md`, punkt o obietnicach wydolnościowych i ISSN). Bezpieczne: „wspiera”, „pomaga planować”, „edukacja”.
- **Fałszywa ograniczona dostępność** („tylko dziś”, „ostatnie miejsca”, gdy to nieprawda) → nieuczciwe. Limit 5 miejsc na Campie jest od 2026-09-09 **realnym zobowiązaniem**. Elementy „BATCH #04”, „VIP ACCESS”, „#KT-8842-PRO” nadal są **fikcją do usunięcia**.
- **Opinie i rekomendacje (Omnibus):** przy publikowaniu opinii klientów trzeba informować, **czy i jak** sprawdzamy, że pochodzą od prawdziwych klientów. Zakaz kupowania i zniekształcania opinii. Dziś testimoniali brak (zero podopiecznych). Przy pierwszych: weryfikacja + informacja na stronie.
- **Promocje cen (Omnibus):** przy obniżce ceny Campu podawać **najniższą cenę z 30 dni** przed obniżką.
- Zakaz podawania fikcyjnych danych jako prawdziwych (spójne z `DESIGN.md` §7: dane przykładowe muszą być oznaczone).

### 5.4 Reklama w mediach społecznościowych (rekomendacje UOKiK dla influencerów)
Główny kanał to Stories na Instagramie i Facebooku. **Autopromocja** (reklamowanie własnej marki i usług, np. Campu) też podlega oznaczaniu: jasno, jednoznacznie, dwupoziomowo (funkcja platformy + oznaczenie w treści, np. „#autopromocja”, „reklama mojej usługi”). Brak oznaczenia = wprowadzanie w błąd.

---

## 6. Wyrób medyczny (rozporządzenie MDR 2017/745) ⚠️ ryzyko do pilnowania

Oprogramowanie dostarczające informacji do decyzji **diagnostycznych lub terapeutycznych** może być wyrobem medycznym (reguła 11 MDR, co najmniej klasa IIa: certyfikacja, jednostka notyfikowana, ogromny koszt). Aplikacje do ogólnego **fitness i dobrostanu (wellness/lifestyle)** wyrobami nie są.

- **Decyduje deklarowane przeznaczenie** („intended purpose”) w opisie, reklamie i funkcjach, **nie sam disclaimer**. Zastrzeżenie nie pomoże, jeśli funkcje faktycznie są medyczne.
- **Dziś:** kalkulator makro dla osób zdrowych + edukacja + zastrzeżenie i przeciwwskazania → wellness ✅.
- ⚠️ **Czerwone flagi, których unikać w treściach i funkcjach:**
  - „protokół kliniczny”, „leczenie”, „terapia” (np. VLCKD jako terapia);
  - plany dla osób z chorobami (cukrzyca, insulinooporność, padaczka);
  - interpretacja wyników badań;
  - alarmy zdrowotne („Twoje ketony wskazują…”);
  - dawkowanie leków.
- 📋 Przy chatbocie (§8) i przy każdej nowej funkcji zadać pytanie: „czy to wspiera decyzję diagnostyczną/terapeutyczną?”.

---

## 7. Kwalifikacje i tytuły zawodowe

- **Stan faktyczny autora:** Instruktor Muay Thai (MEN) ukończony; **dietetyka kliniczna w trakcie** → nigdzie (strona, regulamin, polityka, Stories, bot) nie przedstawiać jako ukończonej i nie używać tytułu „dietetyk”.
- **Projekt ustawy o zawodzie dietetyka** (poselski, złożony w Sejmie w lipcu 2026; uznanie dietetyka za samodzielny zawód medyczny, obowiązkowy samorząd i rejestr). 📋 **Monitorować.** Po uchwaleniu tytuł i część czynności (np. układanie planów żywieniowych dla osób chorych) mogą zostać zastrzeżone. Sprawdzić wpływ na `/camp` i treść kalkulatora.
- Czynności w Campie opisywać jako trening, mentoring, edukację żywieniową, nie jako poradę dietetyczną czy medyczną.

---

## 8. Sztuczna inteligencja (AI Act) 📋 przy chatbocie (`PLAN.md` §6.6)

- **Art. 50 ust. 1, obowiązuje od 2.08.2026:** osoba rozmawiająca z systemem AI musi o tym wiedzieć **w miejscu kontaktu** (nie tylko w polityce), chyba że to oczywiste. Kary do 15 mln EUR lub 3% obrotu.
- Warunki darmowego Gemini API: **nie wysyłać danych osobowych ani wrażliwych** → bot bez profilu, wagi i bilansu, z ostrzeżeniem nad czatem.
- Bot nie może podawać się za dietetyka ani lekarza (§7) i musi odmawiać pytań medycznych (§6).
- Nowy podmiot przetwarzający → polityka, rejestr czynności, umowa powierzenia, ocena ryzyka (§2.11).

---

## 9. Działalność, podatki, faktury ❓

- **Działalność nierejestrowana (2026):** limit przychodu **10 813,50 zł na kwartał**. Po przekroczeniu działalność staje się gospodarczą od dnia przekroczenia, a wniosek do CEIDG trzeba złożyć w 7 dni. Obowiązki wobec konsumentów (regulamin, odstąpienie, reklamacje, RODO) są **takie same** jak dla firmy.
- **KSeF:** faktury dla konsumentów (B2C) **nie są obowiązkowe w KSeF**. Obowiązek KSeF dla małych firm (do 10 000 zł faktur B2B miesięcznie) od 1.01.2027. Przy płatnym Campie decyzja z księgowym: forma działalności, faktury / rachunki, ewentualnie kasa fiskalna przy sprzedaży usług osobom prywatnym.
- To temat dla **księgowego**, nie prawnika od RODO.

---

## 10. Google, domena i weryfikacja marki (powiązane z etapem 7)

Weryfikacja marki Google (ekran zgody z nazwą „Keto Thai” zamiast adresu Supabase) wymaga:
- strony głównej na **zweryfikowanej domenie**, opisującej aplikację (nie samej strony logowania);
- **polityki prywatności na tej samej domenie**, podlinkowanej na stronie głównej i na ekranie zgody (ten sam adres);
- w polityce: jak aplikacja pobiera, używa, przechowuje i udostępnia dane z kont Google.

Kolejność z `PLAN.md` §1a: domena → polityka prywatności → SMTP → „Confirm email” → weryfikacja marki.

---

## 11. Dostępność (Polski Akt o Dostępności, od 28.06.2025)

Ustawa o zapewnianiu spełniania wymagań dostępności niektórych produktów i usług **nie dotyczy usług świadczonych przez mikroprzedsiębiorców** (poniżej 10 osób i 2 mln EUR obrotu). ⏸️ Formalnie nas nie obejmuje. Mimo to WCAG to dobra praktyka i część jakości (`RAPORT.md` #8: kontrast poniżej AA w 4 miejscach). Wrócić do tego, jeśli firma urośnie albo pojawi się sprzedaż online.

---

## 12. Wizerunek i prawa autorskie

- **Wizerunek (art. 81 prawa autorskiego + RODO):** zdjęcia osób na stronie (galeria z Tajlandii, podopieczni, sparingpartnerzy) → **pisemna zgoda** z zakresem: gdzie (strona, Instagram), jak długo, w jakim celu. Wyjątek „osoba jako szczegół całości” (tłum, impreza publiczna) rzadko obejmuje portret.
- ⚠️ **Dzieci** (`/treningi-tychy`: mistrz świata WBC dzieci 2026, brązowi medaliści): zgoda **rodziców/opiekunów**, a dobrą praktyką (stanowisko Rzecznika Praw Dziecka) jest też zapytanie dziecka. Zgoda konkretna: zdjęcie, miejsce publikacji, czas. Rozważyć publikację bez twarzy albo tylko z imieniem.
- **Zdjęcia przepisów:** licencja CC0 ✅. Trzymać ślad pochodzenia (skąd, jaka licencja) przy każdym pliku.
- **Dane USDA (CC0):** atrybucja niewymagana prawnie, ale prośba USDA o wzmiankę (`PROGRES.md`, pkt 9 listy).
- **Przepisy r51–r100:** pisane od nowa, nie kopiowane ✅ (sam przepis jako lista składników nie jest chroniony, ale tekst opisu i zdjęcia już tak).
- **Fonty:** licencja SIL OFL pozwala hostować u siebie ✅ (§2.10).

---

## 13. Lista zadań

### 🔴 Kod (przed startem kont)
1. **Zgody przy Google: wariant C** (§14). ✅ 2026-10-08 (test furtki z nowym kontem Google do zrobienia).
2. **Zapis zgód w bazie** (tabela: `user_id`, rodzaj zgody, wersja tekstu, data, źródło) — luka nr 8. ✅ 2026-10-08.
3. **Etap 6 czeka na zgodę:** żadne dane o zdrowiu nie idą do bazy, dopóki konto nie ma zapisanej zgody art. 9. ✅ 2026-10-08 (bramka w `main.js` przed `syncWithAccountData()`).
4. **Fonty i biblioteki w paczce Vite** (Google Fonts, Lucide, Chart.js) zamiast CDN.
5. **Linki do polityki i regulaminu** przy zgodach (`account.js:406`, TODO) i w stopce.
6. Eksport danych („Pobierz moje dane”), minimum: procedura mailowa.
7. Decyzja o „Cofnij zgodę” (§2.3).

### 🔴 Dokumenty
8. Polityka prywatności (§2.4).
9. Regulamin aplikacji (§4).
10. Rejestr czynności przetwarzania (§2.8) — wewnętrzny.
11. Procedura i rejestr naruszeń (§2.12) — wewnętrzne.
12. Notatka: brak IOD + analiza ryzyka (§2.7, §2.11) — wewnętrzna.
13. Zaakceptowane umowy powierzenia (DPA): Supabase, Web3Forms, później SMTP.
14. Regulamin Campu + pouczenie i formularz odstąpienia (§5.2) — przed pierwszą płatną umową.
15. Wzór zgody na wizerunek (dorośli / rodzice dzieci) (§12).

### 🟠 Treści i marketing
16. Przegląd copy: „leczy” i podobne (§5.3, §6), obietnice wydolnościowe (ISSN).
17. Usunięcie fikcji: BATCH #04, VIP ACCESS, #KT-8842-PRO (§5.3).
18. Oznaczanie autopromocji w Stories (§5.4).

### 🟡 Organizacyjne
19. 2FA na Supabase, GitHub, Google Cloud i skrzynce e-mail (§2.12).
20. Nawyk / filtr usuwania starych zgłoszeń z `/camp` i `/contact` w skrzynce (§2.5).
21. Forma działalności i faktury — z księgowym (§9).
22. **Przegląd całości u prawnika** (RODO + prawo konsumenckie) przed startem kont.

---

## 14. Dziennik decyzji

### 2026-10-08: zgody przy rejestracji przez Google — wariant C (A + B)
- **Problem:** oba przyciski Google wołają `signInWithOAuth()`, a Supabase przy pierwszym logowaniu OAuth po cichu zakłada konto. Rejestracja („Kontynuuj z Google”) sprawdzała checkboxy ręcznie, ale stały one pod przyciskiem, a zgoda nigdzie się nie zapisywała. „Zaloguj przez Google” na ekranie logowania zakłada konto **bez żadnej zgody**, a po etapie 6 (S1) dane o zdrowiu gościa trafiają wtedy do bazy automatycznie. (Sprostowanie: w rozmowie 2026-10-08 Claude najpierw błędnie twierdził, że rejestracja przez Google pomija zgody.)
- **Decyzja (wybór autora: „pewność prawna i wygoda”):**
  - **A** — checkboxy zgód **nad** przyciskami na ekranie rejestracji; Google nieaktywny, dopóki nie są zaznaczone. Zgoda zaznaczona przed Google jest zapamiętywana na czas wyjścia do Google i powrotu (`sessionStorage`) i zapisywana w bazie po powrocie.
  - **B** — **bramka po zalogowaniu:** po każdym logowaniu (e-mail, Google, dowolny ekran) sprawdzamy w bazie zapisaną zgodę art. 9 (w aktualnej wersji tekstu). Brak → ekran zgód; etap 6 (przeniesienie danych gościa) i zapisy danych o zdrowiu czekają.
- **Odrzucone:** samo A (furtka przez ekran logowania, brak dowodu), samo B (zgody widziane dwa razy przy rejestracji e-mailem), D (wyłączenie rejestracji przez Google: brak prostego przełącznika w Supabase, utrata najwygodniejszej drogi).
- **Zależność:** wymaga tabeli zgód w bazie (luka nr 8) → najpierw baza, potem kod.

---

## 15. Otwarte pytania (do autora / prawnika / księgowego)

1. Forma działalności, dane administratora, e-mail do spraw danych. *(autor)*
2. Czy Camp jest płatny, jak przyjmowana jest płatność, kto wystawia dokumenty? *(autor, księgowy)*
3. Treść zgody art. 9: czy obecne zdanie wystarcza? *(prawnik)*
4. Cofnięcie zgody = usunięcie konta, czy potrzebna osobna ścieżka? *(prawnik)*
5. Web3Forms (Indie/USA) zostaje czy zmiana na dostawcę z UE? *(autor)*
6. Czy Supabase ma certyfikat Data Privacy Framework i jaką podstawę transferu wskazać w polityce? *(sprawdzić na dataprivacyframework.gov + DPA Supabase)*
7. Okres przechowywania zapisu zgód po usunięciu konta (dowód vs minimalizacja). *(prawnik)*
8. Pole `sport` w profilu: usunąć czy użyć? *(autor)*
9. Czy przy wiadomościach w `/camp` (mogą zawierać dane o zdrowiu) potrzebna zgoda art. 9? *(prawnik)*

---

## 16. Źródła (sprawdzone 2026-10-08)

- RODO (rozporządzenie 2016/679): art. 4, 6, 7, 9, 13, 17, 20, 22, 25, 30, 32–35, 37.
- Dane o zdrowiu, dieta: [fitmesh.fit: RODO a dane fitness](https://www.fitmesh.fit/pl/blog/rodo-dane-fitness-smartwatch), [kluczesoft.pl: art. 9 RODO](https://kluczesoft.pl/wiedza/bezpieczenstwo/art-9-rodo), [prawo.pl: darmowe aplikacje a dane](https://www.prawo.pl/samorzad/darmowe-aplikacje-naszymi-danymi-placimy-czesto-za-nie,501306.html)
- Rejestr czynności: [poradnikprzedsiebiorcy.pl](https://poradnikprzedsiebiorcy.pl/-rejestr-czynnosci-przetwarzania-czyli-centrum-utrzymania-zgodnosci-z-rodo-w-firmie), [legiscope.com](https://www.legiscope.com/blog/rejestr-czynnosci-przetwarzania-rcp.html)
- Naruszenia: [legiscope.com: art. 33](https://www.legiscope.com/blog/rodo-artykul-33-zgloszenie-naruszenia.html), [poradnikprzedsiebiorcy.pl](https://poradnikprzedsiebiorcy.pl/-incydent-bezpieczenstwa-i-procedura-zglaszania-naruszen-rodo)
- IOD: [infor.pl](https://ksiegowosc.infor.pl/obrot-gospodarczy/dzialalnosc-gospodarcza/2737184,Obowiazek-ustanowienia-IOD-Inspektora-Ochrony-Danych.html)
- Wykaz operacji wymagających DPIA: [UODO](https://uodo.gov.pl/pl/file/2719), [M.P. 2018 poz. 827](https://eli.gov.pl/eli/MP/2018/827/ogl/pol/pdf)
- Prawo komunikacji elektronicznej: [art. 398–400, edlaw](https://edlaw.eduverse.com/docs/jurisdiction/nat/pl/pke), [standardyprawa.pl art. 399](https://standardyprawa.pl/akt/532/art/63604), [legeartis: marketing](https://czasopismo.legeartis.org/2024/08/przesylanie-informacji-handlowych-prawo-komunikacji-elektronicznej-uprzednia-zgoda-marketing-bezposredni/), [ifirma: zgoda marketingowa](https://www.ifirma.pl/blog/zgoda-marketingowa-jak-prawidlowo-uzyskac-zgode-na-wysylanie-ofert/)
- UŚUDE art. 8: [lexlege.pl](https://lexlege.pl/ustawa-o-swiadczeniu-uslug-droga-elektroniczna/art-8/)
- Usługi cyfrowe za dane: [legeartis](https://czasopismo.legeartis.org/2022/12/dostarczanie-tresci-cyfrowej-uslugi-cyfrowej-ustawa-prawach-konsmenta/), [PARP](https://www.parp.gov.pl/component/content/article/83623:dyrektywa-omnibus-platnosc-danymi-osobowymi)
- Odstąpienie od umowy o usługę: [poradnikprzedsiebiorcy.pl](https://poradnikprzedsiebiorcy.pl/-odstapienie-od-umowy-w-przypadku-uslug-elektronicznych-jak-sie-zabezpieczyc)
- Nieuczciwe praktyki art. 7: [lexlege.pl](https://lexlege.pl/ustawa-o-przeciwdzialaniu-nieuczciwym-praktykom-rynkowym/art-7/), [decyzja UOKiK RPZ 3/2023](https://decyzje.uokik.gov.pl/bp/dec_prez.nsf/43104c28a7a1be23c1257eac006d8dd4/18822abccfead282c12589fe0033d4e4/$FILE/Decyzja%20nr%20RPZ%203_2023%20z%2003.07.2023%20-%20(Polmediq%20Krzysztof%20i%20Martyna%20Polus)%20-%20ZIK.pdf)
- Omnibus, opinie: [poradnikprzedsiebiorcy.pl](https://poradnikprzedsiebiorcy.pl/-dyrektywa-omnibus-a-publikacja-opinii-o-produktach-i-uslugach), [PARP](https://www.parp.gov.pl/component/content/article/83340:dyrektywa-omnibus-nowe-obowiazki-dla-e-sprzedawcow-oraz-internetowych-platform-handlowych)
- Influencerzy: [Taylor Wessing: rekomendacje UOKiK](https://www.taylorwessing.com/en/insights-and-events/insights/2022/09/influencer-marketing---new-recommendations-from-the-polish-consumer-protection-authority), [e-prawnik.pl](https://e-prawnik.pl/artykuly/oznaczanie-tresci-reklamowych-przez-influencerow-w-mediach-spolecznosciowych-.html)
- MDR / wellness: [Mason Hayes & Curran](https://mhc.ie/latest/insights/health-and-fitness-apps-v-medical-devices), [Forvis Mazars 3/2025](https://www.forvismazars.com/de/en/who-we-are/news/press-media/newsletters/newsletter-healthcare/newsletter-healthcare-3-2025/klassifizierung-medizinischer-software), [rp.pl: aplikacje zdrowotne](https://pro.rp.pl/biznes/art40928871-jakim-ograniczeniom-podlegaja-zdrowotne-aplikacje-mobilne)
- Zawód dietetyka: [SUM](https://sum.edu.pl/pl/wiadomosci/ogolne/projekt-ustawy-o-zawodzie-dietetyka-i-samorzadzie-zawodowym-dietetykow-zlozony-w-sejmie-rp), [GazetaPrawna](https://www.gazetaprawna.pl/prawnik/legislacja/artykuly/11277968,ustawa-o-zawodzie-dietetyka-zmiany-przepisy.html), [Rynek Zdrowia](https://www.rynekzdrowia.pl/Prawo/Ustawa-o-zawodzie-dietetyka-coraz-blizej-Projekt-krytykuja-pielegniarki-chodzi-o-standard-ksztalcenia,279815,2.html)
- AI Act art. 50: [SecurePrivacy](https://secureprivacy.ai/blog/eu-ai-act-article-50-transparency-obligations-for-chatbots-and-deepfakes-2026), [jorijn.com](https://jorijn.com/en/blog/eu-ai-act-website-chatbot-disclosure-august-2026/)
- Dostępność: [gov.pl: Polski Akt o Dostępności](https://www.gov.pl/web/dostepnosc-cyfrowa/polski-akt-o-dostepnosci--uslugi-handlu-elektronicznego), [poradnikprzedsiebiorcy.pl](https://poradnikprzedsiebiorcy.pl/-wymagania-dostepnosci-produktow-i-uslug-dla-osob-z-niepelnosprawnosciami)
- Google Fonts: [IHK: LG München 3 O 17493/20](https://www.ihk.de/bergische/recht-und-steuern/wettbewerbsrecht/google-fonts-5646176)
- Supabase: [DPA](https://supabase.com/legal/customer-resources/data-processing-addendum), [DPA PDF 2026-06](https://supabase.com/downloads/docs/Supabase+DPA+260601.pdf)
- Web3Forms: [FAQ](https://docs.web3forms.com/getting-started/faq), [DPA](https://web3forms.com/dpa)
- GitHub Pages i logi IP: [przykładowa polityka](https://earthsystemdatalab.net/privacy-policy/)
- Weryfikacja Google: [wymagania weryfikacji](https://support.google.com/cloud/answer/13464321?hl=pl)
- Działalność nierejestrowana 2026: [money.pl](https://direct.money.pl/artykuly/porady/dzialalnosc-nierejestrowana-2026-limit-10-813,50-zl,-po-przekroczeniu-7-dni-na-ceidg), [poradnikprzedsiebiorcy.pl](https://poradnikprzedsiebiorcy.pl/-czym-jest-dzialalnosc-nierejestrowana-co-mowi-o-niej-ustawa)
- KSeF: [prawo.pl](https://www.prawo.pl/podatki/ksef-dla-malych-firm-kto-skorzysta-z-odroczenia,535551.html), [ifirma: KSeF w e-commerce](https://www.ifirma.pl/blog/ksef-w-e-commerce-faktury-b2b-oraz-b2c-w-sprzedazy-online-i-inne-obowiazki-zwiazane-z-krajowym-systemem-e-faktur-od-2026/)
- Wizerunek dziecka: [Grant Thornton](https://grantthornton.pl/publikacja/wizerunek-dziecka-w-internecie-co-powinien-wiedziec-biznes/), [Rzecznik Praw Dziecka](https://brpd.gov.pl/wp-content/uploads/2024/12/Artykul-_Wizerunek-dziecka_-nauczyciele.pdf)
