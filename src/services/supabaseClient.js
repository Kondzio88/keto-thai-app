import { ACCOUNTS_ENABLED } from "../config.js";

// Jedno połączenie z Supabase dla całej aplikacji. Wartości z .env.local
// — Vite wkleja je do kodu przy starcie serwera / buildzie.
const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let clientPromise = null;

// Dynamiczny import zamiast `import { createClient }` na górze pliku:
//   • biblioteka (~100 kB) ładuje się dopiero przy pierwszym użyciu kont,
//   • na produkcji flaga to stałe `false`, więc Vite wycina cały import —
//     statycznego importu nie umiał wyciąć (paczka rosła z 198 do 306 kB).
// null zamiast wyjątku, gdy brakuje konfiguracji: createClient() bez adresu
// rzuca wyjątek, a serwisy wolą pokazać czytelny komunikat.
export const getSupabase = () => {
    if (!ACCOUNTS_ENABLED || !url || !publishableKey) return Promise.resolve(null);

    // PKCE zamiast domyślnego "implicit": po powrocie od Google adres niesie
    // jednorazowy ?code= (wymieniany na sesję), a nie same tokeny w #hash.
    // Query string przeżywa też przekierowanie przez 404.html na GitHub Pages.
    clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
        createClient(url, publishableKey, { auth: { flowType: "pkce" } }),
    );
    return clientPromise;
};

// Dla serwisów danych (etap 5): klient + id użytkownika, gdy ktoś jest
// zalogowany, a null dla gościa — wtedy serwis zapisuje tylko lokalnie.
export const getSignedInClient = async () => {
    const supabase = await getSupabase();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session ? { supabase, userId: data.session.user.id } : null;
};

// Baza przyjmuje tylko uuid. Stare wpisy (id z Date.now(), przepisy "user-…")
// dostają nowe uuid przy przenoszeniu na konto (accountMergeService, etap 6).
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (id) => UUID_PATTERN.test(id);

// Wspólny komunikat nieudanego zapisu do bazy (szczegóły idą do konsoli).
export const SAVE_FAILED = "Nie udało się zapisać. Sprawdź internet i spróbuj ponownie.";
