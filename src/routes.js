import { renderHome, initHome, cleanupHome } from "./pages/home.js";
import { renderRecipes, initRecipes } from "./pages/recipes.js";
import { renderMealBuilder, initMealBuilder } from "./pages/mealBuilder.js";
import { renderOnboarding, initOnboarding } from "./pages/onboarding.js";
import { renderDashboard, initDashboard, cleanupDashboard } from "./pages/dashboard.js";
import { renderCamp, initCamp } from "./pages/camp.js";
import { renderContact, initContact } from "./pages/contact.js";
import { renderAccount, initAccount, renderRegister, initRegister } from "./pages/account.js";
import { ACCOUNTS_ENABLED } from "./config.js";

// Trasy kont istnieją tylko przy włączonej fladze (config.js). Bez niej
// /konto trafia w fallback routera, jak każdy nieznany adres.
const accountRoutes = ACCOUNTS_ENABLED
    ? {
          "/konto": {
              render: renderAccount,
              init: initAccount,
          },
          "/konto/rejestracja": {
              render: renderRegister,
              init: initRegister,
          },
      }
    : {};

export const routes = {
    "/": {
        render: renderHome,
        init: initHome,
        cleanup: cleanupHome,
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
    // Osobny adres, żeby gest "wstecz" wracał do listy przepisów zamiast
    // gubić komponowany posiłek. Wymaga profilu — guard w router.js.
    "/recipes/new": {
        render: renderMealBuilder,
        init: initMealBuilder,
    },
    // Ten sam kreator w trybie edycji: /recipes/edit?id=user-123.
    // Router dopasowuje samą ścieżkę, id czyta kreator z query stringa.
    "/recipes/edit": {
        render: renderMealBuilder,
        init: initMealBuilder,
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
    ...accountRoutes,
};
