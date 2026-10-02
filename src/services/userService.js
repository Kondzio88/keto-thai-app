import { saveState, loadState } from '../state/store.js';

// Zgodność wstecz: profile zapisane przed 5-poziomową skalą aktywności mają
// stare klucze. Stare mnożniki (1.2 / 1.55 / 1.725) są podzbiorem nowych,
// więc tłumaczenie jest bezstratne. Jedno miejsce odczytu = jedno miejsce tłumaczenia.
const LEGACY_ACTIVITY = {
    low: "sedentary",
    medium: "moderate",
    high: "active",
};

const normalizeUser = (user) => {
    const newActivity = LEGACY_ACTIVITY[user.activity];
    if (!newActivity) {
        return user;
    }
    return { ...user, activity: newActivity };
};

// Zakres wagi w kg — JEDNO źródło dla onboardingu (min/max pola) i pomiarów
// na Dashboardzie. Dwie osobne pary liczb rozjechałyby się przy pierwszej zmianie.
export const WEIGHT_LIMITS = { min: 35, max: 200 };

export const saveUser = (userData) => {
    saveState("keto_user", userData);
};

export const getUser = () => {
    const user = loadState("keto_user");
    return user ? normalizeUser(user) : null;
};

export const clearUser = () => {
    localStorage.removeItem('keto_user')
}
