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

// Północ czasu lokalnego z klucza "RRRR-MM-DD" — z części, nie new Date(klucz) (to UTC).
const toLocalDate = (dateKey) => {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day);
};

// Klucz przesunięty o `days` dni (ujemne = wstecz) — "2026-10-01", -1 → "2026-09-30".
// setDate() sam przechodzi przez koniec miesiąca i roku, a zmiana czasu
// (doba 23 lub 25 h) nie przesuwa wyniku, bo nie dodajemy milisekund.
export const shiftDateKey = (dateKey, days) => {
    const date = toLocalDate(dateKey);
    date.setDate(date.getDate() + days);
    return getDateKey(date);
};

// Ile dni kalendarzowych dzieli dwa klucze — "2026-09-28" → "2026-10-05" = 7.
export const getDaysBetween = (fromKey, toKey) => getDaysSince(fromKey, toLocalDate(toKey));

// Czy napis to prawdziwy dzień "RRRR-MM-DD" (np. z adresu, który każdy może wpisać).
// Sam regex przepuściłby "2026-02-31" — Date przesunąłby go na 3 marca,
// więc sprawdzamy, czy po drodze tam i z powrotem klucz się nie zmienił.
export const isValidDateKey = (value) =>
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && shiftDateKey(value, 0) === value;

// Skróty dni jak w kalendarzu ściennym. getDay(): 0 = niedziela.
const WEEKDAY_SHORT = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"];

// "2026-10-07" → "Śr"
export const getWeekdayShort = (dateKey) => WEEKDAY_SHORT[toLocalDate(dateKey).getDay()];

// "2026-10-07" → "środa, 7 października" — pełna nazwa dla czytnika ekranu.
export const formatDateKeyLong = (dateKey) =>
    toLocalDate(dateKey).toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });

// Krótka wersja na oś wykresu — "2026-09-25" → "25.09". Bez roku, bo pełna data
// nie mieści się poziomo i Chart.js obraca etykiety; rok zostaje w podpowiedzi.
export const formatDateKeyShort = (dateKey) => {
    const [year, month, day] = dateKey.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
    });
};
