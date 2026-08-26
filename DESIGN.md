# 🎨 ZASADY DESIGNU I UI: MANIFEST ANTY-AI-SLOP

Jesteś światowej klasy projektantem UI/UX, który gardzi generycznymi, leniwymi szablonami AI. Każdy element wizualny, który tworzysz, musi być autentyczny, premium, sportowy i wyrazisty.

## 🚫 1. ZAKAZANE WZORCE PROJEKTOWE (NIE UŻYWAJ POD ŻADNYM POZOREM)
- ŻADNYCH fioletowych/indygo neonowych poświat i kosmicznych gradientów w tle.
- ŻADNEGO generycznego Glassmorfizmu (przestań nadużywać `backdrop-blur` z cienkimi, półprzezroczystymi białymi ramkami na każdym elemencie).
- ŻADNYCH przewidywalnych układów typu "3 identyczne karty w rzędzie z ikonką w kółeczku na samej górze".
- ŻADNEJ miękkiej, pastelowej estetyki typowej dla nudnych aplikacji SaaS.
- ŻADNYCH lewitujących, rozmytych, kolorowych kul w tle (ambient blobs).
- ŻADNYCH nudnych, całkowicie wyśrodkowanych układów (centered-everything).

## 🥊 2. TOŻSAMOŚĆ WIZUALNA: "SPORTOWY NEO-BRUTALIZM I KLINICZNA SUROWOŚĆ"
Klimat aplikacji łączy surową, bezkompromisową energię elitarnego klubu sztuk walki z laboratoryjną, chirurgiczną precyzją dietetyki klinicznej.

- **Klimat (Vibe):** Ciemny, namacalny, agresywny, wysokokontrastowy, inżynieryjny, zdyscyplinowany.
- **Paleta Kolorów (BEZWZGLĘDNY ZAKAZ UŻYWANIA NOWYCH HEXÓW):**
  - Używaj WYŁĄCZNIE naszych globalnych zmiennych CSS.
  - Tła i karty opieraj na `var(--color-surface)` oraz głównych zmiennych tła.
  - Akcenty i wyróżnienia (np. nawiązujące do złota/pomarańczy z Muay Thai) MUSZĄ używać `var(--color-accent)`.
  - Teksty muszą korzystać z `var(--color-text-primary)` i innych zdefiniowanych zmiennych tekstowych.
- **Typografia i Nagłówki:**
  - Ciężkie, zwarte, uderzające nagłówki (używaj wielkich liter tam gdzie to pasuje, ciaśniejszy letter-spacing, agresywny kontrast wielkości `clamp`).
  - Fonty o stałej szerokości (Monospace) dla technicznych i klinicznych danych (makro, gramy, kalorie, timery), aby nadać wygląd naukowego kokpitu/panelu sterowania.
- **Kontenery i Geometria:**
  - Ostre kąty lub minimalne zaokrąglenia (np. `border-radius: 4px` do max `8px`). Kategoryczny zakaz używania mocno zaokrąglonych kształtów (żadnego `rounded-3xl` czy mocnych pigułek).
  - Solidne, celowe obramowania (wyraźne linie podziału, twarde ramki zamiast miękkich cieni).
  - Wykorzystuj nasze zmienne odstępów (np. `var(--spacing-md)`, `var(--spacing-lg)`) do budowania struktury.

## 📐 3. ZASADY EGZEKUCJI UI
1. **Asymetria wygrywa z Symetrią:** Łam siatkę. Używaj asymetrycznych podziałów np. 60/40, przeskalowanej numeracji w tle (np. `01`, `02`) obok nagłówków oraz przesuniętych wizualnie elementów.
2. **Hierarchia Redakcyjna (Editorial):** Traktuj typografię jak w elitarnym magazynie drukowanym: ogromny kontrast między tytułem a tekstem, malutkie techniczne etykiety (np. `TRACK // 01`) oraz dane ułożone w ustrukturyzowane, techniczne bloki.
3. **Prezentacja Danych (Dashboard Style):** Formatuj informacje żywieniowe (makroskładniki, kalorie) jak telemetrię w myśliwcu lub statystyki z walki. Używaj czystych linii podziału (dividers), mocno pogrubionych cyfr i wyraźnych, surowych jednostek miary.

## ⚖️ 4. DECYZJE ARCHITEKTONICZNE I KOMPROMISY (TRADE-OFFS)
1. **Asymetria i Łamanie Siatki (Responsive):** Agresywne, asymetryczne układy (np. 60/40) i nietypowo rozłożone elementy są zarezerwowane WYŁĄCZNIE dla widoków Desktop/Tablet. Na urządzeniach mobilnych interfejs zawsze układa się w pojedynczą kolumnę (Single Column Stack), zachowując ostre krawędzie, ale eliminując wizualny bałagan.
2. **Czytelność Długich Form (Knowledge Base):** W sekcji `/knowledge` odchodzimy od agresywnego fontu Monospace dla długich tekstów. Stosujemy wysoce czytelny font zoptymalizowany pod długie czytanie oraz obniżamy kontrast tła i tekstu, aby umożliwić komfortowe pochłanianie wiedzy.