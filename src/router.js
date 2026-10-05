 import { routes } from "./routes.js";
import { getUser } from "./services/userService.js";
import { getBase, getCurrentPath } from "./utils/env.js";

let currentRoute = null;
const appContainer = document.getElementById("app");

// Adres bez kotwicy (#…) — ścieżka + query. Query się liczy:
// /recipes/edit?id=a i ?id=b to różne ekrany.
const getPageAddress = () => getCurrentPath() + window.location.search;

// Adres ostatnio wyrenderowanej strony — pozwala odróżnić zmianę strony
// od zmiany samej kotwicy.
let renderedAddress = null;

// Trasy dostępne bez profilu. Konto też: ktoś, kto loguje się na nowym
// telefonie, nie ma jeszcze profilu i nie może zostać odesłany do onboardingu.
const PUBLIC_PATHS = new Set([
    "/",
    "/onboarding",
    "/recipes",
    "/knowledge",
    "/contact",
    "/camp",
    "/konto",
    "/konto/rejestracja",
]);

const renderContent = () => {
    currentRoute?.cleanup?.();

    const user = getUser();

    let path = getCurrentPath();

    if (!user && !PUBLIC_PATHS.has(path)) {
        path = "/onboarding";
        window.history.replaceState(null, null, getBase() + path);
    } else if (user && path === "/onboarding") {
        path = "/dashboard";
        window.history.replaceState(null, null, getBase() + path);
    }

    const route = routes[path] || routes["/"];

    currentRoute = route;
    renderedAddress = getPageAddress(); // po ewentualnym przekierowaniu guarda

    appContainer.innerHTML = route.render();

    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }

    if (route.init) {
        route.init();
    }

    // Sygnał dla elementów spoza #app (nawigacja), że strona się zmieniła —
    // także po navigateTo() z kodu, nie tylko po kliknięciu w link.
    document.dispatchEvent(new CustomEvent("route:rendered"));
};

export const navigateTo = (url) => {
    window.history.pushState(null, null, getBase() + url);
    renderContent();
};

export const initRouter = () => {
    const redirectPath = sessionStorage.getItem("redirectPath");

    if (redirectPath) {
        sessionStorage.removeItem("redirectPath");
        window.history.replaceState(null, null, redirectPath);
    }

    document.body.addEventListener("click", (event) => {
        const linkElement = event.target.closest("[data-link]");

        if (linkElement) {
            event.preventDefault();
            navigateTo(linkElement.getAttribute("href"));
        }
    });

    // Kliknięcie w kotwicę (np. "#steps") też wywołuje popstate. Gdy zmieniła się
    // tylko kotwica, strona jest ta sama — nie przerysowujemy jej (to robiło
    // scrollTo(0, 0) i skok na górę), przewinięcie zostawiamy przeglądarce.
    // "Wstecz" do innej trasy zmienia ścieżkę, więc nadal przerysowuje.
    window.addEventListener("popstate", () => {
        if (getPageAddress() === renderedAddress) return;
        renderContent();
    });

    renderContent();
};
