import { getSupabase } from "./supabaseClient.js";

// Logowanie przez Supabase Auth (PLAN.md §1a, etap 4).
//
// INTERFEJS bez zmian względem mocka z wariantu B — widoki (account.js,
// accountNav.js) nie wiedzą, że pod spodem jest teraz sieć:
//   akcje zwracają { user, error }
//   user  — { id, email, provider: "email" | "google", createdAt: "RRRR-MM-DD" } albo null
//   error — gotowy komunikat po polsku albo null
//
// Supabase sam trzyma sesję w localStorage (klucz sb-<projekt>-auth-token)
// i odświeża jej token w tle.

export const PASSWORD_MIN_LENGTH = 8;

const NOT_CONFIGURED = {
    user: null,
    error: "Logowanie jest niedostępne: brak konfiguracji Supabase w .env.local.",
};

// Obiekt użytkownika Supabase → nasz mały, stały kształt. Jedno miejsce
// tłumaczenia: gdy Supabase zmieni swoje pola, poprawiamy tylko tutaj.
const toAppUser = (user) =>
    user
        ? {
              id: user.id,
              email: user.email,
              provider: user.app_metadata?.provider === "google" ? "google" : "email",
              createdAt: user.created_at.slice(0, 10),
          }
        : null;

// Kody błędów Supabase Auth → komunikaty dla człowieka. Rozpoznajemy po
// KODZIE, nie po treści: treść bywa zmieniana, kod nie.
const ERROR_MESSAGES = {
    invalid_credentials: "Nieprawidłowy e-mail lub hasło.",
    user_already_exists: "Konto z tym adresem już istnieje. Zaloguj się.",
    email_exists: "Konto z tym adresem już istnieje. Zaloguj się.",
    weak_password: `Hasło jest za słabe. Użyj co najmniej ${PASSWORD_MIN_LENGTH} znaków.`,
    email_address_invalid: "Ten adres e-mail wygląda na niepoprawny.",
    email_not_confirmed: "Najpierw potwierdź adres e-mail linkiem z wiadomości.",
    // Wyłączone w panelu Supabase — ponowna próba nic nie da, więc bez „spróbuj za chwilę”.
    signup_disabled: "Zakładanie nowych kont jest chwilowo wyłączone.",
    email_provider_disabled: "Logowanie e-mailem jest chwilowo wyłączone.",
    over_request_rate_limit: "Za dużo prób w krótkim czasie. Odczekaj chwilę i spróbuj ponownie.",
    over_email_send_rate_limit: "Za dużo prób w krótkim czasie. Odczekaj chwilę i spróbuj ponownie.",
};

const toMessage = (error) => {
    // Brak sieci albo uśpiony projekt (plan darmowy) — status 0 / błąd fetch.
    if (!error.status || error.name === "AuthRetryableFetchError") {
        return "Nie udało się połączyć z serwerem. Sprawdź internet i spróbuj ponownie.";
    }
    console.error("Supabase Auth:", error);
    return ERROR_MESSAGES[error.code] ?? "Coś poszło nie tak. Spróbuj ponownie za chwilę.";
};

// ---------- Nasłuch zmian ----------

// Supabase ostrzega: wywołanie innej funkcji Supabase WEWNĄTRZ callbacku
// onAuthStateChange może się zakleszczyć (deadlock). Nasz listener woła
// getSession(), więc odkładamy go na następny obieg pętli zdarzeń.
// Klient ładuje się asynchronicznie, a funkcja wypisująca musi być zwrócona
// od razu — dlatego zapamiętujemy, czy ktoś zdążył się wypisać przed startem.
export const onAuthChange = (listener) => {
    let subscription = null;
    let cancelled = false;

    getSupabase().then((supabase) => {
        if (!supabase || cancelled) return;
        ({ subscription } = supabase.auth.onAuthStateChange((_event, session) => {
            setTimeout(() => listener(toAppUser(session?.user)), 0);
        }).data);
    });

    return () => {
        cancelled = true;
        subscription?.unsubscribe();
    };
};

// ---------- Odczyt ----------

export const getSession = async () => {
    const supabase = await getSupabase();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return toAppUser(data.session?.user);
};

// ---------- Akcje ----------

export const signUp = async ({ email, password }) => {
    const supabase = await getSupabase();
    if (!supabase) return NOT_CONFIGURED;
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) return { user: null, error: toMessage(error) };

    // Bez sesji = Supabase czeka na kliknięcie linku z maila („Confirm email”
    // włączone). Dziś wyłączone (PLAN.md §1a, wariant B); przed startem
    // to miejsce dostanie własny ekran „Sprawdź skrzynkę”.
    if (!data.session) {
        return { user: null, error: "Sprawdź skrzynkę: wysłaliśmy link potwierdzający adres e-mail." };
    }
    return { user: toAppUser(data.user), error: null };
};

export const signIn = async ({ email, password }) => {
    const supabase = await getSupabase();
    if (!supabase) return NOT_CONFIGURED;
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { user: null, error: toMessage(error) };
    return { user: toAppUser(data.user), error: null };
};

// Google to PRZEKIEROWANIE, nie odpowiedź: przeglądarka opuszcza aplikację,
// a wraca na `redirectTo` z ?code=, który klient Supabase sam wymienia na
// sesję przy starcie. Dlatego tu nie ma jeszcze użytkownika — zamiast niego
// `redirecting: true`, żeby widok nie nawigował w tle, gdy strona już odchodzi.
// `redirectTo` musi być na liście Redirect URLs w Supabase (URL Configuration).
export const signInWithGoogle = async ({ redirectTo }) => {
    const supabase = await getSupabase();
    if (!supabase) return NOT_CONFIGURED;
    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
    });
    if (error) return { user: null, error: toMessage(error) };
    return { user: null, error: null, redirecting: true };
};

export const signOut = async () => {
    const supabase = await getSupabase();
    if (!supabase) return NOT_CONFIGURED;
    const { error } = await supabase.auth.signOut();
    if (error) return { user: null, error: toMessage(error) };
    return { user: null, error: null };
};

// Funkcja delete_my_account() w bazie (supabase/schema.sql, część 5) usuwa
// konto wywołującego; kaskada kasuje jego dane. Potem czyścimy sesję lokalnie
// — konto już nie istnieje, więc wylogowanie na serwerze nie ma czego unieważniać.
export const deleteAccount = async () => {
    const supabase = await getSupabase();
    if (!supabase) return NOT_CONFIGURED;
    const { error } = await supabase.rpc("delete_my_account");
    if (error) return { user: null, error: toMessage(error) };

    await supabase.auth.signOut({ scope: "local" });
    return { user: null, error: null };
};
