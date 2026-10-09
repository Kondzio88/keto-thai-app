import { saveState, readState, removeState, quarantineCorrupted } from "../state/store.js";
import { getDateKey } from "../utils/date.js";
import { getNetCarbs } from "./productService.js";
import { getSignedInClient, isUuid, SAVE_FAILED } from "./supabaseClient.js";

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

// Wpisy z dowolnego dnia "RRRR-MM-DD" — przełącznik dni na Dashboardzie czyta też przeszłość.
export const getMealsForDay = (dateKey) => getAllMeals()[dateKey] ?? [];

export const getTodayMeal = () => getMealsForDay(getDateKey());

export const removeMeal = async (mealId) => {
    const account = await getSignedInClient();
    if (account && isUuid(mealId)) {
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

// Godzina wpisu gościa ("14:05") + dzień → znacznik czasu dla kolumny eaten_at.
// Konstruktor z liczbami liczy w czasie LOKALNYM (new Date("RRRR-MM-DD") byłby UTC).
// Wpis bez czytelnej godziny dostaje południe — kolejność w obrębie dnia jest
// wtedy przybliżona, ale dzień (eaten_on) zostaje dokładny.
const toEatenAt = (dateKey, time) => {
    const [year, month, day] = dateKey.split("-").map(Number);
    const match = /^(\d{1,2}):(\d{2})/.exec(time ?? "");
    const [hours, minutes] = match ? [Number(match[1]), Number(match[2])] : [12, 0];
    return new Date(year, month - 1, day, hours, minutes).toISOString();
};

// Etap 6: wpisy gościa → konto. Wymaga id w formacie uuid (accountMergeService
// zamienia stare id wcześniej). `ignoreDuplicates` po id: ponowna próba po
// przerwanym przenoszeniu nie zdubluje wpisów, które już weszły.
// `entries` = [{ date: "RRRR-MM-DD", meal }]. Zwraca true, gdy baza przyjęła wszystko.
export const pushGuestMealsToServer = async ({ supabase }, entries) => {
    if (entries.length === 0) return true;

    // Stare wpisy nie mają błonnika — jawne 0, bo w wielowierszowym insercie
    // brakujące pole stałoby się NULL-em, a kolumna fiber jest NOT NULL.
    const rows = entries.map(({ date, meal }) => ({
        id: meal.id,
        eaten_on: date,
        eaten_at: toEatenAt(date, meal.time),
        ...toSnapshotRow({ ...meal, fiber: meal.fiber ?? 0 }),
    }));

    const { error } = await supabase.from("meals").upsert(rows, { onConflict: "id", ignoreDuplicates: true });
    if (error) console.error("Supabase meals (przeniesienie):", error);
    return !error;
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

    // Pusta baza: nie kasujemy lokalnej kopii. Dane gościa trafiają do bazy
    // wcześniej, w accountMergeService (etap 6).
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
