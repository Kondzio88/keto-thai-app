import { saveState, readState, removeState, quarantineCorrupted } from "../state/store.js";
import { getDateKey } from "../utils/date.js";
import { sumIngredients } from "./productService.js";
import { getSignedInClient, isUuid, SAVE_FAILED } from "./supabaseClient.js";

const RECIPES_STORAGE_KEY = "keto_custom_recipes";
const DRAFT_STORAGE_KEY = "keto_meal_draft";
const EDIT_DRAFT_STORAGE_KEY = "keto_meal_edit_draft";

// ---------- Własne przepisy ----------

// Przepisy zapisane przed 29.09 nie mają `fiber`. Skład jest zapisany, więc
// uzupełniamy sam błonnik z bazy produktów — reszta sum zostaje nietknięta.
export const getCustomRecipes = () => {
    const result = readState(RECIPES_STORAGE_KEY);
    if (result.status === "corrupted") {
        quarantineCorrupted(RECIPES_STORAGE_KEY, result.raw, "własnych przepisów");
        return [];
    }
    return (result.data ?? []).map((recipe) =>
        recipe.fiber === undefined ? { ...recipe, fiber: sumIngredients(recipe.ingredients).fiber } : recipe,
    );
};

export const getCustomRecipeById = (recipeId) => getCustomRecipes().find((recipe) => recipe.id === recipeId);

// ---------- Zapis (PLAN.md §1a, etap 5, wariant C; transakcja: wariant A) ----------
// Zalogowany: najpierw baza, lokalnie dopiero po potwierdzeniu. Gość: tylko lokalnie.
// Akcje zwracają { error } (null albo komunikat po polsku), zapisujące też { recipe }.

const LOCAL_SAVE_FAILED = "Pamięć przeglądarki jest pełna albo zablokowana (np. tryb prywatny).";

// Przepis + skład w JEDNYM wywołaniu funkcji bazy (supabase/002_custom_recipes.sql)
// = jedna transakcja. Dwa osobne zapytania mogłyby zostawić przepis bez składników.
const saveRecipeToServer = async (supabase, recipe) => {
    const { error } = await supabase.rpc("save_custom_recipe", {
        p_id: recipe.id,
        p_title: recipe.title,
        p_category: recipe.category,
        p_calories: recipe.calories,
        p_protein: recipe.protein,
        p_fats: recipe.fats,
        p_carbs: recipe.carbs,
        p_fiber: recipe.fiber,
        p_ingredients: recipe.ingredients.map(({ productId, grams }) => ({ productId, grams })),
    });
    if (error) console.error("Supabase save_custom_recipe:", error);
    return !error;
};

// Zapisujemy skład ({ productId, grams }) ORAZ sumy. Sumy mają ten sam kształt
// co RECIPES_DATA, więc addMeal() i karty przepisów działają bez zmian.
export const createCustomRecipe = async ({ title, category, ingredients }) => {
    const recipe = {
        // To samo id lokalnie i w bazie (uuid, jak przy posiłkach).
        id: crypto.randomUUID(),
        source: "user",
        title,
        category,
        ingredients,
        ...sumIngredients(ingredients),
        createdAt: getDateKey(),
    };

    const account = await getSignedInClient();
    if (account && !(await saveRecipeToServer(account.supabase, recipe))) {
        return { recipe: null, error: SAVE_FAILED };
    }

    // Odczyt listy PO czekaniu na bazę — inaczej mógłby nadpisać zmianę z międzyczasu.
    if (!saveState(RECIPES_STORAGE_KEY, [recipe, ...getCustomRecipes()])) {
        return { recipe: null, error: LOCAL_SAVE_FAILED };
    }
    return { recipe, error: null };
};

// Nadpisuje skład i sumy, zachowuje id i datę utworzenia — karta zostaje
// "tym samym" przepisem (to samo id = te same powiązania z dziennikiem).
// { recipe: null, error: null } = przepisu już nie ma (np. usunięty w innej karcie).
export const updateCustomRecipe = async (recipeId, { title, category, ingredients }) => {
    const existing = getCustomRecipeById(recipeId);
    if (!existing) return { recipe: null, error: null };

    const updated = { ...existing, title, category, ingredients, ...sumIngredients(ingredients) };

    // Stare przepisy ("user-…") nie są w bazie — zostają lokalne do etapu 6.
    const account = await getSignedInClient();
    if (account && isUuid(recipeId) && !(await saveRecipeToServer(account.supabase, updated))) {
        return { recipe: null, error: SAVE_FAILED };
    }

    const recipes = getCustomRecipes().map((recipe) => (recipe.id === recipeId ? updated : recipe));
    if (!saveState(RECIPES_STORAGE_KEY, recipes)) return { recipe: null, error: LOCAL_SAVE_FAILED };
    return { recipe: updated, error: null };
};

// Usuwa wyłącznie przepisy użytkownika — przepisy z RECIPES_DATA nie żyją
// w tym magazynie, więc nie da się ich tędy skasować. Wpisy w dzienniku są
// kopiami makro, więc historia dni zostaje nietknięta.
// W bazie wystarczy jedno zapytanie: składniki usunie kaskada (on delete cascade).
export const deleteCustomRecipe = async (recipeId) => {
    const account = await getSignedInClient();
    if (account && isUuid(recipeId)) {
        const { error } = await account.supabase.from("custom_recipes").delete().eq("id", recipeId);
        if (error) {
            console.error("Supabase custom_recipes:", error);
            return { error: SAVE_FAILED };
        }
    }

    const remaining = getCustomRecipes().filter((recipe) => recipe.id !== recipeId);
    return saveState(RECIPES_STORAGE_KEY, remaining) ? { error: null } : { error: LOCAL_SAVE_FAILED };
};

// Pobiera własne przepisy zalogowanego (razem ze składnikami) do localStorage.
// Zwraca true, gdy lokalna kopia się zmieniła. Błąd sieci = zostajemy przy lokalnej.
export const pullCustomRecipesFromServer = async () => {
    const account = await getSignedInClient();
    if (!account) return false;

    // Zagnieżdżony select: Supabase sam dołącza składniki po kluczu obcym
    // recipe_id (to jest JOIN, tylko zapisany jako "tabela(kolumny)").
    const { data, error } = await account.supabase
        .from("custom_recipes")
        .select(
            "id, title, category, calories, protein, fats, carbs, fiber, created_at, custom_recipe_ingredients(product_id, grams, position)",
        )
        .order("created_at", { ascending: false }) // najnowsze pierwsze, jak lokalnie
        .order("position", { referencedTable: "custom_recipe_ingredients" });
    if (error) {
        console.error("Supabase pull custom_recipes:", error);
        return false;
    }

    // Pusta baza przy niepustej lokalnej liście = przepisy sprzed konta.
    // Nie kasujemy ich — przeniesienie do bazy to etap 6.
    if (data.length === 0) return false;

    const serverRecipes = data.map((row) => ({
        id: row.id,
        source: "user",
        title: row.title,
        category: row.category,
        ingredients: row.custom_recipe_ingredients.map((item) => ({
            productId: item.product_id,
            grams: Number(item.grams),
        })),
        calories: Number(row.calories),
        protein: Number(row.protein),
        fats: Number(row.fats),
        carbs: Number(row.carbs),
        fiber: Number(row.fiber),
        createdAt: getDateKey(new Date(row.created_at)),
    }));

    const local = readState(RECIPES_STORAGE_KEY);
    if (local.status === "ok" && JSON.stringify(local.data) === JSON.stringify(serverRecipes)) return false;
    return saveState(RECIPES_STORAGE_KEY, serverRecipes);
};

export const clearCustomRecipes = () => removeState(RECIPES_STORAGE_KEY);

// ---------- Szkic kreatora ----------

// localStorage, a nie sessionStorage: system potrafi zabić PWA w tle
// (np. gdy użytkownik przełączy się do aparatu), a nowy start = nowa sesja.
// Szkic z innego dnia jest odrzucany, żeby nie zaskoczyć wczorajszym posiłkiem.
//
// Dwa osobne szkice: nowego posiłku i edycji. Wspólny klucz sprawiał, że
// otwarcie edycji nadpisałoby niedokończony nowy posiłek (i odwrotnie).
// `editId` = null → szkic nowego posiłku; id przepisu → szkic jego edycji.
const getDraftKey = (editId) => (editId ? EDIT_DRAFT_STORAGE_KEY : DRAFT_STORAGE_KEY);

export const getMealDraft = (editId = null) => {
    // Uszkodzony szkic traktujemy jak brak szkicu: i tak wygasa następnego
    // dnia, więc nie jest wart ani kopii, ani komunikatu.
    const { data: draft } = readState(getDraftKey(editId));
    // Szkic edycji innego przepisu też odrzucamy — nie wolno go wczytać do złej karty.
    if (!draft || draft.date !== getDateKey() || (draft.editId ?? null) !== editId) {
        clearMealDraft(editId);
        return null;
    }
    return draft;
};

export const saveMealDraft = ({ title, category, ingredients }, editId = null) => {
    saveState(getDraftKey(editId), { date: getDateKey(), editId, title, category, ingredients });
};

export const clearMealDraft = (editId = null) => removeState(getDraftKey(editId));

// "Skasuj dane aplikacji" — oba szkice naraz.
export const clearAllMealDrafts = () => {
    removeState(DRAFT_STORAGE_KEY);
    removeState(EDIT_DRAFT_STORAGE_KEY);
};
