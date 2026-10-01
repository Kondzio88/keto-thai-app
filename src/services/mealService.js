import { saveState, loadState } from "../state/store.js";
import { getDateKey } from "../utils/date.js";
import { getNetCarbs } from "./productService.js";

const MEALS_STORAGE_KEY = "keto_meals";

export const getAllMeals = () => {
    const savedMeals = loadState(MEALS_STORAGE_KEY);
    const allMeals = savedMeals ? savedMeals : {};
    return allMeals;
};

export const saveMeals = (meals) => saveState(MEALS_STORAGE_KEY, meals);

export const clearMeals = () => {
    localStorage.removeItem(MEALS_STORAGE_KEY);
};

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

export const addMeal = (recipe) => {
    const meals = getAllMeals();

    const today = getDateKey();

    if (!meals[today]) {
        meals[today] = [];
    }
    const newMeal = {
        id: Date.now().toString(), // unikalne ID tego wpisu
        ...snapshotRecipe(recipe),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    meals[today].push(newMeal);

    saveMeals(meals);
};

// Ile razy przepis jest w dzisiejszym dzienniku — po edycji pytamy, czy je poprawić.
export const countTodayMealsByRecipe = (recipeId) => getTodayMeal().filter((meal) => meal.recipeId === recipeId).length;

// Po edycji przepisu: nadpisuje makro TYLKO dzisiejszych wpisów z tym przepisem.
// Wcześniejsze dni zostają nietknięte — to historia tego, co faktycznie zjedzono.
// id i godzina wpisu zostają, zmienia się tylko kopia danych przepisu.
export const updateTodayMealsFromRecipe = (recipe) => {
    const meals = getAllMeals();
    const today = getDateKey();
    if (!meals[today]) return 0;

    let updatedCount = 0;
    meals[today] = meals[today].map((meal) => {
        if (meal.recipeId !== recipe.id) return meal;
        updatedCount += 1;
        return { ...meal, ...snapshotRecipe(recipe) };
    });

    saveMeals(meals);
    return updatedCount;
};

export const getTodayMeal = () => {
    const meals = getAllMeals();
    const today = getDateKey();

    return meals[today] ? meals[today] : [];
};

export const removeMeal = (mealId) => {
    const meals = getAllMeals();
    const today = getDateKey();

    if (!meals[today]) return;

    meals[today] = meals[today].filter((meal) => meal.id !== mealId);
    saveMeals(meals);
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
