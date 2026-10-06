import { html } from "../utils/template.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { navigateTo } from "../router.js";
import { getBase } from "../utils/env.js";
import { showToast } from "../components/toast.js";
import { showConfirmModal } from "../components/confirmModal.js";
import {
    getSession,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    deleteAccount,
    PASSWORD_MIN_LENGTH,
} from "../services/authService.js";
import { getUser } from "../services/userService.js";
import { getAllMeals } from "../services/mealService.js";
import { getCustomRecipes } from "../services/customRecipeService.js";
import { clearLocalData } from "../services/localDataService.js";

// Trasy /konto (logowanie gościa albo strona konta) i /konto/rejestracja.
// Wygląd: makieta "Keto Thai – makieta kont" (DESIGN.md).

// ---------- Powrót po zalogowaniu ----------

// Zaproszenia do konta prowadzą tu z ?wroc=/dashboard — po zalogowaniu
// wracamy tam, skąd ktoś przyszedł, zamiast zostawiać go na formularzu.
const RETURN_LABELS = {
    "/": "Home",
    "/dashboard": "Tracker",
    "/recipes": "Przepisy",
    "/camp": "Camp",
    "/knowledge": "Wiedza",
    "/contact": "Kontakt",
};

// Tylko ścieżki wewnątrz aplikacji. "//zly-adres.pl" przeglądarka czyta jako
// INNY serwer — bez tej kontroli link z ?wroc= mógłby wyprowadzić użytkownika
// z naszej strony zaraz po zalogowaniu (tzw. open redirect).
const getReturnPath = () => {
    const raw = new URLSearchParams(window.location.search).get("wroc");
    if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/konto")) return null;
    return raw;
};

const getReturnQuery = () => {
    const returnPath = getReturnPath();
    return returnPath ? `?wroc=${encodeURIComponent(returnPath)}` : "";
};

// Zalogowany przychodzi po dziennik, więc domyślnie Tracker — także zamiast
// strony głównej i kalkulatora. Inne strony (przepisy, Camp…) zostają, żeby
// nie gubić miejsca, z którego ktoś się logował. Konto bez profilu guard
// routera sam odeśle z /dashboard na /onboarding.
const DASHBOARD_INSTEAD_OF = new Set(["/", "/onboarding"]);

const goAfterSignIn = (options) => {
    const returnPath = getReturnPath();
    const target = !returnPath || DASHBOARD_INSTEAD_OF.has(returnPath) ? "/dashboard" : returnPath;
    navigateTo(target, options);
};

// Znacznik w adresie powrotu od Google. Odróżnia „właśnie zalogowałem się
// przez Google” od zwykłego wejścia na /konto?wroc=… (np. z szuflady),
// bo tylko po Google przekierowujemy dalej sami (PLAN.md §1a, luka nr 8).
const GOOGLE_RETURN_PARAM = "google";

// Po Google wracamy na /konto z ?wroc= i znacznikiem. Pełny adres z domeną, bo
// wraca do nas serwer Google/Supabase, a nie nasz router.
const getGoogleRedirect = () => {
    const params = new URLSearchParams({ [GOOGLE_RETURN_PARAM]: "1" });
    const returnPath = getReturnPath();
    if (returnPath) params.set("wroc", returnPath);
    return `${window.location.origin}${getBase()}/konto?${params}`;
};

const isBackFromGoogle = () => new URLSearchParams(window.location.search).has(GOOGLE_RETURN_PARAM);
const continueWithGoogle = () => signInWithGoogle({ redirectTo: getGoogleRedirect() });

const getReturnNoteHTML = () => {
    const label = RETURN_LABELS[getReturnPath()?.split("?")[0]];
    return label ? html`<p class="tag account__return">Potem wrócisz do: ${label}</p>` : "";
};

// ---------- Wspólne kawałki widoków ----------

// Znak Google w oryginalnych kolorach — wymóg wytycznych marki Google dla
// przycisku logowania, jedyne miejsce z kolorami spoza palety DESIGN.md.
const GOOGLE_ICON = html`<svg class="account__google-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
</svg>`;

const renderEmailField = (id) => html`<div class="form__group">
    <label for="${id}" class="form__label">E-mail</label>
    <input type="email" id="${id}" name="email" class="form__input" autocomplete="email" placeholder="twoj@email.pl" required />
</div>`;

// `autocomplete` mówi menedżerowi haseł, czy podpowiedzieć zapisane hasło
// (current-password), czy zaproponować nowe (new-password).
const renderPasswordField = (id, autocomplete, hint = "") => html`<div class="form__group">
    <label for="${id}" class="form__label">Hasło</label>
    <div class="account__password">
        <input
            type="password"
            id="${id}"
            name="password"
            class="form__input"
            autocomplete="${autocomplete}"
            ${hint ? `minlength="${PASSWORD_MIN_LENGTH}" aria-describedby="${id}-hint"` : ""}
            required
        />
        <button type="button" class="account__password-toggle" aria-controls="${id}" aria-pressed="false">Pokaż</button>
    </div>
    ${hint ? `<p class="form__note" id="${id}-hint">${hint}</p>` : ""}
</div>`;

const renderGoogleButton = (label) => html`<button type="button" class="btn btn--secondary btn--icon account__google" id="account-google">
    ${GOOGLE_ICON}<span>${label}</span>
</button>`;

const bindPasswordToggle = (root) => {
    const toggle = root.querySelector(".account__password-toggle");
    const input = root.querySelector(`#${toggle?.getAttribute("aria-controls")}`);
    if (!toggle || !input) return;

    toggle.addEventListener("click", () => {
        const isVisible = input.type === "text";
        input.type = isVisible ? "password" : "text";
        toggle.textContent = isVisible ? "Pokaż" : "Ukryj";
        toggle.setAttribute("aria-pressed", String(!isVisible));
    });
};

// Jeden przebieg każdej akcji: blokada przycisku i napis "w toku" → czekanie
// na serwis → komunikat błędu albo sukces. Zablokowany przycisk chroni przed
// podwójnym kliknięciem, które wysłałoby dwie rejestracje naraz.
const runAction = async ({ button, busyLabel, errorBox, action }) => {
    const label = button.querySelector("span") ?? button;
    const idleLabel = label.textContent;

    errorBox.classList.add("is-hidden");
    button.disabled = true;
    label.textContent = busyLabel;

    let result;
    try {
        result = await action();
    } catch (error) {
        // Wyjątek zamiast { error } to awaria sieci — przy Supabase realna sytuacja.
        console.error(error);
        result = { error: "Nie udało się połączyć. Sprawdź internet i spróbuj ponownie." };
    }

    button.disabled = false;
    label.textContent = idleLabel;

    if (result.error) {
        errorBox.textContent = result.error;
        errorBox.classList.remove("is-hidden");
    }
    return result;
};

const formatDate = (dateKey) => dateKey.split("-").reverse().join(".");

// ---------- /konto ----------

// Sesja przychodzi asynchronicznie, więc render() daje tylko stan "sprawdzam",
// a właściwy widok (logowanie albo konto) wstawia init() po odpowiedzi serwisu.
export const renderAccount = () => html`<div class="page-container account" id="account-root" aria-busy="true">
    <p class="account__loading tag">Sprawdzam konto…</p>
</div>`;

const renderSignInView = () => html`<header class="page-header account__header">
        <h1 class="page-header__title">Zaloguj się</h1>
        <p class="page-header__desc">Dziennik, pomiary i własne przepisy na każdym urządzeniu.</p>
        ${getReturnNoteHTML()}
    </header>

    <div class="account__panel">
        ${renderGoogleButton("Zaloguj przez Google")}
        <p class="account__or tag">albo e-mail</p>
        <form class="account__form" id="account-form">
            ${renderEmailField("signin-email")} ${renderPasswordField("signin-password", "current-password")}
            <p class="form__error is-hidden" id="account-error" role="alert"></p>
            <button type="submit" class="btn btn--primary" id="account-submit"><span>Zaloguj się</span></button>
        </form>
        <p class="account__switch">
            Nie masz konta? <a href="/konto/rejestracja${getReturnQuery()}" data-link>Załóż konto</a>
        </p>
    </div>`;

const PROVIDER_LABELS = { email: "E-mail i hasło", google: "Google" };

const renderSignedInView = (session) => html`<header class="page-header account__header">
        <h1 class="page-header__title">Konto</h1>
    </header>

    <div class="account__panel">
        <section class="account-card paper" aria-labelledby="account-card-title">
            <div class="account-card__holes" aria-hidden="true">
                <span class="hole"></span>
                <span class="hole"></span>
            </div>
            <h2 class="account-card__title" id="account-card-title">Karta zawodnika</h2>
            <dl class="account-card__list">
                <div class="account-card__row">
                    <dt>E-mail</dt>
                    <dd>${escapeHtml(session.email)}</dd>
                </div>
                <div class="account-card__row">
                    <dt>Logowanie</dt>
                    <dd>${PROVIDER_LABELS[session.provider] ?? "E-mail i hasło"}</dd>
                </div>
                <div class="account-card__row">
                    <dt>Konto od</dt>
                    <dd>${formatDate(session.createdAt)}</dd>
                </div>
            </dl>
        </section>

        <p class="form__error is-hidden" id="account-error" role="alert"></p>

        <button type="button" class="btn btn--secondary btn--icon" id="account-signout">
            <i data-lucide="log-out"></i><span>Wyloguj się</span>
        </button>

        <section class="account__danger" aria-labelledby="account-delete-title">
            <h2 class="account__danger-title" id="account-delete-title">Usunięcie konta</h2>
            <p class="account__danger-text">
                Kasuje konto i wszystko na nim: profil, pomiary wagi, dziennik i własne przepisy. Tego nie da się
                cofnąć.
            </p>
            <button type="button" class="btn btn--icon account__delete" id="account-delete">
                <i data-lucide="trash-2"></i><span>Usuń konto i dane</span>
            </button>
        </section>
    </div>`;

const initSignInView = (root) => {
    const form = root.querySelector("#account-form");
    const errorBox = root.querySelector("#account-error");
    bindPasswordToggle(root);

    root.querySelector("#account-google").addEventListener("click", async (event) => {
        const result = await runAction({
            button: event.currentTarget,
            busyLabel: "Łączę z Google…",
            errorBox,
            action: continueWithGoogle,
        });
        if (!result.error && !result.redirecting) goAfterSignIn();
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(form);

        const result = await runAction({
            button: root.querySelector("#account-submit"),
            busyLabel: "Loguję…",
            errorBox,
            action: () => signIn({ email: data.get("email"), password: data.get("password") }),
        });
        if (!result.error) goAfterSignIn();
    });
};

const initSignedInView = (root) => {
    const errorBox = root.querySelector("#account-error");

    root.querySelector("#account-signout").addEventListener("click", async (event) => {
        const result = await runAction({
            button: event.currentTarget,
            busyLabel: "Wylogowuję…",
            errorBox,
            // Najpierw czyścimy, potem wylogowanie: dane o zdrowiu znikają
            // z tej przeglądarki nawet wtedy, gdy signOut() się nie uda
            // (brak sieci) albo rzuci wyjątek. Oryginał zostaje w bazie.
            action: () => {
                clearLocalData();
                return signOut();
            },
        });
        if (result.error) return;
        navigateTo("/konto");
        // Pusta aplikacja po wylogowaniu wygląda jak utrata danych — mówimy wprost,
        // że są na koncie (PLAN.md §1a, wylogowanie czyści dane lokalne).
        showToast({
            stamp: "Wylogowano",
            title: "Twoje dane zostały na koncie",
            note: "Zaloguj się, żeby znowu zobaczyć dziennik i pomiary.",
        });
    });

    root.querySelector("#account-delete").addEventListener("click", (event) => {
        const button = event.currentTarget;

        showConfirmModal({
            title: "Usunąć konto?",
            message: "Skasujemy konto i wszystkie zapisane na nim dane. Tej operacji nie można cofnąć.",
            confirmLabel: "Usuń konto",
            cancelLabel: "Anuluj",
            onConfirm: async () => {
                const result = await runAction({ button, busyLabel: "Usuwam…", errorBox, action: deleteAccount });
                if (result.error) return;
                // Dopiero po sukcesie: przy błędzie konto dalej istnieje,
                // a pusty ekran sugerowałby, że dane zniknęły.
                clearLocalData();
                navigateTo("/");
                showToast({ stamp: "Usunięte", title: "Konto zostało usunięte" });
            },
        });
    });
};

export const initAccount = async () => {
    const root = document.getElementById("account-root");
    const session = await getSession();

    // Użytkownik mógł w międzyczasie przejść na inną stronę — wtedy `root`
    // nie jest już w dokumencie i nie wolno go wypełniać.
    if (!root?.isConnected) return;

    // Powrót od Google: sesja już jest, więc idziemy tam, skąd ktoś przyszedł.
    // replace, a nie push — inaczej „Wstecz” wracałoby na ten adres
    // ze znacznikiem i przekierowywało w kółko.
    if (session && isBackFromGoogle()) {
        goAfterSignIn({ replace: true });
        return;
    }

    root.innerHTML = session ? renderSignedInView(session) : renderSignInView();
    root.removeAttribute("aria-busy");
    window.lucide?.createIcons();

    if (session) initSignedInView(root);
    else initSignInView(root);
};

// ---------- /konto/rejestracja ----------

// Co gość ma już na tym urządzeniu — liczone z localStorage, nie z makiety.
const getLocalDataSummary = () => {
    const user = getUser();
    const days = Object.values(getAllMeals()).filter((meals) => Array.isArray(meals) && meals.length > 0).length;

    return {
        hasProfile: Boolean(user),
        days,
        weights: user?.weightHistory.length ?? 0,
        recipes: getCustomRecipes().length,
    };
};

// Przeniesienie tych danych do bazy to etap 6 (PLAN.md §1a). Do tego czasu
// zostają w localStorage, więc po rejestracji nic nie znika z ekranu.
const renderLocalDataCard = () => {
    const summary = getLocalDataSummary();
    if (!summary.hasProfile && summary.days === 0 && summary.recipes === 0) return "";

    return html`<section class="account-card paper" aria-labelledby="account-move-title">
        <div class="account-card__holes" aria-hidden="true">
            <span class="hole"></span>
            <span class="hole"></span>
        </div>
        <h2 class="account-card__title" id="account-move-title">Przeniesiemy</h2>
        <dl class="account-card__list">
            <div class="account-card__row">
                <dt>Profil i plan</dt>
                <dd>${summary.hasProfile ? "tak" : "brak"}</dd>
            </div>
            <div class="account-card__row">
                <dt>Dni w dzienniku</dt>
                <dd>${summary.days}</dd>
            </div>
            <div class="account-card__row">
                <dt>Pomiary wagi</dt>
                <dd>${summary.weights}</dd>
            </div>
            <div class="account-card__row">
                <dt>Własne przepisy</dt>
                <dd>${summary.recipes}</dd>
            </div>
        </dl>
    </section>`;
};

export const renderRegister = () => html`<div class="page-container account" id="register-root">
    <header class="page-header account__header">
        <h1 class="page-header__title">Załóż konto</h1>
        <p class="page-header__desc">Nic nie wpisujesz od nowa. To, co masz na tym urządzeniu, trafi na konto.</p>
        ${getReturnNoteHTML()}
    </header>

    <div class="account__panel">
        ${renderLocalDataCard()} ${renderGoogleButton("Kontynuuj z Google")}
        <p class="account__or tag">albo e-mail</p>
        <form class="account__form" id="account-form">
            ${renderEmailField("signup-email")}
            ${renderPasswordField("signup-password", "new-password", `Co najmniej ${PASSWORD_MIN_LENGTH} znaków.`)}

            <!-- TODO etap 7 (RODO): podlinkować regulamin i politykę prywatności, gdy powstaną. -->
            <fieldset class="consent account__consent">
                <legend class="visually-hidden">Zgody</legend>
                <label class="consent__check">
                    <input type="checkbox" name="terms" required />
                    <span>Akceptuję regulamin i politykę prywatności.</span>
                </label>
                <label class="consent__check">
                    <input type="checkbox" name="health" required />
                    <span>
                        Zgadzam się na przechowywanie na koncie danych o mojej wadze i diecie (to dane o zdrowiu).
                    </span>
                </label>
            </fieldset>

            <p class="form__error is-hidden" id="account-error" role="alert"></p>
            <button type="submit" class="btn btn--primary" id="account-submit"><span>Załóż konto</span></button>
        </form>
        <p class="account__switch">
            Masz konto? <a href="/konto${getReturnQuery()}" data-link>Zaloguj się</a>
        </p>
    </div>
</div>`;

export const initRegister = async () => {
    const root = document.getElementById("register-root");

    // Zalogowany nie ma tu czego szukać — jego miejsce to strona konta.
    if (await getSession()) {
        if (root?.isConnected) navigateTo("/konto");
        return;
    }

    const form = root.querySelector("#account-form");
    const errorBox = root.querySelector("#account-error");
    bindPasswordToggle(root);

    const finish = (result) => {
        if (result.error || result.redirecting) return;
        showToast({ stamp: "Gotowe", title: "Konto założone" });
        goAfterSignIn();
    };

    // Zgody dotyczą obu dróg. Formularz pilnuje ich sam (`required`), ale
    // przycisk Google jest poza wysyłką formularza, więc sprawdzamy je ręcznie.
    root.querySelector("#account-google").addEventListener("click", async (event) => {
        if (!form.elements.terms.checked || !form.elements.health.checked) {
            errorBox.textContent = "Zaznacz obie zgody pod formularzem, zanim założysz konto.";
            errorBox.classList.remove("is-hidden");
            form.elements.terms.focus();
            return;
        }

        finish(
            await runAction({
                button: event.currentTarget,
                busyLabel: "Łączę z Google…",
                errorBox,
                action: continueWithGoogle,
            }),
        );
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(form);

        finish(
            await runAction({
                button: root.querySelector("#account-submit"),
                busyLabel: "Zakładam konto…",
                errorBox,
                action: () => signUp({ email: data.get("email"), password: data.get("password") }),
            }),
        );
    });
};
