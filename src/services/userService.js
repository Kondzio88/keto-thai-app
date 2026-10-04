import { saveState, readState, removeState, quarantineCorrupted } from "../state/store.js";
import { isKnownActivity, isKnownGoal } from "./calculatorService.js";
import { getDateKey } from "../utils/date.js";

const USER_STORAGE_KEY = "keto_user";

// Zgodność wstecz: profile zapisane przed 5-poziomową skalą aktywności mają
// stare klucze. Stare mnożniki (1.2 / 1.55 / 1.725) są podzbiorem nowych,
// więc tłumaczenie jest bezstratne. Jedno miejsce odczytu = jedno miejsce tłumaczenia.
const LEGACY_ACTIVITY = {
    low: "sedentary",
    medium: "moderate",
    high: "active",
};

const normalizeUser = (user) => {
    // Profile sprzed historii wagi nie mają `weightHistory`, a Dashboard czyta jej
    // ostatni wpis. Brakującą lub pustą tablicę uzupełniamy jednym wpisem z bieżącej
    // wagi — dokładna data dawnego pomiaru nie jest znana, więc bierzemy dzisiejszą.
    const hasHistory = Array.isArray(user.weightHistory) && user.weightHistory.length > 0;

    return {
        ...user,
        activity: LEGACY_ACTIVITY[user.activity] ?? user.activity,
        weightHistory: hasHistory ? user.weightHistory : [{ date: getDateKey(), weight: user.weight }],
    };
};

// Poprawny JSON to jeszcze nie poprawny profil. Kalkulator rzuca wyjątek dla
// nieznanego celu czy aktywności, a wyjątek w initDashboard() zabiera całą stronę —
// dlatego kształt sprawdzamy tu, na granicy, a reszta aplikacji może mu ufać.
const isUsableProfile = (user) =>
    ["age", "height", "weight"].every((field) => Number.isFinite(user[field])) &&
    (user.gender === "male" || user.gender === "female") &&
    isKnownActivity(user.activity) &&
    isKnownGoal(user.goal) &&
    user.weightHistory.every((entry) => typeof entry?.date === "string" && Number.isFinite(entry.weight));

// Zakres wagi w kg — JEDNO źródło dla onboardingu (min/max pola) i pomiarów
// na Dashboardzie. Dwie osobne pary liczb rozjechałyby się przy pierwszej zmianie.
export const WEIGHT_LIMITS = { min: 35, max: 200 };

export const saveUser = (userData) => saveState(USER_STORAGE_KEY, userData);

export const getUser = () => {
    const result = readState(USER_STORAGE_KEY);

    if (result.status === "corrupted") {
        quarantineCorrupted(USER_STORAGE_KEY, result.raw, "profilu");
        return null;
    }
    if (result.data === undefined || result.data === null) return null;

    const isObject = typeof result.data === "object" && !Array.isArray(result.data);
    const user = isObject ? normalizeUser(result.data) : null;

    if (!user || !isUsableProfile(user)) {
        quarantineCorrupted(USER_STORAGE_KEY, JSON.stringify(result.data), "profilu");
        return null;
    }
    return user;
};

export const clearUser = () => removeState(USER_STORAGE_KEY);
