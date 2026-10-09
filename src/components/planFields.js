// Pola planu wspólne dla onboardingu i "Zmień dane planu" na Dashboardzie.
// Jedno źródło tekstów: dwie kopie rozjechałyby się przy pierwszej zmianie opisu.
// Liczby (PAL, białko, mnożniki celu) są w calculatorService.js — tu tylko to,
// co widzi użytkownik.

// Przedziały rozłączne: kto trenuje 3×, ma dokładnie jedną pasującą odpowiedź.
export const ACTIVITY_OPTIONS = [
    {
        value: "sedentary",
        label: "Siedzący",
        description: "Praca przy biurku, treningi rzadziej niż raz w tygodniu.",
    },
    {
        value: "light",
        label: "Lekki",
        description: "1–2 treningi w tygodniu albo dużo chodzenia na co dzień.",
    },
    {
        value: "moderate",
        label: "Umiarkowany",
        description: "3–4 treningi w tygodniu, około 60 minut każdy.",
    },
    {
        value: "active",
        label: "Wysoki",
        description: "5–6 treningów w tygodniu albo praca fizyczna i 3 treningi.",
    },
    {
        value: "very_active",
        label: "Bardzo wysoki",
        description:
            "Trening codziennie lub dwa razy dziennie (obóz, przygotowanie do walki) albo ciężka praca fizyczna i treningi.",
    },
];

export const ACTIVITY_HINT = "Liczy się to, co robisz w typowym tygodniu, nie w najlepszym.";

export const GOAL_OPTIONS = [
    { value: "reduction", label: "Redukcja" },
    { value: "still", label: "Utrzymanie wagi" },
    { value: "mass", label: "Przybranie wagi" },
];

// `selected` = wartość z profilu (modal) albo nic (onboarding). Teksty to stałe
// z tego pliku, nie dane użytkownika, więc bez escapeHtml.
export const generateOptionsHTML = (options, selected) =>
    options
        .map(
            ({ value, label }) =>
                `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`,
        )
        .join("");

// Opis pod polem pokazuje, co dokładnie oznacza wybrany poziom —
// w <option> się nie zmieści, a bez niego użytkownik wybiera na oko.
export const getActivityNote = (value) =>
    ACTIVITY_OPTIONS.find((option) => option.value === value)?.description ?? ACTIVITY_HINT;

export const bindActivityNote = (select, note) => {
    select.addEventListener("change", () => {
        note.textContent = getActivityNote(select.value);
    });
};
