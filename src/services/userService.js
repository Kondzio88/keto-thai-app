import { saveState, readState, removeState, quarantineCorrupted } from "../state/store.js";
import { isKnownActivity, isKnownGoal } from "./calculatorService.js";
import { getDateKey } from "../utils/date.js";
import { getSignedInClient, SAVE_FAILED } from "./supabaseClient.js";

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

// ---------- Konto: profil i pomiary w Supabase (PLAN.md §1a, etap 5, wariant C) ----------
//
// Odczyt zostaje synchroniczny: widoki i guard routera czytają getUser(), czyli
// localStorage, który pełni rolę lokalnej kopii danych z bazy.
// Zapis zalogowanego idzie NAJPIERW do bazy, a do localStorage dopiero po
// potwierdzeniu — serwer ma ostatnie słowo, więc nie ma konfliktów.
// Gość (bez sesji) zapisuje jak dawniej, tylko lokalnie.
//
// Akcje zwracają { error }: null albo gotowy komunikat po polsku.

// Lokalny kształt profilu → wiersz tabeli profiles. Waga nie ma tu kolumny:
// bieżąca waga to najnowszy wiersz w weight_entries.
const toProfileRow = (user, userId) => ({
    user_id: userId,
    gender: user.gender,
    age: user.age,
    height: user.height,
    activity: user.activity,
    goal: user.goal,
    sport: user.sport || null, // pusty <select> daje "", a baza przyjmuje tylko znane wartości albo null
});

const toWeightRow = (entry) => ({ measured_on: entry.date, weight_kg: entry.weight });

// Onboarding: nowy profil + pierwszy pomiar.
export const createProfile = async (user) => {
    const account = await getSignedInClient();

    if (account) {
        const { supabase, userId } = account;
        // upsert = "wstaw, a jeśli profil już jest, nadpisz" — po "Skasuj dane"
        // zalogowany przechodzi onboarding drugi raz, a wiersz w bazie już istnieje.
        const { error: profileError } = await supabase.from("profiles").upsert(toProfileRow(user, userId));
        if (profileError) {
            console.error("Supabase profiles:", profileError);
            return { error: SAVE_FAILED };
        }

        const { error: weightError } = await supabase.from("weight_entries").insert(toWeightRow(user.weightHistory[0]));
        if (weightError) {
            console.error("Supabase weight_entries:", weightError);
            return { error: SAVE_FAILED };
        }
    }

    return saveUser(user) ? { error: null } : { error: "Nie udało się zapisać profilu w przeglądarce." };
};

// Dashboard: nowy pomiar wagi. Zwraca NOWY obiekt profilu — przekazanego nie
// zmienia, więc przy błędzie nie ma czego cofać.
export const addWeightEntry = async (user, weight) => {
    const entry = { date: getDateKey(), weight };
    const account = await getSignedInClient();

    if (account) {
        const { error } = await account.supabase.from("weight_entries").insert(toWeightRow(entry));
        if (error) {
            console.error("Supabase weight_entries:", error);
            return { user, error: SAVE_FAILED };
        }
    }

    const updated = { ...user, weight, weightHistory: [...user.weightHistory, entry] };
    if (!saveUser(updated)) {
        return { user, error: "Nie udało się zapisać pomiaru — pamięć przeglądarki jest pełna albo zablokowana." };
    }
    return { user: updated, error: null };
};

// Pobiera profil i pomiary zalogowanego z bazy do localStorage.
// Zwraca true, gdy lokalna kopia się zmieniła (wtedy main.js przerysowuje stronę).
// Błąd sieci = zostajemy przy lokalnej kopii, bez komunikatu: odczyt i tak działa.
export const pullUserFromServer = async () => {
    const account = await getSignedInClient();
    if (!account) return false;
    const { supabase } = account;

    const [profileResult, weightsResult] = await Promise.all([
        supabase.from("profiles").select("gender, age, height, activity, goal, sport").maybeSingle(),
        supabase.from("weight_entries").select("measured_on, weight_kg").order("measured_on").order("created_at"),
    ]);

    if (profileResult.error || weightsResult.error) {
        console.error("Supabase pull:", profileResult.error ?? weightsResult.error);
        return false;
    }

    // Brak profilu w bazie (konto bez onboardingu albo dane tylko lokalne):
    // NIE kasujemy lokalnej kopii. Przeniesienie jej do bazy to etap 6.
    const profile = profileResult.data;
    const weights = weightsResult.data;
    if (!profile || weights.length === 0) return false;

    const weightHistory = weights.map((row) => ({ date: row.measured_on, weight: Number(row.weight_kg) }));
    const serverUser = {
        gender: profile.gender,
        age: profile.age,
        height: Number(profile.height),
        activity: profile.activity,
        goal: profile.goal,
        sport: profile.sport ?? "",
        weight: weightHistory[weightHistory.length - 1].weight,
        weightHistory,
    };

    // Porównanie po treści: bez zmian = bez przerysowania (SIGNED_IN potrafi
    // przyjść ponownie np. po powrocie do karty, a przerysowanie skasowałoby
    // to, co ktoś akurat wpisuje w formularz).
    const local = readState(USER_STORAGE_KEY);
    if (local.status === "ok" && JSON.stringify(local.data) === JSON.stringify(serverUser)) return false;

    return saveUser(serverUser);
};
