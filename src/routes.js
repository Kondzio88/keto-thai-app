import { renderHome, initHome } from "./pages/home.js";
import { renderRecipes, initRecipes } from "./pages/recipes.js";
import { renderOnboarding, initOnboarding } from "./pages/onboarding.js";
import { renderDashboard, initDashboard, cleanupDashboard } from "./pages/dashboard.js";
import { renderCamp, initCamp } from "./pages/camp.js";
import { renderContact, initContact } from "./pages/contact.js";

export const routes = {
    "/": {
        render: renderHome,
        init: initHome,
    },
    "/dashboard": {
        render: renderDashboard,
        init: initDashboard,
        cleanup:cleanupDashboard,
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
        render: () => `
            <div class="page-container">
                <h1 class="page-header__title">Baza Wiedzy</h1>
                <span class="stamp-off">W opracowaniu</span>
                <p class="page-header__desc">
                    Artykuły o keto, wydolności i regeneracji pojawią się tutaj w kolejnym etapie budowy aplikacji.
                </p>
            </div>
        `,
    },
    "/camp": {
        render: renderCamp,
        init: initCamp,
    },
    "/contact": {
        render: renderContact,
        init: initContact,
    },
};
