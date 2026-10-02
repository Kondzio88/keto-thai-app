// Klucz dnia "RRRR-MM-DD" liczony w czasie LOKALNYM użytkownika.
// toISOString() liczy w UTC — w Polsce wpis z 00:30 trafiałby do poprzedniego dnia.
export const getDateKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// Ile pełnych dni kalendarzowych minęło od dnia "RRRR-MM-DD" do dziś.
// Obie daty jako północ UTC z tych samych części (rok, miesiąc, dzień) — wtedy
// różnica to zawsze wielokrotność doby: bez przesunięcia o strefę (new Date(klucz)
// to UTC, a new Date() to czas lokalny) i bez 23/25-godzinnych dób przy zmianie czasu.
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const getDaysSince = (dateKey, today = new Date()) => {
    const [year, month, day] = dateKey.split("-").map(Number);
    const then = Date.UTC(year, month - 1, day);
    const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    return Math.round((now - then) / MS_PER_DAY);
};

// Odwrotność getDateKey — "2026-09-25" → "25.09.2026".
// Składamy datę z części (rok, miesiąc, dzień), a nie z new Date("RRRR-MM-DD"):
// ten zapis jest czytany jako UTC i w strefie na zachód od Greenwich
// pokazałby poprzedni dzień.
export const formatDateKey = (dateKey) => {
    const [year, month, day] = dateKey.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};
