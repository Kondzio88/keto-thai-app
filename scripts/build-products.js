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

// Ręcznie wybrana lista: polska nazwa, kategoria, rekord USDA.
// `piece` = przelicznik dla produktów liczonych w sztukach (waga z food_portion.csv USDA).
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
    { fdcId: 175139, name: "Sardynki w oleju (odsączone)", category: "Ryby i owoce morza" },
    { fdcId: 171986, name: "Tuńczyk w wodzie (odsączony)", category: "Ryby i owoce morza" },
    { fdcId: 171955, name: "Dorsz atlantycki", category: "Ryby i owoce morza" },
    { fdcId: 173717, name: "Pstrąg tęczowy", category: "Ryby i owoce morza" },
    { fdcId: 175179, name: "Krewetki surowe", category: "Ryby i owoce morza" },
    { fdcId: 174216, name: "Małże", category: "Ryby i owoce morza" },
    { fdcId: 174223, name: "Kalmary", category: "Ryby i owoce morza" },

    // Jaja
    { fdcId: 171287, name: "Jajko kurze", category: "Jaja", piece: { label: "1 jajko (L)", grams: 50 } },
    { fdcId: 172184, name: "Żółtko jaja", category: "Jaja", piece: { label: "1 żółtko", grams: 17 } },
    { fdcId: 172183, name: "Białko jaja", category: "Jaja", piece: { label: "1 białko", grams: 33 } },

    // Nabiał
    { fdcId: 173430, name: "Masło niesolone", category: "Nabiał" },
    { fdcId: 173412, name: "Masło klarowane (ghee)", category: "Nabiał" },
    { fdcId: 170859, name: "Śmietanka 36%", category: "Nabiał" },
    { fdcId: 171257, name: "Śmietana kwaśna (ok. 19%)", category: "Nabiał" },
    { fdcId: 171304, name: "Jogurt grecki pełnotłusty", category: "Nabiał" },
    { fdcId: 172179, name: "Serek wiejski (cottage)", category: "Nabiał" },
    { fdcId: 170845, name: "Mozzarella pełnotłusta", category: "Nabiał" },
    { fdcId: 173414, name: "Ser cheddar", category: "Nabiał" },
    { fdcId: 170848, name: "Parmezan", category: "Nabiał" },
    { fdcId: 173420, name: "Ser feta", category: "Nabiał" },
    { fdcId: 172177, name: "Ser brie", category: "Nabiał" },
    { fdcId: 173435, name: "Ser kozi miękki", category: "Nabiał" },
    { fdcId: 173418, name: "Serek śmietankowy", category: "Nabiał" },
    { fdcId: 171251, name: "Ser ementaler", category: "Nabiał" },

    // Tłuszcze
    { fdcId: 171413, name: "Oliwa z oliwek", category: "Tłuszcze" },
    { fdcId: 171412, name: "Olej kokosowy", category: "Tłuszcze" },
    { fdcId: 173573, name: "Olej z awokado", category: "Tłuszcze" },
    { fdcId: 171016, name: "Olej sezamowy", category: "Tłuszcze" },
    { fdcId: 171401, name: "Smalec", category: "Tłuszcze" },
    { fdcId: 170173, name: "Mleko kokosowe (puszka)", category: "Tłuszcze" },

    // Warzywa
    { fdcId: 171705, name: "Awokado", category: "Warzywa", piece: { label: "1 awokado", grams: 201 } },
    { fdcId: 168462, name: "Szpinak", category: "Warzywa" },
    { fdcId: 168421, name: "Jarmuż", category: "Warzywa" },
    { fdcId: 169387, name: "Rukola", category: "Warzywa" },
    { fdcId: 169247, name: "Sałata rzymska", category: "Warzywa" },
    { fdcId: 170379, name: "Brokuł", category: "Warzywa" },
    { fdcId: 169986, name: "Kalafior", category: "Warzywa" },
    { fdcId: 169291, name: "Cukinia", category: "Warzywa", piece: { label: "1 średnia cukinia", grams: 196 } },
    { fdcId: 169228, name: "Bakłażan", category: "Warzywa" },
    { fdcId: 170427, name: "Papryka zielona", category: "Warzywa", piece: { label: "1 średnia papryka", grams: 119 } },
    { fdcId: 170108, name: "Papryka czerwona", category: "Warzywa", piece: { label: "1 średnia papryka", grams: 119 } },
    { fdcId: 168409, name: "Ogórek ze skórką", category: "Warzywa" },
    { fdcId: 170457, name: "Pomidor", category: "Warzywa", piece: { label: "1 średni pomidor", grams: 123 } },
    { fdcId: 169251, name: "Pieczarki", category: "Warzywa" },
    { fdcId: 168389, name: "Szparagi", category: "Warzywa" },
    { fdcId: 169961, name: "Fasolka szparagowa", category: "Warzywa" },
    { fdcId: 169975, name: "Kapusta biała", category: "Warzywa" },
    { fdcId: 170390, name: "Pak choi", category: "Warzywa" },
    { fdcId: 169979, name: "Kapusta pekińska", category: "Warzywa" },
    { fdcId: 169957, name: "Kiełki fasoli mung", category: "Warzywa" },
    { fdcId: 169276, name: "Rzodkiewka", category: "Warzywa", piece: { label: "1 rzodkiewka", grams: 4.5 } },
    { fdcId: 169988, name: "Seler naciowy", category: "Warzywa", piece: { label: "1 łodyga", grams: 40 } },
    { fdcId: 170000, name: "Cebula", category: "Warzywa" },
    { fdcId: 169230, name: "Czosnek", category: "Warzywa", piece: { label: "1 ząbek", grams: 3 } },
    { fdcId: 169279, name: "Kapusta kiszona", category: "Warzywa" },
    { fdcId: 169094, name: "Oliwki czarne", category: "Warzywa" },
    { fdcId: 169096, name: "Oliwki zielone", category: "Warzywa" },
    { fdcId: 170106, name: "Papryczka chili", category: "Warzywa" },
    { fdcId: 169231, name: "Imbir świeży", category: "Warzywa" },
    { fdcId: 169997, name: "Kolendra świeża", category: "Warzywa" },
    { fdcId: 172232, name: "Bazylia świeża", category: "Warzywa" },

    // Orzechy i nasiona
    { fdcId: 170567, name: "Migdały", category: "Orzechy i nasiona" },
    { fdcId: 170187, name: "Orzechy włoskie", category: "Orzechy i nasiona" },
    { fdcId: 170178, name: "Orzechy makadamia", category: "Orzechy i nasiona" },
    { fdcId: 170182, name: "Orzechy pekan", category: "Orzechy i nasiona" },
    { fdcId: 170581, name: "Orzechy laskowe", category: "Orzechy i nasiona" },
    { fdcId: 170569, name: "Orzechy brazylijskie", category: "Orzechy i nasiona", piece: { label: "1 orzech", grams: 5 } },
    { fdcId: 170554, name: "Nasiona chia", category: "Orzechy i nasiona" },
    { fdcId: 169414, name: "Siemię lniane", category: "Orzechy i nasiona" },
    { fdcId: 170556, name: "Pestki dyni", category: "Orzechy i nasiona" },
    { fdcId: 170150, name: "Sezam", category: "Orzechy i nasiona" },
    { fdcId: 168588, name: "Masło migdałowe", category: "Orzechy i nasiona" },
    { fdcId: 170170, name: "Wiórki kokosowe niesłodzone", category: "Orzechy i nasiona" },
    { fdcId: 170189, name: "Tahini (pasta sezamowa)", category: "Orzechy i nasiona" },
    { fdcId: 170148, name: "Nasiona konopi łuskane", category: "Orzechy i nasiona" },

    // Owoce
    { fdcId: 167755, name: "Maliny", category: "Owoce" },
    { fdcId: 167762, name: "Truskawki", category: "Owoce" },
    { fdcId: 173946, name: "Jeżyny", category: "Owoce" },
    { fdcId: 167746, name: "Cytryna", category: "Owoce", piece: { label: "1 cytryna", grams: 58 } },
    { fdcId: 168155, name: "Limonka", category: "Owoce", piece: { label: "1 limonka", grams: 67 } },

    // Dodatki
    { fdcId: 172475, name: "Tofu twarde", category: "Dodatki" },
    { fdcId: 174531, name: "Sos rybny", category: "Dodatki" },
    { fdcId: 174278, name: "Sos sojowy tamari", category: "Dodatki" },
    { fdcId: 169593, name: "Kakao niesłodzone", category: "Dodatki" },

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
    { fdcId: 174183, name: "Anchois w oleju (odsączone)", category: "Ryby i owoce morza" },
    { fdcId: 173687, name: "Łosoś wędzony", category: "Ryby i owoce morza" },
    { fdcId: 175118, name: "Śledź marynowany", category: "Ryby i owoce morza" },
    { fdcId: 175142, name: "Labraks (okoń morski)", category: "Ryby i owoce morza" },
    { fdcId: 175129, name: "Czarniak (pollock atlantycki)", category: "Ryby i owoce morza" },
    { fdcId: 173678, name: "Okoń", category: "Ryby i owoce morza" },
    { fdcId: 173711, name: "Sieja", category: "Ryby i owoce morza" },
    { fdcId: 174204, name: "Krab", category: "Ryby i owoce morza" },
    { fdcId: 174220, name: "Przegrzebki", category: "Ryby i owoce morza" },
    { fdcId: 174219, name: "Ostrygi", category: "Ryby i owoce morza" },
    { fdcId: 174218, name: "Ośmiornica", category: "Ryby i owoce morza" },
    { fdcId: 175140, name: "Sardynki w sosie pomidorowym (odsączone)", category: "Ryby i owoce morza" },
    { fdcId: 175159, name: "Tuńczyk świeży (żółtopłetwy)", category: "Ryby i owoce morza" },

    // Jaja
    { fdcId: 172189, name: "Jajo kacze", category: "Jaja", piece: { label: "1 jajo", grams: 70 } },
    { fdcId: 172191, name: "Jajo przepiórcze", category: "Jaja", piece: { label: "1 jajo", grams: 9 } },

    // Nabiał
    { fdcId: 173410, name: "Masło solone", category: "Nabiał" },
    { fdcId: 170858, name: "Śmietanka 30%", category: "Nabiał" },
    { fdcId: 171255, name: "Śmietanka ok. 12%", category: "Nabiał" },
    { fdcId: 171284, name: "Jogurt naturalny pełnotłusty", category: "Nabiał" },
    { fdcId: 171265, name: "Mleko 3,2%", category: "Nabiał" },
    { fdcId: 170851, name: "Ricotta", category: "Nabiał" },
    { fdcId: 172175, name: "Ser pleśniowy (niebieski)", category: "Nabiał" },
    { fdcId: 170850, name: "Ser provolone", category: "Nabiał" },
    { fdcId: 173419, name: "Ser edamski", category: "Nabiał" },
    { fdcId: 171241, name: "Ser gouda", category: "Nabiał" },
    { fdcId: 172178, name: "Ser camembert", category: "Nabiał" },
    { fdcId: 172197, name: "Ser kozi twardy", category: "Nabiał" },

    // Tłuszcze
    { fdcId: 171400, name: "Łój wołowy", category: "Tłuszcze" },
    { fdcId: 171030, name: "Olej z orzechów włoskich", category: "Tłuszcze" },
    { fdcId: 167702, name: "Olej lniany tłoczony na zimno", category: "Tłuszcze" },
    { fdcId: 171427, name: "Olej z orzechów laskowych", category: "Tłuszcze" },
    { fdcId: 171410, name: "Olej arachidowy", category: "Tłuszcze" },
    { fdcId: 171009, name: "Majonez", category: "Tłuszcze" },

    // Warzywa
    { fdcId: 168429, name: "Sałata masłowa", category: "Warzywa" },
    { fdcId: 169248, name: "Sałata lodowa", category: "Warzywa" },
    { fdcId: 168580, name: "Boczniaki", category: "Warzywa" },
    { fdcId: 169242, name: "Grzyby shiitake", category: "Warzywa" },
    { fdcId: 169255, name: "Grzyby portobello", category: "Warzywa" },
    { fdcId: 168424, name: "Kalarepa", category: "Warzywa" },
    { fdcId: 169991, name: "Boćwina", category: "Warzywa" },
    { fdcId: 170005, name: "Dymka (szczypior z cebulką)", category: "Warzywa", piece: { label: "1 średnia dymka", grams: 15 } },
    { fdcId: 170416, name: "Natka pietruszki", category: "Warzywa" },
    { fdcId: 172233, name: "Koperek", category: "Warzywa" },
    { fdcId: 173475, name: "Mięta świeża", category: "Warzywa" },
    { fdcId: 169977, name: "Kapusta czerwona", category: "Warzywa" },
    { fdcId: 170388, name: "Kapusta włoska", category: "Warzywa" },
    { fdcId: 168576, name: "Papryczka jalapeño", category: "Warzywa", piece: { label: "1 papryczka", grams: 14 } },
    { fdcId: 169210, name: "Pędy bambusa", category: "Warzywa" },
    { fdcId: 168458, name: "Wodorosty nori", category: "Warzywa" },
    { fdcId: 172238, name: "Kapary", category: "Warzywa" },
    { fdcId: 170383, name: "Brukselka", category: "Warzywa" },
    { fdcId: 169246, name: "Por", category: "Warzywa" },
    { fdcId: 170392, name: "Kimchi", category: "Warzywa" },
    { fdcId: 168558, name: "Ogórek konserwowy (koperkowy)", category: "Warzywa" },
    { fdcId: 170400, name: "Seler korzeniowy", category: "Warzywa" },
    { fdcId: 168573, name: "Trawa cytrynowa", category: "Warzywa" },

    // Orzechy i nasiona
    { fdcId: 170591, name: "Orzeszki piniowe", category: "Orzechy i nasiona" },
    { fdcId: 170562, name: "Pestki słonecznika", category: "Orzechy i nasiona" },
    { fdcId: 172430, name: "Orzeszki ziemne", category: "Orzechy i nasiona" },
    { fdcId: 172470, name: "Masło orzechowe bez soli", category: "Orzechy i nasiona" },
    { fdcId: 170568, name: "Migdały blanszowane (mąka migdałowa)", category: "Orzechy i nasiona" },
    { fdcId: 170169, name: "Miąższ kokosa świeży", category: "Orzechy i nasiona" },

    // Owoce
    { fdcId: 171711, name: "Borówki", category: "Owoce" },
    { fdcId: 171722, name: "Żurawina świeża", category: "Owoce" },
    { fdcId: 167758, name: "Rabarbar", category: "Owoce" },
    { fdcId: 173964, name: "Porzeczki czerwone", category: "Owoce" },
    { fdcId: 167747, name: "Sok z cytryny", category: "Owoce" },

    // Dodatki
    { fdcId: 170273, name: "Gorzka czekolada 70–85%", category: "Dodatki" },
    { fdcId: 172234, name: "Musztarda", category: "Dodatki" },
    { fdcId: 173469, name: "Ocet jabłkowy", category: "Dodatki" },
    { fdcId: 174277, name: "Sos sojowy", category: "Dodatki" },
    { fdcId: 167961, name: "Skórki wieprzowe (chicharrones)", category: "Dodatki" },
    { fdcId: 169599, name: "Żelatyna niesłodzona", category: "Dodatki" },
    { fdcId: 172883, name: "Bulion wołowy domowy", category: "Dodatki" },
    { fdcId: 172884, name: "Bulion drobiowy domowy", category: "Dodatki" },
    { fdcId: 174832, name: "Napój migdałowy niesłodzony", category: "Dodatki" },
    { fdcId: 168410, name: "Edamame", category: "Dodatki" },
    { fdcId: 171320, name: "Cynamon mielony", category: "Dodatki" },
    { fdcId: 172231, name: "Kurkuma mielona", category: "Dodatki" },
    { fdcId: 170931, name: "Pieprz czarny", category: "Dodatki" },
    { fdcId: 174272, name: "Tempeh", category: "Dodatki" },
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

    const products = PRODUCTS.map(({ fdcId, name, category, piece }) => {
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
            ...(piece ? { piece } : {}),
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
