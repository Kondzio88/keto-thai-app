import { renderHome, initHome } from "./pages/home.js";
import { renderRecipes, initRecipes } from "./pages/recipes.js";
import { renderOnboarding, initOnboarding } from "./pages/onboarding.js";
import { renderDashboard, initDashboard } from "./pages/dashboard.js";
import { renderCamp ,initCamp} from "./pages/camp.js";

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
        init: initOnboarding, 
    },
    "/recipes": {
        render: renderRecipes,
        init: initRecipes,
    },
    "/knowledge": {
        render: () => "<h1>Knowledge Base</h1>",
    },
    "/camp":{
        render: renderCamp,
        init:initCamp
    },
    "/contact": {
        render: () => "<h1>Contact Coach</h1>",
    },
};
