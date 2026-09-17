 import { routes } from "./routes.js";
import { getUser } from "./services/userService.js";
import { getBase, getCurrentPath } from "./utils/env.js";

let currentRoute = null;
const appContainer = document.getElementById("app");

const renderContent = () => {
    currentRoute?.cleanup?.();

    const user = getUser();

    let path = getCurrentPath();

    if (
        !user &&
        path !== "/onboarding" &&
        path !== "/" &&
        path !== "/recipes" &&
        path !== "/knowledge" &&
        path !== "/contact" &&
        path !== "/camp"
    ) {
        path = "/onboarding";
        window.history.replaceState(null, null, getBase() + path);
    } else if (user && path === "/onboarding") {
        path = "/dashboard";
        window.history.replaceState(null, null, getBase() + path);
    }

    const route = routes[path] || routes["/"];

    currentRoute = route;

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

    window.addEventListener("popstate", renderContent);

    renderContent();
};
