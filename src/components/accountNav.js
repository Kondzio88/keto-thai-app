import { html } from "../utils/template.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { getCurrentPath } from "../utils/env.js";
import { ACCOUNTS_ENABLED } from "../config.js";
import { getSession } from "../services/authService.js";
import { getUser } from "../services/userService.js";

// Pozycja konta w szufladzie (mobile) i na dole sidebara (desktop).
// Trzy stany z PLAN.md §1a: gość bez profilu → gość z profilem → zalogowany.

const getAccountState = (session) => {
    if (session) return "signed-in";
    return getUser() ? "guest-profile" : "guest";
};

const USER_ICON = html`<svg class="drawer-account__icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
</svg>`;

const renderDrawerSlot = (state, session, links) => {
    if (state === "signed-in") {
        return html`<a href="/konto" data-link class="drawer-account__profile">
            ${USER_ICON}
            <span class="drawer-account__name">
                <span>Konto</span>
                <span class="drawer-account__email">${escapeHtml(session.email)}</span>
            </span>
        </a>`;
    }

    if (state === "guest-profile") {
        return html`<section class="drawer-account__card paper" aria-labelledby="drawer-account-title">
            <div class="drawer-account__holes" aria-hidden="true">
                <span class="hole"></span>
                <span class="hole"></span>
            </div>
            <h2 class="drawer-account__title" id="drawer-account-title">Dziennik tylko na tym telefonie</h2>
            <p class="drawer-account__text">
                Wyczyszczenie przeglądarki albo nowy telefon usunie posiłki i pomiary. Konto przechowa je za Ciebie.
            </p>
            <a href="${links.register}" data-link class="btn btn--primary">Załóż konto</a>
            <p class="drawer-account__text">
                Masz konto? <a href="${links.signIn}" data-link class="drawer-account__link">Zaloguj się</a>
            </p>
        </section>`;
    }

    return html`<p class="drawer-account__lead">Masz już dziennik na innym urządzeniu?</p>
        <a href="${links.signIn}" data-link class="btn btn--secondary btn--icon drawer-account__signin">
            ${USER_ICON}<span>Zaloguj się</span>
        </a>`;
};

const TAB_LABELS = {
    guest: "Zaloguj",
    "guest-profile": "Zapisz dane",
    "signed-in": "Konto",
};

// Woła ją main.js po każdej zmianie strony i po zalogowaniu/wylogowaniu.
// Stan "gość z profilem" zmienia się bez logowania (onboarding zapisuje profil),
// dlatego odświeżamy też po każdej nawigacji, nie tylko po zmianie sesji.
export const updateAccountNav = async () => {
    if (!ACCOUNTS_ENABLED) return;

    const drawerSlot = document.getElementById("drawer-account");
    const tabLink = document.getElementById("tabbar-account");
    if (!drawerSlot || !tabLink) return;

    const session = await getSession();
    const state = getAccountState(session);

    // ?wroc= — po zalogowaniu użytkownik wraca na stronę, z której przyszedł.
    const path = getCurrentPath();
    const returnQuery = path.startsWith("/konto") ? "" : `?wroc=${encodeURIComponent(path)}`;
    const links = { signIn: `/konto${returnQuery}`, register: `/konto/rejestracja${returnQuery}` };

    drawerSlot.innerHTML = renderDrawerSlot(state, session, links);
    drawerSlot.hidden = false;

    const tabHref = { guest: links.signIn, "guest-profile": links.register, "signed-in": "/konto" }[state];
    tabLink.setAttribute("href", tabHref);
    tabLink.querySelector(".tabbar__label").textContent = TAB_LABELS[state];
    // Kropka to tylko wzmocnienie — stan niesie też tekst etykiety ("Zapisz dane").
    tabLink.querySelector(".tabbar__account-dot").classList.toggle("is-hidden", state !== "guest-profile");
    tabLink.hidden = false;
};
