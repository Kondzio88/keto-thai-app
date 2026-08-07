import { routes } from './routes.js';

const appContainer = document.getElementById('app');

const renderContent = () => {
    const path = window.location.pathname;
    const route = routes[path] || routes['/'];

    appContainer.innerHTML = route.render();

    if(window.lucide){
        window.lucide.createIcons();
    }

    if(route.init){
        route.init()
    }
};

export const navigateTo = (url) => {
    window.history.pushState(null, null, url);
    renderContent();
};

export const initRouter = () => {
    document.body.addEventListener('click', (event) => {
        if (event.target.matches('[data-link]')) {
            event.preventDefault();
            navigateTo(event.target.href);
        }
    });

    window.addEventListener('popstate', renderContent);

    renderContent();
};