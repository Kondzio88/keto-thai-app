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

    clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
        createClient(url, publishableKey),
    );
    return clientPromise;
};
