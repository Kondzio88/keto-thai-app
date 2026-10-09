import { html } from "../utils/template.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { getUser, addWeightEntry, updatePlanSettings, WEIGHT_LIMITS, AGE_LIMITS } from "../services/userService.js";
import {
    generateDietPlan,
    isKnownActivity,
    isKnownGoal,
    FLOOR_LIMIT,
    TARGET_DEFICIT_PERCENT,
} from "../services/calculatorService.js";
import {
    ACTIVITY_OPTIONS,
    GOAL_OPTIONS,
    generateOptionsHTML,
    getActivityNote,
    bindActivityNote,
} from "../components/planFields.js";
import { getAllMeals, getMealsForDay, removeMeal, sumMacros } from "../services/mealService.js";
import { getNetCarbs } from "../services/productService.js";
import { clearLocalData } from "../services/localDataService.js";
import { getSession } from "../services/authService.js";
import {
    getDateKey,
    getDaysSince,
    getDaysBetween,
    shiftDateKey,
    isValidDateKey,
    getWeekdayShort,
    formatDateKey,
    formatDateKeyLong,
    formatDateKeyShort,
} from "../utils/date.js";
import { navigateTo, replaceQuery } from "../router.js";
import { trapFocus } from "../utils/focusTrap.js";
import { showConfirmModal } from "../components/confirmModal.js";
import { showToast } from "../components/toast.js";

let weightChartInstance = null;
let closeWeightModal = null; // pozwala cleanupowi zamknąć modal przy zmianie trasy
let closePlanModal = null; // to samo dla "Zmień dane planu"

// Odpowiednik tokenów z global.css — Chart.js potrzebuje literalnych wartości,
// nie może czytać CSS custom properties.
const CHART_COLORS = {
    amber: "#D98C2B",
    boneDim: "#A79E88",
    gridLine: "rgba(239, 233, 216, 0.08)",
};

const CHART_FONT = { family: '"Martian Mono", monospace', size: 11 };

// Plan z kalkulatora i suma dnia używają tych samych nazw pól, więc jeden `key`
// czyta cel i spożycie. `meter` = modyfikator CSS miarki (kolor makro).
const BALANCE_ROWS = [
    { key: "calories", label: "Kalorie", unit: "kcal", meter: "calories" },
    { key: "protein", label: "Białko", unit: "g", meter: "protein" },
    { key: "fats", label: "Tłuszcz", unit: "g", meter: "fats" },
    { key: "netCarbs", label: "Węgle netto", unit: "g", meter: "carbs" },
];

// Po tylu dniach bez pomiaru dziennik przypomina o wadze — plan liczy się
// z ostatniej wpisanej wagi, więc stara waga = nieaktualny cel.
const WEIGH_IN_INTERVAL_DAYS = 7;

const getDaysSinceLastWeighIn = (user) => getDaysSince(user.weightHistory[user.weightHistory.length - 1].date);

// Ikona pory posiłku — informacja, nie dekoracja. Tekst dla czytnika w aria-label.
const MEAL_CATEGORY_ICONS = {
    śniadanie: { icon: "sunrise", label: "Śniadanie" },
    obiad: { icon: "sun", label: "Obiad" },
    kolacja: { icon: "moon", label: "Kolacja" },
};

const generateMealIconHTML = (category) => {
    const meta = MEAL_CATEGORY_ICONS[category];
    if (!meta) return "";

    return html`
        <span class="meal-log__icon" role="img" aria-label="${meta.label}" title="${meta.label}">
            <i data-lucide="${meta.icon}" aria-hidden="true"></i>
        </span>
    `;
};

// ---------- Przełącznik dni: zakładki tygodnia nad kartką ----------

// Wybrany dzień żyje w adresie (/dashboard?dzien=2026-10-08), nie w zmiennej:
// zalogowanemu strona przerysowuje się sama po pobraniu danych z bazy (main.js,
// refreshCurrentRoute), a adres to przetrwa — zmienna wróciłaby na dziś.
const DAY_PARAM = "dzien";
const STRIP_DAYS = 7;

// Najwcześniejszy dzień, w którym mogą być dane: start profilu albo najstarszy wpis
// (profil sprzed historii wagi dostaje datę "dziś", a posiłki mogą być starsze).
// Klucze "RRRR-MM-DD" porównują się poprawnie jako zwykłe napisy.
const getFirstDayKey = (user) => [user.weightHistory[0].date, ...Object.keys(getAllMeals())].sort()[0];

// null = dziś. Dziś nie trafia do adresu, więc po północy "dziś" przesuwa się samo.
// Adres może wpisać każdy: zły, przyszły albo sprzed startu → dziś.
const readDayFromUrl = (today, firstDay) => {
    const value = new URLSearchParams(window.location.search).get(DAY_PARAM);
    const isPastDay = isValidDateKey(value) && value >= firstDay && value < today;
    if (value !== null && !isPastDay) replaceQuery({}); // sprzątamy zły parametr z adresu
    return isPastDay ? value : null;
};

// 7 dni, ostatni po prawej. Bieżący tydzień kończy się dziś; starsze to pełne
// siódemki wstecz od dziś, więc wybrany dzień zawsze jest w pokazanym tygodniu.
const getStripDays = (selected, today) => {
    const weeksBack = Math.floor(getDaysSince(selected) / STRIP_DAYS);
    const lastDay = shiftDateKey(today, -weeksBack * STRIP_DAYS);
    return Array.from({ length: STRIP_DAYS }, (_, index) => shiftDateKey(lastDay, index - (STRIP_DAYS - 1)));
};

// Zaliczony dzień = jest wpis i węgle netto w limicie (decyzja 2026-10-09).
// Limit z OBECNEGO planu — przeszłe dni liczymy z dzisiejszych ustawień (wariant A).
const getDayStatus = (meals, plan) => {
    if (meals.length === 0) return "empty";
    return sumMacros(meals).netCarbs <= plan.netCarbs ? "done" : "logged";
};

// Znak różni się KSZTAŁTEM, nie tylko kolorem (DESIGN.md §8): ptaszek vs kropka.
// "open" = dziś: dzień w trakcie nie jest jeszcze zaliczony ani przestrzelony
// (kolacja może zmienić wynik), więc znak pojawia się dopiero po północy.
const DAY_MARKS = {
    done: html`<i data-lucide="check"></i>`,
    logged: html`<span class="day-dot"></span>`,
    empty: "",
    open: "",
};

const DAY_STATUS_TEXT = {
    done: "dzień zamknięty w limicie węgli netto",
    logged: "węgle netto ponad limit",
    empty: "brak wpisu",
    open: "dzień w trakcie",
};

const getTabStatus = (dateKey, { today, firstDay, plan }) => {
    if (dateKey < firstDay) return "beforeStart";
    if (dateKey === today) return "open";
    return getDayStatus(getMealsForDay(dateKey), plan);
};

// Natywne radio zamiast własnych przycisków: strzałki, Tab i ogłaszanie
// "zaznaczony, 3 z 7" daje przeglądarka. Widoczny skrót "Śr 08" jest ukryty
// dla czytnika — ten czyta pełne zdanie z .visually-hidden.
const generateDayTabsHTML = (days, { selected, today, firstDay, plan }) =>
    days
        .map((dateKey) => {
            const status = getTabStatus(dateKey, { today, firstDay, plan });
            const isBeforeStart = status === "beforeStart";
            const isToday = dateKey === today;
            const id = `day-${dateKey}`;

            return html`
                <input
                    type="radio"
                    class="day-tabs__input visually-hidden"
                    name="day"
                    id="${id}"
                    value="${dateKey}"
                    ${dateKey === selected ? "checked" : ""}
                    ${isBeforeStart ? "disabled" : ""}
                />
                <label class="day-tabs__tab ${isToday ? "is-today" : ""}" for="${id}">
                    <span class="day-tabs__weekday" aria-hidden="true">${getWeekdayShort(dateKey)}</span>
                    <span class="day-tabs__number" aria-hidden="true">${dateKey.slice(8)}</span>
                    <span class="day-tabs__mark" aria-hidden="true">${DAY_MARKS[status] ?? ""}</span>
                    <span class="visually-hidden">
                        ${formatDateKeyLong(dateKey)}${isToday ? ", dziś" : ""}:
                        ${isBeforeStart ? "przed startem dziennika" : DAY_STATUS_TEXT[status]}
                    </span>
                </label>
            `;
        })
        .join("");

// Wyjaśnienie kolumny "Cel", gdy podłoga kaloryczna zmieniła redukcję.
// Liczone przy każdym odświeżeniu, bo plan zależy od aktualnej wagi — ktoś,
// kto chudnie, może wpaść pod podłogę dopiero po kilku tygodniach.
// null = nic do wyjaśnienia (pełny deficyt albo inny cel niż redukcja).
// HTML bez danych od użytkownika (tylko liczby z kalkulatora), więc bez escapeHtml.
const getPlanNoteHTML = (plan) => {
    if (plan.floorLimit === FLOOR_LIMIT.reduced) {
        return `Twój cel to bezpieczne minimum (${plan.calories} kcal), więc redukcja jest łagodniejsza: ${plan.deficitPercent}% poniżej zapotrzebowania zamiast ${TARGET_DEFICIT_PERCENT}%.`;
    }
    if (plan.floorLimit === FLOOR_LIMIT.maintenance) {
        return html`Przy Twoich parametrach bezpieczny deficyt nie jest możliwy — cel pokazuje utrzymanie wagi.
            Redukcję skonsultuj z lekarzem lub dietetykiem.
            <a href="#zastrzezenia" class="plan-note__link">Przeciwwskazania i zasady</a>`;
    }
    return null;
};

// "Redukcja · poziom aktywności: umiarkowany · wiek: 41". Etykiety aktywności mają
// rodzaj męski (pasują do "poziomu"), stąd "poziom aktywności", a "wiek: 41"
// omija odmianę "lat / lata". Trzy nierozdzielne części jak w notce o błonniku:
// na telefonie linia łamie się tylko między nimi, nie w środku "poziom aktywności: lekki".
// HTML tylko ze stałych etykiet i liczby wieku, więc bez escapeHtml.
const getPlanSummaryHTML = (user) => {
    const goal = GOAL_OPTIONS.find((option) => option.value === user.goal)?.label ?? "";
    const activity = ACTIVITY_OPTIONS.find((option) => option.value === user.activity)?.label.toLowerCase() ?? "";
    return html`<span class="nowrap">${goal}</span>
        <span class="nowrap">· poziom aktywności: ${activity}</span>
        <span class="nowrap">· wiek: ${user.age}</span>`;
};

const generateBalanceRowsHTML = (plan, eaten) => {
    return BALANCE_ROWS.map(({ key, label, unit, meter }) => {
        const target = plan[key];
        const consumed = eaten[key];
        const left = target - consumed;
        const isOver = left < 0;

        // Skala miarki rośnie przy przekroczeniu — kreska pokazuje, gdzie był limit.
        const scaleMax = Math.max(target, consumed);
        const fillPercent = scaleMax > 0 ? (consumed / scaleMax) * 100 : 0;
        const limitPercent = scaleMax > 0 ? (target / scaleMax) * 100 : 100;

        return html`
            <tr class="balance__row ${isOver ? "is-over" : ""}">
                <th scope="row">${label}<span class="balance__unit">${unit}</span></th>
                <td>${target}</td>
                <td>${consumed}</td>
                <td class="balance__left">
                    ${isOver ? `+${Math.abs(left)}` : left}
                    ${isOver ? html`<span class="balance__over-tag">ponad</span>` : ""}
                </td>
            </tr>
            <tr class="balance__meter-row" aria-hidden="true">
                <td colspan="4">
                    <div class="meter meter--${meter}">
                        <span class="meter__fill" style="width: ${fillPercent}%"></span>
                        ${isOver ? html`<span class="meter__limit" style="left: ${limitPercent}%"></span>` : ""}
                    </div>
                </td>
            </tr>
        `;
    }).join("");
};

// ---------- Karta ważenia: start → ostatni pomiar ----------

// Tempo dopiero po 2 tygodniach: z kilku dni to szum (sama woda daje ±1,5 kg).
const MIN_DAYS_FOR_PACE = 14;

// Zaokrąglenie PRZED znakiem: inaczej 75,3 − 75,3 z błędem liczb zmiennoprzecinkowych
// (−0,0000001) dałoby "−0,0 kg".
const roundKg = (value) => Math.round(value * 10) / 10;

const formatKg = (value) =>
    value.toLocaleString("pl-PL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Prawdziwy minus (U+2212), nie łącznik — w kolumnie liczb ma szerokość plusa.
const formatSignedKg = (value) => {
    const rounded = roundKg(value);
    const sign = rounded > 0 ? "+" : rounded < 0 ? "−" : "";
    return `${sign}${formatKg(Math.abs(rounded))}`;
};

// Start = pierwszy pomiar w ogóle (wariant 1, 2026-10-09). Znak zmiany bez oceny:
// −2 kg to sukces przy redukcji, a porażka przy masie, więc nie kolorujemy.
// HTML tylko z dat i liczb, więc bez escapeHtml.
const generateWeighCardHTML = (weightHistory) => {
    const start = weightHistory[0];
    const last = weightHistory[weightHistory.length - 1];

    if (weightHistory.length < 2) {
        return html`<p class="weigh-card__empty">
            Jeden pomiar: ${formatDateKeyShort(start.date)} · ${formatKg(start.weight)} kg.
            Postęp pokażemy po drugim ważeniu.
        </p>`;
    }

    const change = last.weight - start.weight;
    const days = getDaysBetween(start.date, last.date);
    const pace =
        days >= MIN_DAYS_FOR_PACE
            ? `${formatSignedKg(change / (days / 7))} kg/tydz.`
            : `po ${MIN_DAYS_FOR_PACE} dniach pomiarów`;

    return html`
        <dl class="weigh-card__list">
            <div class="weigh-card__row">
                <dt>Start</dt>
                <dd>${formatDateKey(start.date)} · ${formatKg(start.weight)} kg</dd>
            </div>
            <div class="weigh-card__row">
                <dt>Ostatnio</dt>
                <dd>${formatDateKey(last.date)} · ${formatKg(last.weight)} kg</dd>
            </div>
            <div class="weigh-card__row weigh-card__row--key">
                <dt>Zmiana</dt>
                <dd>${formatSignedKg(change)} kg</dd>
            </div>
            <div class="weigh-card__row">
                <dt>Tempo</dt>
                <dd>${pace}</dd>
            </div>
        </dl>
    `;
};

// readOnly: miniony dzień — bez "Usuń" (przeszłości nie edytujemy, a removeMeal()
// i tak usuwa tylko z dzisiaj) i bez zachęty do dodania dania.
const generateMealLogHTML = (meals, { readOnly = false } = {}) => {
    if (meals.length === 0) {
        if (readOnly) return html`<p class="meal-log__empty">Tego dnia nic nie wpisano.</p>`;
        return html`
            <p class="meal-log__empty">
                Nic dziś jeszcze nie wpisano. Wybierz danie w
                <a href="/recipes" data-link>Przepisach</a> i dodaj je do dnia.
            </p>
        `;
    }

    return html`
        <ol class="meal-log">
            ${meals
                .map(
                    (meal) => html`
                        <li class="meal-log__entry">
                            ${generateMealIconHTML(meal.category)}
                            <span class="meal-log__time">${meal.time}</span>
                            <span class="meal-log__title">${escapeHtml(meal.title)}</span>
                            <span class="meal-log__kcal">${meal.calories} kcal</span>
                            <span class="meal-log__macros">
                                <span class="nowrap">B ${meal.protein}</span> ·
                                <span class="nowrap">T ${meal.fats}</span> ·
                                <span class="nowrap">W netto ${getNetCarbs(meal)}</span>
                            </span>
                            ${readOnly
                                ? ""
                                : html`<button
                                      type="button"
                                      class="meal-log__remove"
                                      data-meal-id="${meal.id}"
                                      aria-label="Usuń: ${escapeHtml(meal.title)}"
                                  >
                                      <i data-lucide="x" aria-hidden="true"></i>
                                      <span>Usuń</span>
                                  </button>`}
                        </li>
                    `,
                )
                .join("")}
        </ol>
    `;
};

export const renderDashboard = () => {
    return html`
        <div class="page-container">
            <!-- Teksty nagłówka zależą od wybranego dnia — ustawia je refreshDay(). -->
            <header class="page-header">
                <h1 class="page-header__title" id="day-heading">Dziś w dzienniku</h1>
                <p class="page-header__desc" id="day-desc">Twój cel Keto — wpis dnia</p>
            </header>

            <div class="dashboard">
                <div class="journal-wrap">
                    <!-- Zakładki teczki przyklejone do górnej krawędzi kartki (DESIGN.md §6):
                         oddzielone od bilansu, ale widać, którą stronę dziennika otwierają. -->
                    <fieldset class="day-tabs">
                        <legend class="visually-hidden">Dzień w dzienniku</legend>
                        <div class="day-tabs__row" id="day-tabs-row"></div>
                    </fieldset>

                    <section class="paper journal" aria-labelledby="journal-title">
                        <div class="journal__holes" aria-hidden="true">
                            <span class="hole"></span>
                            <span class="hole"></span>
                        </div>

                        <div class="journal__header">
                            <h2 class="journal__title" id="journal-title" tabindex="-1">Bilans dnia</h2>
                            <!-- Strzałki o jeden dzień: jedyna droga do tygodni starszych niż
                                 te na zakładkach. Chevron to znak oczywisty, nazwa w aria-label. -->
                            <div class="day-nav">
                                <button type="button" class="day-nav__step" id="btn-prev-day" aria-label="Poprzedni dzień">
                                    <i data-lucide="chevron-left" aria-hidden="true"></i>
                                </button>
                                <span class="tag journal__date" id="journal-date"></span>
                                <button type="button" class="day-nav__step" id="btn-next-day" aria-label="Następny dzień">
                                    <i data-lucide="chevron-right" aria-hidden="true"></i>
                                </button>
                                <button type="button" class="btn-icon-text day-nav__today is-hidden" id="btn-today">
                                    Wróć do dziś
                                </button>
                            </div>
                            <!-- Pod nagłówkiem, nie nad nim (DESIGN.md §4). Treść z refreshDay(),
                                 bo zmienia się po "Zmień dane planu". -->
                            <p class="journal__plan" id="plan-summary"></p>
                        </div>

                        <!-- Przypomnienie o pomiarze: wpis w dzienniku nad bilansem, nie baner
                             w kolumnie wykresu (na telefonie był pod całym dziennikiem). -->
                        <div class="weigh-in is-hidden" id="weigh-in-reminder">
                            <p class="weigh-in__text" id="weigh-in-text"></p>
                            <button type="button" class="btn-icon-text weigh-in__btn" id="btn-weigh-in">
                                <i data-lucide="plus" aria-hidden="true"></i>
                                Dodaj pomiar
                            </button>
                        </div>

                        <!-- Kolumna "Plan", nie "Cel": "cel" to redukcja / utrzymanie / masa
                             z linii nad tabelą, a tu jest liczba na dziś. -->
                        <table class="balance" id="balance-table" aria-label="Plan, spożycie i pozostały limit na dziś">
                            <thead>
                                <tr>
                                    <th scope="col">Makro</th>
                                    <th scope="col">Plan</th>
                                    <th scope="col">Zjedzone</th>
                                    <th scope="col">Zostało</th>
                                </tr>
                            </thead>
                            <tbody id="balance-body"></tbody>
                        </table>

                        <p class="plan-note is-hidden" id="plan-note"></p>
                        <p class="balance__note" id="balance-note"></p>

                        <p class="stamp balance__alert is-hidden" id="carbs-alert" role="status">
                            Limit węgli przekroczony
                        </p>

                        <!-- Jedyne miejsce zmiany celu bez ponownego onboardingu. Zdanie mówi,
                             z czego liczy się kolumna "Cel" — przycisk sam mówi, co robi. -->
                        <!-- Miniony dzień: zdanie mówi, skąd kolumna "Plan" (obecne ustawienia),
                             a przycisku nie ma — przeszłość jest tylko do odczytu. -->
                        <div class="plan-settings">
                            <p class="plan-settings__text" id="plan-settings-text"></p>
                            <button type="button" class="btn-icon-text plan-settings__btn" id="btn-plan-settings">
                                <i data-lucide="sliders-horizontal" aria-hidden="true"></i>
                                Zmień dane planu
                            </button>
                        </div>

                        <h3 class="journal__section-title" id="meal-log-title">Posiłki dziś</h3>
                        <div id="meal-log"></div>
                    </section>

                    <!-- Klucz znaków z zakładek — pod kartką, na macie, jak legenda pod tabelą. -->
                    <p class="day-key">
                        <span class="day-key__item">
                            <span class="day-key__mark" aria-hidden="true"><i data-lucide="check"></i></span>
                            dzień zamknięty w limicie węgli netto
                        </span>
                        <span class="day-key__item">
                            <span class="day-key__mark" aria-hidden="true"><span class="day-dot"></span></span>
                            węgle netto ponad limit
                        </span>
                        <span class="day-key__item">dziś: znak po północy</span>
                    </p>
                </div>

                <aside class="trend" aria-label="Trend wagi">
                    <section class="trend__panel">
                        <h2 class="trend__title">Trend wagi</h2>
                        <div class="line-chart-wrapper">
                            <canvas
                                id="weight-chart"
                                aria-label="Wykres wagi w kolejnych pomiarach"
                                role="img"
                            ></canvas>
                        </div>
                        <!-- Pod wykresem, na całą szerokość: tu jest miejsce na pełną nazwę,
                             a mały "+ Pomiar" w nagłówku obok tego byłby drugim przyciskiem do tego samego. -->
                        <button type="button" class="btn-icon-text trend__add-weight" id="btn-add-weight">
                            <i data-lucide="plus" aria-hidden="true"></i>
                            Dodaj pomiar
                        </button>
                    </section>

                    <!-- Osobna kartka (wariant C): papier jak karta zawodnika przy ważeniu,
                         w kolumnie "teczki", bo dotyczy całego okresu, a nie jednego dnia. -->
                    <section class="paper weigh-card" aria-labelledby="weigh-card-title">
                        <div class="weigh-card__holes" aria-hidden="true">
                            <span class="hole"></span>
                            <span class="hole"></span>
                        </div>
                        <h2 class="weigh-card__title" id="weigh-card-title">Karta ważenia</h2>
                        <div id="weigh-card-body"></div>
                    </section>
                </aside>
            </div>

            <div class="page-actions">
                <button class="btn btn-delete" id="btn-delete">Skasuj dane aplikacji</button>
            </div>
        </div>

        <div class="modal-overlay is-hidden" id="modal-overlay">
            <div class="modal__content" role="dialog" aria-modal="true" aria-labelledby="weight-modal-title">
                <h3 class="modal__title" id="weight-modal-title">Podaj aktualną wagę</h3>
                <input
                    type="number"
                    class="modal__input"
                    id="input-weight"
                    step="0.1"
                    placeholder="kg"
                    aria-label="Waga w kilogramach"
                    aria-describedby="modal-weight-error"
                />
                <p class="form__error is-hidden" id="modal-weight-error" role="alert"></p>
                <div class="modal__actions">
                    <button class="btn btn--primary" id="btn-save-weight">Zapisz</button>
                    <button class="btn btn--secondary" id="btn-exit">Wyjdź</button>
                </div>
            </div>
        </div>

        <!-- Pola wypełnia openPlanModal() wartościami z profilu przy każdym otwarciu. -->
        <div class="modal-overlay is-hidden" id="plan-modal-overlay">
            <div class="modal__content" role="dialog" aria-modal="true" aria-labelledby="plan-modal-title">
                <h3 class="modal__title" id="plan-modal-title">Dane planu</h3>
                <form class="plan-form" id="plan-form" novalidate>
                    <div class="form__group">
                        <label for="plan-goal" class="form__label">Twój cel</label>
                        <select class="form__input" name="goal" id="plan-goal">
                            ${generateOptionsHTML(GOAL_OPTIONS)}
                        </select>
                    </div>
                    <div class="form__group">
                        <label for="plan-activity" class="form__label">Aktywność</label>
                        <select
                            class="form__input"
                            name="activity"
                            id="plan-activity"
                            aria-describedby="plan-activity-note"
                        >
                            ${generateOptionsHTML(ACTIVITY_OPTIONS)}
                        </select>
                        <p class="form__note" id="plan-activity-note"></p>
                    </div>
                    <div class="form__group">
                        <label for="plan-age" class="form__label">Wiek</label>
                        <input
                            type="number"
                            class="form__input"
                            name="age"
                            id="plan-age"
                            min="${AGE_LIMITS.min}"
                            max="${AGE_LIMITS.max}"
                            step="1"
                            aria-describedby="plan-form-error"
                        />
                    </div>
                    <p class="form__error is-hidden" id="plan-form-error" role="alert"></p>
                    <div class="modal__actions">
                        <button type="submit" class="btn btn--primary" id="btn-save-plan">Zapisz</button>
                        <button type="button" class="btn btn--secondary" id="btn-cancel-plan">Anuluj</button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

// Jedyne wyjście awaryjne z zepsutych danych, więc musi działać ZAWSZE — także
// wtedy, gdy rysowanie bilansu rzuci wyjątek. Dlatego initDashboard() rejestruje
// je jako pierwsze: wyjątek przerywa funkcję w miejscu, a listenery podpięte
// niżej już nigdy nie powstają.
const initDeleteData = () => {
    document.getElementById("btn-delete")?.addEventListener("click", () => {
        showConfirmModal({
            title: "Skasować dane aplikacji?",
            message: "Usuniemy Twój profil, wszystkie zapisane posiłki i Twoje własne przepisy. Tej operacji nie można cofnąć.",
            confirmLabel: "Skasuj",
            cancelLabel: "Anuluj",
            onConfirm: () => {
                clearLocalData();
                navigateTo("/");
            },
        });
    });

    // Zalogowany nie dostaje tego przycisku (PLAN.md §1a, luka nr 4): kasuje on tylko
    // kopię w przeglądarce, a dane wracają z bazy przy następnym starcie — obietnica
    // "nie można cofnąć" byłaby fałszywa. Dla niego jest "Usuń konto i dane" w /konto,
    // a wyjściem z zepsutych danych lokalnych jest "Wyloguj" (też czyści localStorage).
    // Sesję znamy dopiero asynchronicznie, więc przycisk renderuje się zawsze i znika
    // po potwierdzeniu sesji — gość i appka bez Supabase mają go bez wyjątku.
    getSession()
        .then((session) => {
            if (session) document.getElementById("btn-delete")?.closest(".page-actions")?.remove();
        })
        .catch(() => {}); // brak sieci / klienta: zostawiamy przycisk, tak jak u gościa
};

export const initDashboard = () => {
    initDeleteData();

    const userProfile = getUser();

    if (!userProfile) return;

    const balanceBody = document.getElementById("balance-body");
    const carbsAlert = document.getElementById("carbs-alert");
    const balanceNote = document.getElementById("balance-note");
    const planNote = document.getElementById("plan-note");
    const mealLog = document.getElementById("meal-log");
    const planSummary = document.getElementById("plan-summary");
    const dayHeading = document.getElementById("day-heading");
    const dayDesc = document.getElementById("day-desc");
    const dayTabsRow = document.getElementById("day-tabs-row");
    const journalDate = document.getElementById("journal-date");
    const prevDayButton = document.getElementById("btn-prev-day");
    const nextDayButton = document.getElementById("btn-next-day");
    const todayButton = document.getElementById("btn-today");
    const weighInRow = document.getElementById("weigh-in-reminder");
    const balanceTable = document.getElementById("balance-table");
    const planSettingsText = document.getElementById("plan-settings-text");
    const planSettingsButton = document.getElementById("btn-plan-settings");
    const mealLogTitle = document.getElementById("meal-log-title");

    const weighCardBody = document.getElementById("weigh-card-body");

    // Na wąskim ekranie (np. 320 px) 7 zakładek po 44 px się nie mieści i wiersz
    // przewija się w poziomie (wariant C). Bez tego dziś — skrajnie z prawej —
    // startowałoby schowane za krawędzią. Przesuwamy tylko tyle, ile trzeba,
    // i tylko wiersz: scrollIntoView() przewinąłby też całą stronę w pionie.
    const revealSelectedTab = () => {
        const tab = dayTabsRow.querySelector(".day-tabs__input:checked + .day-tabs__tab");
        if (!tab) return;
        const rowBox = dayTabsRow.getBoundingClientRect();
        const tabBox = tab.getBoundingClientRect();
        if (tabBox.right > rowBox.right) dayTabsRow.scrollLeft += tabBox.right - rowBox.right;
        else if (tabBox.left < rowBox.left) dayTabsRow.scrollLeft -= rowBox.left - tabBox.left;
    };

    // Karta ważenia zależy tylko od historii wagi, nie od wybranego dnia,
    // więc rysuje się przy wejściu i po każdym pomiarze, a nie w refreshDay().
    const renderWeighCard = () => {
        weighCardBody.innerHTML = generateWeighCardHTML(userProfile.weightHistory);
    };
    renderWeighCard();

    // Oglądany dzień: null = dziś (patrz readDayFromUrl).
    let selectedDay = readDayFromUrl(getDateKey(), getFirstDayKey(userProfile));

    // JEDNO miejsce, które rysuje stan dnia. Każda zmiana danych (waga, posiłek)
    // i każda zmiana dnia woła tylko tę funkcję — "zostało" nigdy nie jest
    // zapisywane, zawsze liczone. "Dziś" liczone przy każdym wywołaniu, nie raz
    // przy wejściu: Dashboard otwarty przez północ przesuwa się na nowy dzień.
    const refreshDay = () => {
        const today = getDateKey();
        const firstDay = getFirstDayKey(userProfile);
        const day = selectedDay ?? today;
        const isToday = day === today;
        const plan = generateDietPlan(userProfile);
        const meals = getMealsForDay(day);
        const eaten = sumMacros(meals);
        const dayWord = isToday ? "dziś" : "tego dnia";

        // Zakładki i strzałki są przerysowywane albo wyłączane — element z fokusem
        // może zniknąć spod palca klawiatury. Zapamiętujemy, gdzie był fokus.
        const focused = document.activeElement;
        const focusWasInTabs = dayTabsRow.contains(focused);

        dayHeading.textContent = isToday ? "Dziś w dzienniku" : `Wpis z ${formatDateKeyShort(day)}`;
        dayDesc.textContent = isToday ? "Twój cel Keto — wpis dnia" : "Miniony dzień — tylko do odczytu.";
        journalDate.textContent = `${getWeekdayShort(day)} ${formatDateKey(day)}`;
        dayTabsRow.innerHTML = generateDayTabsHTML(getStripDays(day, today), { selected: day, today, firstDay, plan });
        prevDayButton.disabled = day <= firstDay;
        nextDayButton.disabled = isToday;
        todayButton.classList.toggle("is-hidden", isToday);

        // Przypomnienie o ważeniu dotyczy dzisiejszego planu — w przeszłości nie ma sensu.
        const daysSinceWeighIn = getDaysSinceLastWeighIn(userProfile);
        const showWeighIn = isToday && daysSinceWeighIn >= WEIGH_IN_INTERVAL_DAYS;
        if (showWeighIn) {
            // Liczba dni + skutek: sam "minęło 7 dni!" nie mówi, po co ważyć się znowu.
            // Zawsze >= 7, więc forma "dni" jest poprawna bez odmiany.
            document.getElementById("weigh-in-text").textContent =
                `Ostatni pomiar wagi: ${daysSinceWeighIn} dni temu — cel na dziś liczony jest z tej wagi.`;
        }
        weighInRow.classList.toggle("is-hidden", !showWeighIn);

        planSummary.innerHTML = getPlanSummaryHTML(userProfile);
        balanceTable.setAttribute("aria-label", `Plan, spożycie i pozostały limit — ${formatDateKeyLong(day)}`);
        balanceBody.innerHTML = generateBalanceRowsHTML(plan, eaten);
        carbsAlert.classList.toggle("is-hidden", eaten.netCarbs <= plan.netCarbs);
        const planNoteHTML = getPlanNoteHTML(plan);
        planNote.innerHTML = planNoteHTML ?? "";
        planNote.classList.toggle("is-hidden", !planNoteHTML);
        // Błonnik informacyjnie, bez celu — mówi, skąd się bierze "netto".
        // Dwie nierozdzielne części: linia łamie się tylko między nimi, nie w środku zdania.
        balanceNote.innerHTML = html`<span class="nowrap">Błonnik ${dayWord}: ${eaten.fiber} g</span>
            <span class="nowrap">— odjęty od węgli netto.</span>`;

        // Wariant A (2026-10-09): plan minionego dnia liczony z obecnych ustawień —
        // mówimy to wprost, bo po zmianie celu przeszłość wyglądałaby inaczej niż wtedy.
        planSettingsText.textContent = isToday
            ? "Plan liczymy z Twojego celu, aktywności i wieku. Coś się zmieniło?"
            : "Kolumna „Plan” liczona z obecnych ustawień — zmiany planu nie działają wstecz.";
        planSettingsButton.classList.toggle("is-hidden", !isToday);

        mealLogTitle.textContent = isToday ? "Posiłki dziś" : "Posiłki tego dnia";
        mealLog.innerHTML = generateMealLogHTML(meals, { readOnly: !isToday });

        window.lucide?.createIcons();
        revealSelectedTab();

        // Fokus wraca na zaznaczoną zakładkę, gdy był w zakładkach (przerysowane)
        // albo na przycisku, który właśnie zniknął lub się wyłączył (np. "›" na dziś).
        if (focusWasInTabs || focused?.disabled || focused?.closest(".is-hidden")) {
            dayTabsRow.querySelector("input:checked")?.focus();
        }
    };

    // Jedyna droga zmiany dnia: adres + przerysowanie kartki (bez wykresu wagi,
    // który od dnia nie zależy). Przyszłość i dni sprzed startu są niedostępne.
    const selectDay = (dateKey) => {
        const today = getDateKey();
        if (!isValidDateKey(dateKey) || dateKey < getFirstDayKey(userProfile)) return;

        selectedDay = dateKey >= today ? null : dateKey;
        replaceQuery(selectedDay ? { [DAY_PARAM]: selectedDay } : {});
        refreshDay();
    };

    refreshDay();

    // Delegacja: zakładki są przerysowywane, wiersz zostaje ten sam.
    // "change" zamiast "click" — działa też dla strzałek klawiatury w grupie radio.
    dayTabsRow.addEventListener("change", (event) => selectDay(event.target.value));
    prevDayButton.addEventListener("click", () => selectDay(shiftDateKey(selectedDay ?? getDateKey(), -1)));
    nextDayButton.addEventListener("click", () => selectDay(shiftDateKey(selectedDay ?? getDateKey(), 1)));
    todayButton.addEventListener("click", () => selectDay(getDateKey()));

    // Delegacja zdarzeń: lista jest przerysowywana, kontener zostaje ten sam.
    mealLog.addEventListener("click", async (event) => {
        const removeButton = event.target.closest(".meal-log__remove");
        if (!removeButton || removeButton.disabled) return;

        removeButton.disabled = true; // zalogowany czeka na bazę — bez podwójnego kliknięcia
        const { error } = await removeMeal(removeButton.dataset.mealId);
        if (error) {
            removeButton.disabled = false;
            showToast({ stamp: "Uwaga", title: "Nie udało się usunąć posiłku", note: error });
            return;
        }
        refreshDay();
    });


    weightChartInstance = new Chart(document.getElementById("weight-chart"), {
        type: "line",
        data: {
            labels: userProfile.weightHistory.map((entry) => entry.date),
            datasets: [
                {
                    label: "Waga (kg)",
                    data: userProfile.weightHistory.map((entry) => entry.weight),
                    borderColor: CHART_COLORS.amber,
                    borderWidth: 2,
                    pointBackgroundColor: CHART_COLORS.amber,
                    pointBorderWidth: 0,
                    pointRadius: 4,
                    tension: 0, // prosta kreska między pomiarami — jak ołówkiem w dzienniku
                    fill: false,
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }, // tytuł panelu już mówi, co to za linia
                tooltip: {
                    // Oś pokazuje datę bez roku — podpowiedź przy punkcie podaje pełną.
                    callbacks: { title: ([point]) => formatDateKey(point.label) },
                },
            },
            scales: {
                y: { grid: { color: CHART_COLORS.gridLine }, ticks: { color: CHART_COLORS.boneDim, font: CHART_FONT } },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: CHART_COLORS.boneDim,
                        font: CHART_FONT,
                        // labels zostają kluczami "RRRR-MM-DD" (dane), formatujemy tylko napis na osi.
                        // Bez obrotu: gdy etykiet jest za dużo, Chart.js pomija co którąś (autoSkip).
                        callback(value) {
                            return formatDateKeyShort(this.getLabelForValue(value));
                        },
                        maxRotation: 0,
                    },
                },
            },
        },
    });

    // Komunikat przy polu zamiast alert(): systemowe okienko blokuje stronę,
    // znika po kliknięciu i nie mówi, CO poprawić. Tekst zostaje obok pola,
    // aż użytkownik zacznie je poprawiać.
    const showWeightError = (input, errorBox, message) => {
        errorBox.textContent = message;
        errorBox.classList.remove("is-hidden");
        input.setAttribute("aria-invalid", "true");
        input.focus();
    };

    const clearWeightError = (input, errorBox) => {
        errorBox.classList.add("is-hidden");
        errorBox.textContent = "";
        input.removeAttribute("aria-invalid");
    };

    // null = waga poprawna. Pole type="number" z tekstem w środku daje "" —
    // dlatego pusty i niepoprawny wpis mają ten sam komunikat.
    const getWeightError = (rawValue) => {
        const weight = Number(rawValue);
        if (rawValue === "" || !(weight >= WEIGHT_LIMITS.min && weight <= WEIGHT_LIMITS.max)) {
            return `Podaj wagę od ${WEIGHT_LIMITS.min} do ${WEIGHT_LIMITS.max} kg.`;
        }
        return null;
    };

    // Jeden zapis wagi dla banera i modala (wcześniej ta logika była skopiowana dwa razy).
    // Wcześniej sprawdzało tylko pusty wpis — 0 albo 500 kg trafiało do profilu i kalkulatora.
    const recordWeight = async (input, errorBox) => {
        const error = getWeightError(input.value);
        if (error) {
            showWeightError(input, errorBox, error);
            return false;
        }
        clearWeightError(input, errorBox);

        const newWeight = Number(input.value);

        // Serwis zwraca NOWY profil i niczego nie zmienia przy błędzie (brak sieci,
        // pełna pamięć), więc wykres i bilans nie pokażą pomiaru, którego nie zapisano.
        const result = await addWeightEntry(userProfile, newWeight);
        if (result.error) {
            errorBox.textContent = result.error;
            errorBox.classList.remove("is-hidden");
            return false;
        }
        // Ten sam obiekt, nowa treść — refreshDay() i reszta initDashboard trzymają referencję.
        Object.assign(userProfile, result.user);

        const today = userProfile.weightHistory[userProfile.weightHistory.length - 1].date;
        weightChartInstance.data.labels.push(today);
        weightChartInstance.data.datasets[0].data.push(newWeight);
        weightChartInstance.update();
        renderWeighCard();

        // Nowa waga = nowy cel = nowy bilans. Przypomnienie znika też tutaj: pomiar
        // z dowolnego miejsca (przypomnienie albo przycisk pod wykresem) je spełnia.
        refreshDay();
        return true;
    };

    const modalOverlay = document.getElementById("modal-overlay");
    const modalDialog = modalOverlay.querySelector('[role="dialog"]');
    const modalInput = document.getElementById("input-weight");
    const modalError = document.getElementById("modal-weight-error");
    modalInput.addEventListener("input", () => clearWeightError(modalInput, modalError));

    const openWeightModal = () => {
        modalOverlay.classList.remove("is-hidden");

        // trapFocus zapamiętuje aktywny element (przycisk, który otworzył modal), więc wołamy go przed focus().
        const releaseFocus = trapFocus(modalDialog, { onEscape: () => closeWeightModal() });

        closeWeightModal = () => {
            modalOverlay.classList.add("is-hidden");
            modalInput.value = "";
            clearWeightError(modalInput, modalError); // ponowne otwarcie bez starego błędu
            closeWeightModal = null;
            releaseFocus();
        };

        modalInput.focus();
    };

    // Dwa wejścia, jeden modal i jedna walidacja: "Dodaj pomiar" pod wykresem
    // i "Dodaj pomiar" w przypomnieniu w dzienniku.
    // Czy modal otworzyło przypomnienie — ono znika po zapisie, więc fokus
    // nie może do niego wrócić (patrz obsługa "Zapisz").
    let openedFromWeighIn = false;

    document.getElementById("btn-add-weight").addEventListener("click", () => {
        openedFromWeighIn = false;
        openWeightModal();
    });
    document.getElementById("btn-weigh-in").addEventListener("click", () => {
        openedFromWeighIn = true;
        openWeightModal();
    });
    document.getElementById("btn-exit").addEventListener("click", () => closeWeightModal?.());

    // Klik w tło (poza kartą) zamyka modal
    modalOverlay.addEventListener("click", (event) => {
        if (event.target === modalOverlay) closeWeightModal?.();
    });

    const saveWeightButton = document.getElementById("btn-save-weight");
    saveWeightButton.addEventListener("click", async () => {
        // Zalogowany czeka na bazę — blokada chroni przed podwójnym pomiarem.
        const idleLabel = saveWeightButton.textContent;
        saveWeightButton.disabled = true;
        saveWeightButton.textContent = "Zapisuję…";
        const saved = await recordWeight(modalInput, modalError);
        saveWeightButton.disabled = false;
        saveWeightButton.textContent = idleLabel;
        if (!saved) return;

        const savedWeight = userProfile.weight;
        closeWeightModal?.();

        // Modal oddaje fokus przyciskowi, który go otworzył. "Dodaj pomiar" właśnie
        // zniknął razem z przypomnieniem — focus() na ukrytym elemencie nic nie robi
        // i fokus spadłby na <body>. Nie da się tego sprawdzić przez activeElement:
        // przeglądarka przenosi fokus z ukrytego elementu dopiero przy następnej
        // klatce. Dlatego decydujemy po tym, KTO otworzył modal.
        if (openedFromWeighIn) {
            document.getElementById("journal-title").focus();
        }

        // Potwierdzenie: modal znika, a zmiana na wykresie bywa niewidoczna bez przewijania.
        showToast({
            stamp: "Zapisano",
            title: "Pomiar wagi",
            meta: `${savedWeight.toLocaleString("pl-PL")} kg`,
        });
    });

    // ---------- "Zmień dane planu": cel, aktywność, wiek ----------

    const planOverlay = document.getElementById("plan-modal-overlay");
    const planDialog = planOverlay.querySelector('[role="dialog"]');
    const planForm = document.getElementById("plan-form");
    const planGoal = document.getElementById("plan-goal");
    const planActivity = document.getElementById("plan-activity");
    const planActivityNote = document.getElementById("plan-activity-note");
    const planAge = document.getElementById("plan-age");
    const planError = document.getElementById("plan-form-error");
    const savePlanButton = document.getElementById("btn-save-plan");

    bindActivityNote(planActivity, planActivityNote);

    const clearPlanError = () => {
        planError.classList.add("is-hidden");
        planError.textContent = "";
        planAge.removeAttribute("aria-invalid");
    };
    planAge.addEventListener("input", clearPlanError);

    // null = dane poprawne. Cel i aktywność pochodzą z <select>, ale sprawdzamy je
    // tak samo jak getUser(): niepoprawna wartość w profilu wywraca kalkulator.
    const getPlanError = ({ age, activity, goal }) => {
        if (!(Number.isInteger(age) && age >= AGE_LIMITS.min && age <= AGE_LIMITS.max)) {
            return `Podaj wiek od ${AGE_LIMITS.min} do ${AGE_LIMITS.max} lat (pełne lata).`;
        }
        if (!isKnownActivity(activity) || !isKnownGoal(goal)) {
            return "Wybierz cel i poziom aktywności z listy.";
        }
        return null;
    };

    const openPlanModal = () => {
        // Zawsze aktualne wartości z profilu: wcześniejsze otwarcie mogło zostać
        // anulowane w połowie edycji, a profil mógł się zmienić w innej karcie.
        planGoal.value = userProfile.goal;
        planActivity.value = userProfile.activity;
        planActivityNote.textContent = getActivityNote(userProfile.activity);
        planAge.value = userProfile.age;
        clearPlanError();

        planOverlay.classList.remove("is-hidden");
        const releaseFocus = trapFocus(planDialog, { onEscape: () => closePlanModal() });

        closePlanModal = () => {
            planOverlay.classList.add("is-hidden");
            closePlanModal = null;
            releaseFocus();
        };

        planGoal.focus();
    };

    document.getElementById("btn-plan-settings").addEventListener("click", openPlanModal);
    document.getElementById("btn-cancel-plan").addEventListener("click", () => closePlanModal?.());
    planOverlay.addEventListener("click", (event) => {
        if (event.target === planOverlay) closePlanModal?.();
    });

    // submit zamiast click na "Zapisz": Enter w polu wieku też zapisuje.
    planForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (savePlanButton.disabled) return;

        // Pole puste albo z tekstem daje "" → Number("") = 0 → komunikat o zakresie.
        const changes = {
            age: Number(planAge.value),
            activity: planActivity.value,
            goal: planGoal.value,
        };
        const error = getPlanError(changes);
        if (error) {
            planError.textContent = error;
            planError.classList.remove("is-hidden");
            planAge.setAttribute("aria-invalid", "true");
            planAge.focus();
            return;
        }

        // Zalogowany czeka na bazę — blokada chroni przed podwójnym zapisem.
        const idleLabel = savePlanButton.textContent;
        savePlanButton.disabled = true;
        savePlanButton.textContent = "Zapisuję…";
        const result = await updatePlanSettings(userProfile, changes);
        savePlanButton.disabled = false;
        savePlanButton.textContent = idleLabel;

        if (result.error) {
            planError.textContent = result.error;
            planError.classList.remove("is-hidden");
            return;
        }

        // Ten sam obiekt, nowa treść — jak przy pomiarze wagi.
        Object.assign(userProfile, result.user);
        refreshDay(); // nowy cel = nowa kolumna "Cel" i nowe "Zostało"
        closePlanModal?.();

        // Nowa liczba kalorii w potwierdzeniu: bez tego zmiana w tabeli bywa niezauważona.
        showToast({
            stamp: "Zapisano",
            title: "Dane planu",
            meta: `Cel: ${generateDietPlan(userProfile).calories} kcal`,
        });
    });
};

export const cleanupDashboard = () => {
    closeWeightModal?.(); // zdejmuje listener klawiatury, jeśli modal był otwarty
    closePlanModal?.();
    weightChartInstance?.destroy();
};
