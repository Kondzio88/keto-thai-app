// Klucz dnia "RRRR-MM-DD" liczony w czasie LOKALNYM użytkownika.
// toISOString() liczy w UTC — w Polsce wpis z 00:30 trafiałby do poprzedniego dnia.
export const getDateKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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
