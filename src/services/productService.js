import { PRODUCTS_DATA } from "../data/productsData.js";

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 20;

// "Żółty ser" i "zolty ser" mają dać ten sam wynik — ludzie na telefonie
// pomijają polskie znaki. NFD rozkłada "ó" na "o" + znak diakrytyczny, który
// potem wycinamy. "ł" nie ma rozkładu w Unicode, więc zamieniamy je osobno.
export const normalizeText = (text) =>
    text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/ł/g, "l")
        .trim();

// Indeks liczony raz przy załadowaniu modułu, a nie przy każdym wciśnięciu klawisza.
const SEARCH_INDEX = PRODUCTS_DATA.map((product) => ({
    product,
    name: normalizeText(product.name),
    haystack: normalizeText(`${product.name} ${product.category}`),
}));

// Zapytanie trafia do RegExp — kropka czy nawias wpisane przez użytkownika
// mają znaczyć siebie, a nie "dowolny znak" czy grupę.
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Po normalizeText() litery są już łacińskie bez ogonków, więc granica
// słowa to po prostu "nie litera i nie cyfra" (wbudowane \b nie zna polskich liter,
// ale tu ich już nie ma — mimo to jawny zapis jest czytelniejszy).
const NOT_WORD = "[^a-z0-9]";

// Im niższa ranga, tym wyżej na liście; null = produkt nie pasuje.
// Trafienie w środku słowa odpada: "ser" nie znajdzie "Ogórka konserwowego".
// Kategoria jest ostatnia: "orzech" ma najpierw pokazać "Masło orzechowe",
// a dopiero potem migdały, które łapią się tylko przez "Orzechy i nasiona".
const getMatchRank = ({ name, haystack }, query) => {
    const escaped = escapeRegExp(query);
    const startsWord = new RegExp(`(^|${NOT_WORD})${escaped}`);
    if (!startsWord.test(haystack)) return null;

    const wholeWord = new RegExp(`(^|${NOT_WORD})${escaped}($|${NOT_WORD})`).test(name);
    const startsName = name.startsWith(query);

    if (wholeWord && startsName) return 0; // "ser" → "Ser feta"
    if (wholeWord) return 1; //               "ser" → "Żółty ser"
    if (startsName) return 2; //              "ser" → "Serek wiejski", "Serce wołowe"
    if (startsWord.test(name)) return 3; //   "orzech" → "Masło orzechowe"
    return 4; //                              "orzech" → "Migdały" (z kategorii)
};

export const searchProducts = (query) => {
    const normalizedQuery = normalizeText(query);
    if (normalizedQuery.length < MIN_QUERY_LENGTH) return [];

    // sort() jest stabilny, więc w obrębie tej samej rangi zostaje kolejność z bazy.
    return SEARCH_INDEX.map((entry) => ({ ...entry, rank: getMatchRank(entry, normalizedQuery) }))
        .filter(({ rank }) => rank !== null)
        .sort((a, b) => a.rank - b.rank)
        .slice(0, MAX_RESULTS)
        .map(({ product }) => product);
};

export const getProductById = (productId) => PRODUCTS_DATA.find((product) => product.id === productId);

// Makro składnika przeliczone z wartości na 100 g. Bez zaokrąglania —
// zaokrąglamy dopiero sumę, żeby błędy nie kumulowały się przy wielu składnikach.
// fiber bywa `null` (USDA nie podaje wartości dla części produktów) — traktujemy
// to jak 0, żeby nie psuć sumy (patrz komentarz w productsData.js).
export const calculateIngredientMacros = (product, grams) => {
    const ratio = grams / 100;
    const { calories, protein, fats, carbs, fiber } = product.per100g;

    return {
        calories: calories * ratio,
        protein: protein * ratio,
        fats: fats * ratio,
        carbs: carbs * ratio,
        fiber: (fiber ?? 0) * ratio,
    };
};

// Miara domowa (product.portions[i]) × liczba sztuk → gramy. Zaokrąglamy do 0,1 g,
// bo 3 × 4,7 g w JS daje 14,100000000000001 — a gramy trafiają do zapisanego przepisu.
// Do bazy idą wyłącznie gramy: miara to tylko wygodniejszy sposób ich wpisania.
export const portionToGrams = (portion, count) => Math.round(portion.grams * count * 10) / 10;

// Węgle netto = węglowodany całkowite (USDA "by difference", z błonnikiem) − błonnik.
// JEDYNE miejsce w appce, które to liczy — przepis, wpis w dzienniku, suma dnia
// i makro składnika mają te same pola `carbs`/`fiber`, więc wszystkie przechodzą tędy.
// Brak `fiber` (stare wpisy, 3 produkty bez danych USDA) = 0, czyli netto = całkowite:
// błąd tylko w stronę ostrożności, alarm limitu nigdy nie zapali się za późno.
export const getNetCarbs = ({ carbs, fiber }) => carbs - (fiber ?? 0);

// Suma makro listy składników { productId, grams }, zaokrąglona do pełnych
// jednostek — ten sam kształt co przepisy z RECIPES_DATA, więc addMeal() go przyjmie.
export const sumIngredients = (ingredients) => {
    const total = ingredients.reduce(
        (sum, { productId, grams }) => {
            const product = getProductById(productId);
            if (!product) return sum;

            const macros = calculateIngredientMacros(product, grams);
            return {
                calories: sum.calories + macros.calories,
                protein: sum.protein + macros.protein,
                fats: sum.fats + macros.fats,
                carbs: sum.carbs + macros.carbs,
                fiber: sum.fiber + macros.fiber,
            };
        },
        { calories: 0, protein: 0, fats: 0, carbs: 0, fiber: 0 },
    );

    return {
        calories: Math.round(total.calories),
        protein: Math.round(total.protein),
        fats: Math.round(total.fats),
        carbs: Math.round(total.carbs),
        fiber: Math.round(total.fiber),
    };
};
