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

// Treść w osobnych częściach, każda z własną wagą wizualną (wcześniej jedno
// zdanie — nazwa, kalorie i "dodano" ginęły w nim na równi):
//   stamp  — pieczątka, np. "Dodano" (DESIGN.md §5: pieczątka zamiast badge'a)
//   title  — główna treść, np. nazwa posiłku
//   meta   — opcjonalnie DANE pod spodem, np. "375 kcal" (Martian Mono — pomiar)
//   note   — opcjonalnie ZDANIE pod spodem (Public Sans — mono to nie kostium, §9)
//   action — opcjonalnie { label, href }; link idzie przez router (data-link)
// Wszystko przez textContent, nie innerHTML: title bywa nazwą własnego przepisu
// wpisaną przez użytkownika (ta sama klasa błędu co XSS w dzienniku z 25.09).
export const showToast = ({ stamp, title, meta, note, action }) => {
    const target = getRegion();
    hideToast();

    const toast = document.createElement("div");
    toast.className = "toast paper";

    const body = document.createElement("div");
    body.className = "toast__body";

    if (stamp) {
        const stampEl = document.createElement("span");
        stampEl.className = "stamp toast__stamp";
        stampEl.textContent = stamp;
        body.appendChild(stampEl);
    }

    const titleEl = document.createElement("p");
    titleEl.className = "toast__title";
    titleEl.textContent = title;
    body.appendChild(titleEl);

    for (const [text, className] of [
        [meta, "toast__meta"],
        [note, "toast__note"],
    ]) {
        if (!text) continue;
        const el = document.createElement("p");
        el.className = className;
        el.textContent = text;
        body.appendChild(el);
    }

    toast.appendChild(body);

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
