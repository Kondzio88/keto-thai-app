import { routes } from "./routes.js";
import { getUser } from "./services/userService.js";
import { getBase } from "./utils/env.js";

const appContainer = document.getElementById("app");

const renderContent = () => {
    const user = getUser();

    let path = window.location.pathname;

    if (path.includes("/keto-thai-app")) {
        path = path.replace("/keto-thai-app", "") || "/";
    }

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

    appContainer.innerHTML = route.render();

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
    document.body.addEventListener("click", (event) => {
        if (event.target.matches("[data-link]")) {
            event.preventDefault();
            navigateTo(event.target.getAttribute("href"));
        }
    });

    window.addEventListener("popstate", renderContent);

    renderContent();
};
