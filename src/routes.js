import { renderHome } from './pages/home.js';
import { renderRecipes } from './pages/recipes.js';
import { renderOnboarding, initOnboarding } from './pages/onboarding.js';

export const routes = {
    '/': {
        render: renderHome
    },
    '/dashboard': {
        render: renderOnboarding,
        init: initOnboarding // Ta funkcja odpali się tuż po wyrenderowaniu formularza!
    },
    '/recipes': {
        render: renderRecipes
    },
    '/knowledge': {
        render: () => '<h1>Knowledge Base</h1>'
    },
    '/contact': {
        render: () => '<h1>Contact Coach</h1>'
    }
};