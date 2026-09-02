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

document.addEventListener("DOMContentLoaded", () => {
    initRouter();

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
