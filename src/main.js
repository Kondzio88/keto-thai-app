import { initRouter } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {
    // INIT RUTER
    initRouter();

    // MOBILE MENU FUNC
    const menuBtn = document.getElementById("mobile-menu-btn");
    const mainNav = document.getElementById("main-nav");

    if (menuBtn && mainNav) {
        menuBtn.addEventListener("click", () => {
            menuBtn.classList.toggle("is-active");
            mainNav.classList.toggle("is-active");
        });

        mainNav.addEventListener("click", (event) => {
            if (event.target.matches(".header__link")) {
                menuBtn.classList.remove("is-active");
                mainNav.classList.remove("is-active");
            }
        });
    }
});
