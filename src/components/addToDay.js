import { addMeal } from "../services/mealService.js";
import { getUser } from "../services/userService.js";
import { showToast } from "./toast.js";

// Wspólna reakcja na "Dodaj do mojego dnia" — karta przepisu (/recipes)
// i ekran po zapisie w kreatorze. Użytkownik zostaje tam, gdzie jest
// (może przeglądać dalej), a toast daje mu jedno kliknięcie do Dashboardu.
export const addRecipeToDay = async (recipe, button) => {
    // aria-disabled zamiast disabled: zablokowany przycisk wypada z fokusu
    // i osoba na klawiaturze ląduje "nigdzie". Dlatego blokujemy sami.
    // Blokada działa też w trakcie zapisu — drugie kliknięcie nie doda posiłku dwa razy.
    if (button.getAttribute("aria-disabled") === "true") return;

    const idleHTML = button.innerHTML;
    button.setAttribute("aria-disabled", "true");
    button.textContent = "Dodaję…";

    // Zapis może się nie udać (brak sieci, pełna pamięć) — wtedy przywracamy
    // przycisk i nie ogłaszamy sukcesu, żeby można było spróbować ponownie.
    const { error } = await addMeal(recipe);
    if (error) {
        button.removeAttribute("aria-disabled");
        button.innerHTML = idleHTML;
        window.lucide?.createIcons();
        showToast({ stamp: "Uwaga", title: "Nie udało się dodać posiłku", note: error });
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
