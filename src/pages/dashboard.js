import { html } from "../utils/template.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { getUser, addWeightEntry, WEIGHT_LIMITS } from "../services/userService.js";
import { generateDietPlan, FLOOR_LIMIT, TARGET_DEFICIT_PERCENT } from "../services/calculatorService.js";
import { getTodayMeal, removeMeal, sumMacros } from "../services/mealService.js";
import { getNetCarbs } from "../services/productService.js";
import { clearLocalData } from "../services/localDataService.js";
import { getDaysSince } from "../utils/date.js";
import { navigateTo } from "../router.js";
import { trapFocus } from "../utils/focusTrap.js";
import { showConfirmModal } from "../components/confirmModal.js";
import { showToast } from "../components/toast.js";

let weightChartInstance = null;
let closeWeightModal = null; // pozwala cleanupowi zamknąć modal przy zmianie trasy

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

const formatDate = (date) => date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });

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

const generateMealLogHTML = (meals) => {
    if (meals.length === 0) {
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
                            <button
                                type="button"
                                class="meal-log__remove"
                                data-meal-id="${meal.id}"
                                aria-label="Usuń: ${escapeHtml(meal.title)}"
                            >
                                <i data-lucide="x" aria-hidden="true"></i>
                                <span>Usuń</span>
                            </button>
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
            <header class="page-header">
                <h1 class="page-header__title">Dziś w dzienniku</h1>
                <p class="page-header__desc">Twój cel Keto — wpis dnia</p>
            </header>

            <div class="dashboard">
                <section class="paper journal" aria-labelledby="journal-title">
                    <div class="journal__holes" aria-hidden="true">
                        <span class="hole"></span>
                        <span class="hole"></span>
                    </div>

                    <div class="journal__header">
                        <h2 class="journal__title" id="journal-title" tabindex="-1">Bilans dnia</h2>
                        <span class="tag journal__date">${formatDate(new Date())}</span>
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

                    <table class="balance" aria-label="Cel, spożycie i pozostały limit na dziś">
                        <thead>
                            <tr>
                                <th scope="col">Makro</th>
                                <th scope="col">Cel</th>
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

                    <h3 class="journal__section-title">Posiłki dziś</h3>
                    <div id="meal-log"></div>
                </section>

                <aside class="trend" aria-label="Trend wagi">
                    <section class="trend__panel">
                        <div class="trend__header">
                            <h2 class="trend__title">Trend wagi</h2>
                            <button class="btn-icon-text" id="btn-add-weight">
                                <i data-lucide="plus"></i>
                                <span>Pomiar</span>
                            </button>
                        </div>
                        <div class="line-chart-wrapper">
                            <canvas
                                id="weight-chart"
                                aria-label="Wykres wagi w kolejnych pomiarach"
                                role="img"
                            ></canvas>
                        </div>
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

    // JEDNO miejsce, które rysuje stan dnia. Każda zmiana danych (waga, posiłek)
    // woła tylko tę funkcję — "zostało" nigdy nie jest zapisywane, zawsze liczone.
    const refreshDay = () => {
        const plan = generateDietPlan(userProfile);
        const meals = getTodayMeal();
        const eaten = sumMacros(meals);

        balanceBody.innerHTML = generateBalanceRowsHTML(plan, eaten);
        carbsAlert.classList.toggle("is-hidden", eaten.netCarbs <= plan.netCarbs);
        const planNoteHTML = getPlanNoteHTML(plan);
        planNote.innerHTML = planNoteHTML ?? "";
        planNote.classList.toggle("is-hidden", !planNoteHTML);
        // Błonnik informacyjnie, bez celu — mówi, skąd się bierze "netto".
        // Dwie nierozdzielne części: linia łamie się tylko między nimi, nie w środku zdania.
        balanceNote.innerHTML = html`<span class="nowrap">Błonnik dziś: ${eaten.fiber} g</span>
            <span class="nowrap">— odjęty od węgli netto.</span>`;
        mealLog.innerHTML = generateMealLogHTML(meals);

        window.lucide?.createIcons();
    };

    refreshDay();

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

    const weighInRow = document.getElementById("weigh-in-reminder");
    const daysSinceWeighIn = getDaysSinceLastWeighIn(userProfile);
    if (daysSinceWeighIn >= WEIGH_IN_INTERVAL_DAYS) {
        // Liczba dni + skutek: sam "minęło 7 dni!" nie mówi, po co ważyć się znowu.
        // Zawsze >= 7, więc forma "dni" jest poprawna bez odmiany.
        document.getElementById("weigh-in-text").textContent =
            `Ostatni pomiar wagi: ${daysSinceWeighIn} dni temu — cel na dziś liczony jest z tej wagi.`;
        weighInRow.classList.remove("is-hidden");
    }

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
            },
            scales: {
                y: { grid: { color: CHART_COLORS.gridLine }, ticks: { color: CHART_COLORS.boneDim, font: CHART_FONT } },
                x: { grid: { display: false }, ticks: { color: CHART_COLORS.boneDim, font: CHART_FONT } },
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

        refreshDay(); // nowa waga = nowy cel = nowy bilans
        // Pomiar z dowolnego miejsca ("Dodaj pomiar" w dzienniku albo "+ Pomiar") spełnia przypomnienie.
        weighInRow.classList.add("is-hidden");
        return true;
    };

    const modalOverlay = document.getElementById("modal-overlay");
    const modalDialog = modalOverlay.querySelector('[role="dialog"]');
    const modalInput = document.getElementById("input-weight");
    const modalError = document.getElementById("modal-weight-error");
    modalInput.addEventListener("input", () => clearWeightError(modalInput, modalError));

    const openWeightModal = () => {
        modalOverlay.classList.remove("is-hidden");

        // trapFocus zapamiętuje aktywny element ("+ Pomiar" albo "Dodaj pomiar"), więc wołamy go przed focus().
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

    // Dwa wejścia, jeden modal i jedna walidacja: "+ Pomiar" przy wykresie
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

};

export const cleanupDashboard = () => {
    closeWeightModal?.(); // zdejmuje listener klawiatury, jeśli modal był otwarty
    weightChartInstance?.destroy();
};
