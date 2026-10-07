// Jednorazowy generator bazy produktów — NIE jest częścią bundla aplikacji.
// Czyta CSV z USDA FoodData Central (SR Legacy, 2018-04) i zapisuje
// src/data/productsData.js. Uruchamiany ręcznie, wynik commitowany.
//
// Dane USDA: domena publiczna, CC0 1.0 (fdc.nal.usda.gov/api-guide).
// USDA prosi o podanie źródła — robi to nagłówek wygenerowanego pliku.
//
// Użycie:
//   1. Pobierz i rozpakuj:
//      https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip
//   2. node scripts/build-products.js <ścieżka do rozpakowanego folderu z CSV>

import fs from "node:fs";
import path from "node:path";

// Identyfikatory składników w nutrient.csv USDA
const NUTRIENT_IDS = {
    1008: "calories", // Energy, KCAL
    1003: "protein", // Protein, G
    1004: "fats", // Total lipid (fat), G
    1005: "carbs", // Carbohydrate, by difference, G — ZAWIERA błonnik (PROGRES.md pkt 33)
    1079: "fiber", // Fiber, total dietary, G
};

// Kategorie, w których produkt nie może zawierać błonnika (tkanka zwierzęca).
// Gdy USDA nie podaje wartości, wpisujemy 0 zamiast "brak danych".
const ANIMAL_CATEGORIES = new Set(["Mięso", "Ryby i owoce morza", "Jaja", "Nabiał"]);

// Miary domowe (`portions`): polska etykieta + wskazanie wiersza w food_portion.csv
// USDA przez jego pole `modifier`. Gramów NIE wpisujemy ręcznie — skrypt czyta je
// z CSV (gram_weight / amount), więc nie ma tu miejsca na literówkę.
//   usda   — dokładny tekst `modifier` z food_portion.csv (np. "tbsp", "large")
//   divide — dzielnik, gdy liczba sztuk siedzi w opisie, a nie w polu `amount`
//            ("oz (14 halves)"), albo gdy liczymy mniejszą miarę z większej
//            (łyżeczka = łyżka / 3 — w USA 1 tbsp = 3 tsp z definicji).
//            Pole `amount` ("5 slices", "2 tbsp") skrypt dzieli sam — nie dublować.
//   fdcId  — inny rekord USDA tylko dla wagi (makro zostaje z produktu)
// Zasada doboru: tylko miary, których realnie używa się w polskiej kuchni,
// i tylko gdy waga z USDA pasuje do tego, co kupuje się w Polsce. Plaster sera
// (USDA: 28 g, polski z paczki: ok. 15–20 g) czy puszka tuńczyka — pominięte.
const TBSP = { label: "łyżka", usda: "tbsp" };
const TSP = { label: "łyżeczka", usda: "tsp" };
const TSP_FROM_TBSP = { label: "łyżeczka", usda: "tbsp", divide: 3 };

// Ręcznie wybrana lista: polska nazwa, kategoria, rekord USDA, opcjonalnie miary.
const PRODUCTS = [
    // Mięso
    { fdcId: 171077, name: "Pierś z kurczaka bez skóry", category: "Mięso" },
    { fdcId: 173627, name: "Udko z kurczaka bez skóry", category: "Mięso" },
    { fdcId: 171098, name: "Pierś z indyka", category: "Mięso" },
    { fdcId: 171796, name: "Wołowina mielona (15% tłuszczu)", category: "Mięso" },
    { fdcId: 168612, name: "Antrykot wołowy (rib eye)", category: "Mięso" },
    { fdcId: 169542, name: "Polędwica wołowa", category: "Mięso" },
    { fdcId: 167843, name: "Łopatka wieprzowa", category: "Mięso" },
    { fdcId: 168286, name: "Schab wieprzowy bez kości", category: "Mięso" },
    { fdcId: 167812, name: "Boczek wieprzowy surowy", category: "Mięso" },
    { fdcId: 172551, name: "Comber jagnięcy", category: "Mięso" },
    { fdcId: 171060, name: "Wątróbka drobiowa", category: "Mięso" },
    { fdcId: 169451, name: "Wątróbka wołowa", category: "Mięso" },

    // Ryby i owoce morza
    { fdcId: 175167, name: "Łosoś atlantycki hodowlany", category: "Ryby i owoce morza" },
    { fdcId: 173686, name: "Łosoś atlantycki dziki", category: "Ryby i owoce morza" },
    { fdcId: 175119, name: "Makrela atlantycka", category: "Ryby i owoce morza" },
    { fdcId: 175116, name: "Śledź atlantycki", category: "Ryby i owoce morza" },
    { fdcId: 175139, name: "Sardynki w oleju (odsączone)", category: "Ryby i owoce morza", portions: [{ label: "sardynka", usda: "sardines" }] },
    { fdcId: 171986, name: "Tuńczyk w wodzie (odsączony)", category: "Ryby i owoce morza" },
    { fdcId: 171955, name: "Dorsz atlantycki", category: "Ryby i owoce morza" },
    { fdcId: 173717, name: "Pstrąg tęczowy", category: "Ryby i owoce morza" },
    { fdcId: 175179, name: "Krewetki surowe", category: "Ryby i owoce morza" },
    { fdcId: 174216, name: "Małże", category: "Ryby i owoce morza" },
    { fdcId: 174223, name: "Kalmary", category: "Ryby i owoce morza" },

    // Jaja
    // Klasy UE (S/M/L) to masa ZE skorupką, USDA podaje część jadalną. Skorupka to
    // ok. 10–12% masy, więc M (53–63 g) ≈ USDA large (50 g), L (63–73 g) ≈ extra large,
    // S (< 53 g) ≈ medium. Przybliżenie — do potwierdzenia u źródła (PROGRES.md).
    {
        fdcId: 171287,
        name: "Jajko kurze",
        category: "Jaja",
        portions: [
            { label: "jajko M", usda: "large" },
            { label: "jajko L", usda: "extra large" },
            { label: "jajko S", usda: "medium" },
        ],
    },
    { fdcId: 172184, name: "Żółtko jaja", category: "Jaja", portions: [{ label: "żółtko (z jajka M)", usda: "large" }] },
    { fdcId: 172183, name: "Białko jaja", category: "Jaja", portions: [{ label: "białko (z jajka M)", usda: "large" }] },

    // Nabiał
    { fdcId: 173430, name: "Masło niesolone", category: "Nabiał", portions: [TBSP, TSP_FROM_TBSP] },
    { fdcId: 173412, name: "Masło klarowane (ghee)", category: "Nabiał", portions: [TBSP, TSP_FROM_TBSP] },
    { fdcId: 170859, name: "Śmietanka 36%", category: "Nabiał", portions: [TBSP] },
    { fdcId: 171257, name: "Śmietana kwaśna (ok. 19%)", category: "Nabiał", portions: [TBSP] },
    { fdcId: 171304, name: "Jogurt grecki pełnotłusty", category: "Nabiał" },
    { fdcId: 172179, name: "Serek wiejski (cottage)", category: "Nabiał" },
    { fdcId: 170845, name: "Mozzarella pełnotłusta", category: "Nabiał" },
    { fdcId: 173414, name: "Ser cheddar", category: "Nabiał" },
    { fdcId: 170848, name: "Parmezan", category: "Nabiał" },
    { fdcId: 173420, name: "Ser feta", category: "Nabiał" },
    { fdcId: 172177, name: "Ser brie", category: "Nabiał" },
    { fdcId: 173435, name: "Ser kozi miękki", category: "Nabiał" },
    { fdcId: 173418, name: "Serek śmietankowy", category: "Nabiał", portions: [TBSP] },
    { fdcId: 171251, name: "Ser ementaler", category: "Nabiał" },

    // Tłuszcze
    { fdcId: 171413, name: "Oliwa z oliwek", category: "Tłuszcze", portions: [{ label: "łyżka", usda: "tablespoon" }, TSP] },
    { fdcId: 171412, name: "Olej kokosowy", category: "Tłuszcze", portions: [TBSP, TSP] },
    { fdcId: 173573, name: "Olej z awokado", category: "Tłuszcze", portions: [TBSP, TSP] },
    { fdcId: 171016, name: "Olej sezamowy", category: "Tłuszcze", portions: [{ label: "łyżka", usda: "tablespoon" }, TSP] },
    { fdcId: 171401, name: "Smalec", category: "Tłuszcze", portions: [TBSP, TSP_FROM_TBSP] },
    {
        fdcId: 170173,
        name: "Mleko kokosowe (puszka)",
        category: "Tłuszcze",
        portions: [TBSP, { label: "szklanka (240 ml)", usda: "cup" }],
    },

    // Warzywa
    // Waga z rekordu "Avocados, raw, California" (Hass — odmiana w polskich sklepach):
    // 136 g miąższu, 22 pomiary. Rekord "all commercial varieties" podaje 201 g, bo
    // uśrednia z florydzkimi (304 g) — zawyżałby kalorie o ok. 48%.
    {
        fdcId: 171705,
        name: "Awokado",
        category: "Warzywa",
        portions: [{ label: "awokado Hass (bez skórki i pestki)", usda: "fruit, without skin and seed", fdcId: 171706 }],
    },
    { fdcId: 168462, name: "Szpinak", category: "Warzywa" },
    { fdcId: 168421, name: "Jarmuż", category: "Warzywa" },
    { fdcId: 169387, name: "Rukola", category: "Warzywa" },
    { fdcId: 169247, name: "Sałata rzymska", category: "Warzywa" },
    { fdcId: 170379, name: "Brokuł", category: "Warzywa" },
    { fdcId: 169986, name: "Kalafior", category: "Warzywa", portions: [{ label: "różyczka", usda: "floweret" }] },
    {
        fdcId: 169291,
        name: "Cukinia",
        category: "Warzywa",
        portions: [
            { label: "cukinia średnia", usda: "medium" },
            { label: "cukinia mała", usda: "small" },
            { label: "cukinia duża", usda: "large" },
        ],
    },
    { fdcId: 169228, name: "Bakłażan", category: "Warzywa" },
    {
        fdcId: 170427,
        name: "Papryka zielona",
        category: "Warzywa",
        portions: [
            { label: "papryka średnia", usda: "medium (approx 2-3/4 long, 2-1/2 dia)" },
            { label: "papryka mała", usda: "small" },
            { label: "papryka duża", usda: "large (2-1/4 per lb, approx 3-3/4 long, 3 dia)" },
        ],
    },
    {
        fdcId: 170108,
        name: "Papryka czerwona",
        category: "Warzywa",
        portions: [
            { label: "papryka średnia", usda: "medium (approx 2-3/4 long, 2-1/2 dia.)" },
            { label: "papryka mała", usda: "small" },
            { label: "papryka duża", usda: "large (2-1/4 per pound, approx 3-3/4 long, 3 dia.)" },
        ],
    },
    {
        fdcId: 168409,
        name: "Ogórek ze skórką",
        category: "Warzywa",
        portions: [{ label: "ogórek długi (ok. 21 cm)", usda: "cucumber (8-1/4)" }],
    },
    {
        fdcId: 170457,
        name: "Pomidor",
        category: "Warzywa",
        portions: [
            { label: "pomidor średni", usda: "medium whole (2-3/5 dia)" },
            { label: "pomidor mały", usda: "small whole (2-2/5 dia)" },
            { label: "pomidor duży", usda: "large whole (3 dia)" },
            { label: "pomidorek koktajlowy", usda: "cherry" },
        ],
    },
    {
        fdcId: 169251,
        name: "Pieczarki",
        category: "Warzywa",
        portions: [
            { label: "pieczarka średnia", usda: "medium" },
            { label: "pieczarka duża", usda: "large" },
        ],
    },
    { fdcId: 168389, name: "Szparagi", category: "Warzywa", portions: [{ label: "szparag", usda: "spear, medium (5-1/4 to 7 long)" }] },
    { fdcId: 169961, name: "Fasolka szparagowa", category: "Warzywa", portions: [{ label: "strąk", usda: "beans (4 long)" }] },
    { fdcId: 169975, name: "Kapusta biała", category: "Warzywa", portions: [{ label: "liść", usda: "leaf, medium" }] },
    { fdcId: 170390, name: "Pak choi", category: "Warzywa" },
    { fdcId: 169979, name: "Kapusta pekińska", category: "Warzywa" },
    { fdcId: 169957, name: "Kiełki fasoli mung", category: "Warzywa" },
    {
        fdcId: 169276,
        name: "Rzodkiewka",
        category: "Warzywa",
        portions: [
            { label: "rzodkiewka średnia", usda: "medium (3/4 to 1 dia)" },
            { label: "rzodkiewka duża", usda: "large (1 to 1-1/4 dia)" },
        ],
    },
    { fdcId: 169988, name: "Seler naciowy", category: "Warzywa", portions: [{ label: "łodyga", usda: "stalk, medium (7-1/2 - 8 long)" }] },
    {
        fdcId: 170000,
        name: "Cebula",
        category: "Warzywa",
        portions: [
            { label: "cebula średnia", usda: "medium (2-1/2 dia)" },
            { label: "cebula mała", usda: "small" },
            { label: "cebula duża", usda: "large" },
            { label: "łyżka posiekanej", usda: "tbsp chopped" },
        ],
    },
    { fdcId: 169230, name: "Czosnek", category: "Warzywa", portions: [{ label: "ząbek", usda: "clove" }] },
    { fdcId: 169279, name: "Kapusta kiszona", category: "Warzywa" },
    { fdcId: 169094, name: "Oliwki czarne", category: "Warzywa", portions: [{ label: "oliwka", usda: "large" }] },
    { fdcId: 169096, name: "Oliwki zielone", category: "Warzywa", portions: [{ label: "oliwka", usda: "olive" }] },
    // USDA: 1 papryczka = 45 g — duża odmiana; tajskie chili waży kilka gramów. Bez miary.
    { fdcId: 170106, name: "Papryczka chili", category: "Warzywa" },
    {
        fdcId: 169231,
        name: "Imbir świeży",
        category: "Warzywa",
        portions: [
            { label: "łyżeczka tartego", usda: "tsp" },
            { label: "plasterek", usda: "slices (1 dia)" },
        ],
    },
    { fdcId: 169997, name: "Kolendra świeża", category: "Warzywa" },
    { fdcId: 172232, name: "Bazylia świeża", category: "Warzywa" },

    // Orzechy i nasiona
    { fdcId: 170567, name: "Migdały", category: "Orzechy i nasiona", portions: [{ label: "migdał", usda: "almond" }] },
    {
        fdcId: 170187,
        name: "Orzechy włoskie",
        category: "Orzechy i nasiona",
        portions: [{ label: "połówka orzecha", usda: "oz (14 halves)", divide: 14 }],
    },
    { fdcId: 170178, name: "Orzechy makadamia", category: "Orzechy i nasiona" },
    {
        fdcId: 170182,
        name: "Orzechy pekan",
        category: "Orzechy i nasiona",
        portions: [{ label: "połówka orzecha", usda: "oz (19 halves)", divide: 19 }],
    },
    { fdcId: 170581, name: "Orzechy laskowe", category: "Orzechy i nasiona", portions: [{ label: "orzech", usda: "nuts" }] },
    { fdcId: 170569, name: "Orzechy brazylijskie", category: "Orzechy i nasiona", portions: [{ label: "orzech", usda: "kernel" }] },
    { fdcId: 170554, name: "Nasiona chia", category: "Orzechy i nasiona" },
    {
        fdcId: 169414,
        name: "Siemię lniane",
        category: "Orzechy i nasiona",
        portions: [
            { label: "łyżka (całe)", usda: "tbsp, whole" },
            { label: "łyżka (mielone)", usda: "tbsp, ground" },
            { label: "łyżeczka (całe)", usda: "tsp, whole" },
            { label: "łyżeczka (mielone)", usda: "tsp, ground" },
        ],
    },
    { fdcId: 170556, name: "Pestki dyni", category: "Orzechy i nasiona" },
    { fdcId: 170150, name: "Sezam", category: "Orzechy i nasiona", portions: [TBSP, TSP_FROM_TBSP] },
    { fdcId: 168588, name: "Masło migdałowe", category: "Orzechy i nasiona", portions: [TBSP, TSP_FROM_TBSP] },
    { fdcId: 170170, name: "Wiórki kokosowe niesłodzone", category: "Orzechy i nasiona" },
    { fdcId: 170189, name: "Tahini (pasta sezamowa)", category: "Orzechy i nasiona", portions: [TBSP, TSP_FROM_TBSP] },
    { fdcId: 170148, name: "Nasiona konopi łuskane", category: "Orzechy i nasiona", portions: [TBSP] },

    // Owoce
    { fdcId: 167755, name: "Maliny", category: "Owoce", portions: [{ label: "malina", usda: "raspberries" }] },
    {
        fdcId: 167762,
        name: "Truskawki",
        category: "Owoce",
        portions: [
            { label: "truskawka średnia", usda: "medium (1-1/4 dia)" },
            { label: "truskawka duża", usda: "large (1-3/8 dia)" },
        ],
    },
    { fdcId: 173946, name: "Jeżyny", category: "Owoce" },
    // Rekord USDA to cytryna bez skórki — stąd dopisek w etykiecie.
    {
        fdcId: 167746,
        name: "Cytryna",
        category: "Owoce",
        portions: [
            { label: "cytryna mała (bez skórki)", usda: "fruit (2-1/8 dia)" },
            { label: "cytryna duża (bez skórki)", usda: "fruit (2-3/8 dia)" },
        ],
    },
    { fdcId: 168155, name: "Limonka", category: "Owoce", portions: [{ label: "limonka", usda: "fruit (2 dia)" }] },

    // Dodatki
    { fdcId: 172475, name: "Tofu twarde", category: "Dodatki" },
    { fdcId: 174531, name: "Sos rybny", category: "Dodatki", portions: [TBSP, TSP_FROM_TBSP] },
    { fdcId: 174278, name: "Sos sojowy tamari", category: "Dodatki", portions: [TBSP, TSP] },
    { fdcId: 169593, name: "Kakao niesłodzone", category: "Dodatki", portions: [TBSP, TSP_FROM_TBSP] },

    // ---------- Rozszerzenie bazy (2026-09-25): kolejne 100 produktów ----------

    // Mięso
    { fdcId: 172390, name: "Skrzydełka z kurczaka ze skórą", category: "Mięso" },
    { fdcId: 172373, name: "Podudzie z kurczaka ze skórą", category: "Mięso" },
    { fdcId: 172385, name: "Udko z kurczaka ze skórą", category: "Mięso" },
    { fdcId: 171505, name: "Indyk mielony", category: "Mięso" },
    { fdcId: 168372, name: "Wieprzowina mielona (16% tłuszczu)", category: "Mięso" },
    { fdcId: 172410, name: "Kaczka bez skóry", category: "Mięso" },
    { fdcId: 173855, name: "Jelenina", category: "Mięso" },
    { fdcId: 172521, name: "Królik", category: "Mięso" },
    { fdcId: 172570, name: "Cielęcina (gicz)", category: "Mięso" },
    { fdcId: 168625, name: "Serce wołowe", category: "Mięso" },
    { fdcId: 170196, name: "Ozór wołowy", category: "Mięso" },
    { fdcId: 167862, name: "Wątróbka wieprzowa", category: "Mięso" },
    { fdcId: 167853, name: "Żeberka wieprzowe", category: "Mięso" },
    { fdcId: 168666, name: "Mostek wołowy (brisket)", category: "Mięso" },
    { fdcId: 168726, name: "Rostbef (top sirloin)", category: "Mięso" },
    { fdcId: 174311, name: "Udziec jagnięcy", category: "Mięso" },

    // Ryby i owoce morza
    { fdcId: 171952, name: "Karp", category: "Ryby i owoce morza" },
    { fdcId: 173680, name: "Szczupak", category: "Ryby i owoce morza" },
    { fdcId: 175176, name: "Tilapia", category: "Ryby i owoce morza" },
    { fdcId: 174183, name: "Anchois w oleju (odsączone)", category: "Ryby i owoce morza", portions: [{ label: "filet", usda: "anchovy" }] },
    { fdcId: 173687, name: "Łosoś wędzony", category: "Ryby i owoce morza" },
    { fdcId: 175118, name: "Śledź marynowany", category: "Ryby i owoce morza" },
    { fdcId: 175142, name: "Labraks (okoń morski)", category: "Ryby i owoce morza" },
    { fdcId: 175129, name: "Czarniak (pollock atlantycki)", category: "Ryby i owoce morza" },
    { fdcId: 173678, name: "Okoń", category: "Ryby i owoce morza" },
    { fdcId: 173711, name: "Sieja", category: "Ryby i owoce morza" },
    { fdcId: 174204, name: "Krab", category: "Ryby i owoce morza" },
    { fdcId: 174220, name: "Przegrzebki", category: "Ryby i owoce morza" },
    { fdcId: 174219, name: "Ostrygi", category: "Ryby i owoce morza", portions: [{ label: "ostryga średnia", usda: "medium" }] },
    { fdcId: 174218, name: "Ośmiornica", category: "Ryby i owoce morza" },
    { fdcId: 175140, name: "Sardynki w sosie pomidorowym (odsączone)", category: "Ryby i owoce morza" },
    { fdcId: 175159, name: "Tuńczyk świeży (żółtopłetwy)", category: "Ryby i owoce morza" },

    // Jaja
    { fdcId: 172189, name: "Jajo kacze", category: "Jaja", portions: [{ label: "jajo", usda: "egg" }] },
    { fdcId: 172191, name: "Jajo przepiórcze", category: "Jaja", portions: [{ label: "jajo", usda: "egg" }] },

    // Nabiał
    { fdcId: 173410, name: "Masło solone", category: "Nabiał", portions: [TBSP, TSP_FROM_TBSP] },
    { fdcId: 170858, name: "Śmietanka 30%", category: "Nabiał", portions: [TBSP] },
    { fdcId: 171255, name: "Śmietanka ok. 12%", category: "Nabiał", portions: [TBSP] },
    { fdcId: 171284, name: "Jogurt naturalny pełnotłusty", category: "Nabiał" },
    {
        fdcId: 171265,
        name: "Mleko 3,2%",
        category: "Nabiał",
        portions: [TBSP, { label: "szklanka (240 ml)", usda: "cup" }],
    },
    { fdcId: 170851, name: "Ricotta", category: "Nabiał" },
    { fdcId: 172175, name: "Ser pleśniowy (niebieski)", category: "Nabiał" },
    { fdcId: 170850, name: "Ser provolone", category: "Nabiał" },
    { fdcId: 173419, name: "Ser edamski", category: "Nabiał" },
    { fdcId: 171241, name: "Ser gouda", category: "Nabiał" },
    { fdcId: 172178, name: "Ser camembert", category: "Nabiał" },
    { fdcId: 172197, name: "Ser kozi twardy", category: "Nabiał" },

    // Tłuszcze
    { fdcId: 171400, name: "Łój wołowy", category: "Tłuszcze", portions: [TBSP, TSP_FROM_TBSP] },
    { fdcId: 171030, name: "Olej z orzechów włoskich", category: "Tłuszcze", portions: [TBSP, TSP] },
    { fdcId: 167702, name: "Olej lniany tłoczony na zimno", category: "Tłuszcze", portions: [TBSP, TSP_FROM_TBSP] },
    {
        fdcId: 171427,
        name: "Olej z orzechów laskowych",
        category: "Tłuszcze",
        portions: [{ label: "łyżka", usda: "tablespoon" }, TSP],
    },
    { fdcId: 171410, name: "Olej arachidowy", category: "Tłuszcze", portions: [TBSP, TSP] },
    { fdcId: 171009, name: "Majonez", category: "Tłuszcze", portions: [TBSP, TSP_FROM_TBSP] },

    // Warzywa
    { fdcId: 168429, name: "Sałata masłowa", category: "Warzywa" },
    { fdcId: 169248, name: "Sałata lodowa", category: "Warzywa" },
    { fdcId: 168580, name: "Boczniaki", category: "Warzywa" },
    { fdcId: 169242, name: "Grzyby shiitake", category: "Warzywa", portions: [{ label: "grzyb", usda: "piece whole" }] },
    { fdcId: 169255, name: "Grzyby portobello", category: "Warzywa", portions: [{ label: "grzyb", usda: "piece whole" }] },
    { fdcId: 168424, name: "Kalarepa", category: "Warzywa" },
    { fdcId: 169991, name: "Boćwina", category: "Warzywa" },
    { fdcId: 170005, name: "Dymka (szczypior z cebulką)", category: "Warzywa", portions: [{ label: "dymka średnia", usda: "medium (4-1/8 long)" }] },
    { fdcId: 170416, name: "Natka pietruszki", category: "Warzywa" },
    { fdcId: 172233, name: "Koperek", category: "Warzywa" },
    { fdcId: 173475, name: "Mięta świeża", category: "Warzywa" },
    { fdcId: 169977, name: "Kapusta czerwona", category: "Warzywa" },
    { fdcId: 170388, name: "Kapusta włoska", category: "Warzywa" },
    { fdcId: 168576, name: "Papryczka jalapeño", category: "Warzywa", portions: [{ label: "papryczka", usda: "pepper" }] },
    { fdcId: 169210, name: "Pędy bambusa", category: "Warzywa" },
    { fdcId: 168458, name: "Wodorosty nori", category: "Warzywa", portions: [{ label: "arkusz", usda: "sheets" }] },
    { fdcId: 172238, name: "Kapary", category: "Warzywa", portions: [{ label: "łyżka (odsączone)", usda: "tbsp, drained" }] },
    { fdcId: 170383, name: "Brukselka", category: "Warzywa", portions: [{ label: "główka", usda: "sprout" }] },
    { fdcId: 169246, name: "Por", category: "Warzywa" },
    { fdcId: 170392, name: "Kimchi", category: "Warzywa" },
    { fdcId: 168558, name: "Ogórek konserwowy (koperkowy)", category: "Warzywa" },
    { fdcId: 170400, name: "Seler korzeniowy", category: "Warzywa" },
    { fdcId: 168573, name: "Trawa cytrynowa", category: "Warzywa" },

    // Orzechy i nasiona
    { fdcId: 170591, name: "Orzeszki piniowe", category: "Orzechy i nasiona" },
    { fdcId: 170562, name: "Pestki słonecznika", category: "Orzechy i nasiona" },
    { fdcId: 172430, name: "Orzeszki ziemne", category: "Orzechy i nasiona" },
    // USDA podaje "2 tbsp" — dzielenie przez `amount` daje łyżkę, `divide: 3` łyżeczkę.
    {
        fdcId: 172470,
        name: "Masło orzechowe bez soli",
        category: "Orzechy i nasiona",
        portions: [TBSP, TSP_FROM_TBSP],
    },
    { fdcId: 170568, name: "Migdały blanszowane (mąka migdałowa)", category: "Orzechy i nasiona", portions: [TBSP] },
    { fdcId: 170169, name: "Miąższ kokosa świeży", category: "Orzechy i nasiona" },

    // Owoce
    { fdcId: 171711, name: "Borówki", category: "Owoce", portions: [{ label: "borówka", usda: "berries" }] },
    { fdcId: 171722, name: "Żurawina świeża", category: "Owoce" },
    { fdcId: 167758, name: "Rabarbar", category: "Owoce", portions: [{ label: "łodyga", usda: "stalk" }] },
    { fdcId: 173964, name: "Porzeczki czerwone", category: "Owoce" },
    // USDA nie ma tu łyżki; 1 fl oz = 2 tbsp z definicji, stąd `divide: 2`.
    {
        fdcId: 167747,
        name: "Sok z cytryny",
        category: "Owoce",
        portions: [
            { label: "łyżka", usda: "fl oz", divide: 2 },
            { label: "sok z 1 cytryny", usda: "lemon yields" },
        ],
    },

    // Dodatki
    { fdcId: 170273, name: "Gorzka czekolada 70–85%", category: "Dodatki" },
    { fdcId: 172234, name: "Musztarda", category: "Dodatki", portions: [{ label: "łyżeczka", usda: "tsp or 1 packet" }] },
    { fdcId: 173469, name: "Ocet jabłkowy", category: "Dodatki", portions: [TBSP, TSP] },
    { fdcId: 174277, name: "Sos sojowy", category: "Dodatki", portions: [TBSP, TSP] },
    { fdcId: 167961, name: "Skórki wieprzowe (chicharrones)", category: "Dodatki" },
    { fdcId: 169599, name: "Żelatyna niesłodzona", category: "Dodatki", portions: [{ label: "łyżka", usda: "envelope (1 tbsp)" }] },
    { fdcId: 172883, name: "Bulion wołowy domowy", category: "Dodatki", portions: [{ label: "szklanka (240 ml)", usda: "cup" }] },
    { fdcId: 172884, name: "Bulion drobiowy domowy", category: "Dodatki", portions: [{ label: "szklanka (240 ml)", usda: "cup" }] },
    {
        fdcId: 174832,
        name: "Napój migdałowy niesłodzony",
        category: "Dodatki",
        portions: [{ label: "szklanka (240 ml)", usda: "cup" }],
    },
    { fdcId: 168410, name: "Edamame", category: "Dodatki" },
    { fdcId: 171320, name: "Cynamon mielony", category: "Dodatki", portions: [TSP, TBSP] },
    { fdcId: 172231, name: "Kurkuma mielona", category: "Dodatki", portions: [TSP, TBSP] },
    { fdcId: 170931, name: "Pieprz czarny", category: "Dodatki", portions: [{ label: "łyżeczka (mielony)", usda: "tsp, ground" }] },
    { fdcId: 174272, name: "Tempeh", category: "Dodatki" },

    // ---- Partia 2 (2026-10-07): +100 produktów ----
    // Kryterium keto jak w partii 1: mięso, ryby, jaja, nabiał i tłuszcze bez ograniczeń;
    // warzywa, owoce i orzechy do ok. 12 g netto / 100 g; przyprawy i dodatki wyżej,
    // bo używa się ich w gramach (jak cynamon czy pieprz wyżej). Odrzucone mimo popularności:
    // pistacje (16,6 g netto), nerkowce (26,9), masło słonecznikowe (17,6), szalotka (13,6).

    // Mięso i wędliny
    { fdcId: 171474, name: "Pierś z kurczaka ze skórą", category: "Mięso" },
    { fdcId: 171456, name: "Żołądki drobiowe", category: "Mięso" },
    { fdcId: 171458, name: "Serca drobiowe", category: "Mięso" },
    { fdcId: 172408, name: "Kaczka ze skórą", category: "Mięso" },
    { fdcId: 174470, name: "Gęś ze skórą", category: "Mięso" },
    { fdcId: 171533, name: "Udo z indyka ze skórą", category: "Mięso" },
    { fdcId: 171495, name: "Skrzydło z indyka ze skórą", category: "Mięso" },
    { fdcId: 168668, name: "Łopatka wołowa", category: "Mięso" },
    { fdcId: 168609, name: "Łata wołowa (flank)", category: "Mięso" },
    { fdcId: 167849, name: "Karkówka wieprzowa", category: "Mięso" },
    { fdcId: 168222, name: "Szynka wieprzowa surowa (udziec)", category: "Mięso" },
    { fdcId: 174370, name: "Jagnięcina mielona", category: "Mięso" },
    { fdcId: 172534, name: "Wątróbka cielęca", category: "Mięso" },
    { fdcId: 168277, name: "Bekon (boczek wędzony) surowy", category: "Mięso" },
    { fdcId: 172938, name: "Salami wieprzowe dojrzewające", category: "Mięso" },
    { fdcId: 174575, name: "Pepperoni", category: "Mięso" },
    { fdcId: 172954, name: "Kiełbasa wędzona wieprzowo-wołowa", category: "Mięso" },
    { fdcId: 167872, name: "Szynka gotowana (ok. 11% tłuszczu)", category: "Mięso" },

    // Ryby i owoce morza
    { fdcId: 171964, name: "Łupacz (plamiak)", category: "Ryby i owoce morza" },
    { fdcId: 171965, name: "Halibut grenlandzki", category: "Ryby i owoce morza" },
    { fdcId: 173703, name: "Miecznik", category: "Ryby i owoce morza" },
    { fdcId: 173710, name: "Turbot", category: "Ryby i owoce morza" },
    { fdcId: 173676, name: "Żabnica", category: "Ryby i owoce morza" },
    { fdcId: 173668, name: "Śledź wędzony", category: "Ryby i owoce morza" },
    { fdcId: 168149, name: "Makrela solona", category: "Ryby i owoce morza" },
    { fdcId: 173708, name: "Tuńczyk w oleju (odsączony)", category: "Ryby i owoce morza" },
    { fdcId: 173693, name: "Łosoś sockeye z puszki (odsączony)", category: "Ryby i owoce morza" },
    { fdcId: 174208, name: "Homar", category: "Ryby i owoce morza" },
    { fdcId: 174206, name: "Raki", category: "Ryby i owoce morza" },
    { fdcId: 174215, name: "Mątwa", category: "Ryby i owoce morza" },
    { fdcId: 174188, name: "Kawior", category: "Ryby i owoce morza" },

    // Jaja
    { fdcId: 172190, name: "Jajo gęsie", category: "Jaja" },
    { fdcId: 172192, name: "Jajo indycze", category: "Jaja" },

    // Nabiał
    { fdcId: 170852, name: "Ser tylżycki", category: "Nabiał" },
    { fdcId: 171242, name: "Ser gruyère", category: "Nabiał" },
    { fdcId: 170843, name: "Ser fontina", category: "Nabiał" },
    { fdcId: 171250, name: "Ser roquefort", category: "Nabiał" },
    { fdcId: 171245, name: "Ser munster", category: "Nabiał" },
    { fdcId: 171249, name: "Ser pecorino romano", category: "Nabiał" },
    { fdcId: 173433, name: "Ser kozi półtwardy", category: "Nabiał" },
    { fdcId: 170846, name: "Mozzarella do pizzy (twarda, pełnotłusta)", category: "Nabiał" },
    { fdcId: 170849, name: "Ser port salut", category: "Nabiał" },
    { fdcId: 170844, name: "Ser monterey jack", category: "Nabiał" },
    { fdcId: 170857, name: "Śmietanka ok. 18%", category: "Nabiał" },
    { fdcId: 172225, name: "Maślanka pełnotłusta", category: "Nabiał" },

    // Tłuszcze
    { fdcId: 172336, name: "Olej rzepakowy", category: "Tłuszcze" },
    { fdcId: 171031, name: "Olej migdałowy", category: "Tłuszcze" },
    { fdcId: 171421, name: "Masło kakaowe", category: "Tłuszcze" },
    { fdcId: 173572, name: "Smalec gęsi", category: "Tłuszcze" },
    { fdcId: 173564, name: "Tłuszcz drobiowy", category: "Tłuszcze" },
    { fdcId: 168324, name: "Tłuszcz z boczku (wytopiony)", category: "Tłuszcze" },
    { fdcId: 170580, name: "Śmietanka kokosowa", category: "Tłuszcze" },

    // Warzywa i grzyby
    { fdcId: 168412, name: "Endywia", category: "Warzywa" },
    { fdcId: 168564, name: "Radicchio", category: "Warzywa" },
    { fdcId: 170068, name: "Rukiew wodna", category: "Warzywa" },
    { fdcId: 169385, name: "Koper włoski (fenkuł)", category: "Warzywa" },
    { fdcId: 169260, name: "Okra", category: "Warzywa" },
    { fdcId: 169205, name: "Karczoch", category: "Warzywa" },
    { fdcId: 170465, name: "Rzepa", category: "Warzywa" },
    { fdcId: 168451, name: "Rzodkiew biała (daikon)", category: "Warzywa" },
    { fdcId: 169298, name: "Dynia makaronowa (spaghetti)", category: "Warzywa" },
    { fdcId: 168448, name: "Dynia", category: "Warzywa" },
    { fdcId: 170375, name: "Liście buraka (botwina)", category: "Warzywa" },
    { fdcId: 169226, name: "Liście mniszka", category: "Warzywa" },
    { fdcId: 168569, name: "Serca palmowe (z puszki)", category: "Warzywa" },
    { fdcId: 168431, name: "Sałata czerwona liściasta", category: "Warzywa" },
    { fdcId: 169249, name: "Sałata zielona liściasta", category: "Warzywa" },
    { fdcId: 169994, name: "Szczypiorek", category: "Warzywa" },
    { fdcId: 168422, name: "Kurki", category: "Warzywa" },
    { fdcId: 168423, name: "Smardze", category: "Warzywa" },
    { fdcId: 169382, name: "Grzyby enoki", category: "Warzywa" },
    { fdcId: 169383, name: "Papryka żółta", category: "Warzywa" },
    { fdcId: 169404, name: "Brokuł chiński (gai lan)", category: "Warzywa" },
    { fdcId: 170076, name: "Szczaw", category: "Warzywa" },
    { fdcId: 168546, name: "Papryka czerwona konserwowa", category: "Warzywa" },
    { fdcId: 169379, name: "Ogórek kiszony", category: "Warzywa" },
    { fdcId: 169287, name: "Szpinak mrożony", category: "Warzywa" },
    { fdcId: 169289, name: "Patison", category: "Warzywa" },

    // Orzechy i nasiona
    { fdcId: 171330, name: "Mak", category: "Orzechy i nasiona" },

    // Owoce
    { fdcId: 173030, name: "Agrest", category: "Owoce" },
    { fdcId: 169913, name: "Morwa", category: "Owoce" },

    // Dodatki i przyprawy
    { fdcId: 172449, name: "Tofu miękkie (jedwabiste)", category: "Dodatki" },
    { fdcId: 173180, name: "Odżywka białkowa serwatkowa", category: "Dodatki" },
    { fdcId: 173472, name: "Chrzan tarty", category: "Dodatki" },
    { fdcId: 171580, name: "Pesto bazyliowe", category: "Dodatki" },
    { fdcId: 172240, name: "Ocet z czerwonego wina", category: "Dodatki" },
    { fdcId: 172237, name: "Ocet spirytusowy", category: "Dodatki" },
    { fdcId: 171328, name: "Oregano suszone", category: "Dodatki" },
    { fdcId: 171329, name: "Papryka słodka mielona", category: "Dodatki" },
    { fdcId: 170923, name: "Kumin (kmin rzymski)", category: "Dodatki" },
    { fdcId: 171319, name: "Chili w proszku", category: "Dodatki" },
    { fdcId: 170924, name: "Curry w proszku", category: "Dodatki" },
    { fdcId: 171326, name: "Gałka muszkatołowa", category: "Dodatki" },
    { fdcId: 171325, name: "Czosnek granulowany", category: "Dodatki" },
    { fdcId: 170926, name: "Imbir mielony", category: "Dodatki" },
    { fdcId: 170928, name: "Majeranek suszony", category: "Dodatki" },
    { fdcId: 170938, name: "Tymianek suszony", category: "Dodatki" },
    { fdcId: 171333, name: "Rozmaryn suszony", category: "Dodatki" },
    { fdcId: 171315, name: "Ziele angielskie mielone", category: "Dodatki" },
    { fdcId: 170918, name: "Kminek", category: "Dodatki" },
];

// CSV z USDA ma pola w cudzysłowach, a w opisach bywają przecinki —
// zwykły split(",") pociąłby je w złych miejscach.
const parseCsvLine = (line) => {
    const fields = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === "," && !inQuotes) {
            fields.push(current);
            current = "";
        } else current += char;
    }
    fields.push(current);
    return fields;
};

const round1 = (value) => Math.round(value * 10) / 10;

// food_portion.csv: id, fdc_id, seq_num, amount, measure_unit_id, portion_description,
// modifier, gram_weight, … W SR Legacy jednostka jest zawsze "undetermined" (9999),
// a cała treść miary ("tbsp", "large", "oz (14 halves)") siedzi w `modifier`.
const readPortions = (csvDir, wantedIds) => {
    const portionsByFood = {};
    const lines = fs.readFileSync(path.join(csvDir, "food_portion.csv"), "utf8").split("\n");
    for (const line of lines.slice(1)) {
        if (!line) continue;
        const [, fdcId, , amount, , , modifier, gramWeight] = parseCsvLine(line);
        if (!wantedIds.has(fdcId)) continue;
        (portionsByFood[fdcId] ??= []).push({ modifier, amount: Number(amount), gramWeight: Number(gramWeight) });
    }
    return portionsByFood;
};

// Miara z listy PRODUCTS → { label, grams }. Wymagamy DOKŁADNIE jednego pasującego
// wiersza: brak (literówka, inny rekord) albo dwa (niejednoznaczność) przerywają
// generowanie, zamiast po cichu wpisać złą wagę.
const resolvePortion = (portionsByFood, product, { label, usda, fdcId = product.fdcId, divide = 1 }) => {
    const matches = (portionsByFood[fdcId] ?? []).filter((row) => row.modifier === usda);
    if (matches.length !== 1) {
        throw new Error(`${product.name}: miara "${usda}" (fdcId ${fdcId}) — pasujących wierszy: ${matches.length}, oczekiwano 1.`);
    }
    const { amount, gramWeight } = matches[0];
    return { label, grams: round1(gramWeight / amount / divide) };
};

const main = () => {
    const csvDir = process.argv[2];
    if (!csvDir) {
        console.error("Podaj ścieżkę do folderu z CSV USDA SR Legacy.");
        process.exit(1);
    }

    const wantedIds = new Set(PRODUCTS.map((product) => String(product.fdcId)));
    if (wantedIds.size !== PRODUCTS.length) {
        throw new Error("Zduplikowany fdcId na liście PRODUCTS.");
    }

    // food_nutrient.csv ma ~36 MB — czytamy raz i zostawiamy tylko nasze produkty.
    const nutrientsByFood = {};
    const lines = fs.readFileSync(path.join(csvDir, "food_nutrient.csv"), "utf8").split("\n");
    for (const line of lines.slice(1)) {
        if (!line) continue;
        const [, fdcId, nutrientId, amount] = parseCsvLine(line);
        const key = NUTRIENT_IDS[nutrientId];
        if (!key || !wantedIds.has(fdcId)) continue;
        (nutrientsByFood[fdcId] ??= {})[key] = Number(amount);
    }

    // Rekordy, z których bierzemy tylko wagę miary (np. awokado Hass), też trzeba wczytać.
    const portionIds = new Set(wantedIds);
    for (const product of PRODUCTS) {
        for (const portion of product.portions ?? []) {
            if (portion.fdcId) portionIds.add(String(portion.fdcId));
        }
    }
    const portionsByFood = readPortions(csvDir, portionIds);

    const products = PRODUCTS.map((product) => {
        const { fdcId, name, category } = product;
        const values = nutrientsByFood[fdcId];
        if (!values) throw new Error(`Brak danych USDA dla fdcId ${fdcId} (${name})`);

        for (const key of ["calories", "protein", "fats", "carbs"]) {
            if (values[key] === undefined) throw new Error(`Brak "${key}" dla ${name}`);
        }

        let fiber = values.fiber;
        if (fiber === undefined) {
            fiber = ANIMAL_CATEGORIES.has(category) ? 0 : null;
        }

        return {
            // Stabilne ID z numeru USDA — poprawka polskiej nazwy nie psuje zapisanych przepisów.
            id: `usda-${fdcId}`,
            fdcId,
            name,
            category,
            per100g: {
                calories: Math.round(values.calories),
                protein: round1(values.protein),
                fats: round1(values.fats),
                carbs: round1(values.carbs),
                fiber: fiber === null ? null : round1(fiber),
            },
            ...(product.portions
                ? { portions: product.portions.map((portion) => resolvePortion(portionsByFood, product, portion)) }
                : {}),
        };
    });

    const missingFiber = products.filter((product) => product.per100g.fiber === null);

    const header = `// PLIK GENEROWANY — nie edytuj ręcznie. Źródło: scripts/build-products.js
// Dane: U.S. Department of Agriculture, Agricultural Research Service.
// FoodData Central, SR Legacy (2018-04). fdc.nal.usda.gov — domena publiczna (CC0 1.0).
//
// Wartości na 100 g części jadalnej. \`carbs\` to "Carbohydrate, by difference" z USDA —
// ZAWIERA błonnik; węgle netto = carbs − fiber (PROGRES.md pkt 33).
// \`fiber: null\` = USDA nie podaje wartości dla tego produktu.
// \`portions\` = miary domowe (łyżka, jajko M…) z food_portion.csv USDA; waga części
// jadalnej jednej miary. Dobór i polskie etykiety — patrz scripts/build-products.js.
`;

    const output = `${header}\nexport const PRODUCTS_DATA = ${JSON.stringify(products, null, 4)};\n`;
    const outPath = path.join(import.meta.dirname, "..", "src", "data", "productsData.js");
    fs.writeFileSync(outPath, output, "utf8");

    console.log(`Zapisano ${products.length} produktów do ${outPath}`);
    if (missingFiber.length) {
        console.log(`Bez danych o błonniku: ${missingFiber.map((product) => product.name).join(", ")}`);
    }
};

main();
