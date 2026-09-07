import { initRouter } from "./router.js";

/**
 * Podświetla aktywną zakładkę w Bottom Tab Bar
 * na podstawie aktualnej ścieżki URL.
 */
const updateActiveTab = () => {
    let path = window.location.pathname;

    if (path.includes("/keto-thai-app")) {
        path = path.replace("/keto-thai-app", "") || "/";
    }

    const links = document.querySelectorAll(".tabbar__link");

    links.forEach((link) => {
        const href = link.getAttribute("href");
        const isActive = href === path;

        link.classList.toggle("tabbar__link--active", isActive);
    });
};

/**
 * Otwiera/zamyka szufladę "Więcej" w górnym pasku (topbar).
 */
const initTopbarDrawer = () => {
    const topbar = document.getElementById("topbar");
    const toggle = document.getElementById("topbar-toggle");
    const drawer = document.getElementById("topbar-drawer");

    if (!topbar || !toggle || !drawer) return;

    const closeDrawer = () => {
        topbar.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
        const isOpen = topbar.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Klik w link wewnątrz szuflady zamyka ją (router obsłuży nawigację)
    drawer.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            closeDrawer();
        }
    });
};

document.addEventListener("DOMContentLoaded", () => {
    initRouter();
    initTopbarDrawer();

    // Aktualizuj aktywną zakładkę po każdej nawigacji
    updateActiveTab();
    window.addEventListener("popstate", updateActiveTab);

    // Nasłuchuj kliknięć w Tab Bar (router obsługuje nawigację, my odświeżamy aktywność)
    const tabbar = document.getElementById("tabbar");
    if (tabbar) {
        tabbar.addEventListener("click", () => {
            // Krótkie opóźnienie, by router zdążył zmienić URL
            requestAnimationFrame(updateActiveTab);
        });
    }
});
