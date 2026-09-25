import { saveState, loadState } from "../state/store.js";
import { getDateKey } from "../utils/date.js";
import { sumIngredients } from "./productService.js";

const RECIPES_STORAGE_KEY = "keto_custom_recipes";
const DRAFT_STORAGE_KEY = "keto_meal_draft";

// ---------- Własne przepisy ----------

export const getCustomRecipes = () => loadState(RECIPES_STORAGE_KEY) ?? [];

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
export const getMealDraft = () => {
    const draft = loadState(DRAFT_STORAGE_KEY);
    if (!draft || draft.date !== getDateKey()) {
        clearMealDraft();
        return null;
    }
    return draft;
};

export const saveMealDraft = ({ title, category, ingredients }) => {
    saveState(DRAFT_STORAGE_KEY, { date: getDateKey(), title, category, ingredients });
};

export const clearMealDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
};
