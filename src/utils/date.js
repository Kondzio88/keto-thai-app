// Klucz dnia "RRRR-MM-DD" liczony w czasie LOKALNYM użytkownika.
// toISOString() liczy w UTC — w Polsce wpis z 00:30 trafiałby do poprzedniego dnia.
export const getDateKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};
