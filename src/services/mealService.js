import { saveState, readState, removeState, quarantineCorrupted } from "../state/store.js";
import { getDateKey } from "../utils/date.js";
import { getNetCarbs } from "./productService.js";
import { getSignedInClient, SAVE_FAILED } from "./supabaseClient.js";

const MEALS_STORAGE_KEY = "keto_meals";

export const getAllMeals = () => {
    const result = readState(MEALS_STORAGE_KEY);
    if (result.status === "corrupted") {
        quarantineCorrupted(MEALS_STORAGE_KEY, result.raw, "dziennika posiłków");
        return {};
    }
    return result.data ?? {};
};

export const saveMeals = (meals) => saveState(MEALS_STORAGE_KEY, meals);

export const clearMeals = () => removeState(MEALS_STORAGE_KEY);

// Kopia danych przepisu we wpisie (snapshot) — jedno miejsce dla dodania
// i aktualizacji wpisu, żeby oba zapisywały dokładnie te same pola.
const snapshotRecipe = (recipe) => ({
    recipeId: recipe.id,
    title: recipe.title,
    category: recipe.category, // śniadanie / obiad / kolacja — ikona w dzienniku
    calories: recipe.calories,
    protein: recipe.protein,
    fats: recipe.fats,
    carbs: recipe.carbs, // całkowite — netto liczy getNetCarbs()
    fiber: recipe.fiber ?? 0,
    imageUrl: recipe.imageUrl,
});

// ---------- Zapis (PLAN.md §1a, etap 5, wariant C) ----------
// Zalogowany: najpierw baza, lokalnie dopiero po potwierdzeniu. Gość: tylko lokalnie.
// Akcje zwracają { error }: null albo gotowy komunikat po polsku.

const LOCAL_SAVE_FAILED = "Pamięć przeglądarki jest pełna albo zablokowana (np. tryb prywatny).";

const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// Baza przyjmuje tylko uuid. Stare wpisy (id z Date.now()) żyją wyłącznie
// lokalnie — ich przeniesienie do bazy to etap 6.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Kopia przepisu w kształcie wiersza tabeli meals (nazwy kolumn z supabase/schema.sql).
const toSnapshotRow = (snapshot) => ({
    recipe_id: snapshot.recipeId ?? null,
    title: snapshot.title,
    category: snapshot.category ?? null,
    image_url: snapshot.imageUrl ?? null,
    calories: snapshot.calories,
    protein: snapshot.protein,
    fats: snapshot.fats,
    carbs: snapshot.carbs,
    fiber: snapshot.fiber,
});

export const addMeal = async (recipe) => {
    const now = new Date();
    const today = getDateKey(now);
    const newMeal = {
        // To samo id lokalnie i w bazie — "Usuń" trafia w ten sam wpis w obu miejscach.
        id: crypto.randomUUID(),
        ...snapshotRecipe(recipe),
        time: formatTime(now),
    };

    const account = await getSignedInClient();
    if (account) {
        const { error } = await account.supabase.from("meals").insert({
            id: newMeal.id,
            eaten_on: today,
            eaten_at: now.toISOString(),
            ...toSnapshotRow(newMeal),
        });
        if (error) {
            console.error("Supabase meals:", error);
            return { error: SAVE_FAILED };
        }
    }

    // Odczyt PO czekaniu na bazę: wcześniejszy mógłby nadpisać zmianę zrobioną
    // w międzyczasie (np. drugi posiłek dodany, zanim baza odpowiedziała).
    const meals = getAllMeals();
    meals[today] = [...(meals[today] ?? []), newMeal];
    return saveMeals(meals) ? { error: null } : { error: LOCAL_SAVE_FAILED };
};

// Ile razy przepis jest w dzisiejszym dzienniku — po edycji pytamy, czy je poprawić.
export const countTodayMealsByRecipe = (recipeId) => getTodayMeal().filter((meal) => meal.recipeId === recipeId).length;

// Po edycji przepisu: nadpisuje makro TYLKO dzisiejszych wpisów z tym przepisem.
// Wcześniejsze dni zostają nietknięte — to historia tego, co faktycznie zjedzono.
// id i godzina wpisu zostają, zmienia się tylko kopia danych przepisu.
export const updateTodayMealsFromRecipe = async (recipe) => {
    const today = getDateKey();
    const snapshot = snapshotRecipe(recipe);

    const account = await getSignedInClient();
    if (account) {
        const { error } = await account.supabase
            .from("meals")
            .update(toSnapshotRow(snapshot))
            .eq("recipe_id", recipe.id)
            .eq("eaten_on", today);
        if (error) {
            console.error("Supabase meals:", error);
            return { error: SAVE_FAILED };
        }
    }

    const meals = getAllMeals();
    if (!meals[today]) return { error: null };
    meals[today] = meals[today].map((meal) => (meal.recipeId === recipe.id ? { ...meal, ...snapshot } : meal));
    return saveMeals(meals) ? { error: null } : { error: LOCAL_SAVE_FAILED };
};

export const getTodayMeal = () => {
    const meals = getAllMeals();
    const today = getDateKey();

    return meals[today] ? meals[today] : [];
};

export const removeMeal = async (mealId) => {
    const account = await getSignedInClient();
    if (account && UUID_PATTERN.test(mealId)) {
        const { error } = await account.supabase.from("meals").delete().eq("id", mealId);
        if (error) {
            console.error("Supabase meals:", error);
            return { error: SAVE_FAILED };
        }
    }

    const meals = getAllMeals();
    const today = getDateKey();
    if (!meals[today]) return { error: null };
    meals[today] = meals[today].filter((meal) => meal.id !== mealId);
    return saveMeals(meals) ? { error: null } : { error: LOCAL_SAVE_FAILED };
};

// Pobiera dziennik zalogowanego z bazy do localStorage (kształt { "RRRR-MM-DD": [wpisy] }).
// Zwraca true, gdy lokalna kopia się zmieniła. Błąd sieci = zostajemy przy lokalnej.
// Pobieramy całą historię — przy jednym użytkowniku to setki wierszy, nie miliony.
// Gdy urośnie, wystarczy zawęzić zapytanie do ostatnich dni.
export const pullMealsFromServer = async () => {
    const account = await getSignedInClient();
    if (!account) return false;

    const { data, error } = await account.supabase
        .from("meals")
        .select("id, eaten_on, eaten_at, recipe_id, title, category, image_url, calories, protein, fats, carbs, fiber")
        .order("eaten_at");
    if (error) {
        console.error("Supabase pull meals:", error);
        return false;
    }

    // Pusta baza przy niepustej lokalnej kopii = dane sprzed konta. Nie kasujemy
    // ich — przeniesienie do bazy to etap 6.
    const local = readState(MEALS_STORAGE_KEY);
    if (data.length === 0) return false;

    // numeric z Postgresa porównujemy jako liczby, nie napisy.
    const serverMeals = {};
    for (const row of data) {
        (serverMeals[row.eaten_on] ??= []).push({
            id: row.id,
            recipeId: row.recipe_id,
            title: row.title,
            category: row.category,
            calories: Number(row.calories),
            protein: Number(row.protein),
            fats: Number(row.fats),
            carbs: Number(row.carbs),
            fiber: Number(row.fiber),
            imageUrl: row.image_url,
            time: formatTime(new Date(row.eaten_at)),
        });
    }

    if (local.status === "ok" && JSON.stringify(local.data) === JSON.stringify(serverMeals)) return false;
    return saveMeals(serverMeals);
};

// Suma makro z listy wpisów — czysta funkcja, niczego nie zapisuje.
// Wpisy sprzed dodania błonnika nie mają `fiber` → liczymy je jako 0.
export const sumMacros = (meals) => {
    const total = meals.reduce(
        (sum, meal) => ({
            calories: sum.calories + meal.calories,
            protein: sum.protein + meal.protein,
            fats: sum.fats + meal.fats,
            carbs: sum.carbs + meal.carbs,
            fiber: sum.fiber + (meal.fiber ?? 0),
        }),
        { calories: 0, protein: 0, fats: 0, carbs: 0, fiber: 0 },
    );

    return { ...total, netCarbs: getNetCarbs(total) };
};
