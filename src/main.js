import { initRouter, refreshCurrentRoute } from "./router.js";
import { pullUserFromServer } from "./services/userService.js";
import { pullMealsFromServer } from "./services/mealService.js";
import { pullCustomRecipesFromServer } from "./services/customRecipeService.js";
import { getCurrentPath , getBase} from "./utils/env.js";
import { initInstallPromptCapture } from "./utils/installPrompt.js";
import { initInstallBanner } from "./components/installBanner.js";
import { onCorruptedData } from "./state/store.js";
import { showToast } from "./components/toast.js";
import { updateAccountNav } from "./components/accountNav.js";
import { onAuthChange } from "./services/authService.js";
import { clearLocalData } from "./services/localDataService.js";

// Rejestrujemy listener na `beforeinstallprompt` jak najwcześniej — event może
// odpalić się zanim appka w ogóle zdąży wyrenderować pierwszą stronę.
initInstallPromptCapture();

// Rejestrujemy PRZED initRouter — router woła getUser() przy pierwszym renderze,
// więc uszkodzony profil zostanie wykryty, zanim cokolwiek się pokaże.
onCorruptedData((label) => {
    showToast({
        stamp: "Uwaga",
        title: `Nie udało się odczytać ${label}`,
        note: "Kopia uszkodzonego wpisu została zachowana w przeglądarce. Aplikacja działa dalej od pustego stanu.",
    });
});

/**
 * Podświetla aktywną zakładkę w Bottom Tab Bar
 * na podstawie aktualnej ścieżki URL.
 */
const updateActiveTab = () => {
    const path = getCurrentPath();

    const links = document.querySelectorAll(".tabbar__link");

    links.forEach((link) => {
        // `data-active-for` — gdy href zmienia się w locie (pozycja konta:
        // /konto?wroc=… albo /konto/rejestracja), a zakładka ma się zapalać
        // dla całej sekcji. Query w href nie bierze udziału w porównaniu.
        const href = link.dataset.activeFor ?? link.getAttribute("href").split("?")[0];
        // Podstrona też zapala swoją zakładkę (/recipes/new → "Przepisy").
        // "/" sprawdzamy dokładnie, bo każda ścieżka zaczyna się od "/".
        const isActive = href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);

        link.classList.toggle("tabbar__link--active", isActive);
    });
};

/**
 * Otwiera/zamyka szufladę "Więcej" w górnym pasku (topbar).
 */
const initTopbarDrawer = () => {
    const topbar = document.getElementById("topbar");
    const toggle = document.getElementById("topbar-toggle");
    const drawer = document.getElementById("topbar-drawer");

    if (!topbar || !toggle || !drawer) return;

    const closeDrawer = () => {
        topbar.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
        const isOpen = topbar.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Klik w link wewnątrz szuflady zamyka ją (router obsłuży nawigację)
    drawer.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            closeDrawer();
        }
    });
};

/**
 * Link do #zastrzezenia (onboarding, Dashboard) ma pokazać treść, nie zwinięty
 * nagłówek — przewinięcie do zamkniętego <details> nic by nie dało.
 * Otwieramy w `click`, PRZED domyślnym przewinięciem przeglądarki, więc
 * działa też przy ponownym kliknięciu, gdy adres już ma ten #hash.
 */
const DISCLAIMER_ID = "zastrzezenia";

const openDisclaimer = () => {
    const disclaimer = document.getElementById(DISCLAIMER_ID);
    if (disclaimer) disclaimer.open = true;
};

const initDisclaimerLinks = () => {
    document.addEventListener("click", (event) => {
        if (event.target.closest(`a[href="#${DISCLAIMER_ID}"]`)) openDisclaimer();
    });

    // Adres wpisany lub odświeżony z #zastrzezenia — router właśnie wyrenderował
    // stronę i przewinął na górę, więc przewijamy sami.
    if (window.location.hash === `#${DISCLAIMER_ID}`) {
        openDisclaimer();
        document.getElementById(DISCLAIMER_ID)?.scrollIntoView();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // Router wysyła "route:rendered" po KAŻDYM renderze strony — także po
    // navigateTo() z kodu (CTA, formularze), czego nie łapał dawny nasłuch
    // kliknięć w tabbar (RAPORT.md #10). Rejestrujemy PRZED initRouter,
    // bo pierwszy render dzieje się już w jego środku.
    document.addEventListener("route:rendered", () => {
        updateActiveTab();
        updateAccountNav();
    });
    // Start aplikacji u zalogowanego i każde logowanie (e-mail, Google):
    // pobierz dane z bazy do lokalnej kopii, a jeśli się zmieniły, przerysuj stronę.
    onAuthChange(async (user, event) => {
        updateAccountNav();

        // Sesja skończyła się bez przycisku "Wyloguj" na tym urządzeniu, np. po
        // "Wyloguj" na telefonie (scope: "global") — laptop dowiaduje się o tym
        // przy odświeżeniu biletu sesji (PLAN.md §1a, luka nr 9). Sprawdzamy
        // nazwę zdarzenia, a NIE `!user`: gość też nie ma użytkownika, a jego
        // dane istnieją tylko lokalnie. Po "Wyloguj" tutaj czyścimy drugi raz —
        // bez szkody, usunięcie nieistniejącego klucza nic nie robi.
        if (event === "SIGNED_OUT") {
            clearLocalData();
            refreshCurrentRoute(); // zdejmuje dane z ekranu, guard odeśle z Trackera
            return;
        }

        if (!user || (event !== "INITIAL_SESSION" && event !== "SIGNED_IN")) return;
        const changed = await Promise.all([
            pullUserFromServer(),
            pullMealsFromServer(),
            pullCustomRecipesFromServer(),
        ]);
        if (changed.some(Boolean)) refreshCurrentRoute();
    });

    initRouter();
    initTopbarDrawer();
    initDisclaimerLinks();
    initInstallBanner();
});

if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register(`${getBase()}/service-worker.js`)
            .then((registration) => {
                console.log("Service Worker zarejestrowany, scope:", registration.scope);
            })
            .catch((error) => {
                console.error("Rejestracja Service Workera nie powiodła się:", error);
            });
    });
}