import { saveState, readState, removeState } from "../state/store.js";
import { getDateKey } from "../utils/date.js";

// ⚠️ UDAWANY serwis logowania (mock) — do czasu Supabase (PLAN.md §1a, etap 4).
//
// Ustalamy tu INTERFEJS, z którego korzystają widoki: te same nazwy funkcji,
// te same argumenty, te same kształty wyników. Przy Supabase zmienia się tylko
// wnętrze tego pliku; account.js i nawigacja zostają bez zmian.
//
// Kształt wyniku każdej akcji: { user, error }
//   user  — { id, email, provider: "email" | "google", createdAt: "RRRR-MM-DD" } albo null
//   error — gotowy komunikat po polsku albo null
//
// Mock NIE przechowuje haseł: logowanie przepuszcza każde hasło do istniejącego
// konta. Prawdziwe hasła trzyma wyłącznie Supabase (zahashowane, po stronie serwera).
// Dane z localStorage (profil, dziennik) zostają tam, gdzie są — przeniesienie
// do bazy to etap 6.

const SESSION_KEY = "keto_fake_session";
const ACCOUNTS_KEY = "keto_fake_accounts";

// Sieć nigdy nie odpowiada natychmiast. Opóźnienie wymusza na widokach
// obsługę stanu "ładowanie" już teraz, a nie dopiero przy Supabase.
const FAKE_DELAY_MS = 600;
const wait = () => new Promise((resolve) => setTimeout(resolve, FAKE_DELAY_MS));

export const PASSWORD_MIN_LENGTH = 8;

const normalizeEmail = (email) => email.trim().toLowerCase();

const getAccounts = () => readState(ACCOUNTS_KEY).data ?? {};

const startSession = (user) => {
    saveState(SESSION_KEY, user);
    notify(user);
    return { user, error: null };
};

// ---------- Nasłuch zmian (odpowiednik onAuthStateChange z Supabase) ----------

const listeners = new Set();

const notify = (user) => listeners.forEach((listener) => listener(user));

// Zwraca funkcję wypisującą — ten sam wzorzec co removeEventListener.
export const onAuthChange = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

// ---------- Odczyt ----------

// async, choć localStorage jest synchroniczny: Supabase odpowiada przez sieć,
// więc wywołujący już teraz muszą czekać (await) na wynik.
export const getSession = async () => {
    const { data } = readState(SESSION_KEY);
    return data?.email ? data : null;
};

// ---------- Akcje ----------

export const signUp = async ({ email, password }) => {
    await wait();
    const address = normalizeEmail(email);

    if (password.length < PASSWORD_MIN_LENGTH) {
        return { user: null, error: `Hasło musi mieć co najmniej ${PASSWORD_MIN_LENGTH} znaków.` };
    }

    const accounts = getAccounts();
    if (accounts[address]) {
        return { user: null, error: "Konto z tym adresem już istnieje. Zaloguj się." };
    }

    const user = { id: crypto.randomUUID(), email: address, provider: "email", createdAt: getDateKey() };
    saveState(ACCOUNTS_KEY, { ...accounts, [address]: user });
    return startSession(user);
};

export const signIn = async ({ email }) => {
    await wait();
    const user = getAccounts()[normalizeEmail(email)];

    // Jeden komunikat dla złego e-maila i złego hasła — tak robi Supabase.
    // Osobne komunikaty zdradzałyby, czy dany adres ma u nas konto.
    if (!user) return { user: null, error: "Nieprawidłowy e-mail lub hasło." };

    return startSession(user);
};

// Prawdziwy Google przekieruje na swoją stronę i wróci do aplikacji.
// Mock od razu "wraca" ze stałym kontem testowym.
export const signInWithGoogle = async () => {
    await wait();
    const address = "konto.google@przyklad.pl";
    const accounts = getAccounts();
    const user = accounts[address] ?? {
        id: crypto.randomUUID(),
        email: address,
        provider: "google",
        createdAt: getDateKey(),
    };

    saveState(ACCOUNTS_KEY, { ...accounts, [address]: user });
    return startSession(user);
};

export const signOut = async () => {
    await wait();
    removeState(SESSION_KEY);
    notify(null);
    return { user: null, error: null };
};

export const deleteAccount = async () => {
    await wait();
    const session = await getSession();
    if (!session) return { user: null, error: "Nie jesteś zalogowany." };

    const { [session.email]: _removed, ...rest } = getAccounts();
    saveState(ACCOUNTS_KEY, rest);
    removeState(SESSION_KEY);
    notify(null);
    return { user: null, error: null };
};
