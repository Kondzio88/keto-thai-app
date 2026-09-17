// Bazowa ścieżka aplikacji bez końcowego "/" (np. "/keto-thai-app").
// Vite wstrzykuje BASE_URL z `base` w vite.config.js — jedno źródło prawdy
// dla dev, preview i GitHub Pages, zamiast zgadywania po nazwie hosta.
export const getBase = () => {
    return import.meta.env.BASE_URL.replace(/\/$/, "");
};

// Ścieżka trasy bez bazy: "/keto-thai-app/dashboard" → "/dashboard".
// Wycina bazę tylko z POCZĄTKU adresu, nigdy ze środka.
export const getCurrentPath = () => {
    const base = getBase();
    const path = window.location.pathname;

    if (base && path.startsWith(base)) {
        return path.slice(base.length) || "/";
    }

    return path;
};
