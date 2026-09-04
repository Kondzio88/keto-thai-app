import { saveState, loadState } from "../state/store.js";

const MEALS_STORAGE_KEY = "keto_meals";

export const getAllMeals = () => {
    const savedMeals = loadState(MEALS_STORAGE_KEY);
    const allMeals = savedMeals ? savedMeals : {};
    return allMeals;
};

export const saveMeals = (meals) => saveState(MEALS_STORAGE_KEY, meals);

export const addMeal = (recipe) => {
    const meals = getAllMeals();

    const today = new Date().toISOString().split("T")[0];

    if (!meals[today]) {
        meals[today] = [];
    }
    const newMeal = {
        id: Date.now().toString(), // unikalne ID tego wpisu
        recipeId: recipe.id,
        title: recipe.title,
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
    const today = new Date().toISOString().split("T")[0];

    return meals[today] ? meals[today] : []
}
