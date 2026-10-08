import { getSignedInClient } from "./supabaseClient.js";

// Zgody przy koncie (PRAWO.md §2.3 i §14, wariant C). Dwie warstwy:
//   A — rejestracja: checkboxy nad przyciskami, zgoda zapamiętana na czas
//       wyjścia do Google / zakładania konta i zapisana po zalogowaniu,
//   B — bramka: po każdym logowaniu sprawdzamy w bazie zgody w AKTUALNEJ
//       wersji; brak → ekran zgód, a dane o zdrowiu nie idą do bazy.

// Jedno źródło treści dla rejestracji i ekranu zgód. Wersja = data ostatniej
// zmiany tekstu. Zmiana tekstu → nowa wersja → bramka poprosi wszystkich
// ponownie. Poprzednie brzmienie zostaje w historii gita — to ono jest
// dowodem, na co zgodził się ktoś z wierszem starej wersji.
export const CONSENTS = {
    terms: {
        version: "2026-10-08",
        label: "Akceptuję regulamin i politykę prywatności.",
    },
    health: {
        version: "2026-10-08",
        label: "Zgadzam się na przechowywanie na koncie danych o mojej wadze i diecie (to dane o zdrowiu).",
    },
};

// ---------- Zgoda zaznaczona przed logowaniem (warstwa A) ----------

// sessionStorage, nie localStorage: zgoda należy do tej jednej karty i tej
// jednej próby rejestracji. Przeżywa przekierowanie do Google i z powrotem,
// ale nie trafi do innej karty ani do jutrzejszej sesji. Do tego termin
// ważności: porzucona rejestracja nie może "przypisać" zgody komuś, kto
// za godzinę zaloguje się w tej karcie na inne konto.
const PENDING_KEY = "keto_pending_consents";
const PENDING_TTL_MS = 15 * 60 * 1000;

export const rememberPendingConsents = (source) => {
    try {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify({ source, savedAt: Date.now() }));
    } catch {
        // Zablokowana pamięć: po zalogowaniu bramka po prostu zapyta o zgody.
    }
};

export const clearPendingConsents = () => {
    try {
        sessionStorage.removeItem(PENDING_KEY);
    } catch {
        // jw.
    }
};

// Odczyt jednorazowy: zgoda zapisuje się raz, potem znika z karty.
const takePendingConsents = () => {
    let pending = null;
    try {
        pending = JSON.parse(sessionStorage.getItem(PENDING_KEY));
    } catch {
        pending = null;
    }
    clearPendingConsents();

    const isFresh = pending && Date.now() - pending.savedAt < PENDING_TTL_MS;
    return isFresh && typeof pending.source === "string" ? pending.source : null;
};

// ---------- Zapis i sprawdzenie w bazie ----------

// Wszystkie zgody jednym insertem = jedna instrukcja SQL: wchodzą obie albo żadna.
const recordConsents = async (supabase, source) => {
    const rows = Object.entries(CONSENTS).map(([kind, { version }]) => ({ kind, version, source }));
    const { error } = await supabase.from("consents").insert(rows);
    if (error) console.error("Supabase consents:", error);
    return !error;
};

const hasCurrentConsents = (rows) =>
    Object.entries(CONSENTS).every(([kind, { version }]) =>
        rows.some((row) => row.kind === kind && row.version === version),
    );

// status: "granted"  — konto ma zgody w aktualnej wersji (albo właśnie je dało)
//         "declined" — użytkownik odmówił na ekranie zgód
//         "error"    — sieć; nie wiemy, więc niczego nie wysyłamy do bazy
const checkConsents = async (askForConsents) => {
    const account = await getSignedInClient();
    if (!account) return "error";
    const { supabase } = account;

    // Zgoda z formularza rejestracji (e-mail albo Google) — zapis bez pytania.
    const pendingSource = takePendingConsents();
    if (pendingSource && (await recordConsents(supabase, pendingSource))) return "granted";

    const { data, error } = await supabase.from("consents").select("kind, version");
    if (error) {
        console.error("Supabase consents:", error);
        return "error";
    }
    if (hasCurrentConsents(data)) return "granted";

    // Ekran zgód sam ponawia zapis przy błędzie, więc tu dostajemy już wynik.
    return askForConsents({ save: () => recordConsents(supabase, "consent_screen") });
};

// Jak w accountMergeService: INITIAL_SESSION i SIGNED_IN tuż po sobie
// pokazałyby dwa ekrany zgód. Drugi wywołujący dostaje obietnicę pierwszego.
let running = null;

// askForConsents({ save }) → Promise<"granted" | "declined">
export const ensureConsents = (askForConsents) => {
    running ??= checkConsents(askForConsents).finally(() => {
        running = null;
    });
    return running;
};
