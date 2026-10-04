import { initRouter } from "./router.js";
import { getCurrentPath , getBase} from "./utils/env.js";
import { initInstallPromptCapture } from "./utils/installPrompt.js";
import { initInstallBanner } from "./components/installBanner.js";
import { onCorruptedData } from "./state/store.js";
import { showToast } from "./components/toast.js";

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
        const href = link.getAttribute("href");
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
    initRouter();
    initTopbarDrawer();
    initDisclaimerLinks();
    initInstallBanner();

    // Aktualizuj aktywną zakładkę po każdej nawigacji
    updateActiveTab();
    window.addEventListener("popstate", updateActiveTab);

    // Nasłuchuj kliknięć w Tab Bar (router obsługuje nawigację, my odświeżamy aktywność)
    const tabbar = document.getElementById("tabbar");
    if (tabbar) {
        tabbar.addEventListener("click", () => {
            // Krótkie opóźnienie, by router zdążył zmienić URL
            requestAnimationFrame(updateActiveTab);
        });
    }
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