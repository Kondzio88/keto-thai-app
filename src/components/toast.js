// Krótkie potwierdzenie na dole ekranu ("Dodano do dnia") z jedną akcją.
// Nie blokuje ekranu i nie zabiera fokusu — w przeciwieństwie do modala nie ma
// tu decyzji do podjęcia, więc nie wolno przerywać użytkownikowi pracy.

const VISIBLE_MS = 8000;

let region = null;
let hideTimer = null;
let showTimer = null;

// Region `role="status"` musi istnieć w DOM, ZANIM pojawi się w nim treść —
// czytnik ekranu ogłasza zmianę zawartości, nie nowo wstawiony element.
// Dlatego tworzymy go raz i zostawiamy na stałe, a treść podmieniamy.
const getRegion = () => {
    if (region) return region;

    region = document.createElement("div");
    region.className = "toast-region";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    document.body.appendChild(region);

    // Pauza, gdy użytkownik celuje w toast myszką albo wszedł w niego klawiaturą
    // (WCAG 2.2.1 — nikt nie powinien przegrać wyścigu z licznikiem).
    region.addEventListener("mouseenter", pauseHide);
    region.addEventListener("mouseleave", scheduleHide);
    region.addEventListener("focusin", pauseHide);
    region.addEventListener("focusout", (event) => {
        if (!region.contains(event.relatedTarget)) scheduleHide();
    });
    region.addEventListener("keydown", (event) => {
        if (event.key === "Escape") hideToast();
    });

    return region;
};

function pauseHide() {
    clearTimeout(hideTimer);
}

function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideToast, VISIBLE_MS);
}

export function hideToast() {
    clearTimeout(hideTimer);
    clearTimeout(showTimer);
    if (region) region.replaceChildren();
}

// message — zwykły tekst. Wstawiany przez textContent, nie innerHTML: w komunikacie
// bywa nazwa własnego przepisu wpisana przez użytkownika (ta sama klasa błędu co XSS
// w dzienniku Dashboardu z 25.09).
// action — opcjonalnie { label, href }; link idzie przez router (data-link).
export const showToast = ({ message, action }) => {
    const target = getRegion();
    hideToast();

    const toast = document.createElement("div");
    toast.className = "toast paper";

    const text = document.createElement("p");
    text.className = "toast__text";
    text.textContent = message;
    toast.appendChild(text);

    const actions = document.createElement("div");
    actions.className = "toast__actions";

    if (action) {
        const link = document.createElement("a");
        link.className = "btn btn--secondary toast__action";
        link.href = action.href;
        link.dataset.link = "";
        link.textContent = action.label;
        // Router (delegacja na body) zrobi nawigację; my tylko sprzątamy toast.
        link.addEventListener("click", () => setTimeout(hideToast));
        actions.appendChild(link);
    }

    const close = document.createElement("button");
    close.type = "button";
    close.className = "toast__close";
    close.setAttribute("aria-label", "Zamknij powiadomienie");
    close.innerHTML = '<i data-lucide="x" aria-hidden="true"></i>';
    close.addEventListener("click", hideToast);
    actions.appendChild(close);

    toast.appendChild(actions);

    // Przy pierwszym wywołaniu region dopiero powstał — chwila odstępu,
    // żeby czytnik ekranu zdążył go zarejestrować, zanim zmieni się treść.
    showTimer = setTimeout(() => {
        target.appendChild(toast);
        window.lucide?.createIcons();
        scheduleHide();
    }, 100);
};
