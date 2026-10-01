import { saveState, loadState } from "../state/store.js";
import { getDateKey } from "../utils/date.js";
import { sumIngredients } from "./productService.js";

const RECIPES_STORAGE_KEY = "keto_custom_recipes";
const DRAFT_STORAGE_KEY = "keto_meal_draft";
const EDIT_DRAFT_STORAGE_KEY = "keto_meal_edit_draft";

// ---------- Własne przepisy ----------

// Przepisy zapisane przed 29.09 nie mają `fiber`. Skład jest zapisany, więc
// uzupełniamy sam błonnik z bazy produktów — reszta sum zostaje nietknięta.
export const getCustomRecipes = () =>
    (loadState(RECIPES_STORAGE_KEY) ?? []).map((recipe) =>
        recipe.fiber === undefined ? { ...recipe, fiber: sumIngredients(recipe.ingredients).fiber } : recipe,
    );

export const getCustomRecipeById = (recipeId) => getCustomRecipes().find((recipe) => recipe.id === recipeId);

// Zapisujemy skład ({ productId, grams }) ORAZ sumy. Skład pozwoli kiedyś na
// edycję, sumy mają ten sam kształt co RECIPES_DATA, więc addMeal() i karty
// przepisów działają bez zmian.
export const createCustomRecipe = ({ title, category, ingredients }) => {
    const recipe = {
        id: `user-${Date.now()}`,
        source: "user",
        title,
        category,
        ingredients,
        ...sumIngredients(ingredients),
        createdAt: getDateKey(),
    };

    saveState(RECIPES_STORAGE_KEY, [recipe, ...getCustomRecipes()]);
    return recipe;
};

// Nadpisuje skład i sumy, zachowuje id i datę utworzenia — karta zostaje
// "tym samym" przepisem (to samo id = te same powiązania z dziennikiem).
// Zwraca zaktualizowany przepis albo null, gdy przepisu już nie ma.
export const updateCustomRecipe = (recipeId, { title, category, ingredients }) => {
    let updated = null;

    const recipes = getCustomRecipes().map((recipe) => {
        if (recipe.id !== recipeId) return recipe;

        updated = {
            ...recipe,
            title,
            category,
            ingredients,
            ...sumIngredients(ingredients),
            updatedAt: getDateKey(),
        };
        return updated;
    });

    if (updated) saveState(RECIPES_STORAGE_KEY, recipes);
    return updated;
};

// Usuwa wyłącznie przepisy użytkownika — przepisy z RECIPES_DATA nie żyją
// w tym magazynie, więc nie da się ich tędy skasować. Wpisy w dzienniku są
// kopiami makro, więc historia dni zostaje nietknięta.
export const deleteCustomRecipe = (recipeId) => {
    const remaining = getCustomRecipes().filter((recipe) => recipe.id !== recipeId);
    saveState(RECIPES_STORAGE_KEY, remaining);
};

export const clearCustomRecipes = () => {
    localStorage.removeItem(RECIPES_STORAGE_KEY);
};

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
    const draft = loadState(getDraftKey(editId));
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

export const clearMealDraft = (editId = null) => {
    localStorage.removeItem(getDraftKey(editId));
};

// "Skasuj dane aplikacji" — oba szkice naraz.
export const clearAllMealDrafts = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    localStorage.removeItem(EDIT_DRAFT_STORAGE_KEY);
};
