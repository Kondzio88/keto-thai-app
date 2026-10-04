import { addMeal } from "../services/mealService.js";
import { getUser } from "../services/userService.js";
import { showToast } from "./toast.js";

// Wspólna reakcja na "Dodaj do mojego dnia" — karta przepisu (/recipes)
// i ekran po zapisie w kreatorze. Użytkownik zostaje tam, gdzie jest
// (może przeglądać dalej), a toast daje mu jedno kliknięcie do Dashboardu.
export const addRecipeToDay = (recipe, button) => {
    // aria-disabled zamiast disabled: zablokowany przycisk wypada z fokusu
    // i osoba na klawiaturze ląduje "nigdzie". Dlatego blokujemy sami.
    if (button.getAttribute("aria-disabled") === "true") return;

    // Zapis może się nie udać (pełna pamięć, część trybów prywatnych) — wtedy nie
    // zmieniamy przycisku i nie ogłaszamy sukcesu, żeby można było spróbować ponownie.
    if (!addMeal(recipe)) {
        showToast({
            stamp: "Uwaga",
            title: "Nie udało się dodać posiłku",
            note: "Pamięć przeglądarki jest pełna albo zablokowana (np. tryb prywatny).",
        });
        return;
    }

    button.setAttribute("aria-disabled", "true");
    button.classList.add("btn--icon");
    button.innerHTML = '<i data-lucide="check" aria-hidden="true"></i> Dodano do dnia';
    window.lucide?.createIcons();

    // Bez profilu Dashboard jest za guardem (router.js) — "Zobacz dzień"
    // przerzuciłoby na onboarding bez słowa wyjaśnienia. Mówimy to wprost.
    const hasProfile = Boolean(getUser());
    showToast({
        stamp: "Dodano",
        title: recipe.title,
        meta: `${recipe.calories} kcal`,
        note: hasProfile ? null : "Bilans dnia zobaczysz po uzupełnieniu profilu.",
        action: hasProfile
            ? { label: "Zobacz dzień", href: "/dashboard" }
            : { label: "Uzupełnij profil", href: "/onboarding" },
    });
};
