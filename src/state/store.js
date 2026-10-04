// Jedyne miejsce dostępu do localStorage. Odczyt rozróżnia trzy sytuacje,
// bo „nie ma danych" i „dane są, ale nieczytelne" wymagają innej reakcji —
// o tej reakcji decyduje serwis, nie magazyn:
//   { status: "empty" }            — klucza nie ma (albo pamięć jest zablokowana)
//   { status: "ok", data }         — dane odczytane
//   { status: "corrupted", raw }   — wpis istnieje, ale to nie jest poprawny JSON
export const readState = (key) => {
    let raw;
    try {
        raw = localStorage.getItem(key);
    } catch {
        // Zablokowana pamięć (część trybów prywatnych) — jak przy pierwszej
        // wizycie; ewentualny zapis i tak zgłosi błąd przez saveState.
        return { status: "empty" };
    }

    if (raw === null) return { status: "empty" };

    try {
        return { status: "ok", data: JSON.parse(raw) };
    } catch {
        return { status: "corrupted", raw };
    }
};

// true/false zamiast wyjątku — setItem rzuca przy przepełnionej pamięci
// i w części trybów prywatnych, a wyjątek przerwałby całą inicjalizację strony.
export const saveState = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Nie udało się zapisać "${key}":`, error);
        return false;
    }
};

const BACKUP_SUFFIX = "_corrupted";

// Kasuje wpis razem z kopią jego uszkodzonej wersji — „Skasuj dane" ma
// usuwać wszystko, co appka trzyma w przeglądarce.
export const removeState = (key) => {
    try {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}${BACKUP_SUFFIX}`);
    } catch (error) {
        console.error(`Nie udało się usunąć "${key}":`, error);
    }
};

// ---------- Uszkodzone wpisy ----------

// Serwis, który uzna wpis za cenny, odkłada jego surową treść pod osobny
// klucz, ZANIM następny zapis ją nadpisze, i zgłasza problem — raz na sesję
// na klucz, bo ten sam wpis jest czytany przy każdej zmianie trasy.
const reportedKeys = new Set();
let corruptedDataHandler = null;

export const onCorruptedData = (handler) => {
    corruptedDataHandler = handler;
};

export const quarantineCorrupted = (key, raw, label) => {
    const backupKey = `${key}${BACKUP_SUFFIX}`;
    try {
        // Starszej kopii nie nadpisujemy — pierwsza uszkodzona wersja jest
        // najbliżej danych sprzed awarii.
        if (localStorage.getItem(backupKey) === null) localStorage.setItem(backupKey, raw);
    } catch (error) {
        console.error(`Nie udało się odłożyć kopii "${key}":`, error);
    }

    if (reportedKeys.has(key)) return;
    reportedKeys.add(key);
    console.error(`Uszkodzony wpis "${key}" — kopia w "${backupKey}".`);
    corruptedDataHandler?.(label);
};
