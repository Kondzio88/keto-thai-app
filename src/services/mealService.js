import { saveState, loadState } from "../state/store.js";
import { getDateKey } from "../utils/date.js";

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

export const addMeal = (recipe) => {
    const meals = getAllMeals();

    const today = getDateKey();

    if (!meals[today]) {
        meals[today] = [];
    }
    const newMeal = {
        id: Date.now().toString(), // unikalne ID tego wpisu
        recipeId: recipe.id,
        title: recipe.title,
        category: recipe.category, // śniadanie / obiad / kolacja — ikona w dzienniku
        calories: recipe.calories,
        protein: recipe.protein,
        fats: recipe.fats,
        carbs: recipe.carbs,
        imageUrl: recipe.imageUrl,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    meals[today].push(newMeal);

    saveMeals(meals);
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
export const sumMacros = (meals) => {
    return meals.reduce(
        (total, meal) => ({
            calories: total.calories + meal.calories,
            protein: total.protein + meal.protein,
            fats: total.fats + meal.fats,
            carbs: total.carbs + meal.carbs,
        }),
        { calories: 0, protein: 0, fats: 0, carbs: 0 },
    );
};
