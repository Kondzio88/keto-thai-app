import { clearUser } from "./userService.js";
import { clearMeals } from "./mealService.js";
import { clearCustomRecipes, clearAllMealDrafts } from "./customRecipeService.js";

// Usuwa z przeglądarki wszystko, co appka wie o osobie: profil z historią wagi,
// dziennik, własne przepisy i szkice kreatora. Jedno miejsce dla "Skasuj dane
// aplikacji", wylogowania i usunięcia konta — nowy klucz w localStorage
// dopisujemy tylko tutaj (PLAN.md §1a, etap 5: wylogowanie czyści dane lokalne).
// U zalogowanego kasuje tylko lokalną kopię; oryginał zostaje w bazie.
export const clearLocalData = () => {
    clearUser();
    clearMeals();
    clearCustomRecipes();
    clearAllMealDrafts();
};
