import { renderHome, initHome } from "./pages/home.js";
import { renderRecipes, initRecipes } from "./pages/recipes.js";
import { renderOnboarding, initOnboarding } from "./pages/onboarding.js";
import { renderDashboard, initDashboard } from "./pages/dashboard.js";

export const routes = {
    "/": {
        render: renderHome,
        init: initHome,
    },
    "/dashboard": {
        render: renderDashboard,
        init: initDashboard,
    },
    "/onboarding": {
        render: renderOnboarding,
        init: initOnboarding, // Ta funkcja odpali się tuż po wyrenderowaniu formularza!
    },
    "/recipes": {
        render: renderRecipes,
        init: initRecipes,
    },
    "/knowledge": {
        render: () => "<h1>Knowledge Base</h1>",
    },
    "/contact": {
        render: () => "<h1>Contact Coach</h1>",
    },
};
