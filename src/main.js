import { initRouter, refreshCurrentRoute } from "./router.js";
import { syncWithAccountData } from "./services/accountMergeService.js";
import { ensureConsents } from "./services/consentService.js";
import { showConfirmModal } from "./components/confirmModal.js";
import { askForConsents } from "./components/consentGate.js";
import { getCurrentPath , getBase} from "./utils/env.js";
import { initInstallPromptCapture } from "./utils/installPrompt.js";
import { initInstallBanner } from "./components/installBanner.js";
import { onCorruptedData } from "./state/store.js";
import { showToast } from "./components/toast.js";
import { updateAccountNav } from "./components/accountNav.js";
import { onAuthChange, signOut } from "./services/authService.js";
import { clearLocalData, getLocalOwner } from "./services/localDataService.js";

// Rejestrujemy listener na `beforeinstallprompt` jak najwcześniej — event może
// odpalić się zanim appka w ogóle zdąży wyrenderować pierwszą stronę.
initInstallPromptCapture();

// Rejestrujemy PRZED initRouter — router woła getUser() przy pierwszym renderze,
// więc uszkodzony profil zostanie wykryty, zanim cokolwiek się pokaże.
onCorruptedData((label) => {
    showToast({
        stamp: "Uwaga",
        title: `Nie udało się odczytać ${label}`,
        note: "Kopia uszkodzonego wpisu została zachowana w przeglądarce. Aplikacja działa dalej od pustego stanu.",
    });
});

/**
 * Podświetla aktywną zakładkę w Bottom Tab Bar
 * na podstawie aktualnej ścieżki URL.
 */
const updateActiveTab = () => {
    const path = getCurrentPath();

    const links = document.querySelectorAll(".tabbar__link");

    links.forEach((link) => {
        // `data-active-for` — gdy href zmienia się w locie (pozycja konta:
        // /konto?wroc=… albo /konto/rejestracja), a zakładka ma się zapalać
        // dla całej sekcji. Query w href nie bierze udziału w porównaniu.
        const href = link.dataset.activeFor ?? link.getAttribute("href").split("?")[0];
        // Podstrona też zapala swoją zakładkę (/recipes/new → "Przepisy").
        // "/" sprawdzamy dokładnie, bo każda ścieżka zaczyna się od "/".
        const isActive = href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);

        link.classList.toggle("tabbar__link--active", isActive);
        // Sama klasa jest tylko wizualna — czytnik ekranu dowiaduje się o
        // bieżącej stronie z aria-current.
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
};

/**
 * Otwiera/zamyka szufladę "Więcej" w górnym pasku (topbar).
 */
const initTopbarDrawer = () => {
    const topbar = document.getElementById("topbar");
    const toggle = document.getElementById("topbar-toggle");
    const drawer = document.getElementById("topbar-drawer");

    if (!topbar || !toggle || !drawer) return;

    const closeDrawer = () => {
        topbar.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
        const isOpen = topbar.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Klik w link wewnątrz szuflady zamyka ją (router obsłuży nawigację)
    drawer.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            closeDrawer();
        }
    });
};

/**
 * Link do #zastrzezenia (onboarding, Dashboard) ma pokazać treść, nie zwinięty
 * nagłówek — przewinięcie do zamkniętego <details> nic by nie dało.
 * Otwieramy w `click`, PRZED domyślnym przewinięciem przeglądarki, więc
 * działa też przy ponownym kliknięciu, gdy adres już ma ten #hash.
 */
const DISCLAIMER_ID = "zastrzezenia";

const openDisclaimer = () => {
    const disclaimer = document.getElementById(DISCLAIMER_ID);
    if (disclaimer) disclaimer.open = true;
};

const initDisclaimerLinks = () => {
    document.addEventListener("click", (event) => {
        if (event.target.closest(`a[href="#${DISCLAIMER_ID}"]`)) openDisclaimer();
    });

    // Adres wpisany lub odświeżony z #zastrzezenia — router właśnie wyrenderował
    // stronę i przewinął na górę, więc przewijamy sami.
    if (window.location.hash === `#${DISCLAIMER_ID}`) {
        openDisclaimer();
        document.getElementById(DISCLAIMER_ID)?.scrollIntoView();
    }
};

// ---------- Etap 6: dane gościa przy logowaniu (PLAN.md §1a) ----------

// Okno dla S2 (konto ma już dane). Bez odmiany "3 posiłki / 5 posiłków"
// — forma "posiłki: 3" działa dla każdej liczby.
const askToMergeGuestData = ({ meals, weights, recipes, profile }) =>
    new Promise((resolve) => {
        const lines = [
            meals > 0 && `posiłki w dzienniku: ${meals}`,
            weights > 0 && `pomiary wagi: ${weights}`,
            recipes > 0 && `własne przepisy: ${recipes}`,
            profile && "profil z kalkulatora (konto jeszcze go nie ma)",
        ].filter(Boolean);

        showConfirmModal({
            title: "Dodać dane z tego urządzenia do konta?",
            message: `Na tym urządzeniu są dane zapisane bez logowania: ${lines.join(" · ")}. Jeśli to nie Twoje dane, wybierz „Odrzuć”: usuniemy je z tego urządzenia, a konto zostanie bez zmian.`,
            confirmLabel: "Dodaj do konta",
            cancelLabel: "Odrzuć",
            onConfirm: () => resolve("merge"),
            onCancel: () => resolve("discard"),
            onDismiss: () => resolve("later"),
            // "Odrzuć" kasuje dane nieodwracalnie, więc Enter nie może w nie trafić.
            initialFocus: "confirm",
        });
    });

const MERGE_MESSAGES = {
    merged: { stamp: "Konto", title: "Dane z tego urządzenia są na koncie" },
    discarded: { stamp: "Konto", title: "Odrzucono dane z tego urządzenia", note: "Konto zostało bez zmian." },
    later: {
        stamp: "Konto",
        title: "Dane z tego urządzenia czekają",
        note: "Zapytamy ponownie przy następnym uruchomieniu aplikacji.",
    },
    error: {
        stamp: "Uwaga",
        title: "Nie udało się przenieść danych na konto",
        note: "Dane zostają na tym urządzeniu. Spróbujemy ponownie przy następnym uruchomieniu.",
    },
};

// Odmowa zgód. Dwa przypadki: na urządzeniu była kartka gościa (zostaje),
// albo kopia danych konta (znika z urządzenia, ale oryginał jest na koncie —
// np. konto ze zgodą w starej wersji tekstu).
const DECLINED_GUEST_DATA = {
    stamp: "Wylogowano",
    title: "Bez zgody nie zapisujemy danych na koncie",
    note: "Dane z tego urządzenia zostały tutaj. Możesz dalej korzystać z aplikacji bez konta.",
};
const DECLINED_ACCOUNT_COPY = {
    stamp: "Wylogowano",
    title: "Bez zgody nie pokażemy danych z konta",
    note: "Twoje dane zostały na koncie. Zaloguj się i zaakceptuj zgody, żeby do nich wrócić.",
};

// Bez odpowiedzi bazy nie wiemy, czy konto ma zgody — więc ani przenoszenia,
// ani pobierania. Następny start (albo logowanie) sprawdzi ponownie.
const CONSENT_CHECK_FAILED = {
    stamp: "Uwaga",
    title: "Nie udało się połączyć z kontem",
    note: "Dane z tego urządzenia zostają tutaj. Spróbujemy ponownie przy następnym uruchomieniu.",
};

const showMergeResult = (result) => {
    if (MERGE_MESSAGES[result]) showToast(MERGE_MESSAGES[result]);
};

document.addEventListener("DOMContentLoaded", () => {
    // Router wysyła "route:rendered" po KAŻDYM renderze strony — także po
    // navigateTo() z kodu (CTA, formularze), czego nie łapał dawny nasłuch
    // kliknięć w tabbar (RAPORT.md #10). Rejestrujemy PRZED initRouter,
    // bo pierwszy render dzieje się już w jego środku.
    document.addEventListener("route:rendered", () => {
        updateActiveTab();
        updateAccountNav();
    });
    // Start aplikacji u zalogowanego i każde logowanie (e-mail, Google):
    // przejmij dane gościa, pobierz dane z bazy do lokalnej kopii, a jeśli się
    // zmieniły, przerysuj stronę.
    onAuthChange(async (user, event) => {
        updateAccountNav();

        // Sesja skończyła się bez przycisku "Wyloguj" na tym urządzeniu, np. po
        // "Wyloguj" na telefonie (scope: "global") — laptop dowiaduje się o tym
        // przy odświeżeniu biletu sesji (PLAN.md §1a, luka nr 9). Sprawdzamy
        // nazwę zdarzenia, a NIE `!user`: gość też nie ma użytkownika, a jego
        // dane istnieją tylko lokalnie. Po "Wyloguj" tutaj czyścimy drugi raz —
        // bez szkody, usunięcie nieistniejącego klucza nic nie robi.
        // Kasujemy tylko KOPIĘ danych konta (jest znacznik właściciela). Bez
        // znacznika to kartka gościa, jeszcze nieprzeniesiona na konto — np. po
        // odmowie zgód — i ona ma zostać na urządzeniu.
        if (event === "SIGNED_OUT") {
            if (getLocalOwner()) clearLocalData();
            refreshCurrentRoute(); // zdejmuje dane z ekranu, guard odeśle z Trackera
            return;
        }

        if (!user || (event !== "INITIAL_SESSION" && event !== "SIGNED_IN")) return;

        // Zgody przed czymkolwiek innym (PRAWO.md §14, warstwa B): bez zgody
        // art. 9 dane o zdrowiu nie mogą trafić do bazy, więc etap 6 czeka.
        const consent = await ensureConsents(askForConsents);
        if (consent === "declined") {
            // Sprawdzamy PRZED wylogowaniem — SIGNED_OUT skasuje kopię konta
            // razem ze znacznikiem, a komunikat zależy od tego, czyje to dane.
            const hadAccountCopy = getLocalOwner() !== null;
            // "local": odmowa w tej przeglądarce nie wylogowuje innych urządzeń.
            await signOut({ scope: "local" });
            showToast(hadAccountCopy ? DECLINED_ACCOUNT_COPY : DECLINED_GUEST_DATA);
            return;
        }
        if (consent !== "granted") {
            showToast(CONSENT_CHECK_FAILED);
            return;
        }

        // Etap 6: najpierw dane gościa z tego urządzenia (przeniesienie albo
        // pytanie), dopiero potem pobranie z bazy — kolejność pilnuje serwis.
        const { changed, result } = await syncWithAccountData(askToMergeGuestData);
        if (changed) refreshCurrentRoute();
        showMergeResult(result);
    });

    initRouter();
    initTopbarDrawer();
    initDisclaimerLinks();
    initInstallBanner();
});

if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register(`${getBase()}/service-worker.js`)
            .then((registration) => {
                console.log("Service Worker zarejestrowany, scope:", registration.scope);
            })
            .catch((error) => {
                console.error("Rejestracja Service Workera nie powiodła się:", error);
            });
    });
}