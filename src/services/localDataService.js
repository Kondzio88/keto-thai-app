import { readState, saveState, removeState } from "../state/store.js";
import { clearUser } from "./userService.js";
import { clearMeals } from "./mealService.js";
import { clearCustomRecipes, clearAllMealDrafts } from "./customRecipeService.js";

// Znacznik właściciela danych lokalnych (PLAN.md §1a, etap 6). Kartka gościa
// i kopia danych zalogowanego wyglądają w localStorage identycznie — różni je
// tylko to, czy znamy właściciela:
//   brak znacznika   → dane gościa (jedyny oryginał, nie wolno ich nadpisać)
//   id użytkownika   → kopia danych z bazy tego konta
const OWNER_STORAGE_KEY = "keto_owner";

export const getLocalOwner = () => {
    const { status, data } = readState(OWNER_STORAGE_KEY);
    return status === "ok" && typeof data === "string" ? data : null;
};

export const setLocalOwner = (userId) => saveState(OWNER_STORAGE_KEY, userId);

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
    removeState(OWNER_STORAGE_KEY);
};
