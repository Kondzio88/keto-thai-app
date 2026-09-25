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

export const searchProducts = (query) => {
    const normalizedQuery = normalizeText(query);
    if (normalizedQuery.length < MIN_QUERY_LENGTH) return [];

    // Nazwa zaczynająca się od zapytania wygrywa: "awokado" → najpierw
    // "Awokado", potem "Olej z awokado". sort() jest stabilny, więc w obrębie
    // tej samej grupy zostaje kolejność z bazy.
    return SEARCH_INDEX.filter(({ haystack }) => haystack.includes(normalizedQuery))
        .sort((a, b) => Number(!a.name.startsWith(normalizedQuery)) - Number(!b.name.startsWith(normalizedQuery)))
        .slice(0, MAX_RESULTS)
        .map(({ product }) => product);
};

export const getProductById = (productId) => PRODUCTS_DATA.find((product) => product.id === productId);

// Makro składnika przeliczone z wartości na 100 g. Bez zaokrąglania —
// zaokrąglamy dopiero sumę, żeby błędy nie kumulowały się przy wielu składnikach.
export const calculateIngredientMacros = (product, grams) => {
    const ratio = grams / 100;
    const { calories, protein, fats, carbs } = product.per100g;

    return {
        calories: calories * ratio,
        protein: protein * ratio,
        fats: fats * ratio,
        carbs: carbs * ratio,
    };
};

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
            };
        },
        { calories: 0, protein: 0, fats: 0, carbs: 0 },
    );

    return {
        calories: Math.round(total.calories),
        protein: Math.round(total.protein),
        fats: Math.round(total.fats),
        carbs: Math.round(total.carbs),
    };
};
