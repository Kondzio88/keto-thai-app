import { getSignedInClient, isUuid } from "./supabaseClient.js";
import { getUser, pullUserFromServer, pushGuestUserToServer } from "./userService.js";
import { getAllMeals, saveMeals, pullMealsFromServer, pushGuestMealsToServer } from "./mealService.js";
import {
    getCustomRecipes,
    saveCustomRecipes,
    pullCustomRecipesFromServer,
    pushGuestRecipesToServer,
} from "./customRecipeService.js";
import { getLocalOwner, setLocalOwner, clearLocalData } from "./localDataService.js";

// Etap 6 (PLAN.md §1a): dane gościa przy logowaniu. Wariant 2 z decyzji 2026-10-08:
//   S1 — konto bez żadnych danych → przenosimy dane gościa bez pytania,
//   S2 — konto ma dane → pytamy (askToMerge) i robimy, co wybrał użytkownik.
// Kolejność zawsze: NAJPIERW wyślij dane gościa, POTEM pobierz z bazy — pobranie
// nadpisuje lokalną kopię, więc odwrotna kolejność zgubiłaby kartkę gościa.
//
// Kroki są bezpieczne do powtórzenia (wpisy po id, profil "on conflict do nothing",
// waga tylko z dni, których konto nie ma), bo przenoszenie może się urwać w połowie.
// Dopóki się nie uda, znacznik właściciela nie powstaje, więc przy następnym
// starcie spróbujemy jeszcze raz — od miejsca, w którym baza już coś ma.

// ---------- Stare id → uuid ----------

// Przepisy "user-…" i wpisy z Date.now() nie pasują do kolumn uuid. Nowe id
// nadajemy LOKALNIE i zapisujemy przed wysyłką: gdyby losować je przy każdej
// próbie, przerwane przenoszenie powtórzone jutro dodałoby przepis drugi raz
// pod innym id. Wpis w dzienniku wskazuje przepis przez recipeId, więc
// przepinamy go na nowe id (inaczej "Popraw wpis" zgubiłby powiązanie).
const normalizeGuestIds = () => {
    const recipes = getCustomRecipes();
    const meals = getAllMeals();
    const recipeIdMap = new Map(); // stare id → nowe uuid

    const fixedRecipes = recipes.map((recipe) => {
        if (isUuid(recipe.id)) return recipe;
        const id = crypto.randomUUID();
        recipeIdMap.set(recipe.id, id);
        return { ...recipe, id };
    });

    let mealsChanged = false;
    const fixedMeals = {};
    for (const [date, entries] of Object.entries(meals)) {
        fixedMeals[date] = entries.map((meal) => {
            const id = isUuid(String(meal.id)) ? meal.id : crypto.randomUUID();
            const recipeId = recipeIdMap.get(meal.recipeId) ?? meal.recipeId;
            if (id === meal.id && recipeId === meal.recipeId) return meal;
            mealsChanged = true;
            return { ...meal, id, recipeId };
        });
    }

    // Przepisy pierwsze; jeśli potem nie zapisze się dziennik, cofamy przepisy,
    // żeby wpisy nie wskazywały id, których lokalnie nie ma.
    if (recipeIdMap.size > 0 && !saveCustomRecipes(fixedRecipes)) return false;
    if (mealsChanged && !saveMeals(fixedMeals)) {
        if (recipeIdMap.size > 0) saveCustomRecipes(recipes);
        return false;
    }
    return true;
};

// ---------- Co już jest na koncie ----------

// Same identyfikatory i daty, bez treści: tyle wystarczy, żeby ustalić S1/S2
// i odsiać to, co baza już ma. null = błąd sieci (wtedy niczego nie ruszamy).
const fetchServerSummary = async (supabase) => {
    const [profile, weights, meals, recipes] = await Promise.all([
        supabase.from("profiles").select("user_id").maybeSingle(),
        supabase.from("weight_entries").select("measured_on"),
        supabase.from("meals").select("id"),
        supabase.from("custom_recipes").select("id"),
    ]);

    const error = profile.error ?? weights.error ?? meals.error ?? recipes.error;
    if (error) {
        console.error("Supabase (stan konta przed przeniesieniem):", error);
        return null;
    }

    const summary = {
        hasProfile: profile.data !== null,
        weightDates: new Set(weights.data.map((row) => row.measured_on)),
        mealIds: new Set(meals.data.map((row) => row.id)),
        recipeIds: new Set(recipes.data.map((row) => row.id)),
    };
    // S2 = konto ma COKOLWIEK. Sam profil nie wystarczy: konto bez onboardingu
    // może mieć już posiłki dodane z /recipes.
    summary.hasData =
        summary.hasProfile || summary.weightDates.size > 0 || summary.mealIds.size > 0 || summary.recipeIds.size > 0;
    return summary;
};

// ---------- Co z kartki gościa trzeba wysłać ----------

const findPending = (server) => {
    const user = getUser();

    const meals = Object.entries(getAllMeals()).flatMap(([date, entries]) =>
        entries.map((meal) => ({ date, meal })),
    );

    return {
        // Profil z konta wygrywa — profil gościa tylko, gdy konto go nie ma.
        profile: user && !server.hasProfile ? user : null,
        // Pomiar z dnia, który konto już ma: wygrywa konto.
        weights: (user?.weightHistory ?? []).filter((entry) => !server.weightDates.has(entry.date)),
        meals: meals.filter(({ meal }) => !server.mealIds.has(meal.id)),
        // Przepis bez składników odrzuciłaby funkcja w bazie i przenoszenie
        // nie udałoby się nigdy — taki pomijamy (kreator nie pozwala go utworzyć).
        recipes: getCustomRecipes().filter(
            (recipe) => !server.recipeIds.has(recipe.id) && recipe.ingredients?.length > 0,
        ),
    };
};

const isEmpty = (pending) =>
    !pending.profile && pending.weights.length === 0 && pending.meals.length === 0 && pending.recipes.length === 0;

const hasGuestData = () =>
    getUser() !== null || Object.keys(getAllMeals()).length > 0 || getCustomRecipes().length > 0;

// ---------- Przejęcie kartki gościa ----------

// status: "done"    — kartka obsłużona (przeniesiona, odrzucona albo pusta)
//         "later"   — użytkownik zamknął okno bez wyboru, zapytamy przy następnym starcie
//         "error"   — sieć / pamięć; dane gościa zostają nietknięte
// result: "merged" | "discarded" | null — do komunikatu dla użytkownika
const adoptGuestData = async (account, askToMerge) => {
    if (!hasGuestData()) return { status: "done", result: null };
    if (!normalizeGuestIds()) return { status: "error" };

    const server = await fetchServerSummary(account.supabase);
    if (!server) return { status: "error" };

    const pending = findPending(server);
    // Np. kopia danych zalogowanego sprzed etapu 6 (bez znacznika): wszystko
    // już jest w bazie, więc nie ma o co pytać.
    if (isEmpty(pending)) return { status: "done", result: null };

    if (server.hasData) {
        const choice = await askToMerge({
            meals: pending.meals.length,
            weights: pending.weights.length,
            recipes: pending.recipes.length,
            profile: pending.profile !== null,
        });
        if (choice === "later") return { status: "later" };
        if (choice === "discard") {
            clearLocalData();
            return { status: "done", result: "discarded" };
        }
    }

    // Profil przed resztą: konto bez profilu dostaje go, zanim pojawią się pomiary.
    const uploaded =
        (await pushGuestUserToServer(account, pending)) &&
        (await pushGuestRecipesToServer(account, pending.recipes)) &&
        (await pushGuestMealsToServer(account, pending.meals));

    return uploaded ? { status: "done", result: "merged" } : { status: "error" };
};

// ---------- Wejście: start aplikacji u zalogowanego i każde logowanie ----------

const pullAll = async () => {
    const changed = await Promise.all([pullUserFromServer(), pullMealsFromServer(), pullCustomRecipesFromServer()]);
    return changed.some(Boolean);
};

const syncWithAccount = async (askToMerge) => {
    const account = await getSignedInClient();
    if (!account) return { changed: false, result: null };

    const owner = getLocalOwner();
    // Kopia innego konta (np. wylogowanie, którego ta karta nie zauważyła):
    // nigdy jej nie scalamy, tylko kasujemy.
    if (owner && owner !== account.userId) clearLocalData();

    let result = null;
    if (owner !== account.userId) {
        const adoption = await adoptGuestData(account, askToMerge);
        // Bez pobierania: pobranie nadpisałoby kartkę gościa, której jeszcze nie ma w bazie.
        if (adoption.status !== "done") return { changed: false, result: adoption.status };
        result = adoption.result;
        setLocalOwner(account.userId);
    }

    const changed = await pullAll();
    // Po odrzuceniu ekran trzeba przerysować nawet przy pustym koncie.
    return { changed: changed || result !== null, result };
};

// SIGNED_IN potrafi przyjść tuż po INITIAL_SESSION — dwa równoległe przebiegi
// pokazałyby dwa okna i dwa razy wysłały te same pomiary wagi. Drugi wywołujący
// dostaje więc obietnicę pierwszego.
let running = null;

// askToMerge(counts) → Promise<"merge" | "discard" | "later">; pyta tylko w S2.
// Zwraca { changed, result }: result = "merged" | "discarded" | "later" | "error" | null.
export const syncWithAccountData = (askToMerge) => {
    running ??= syncWithAccount(askToMerge).finally(() => {
        running = null;
    });
    return running;
};
