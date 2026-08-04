import { renderHome } from './pages/home.js';

export const routes = {
    '/': renderHome,
    '/dashboard': () => '<h1>Dashboard - Your Progress</h1>',
    '/recipes': () => '<h1>Recipes - Keto Meals</h1>',
    '/knowledge': () => '<h1>Knowledge Base</h1>',
    '/contact': () => '<h1>Contact Coach</h1>'
};