import { html } from "../utils/template.js";
import { getUser, clearUser, saveUser } from "../services/userService.js";
import { generateDietPlan } from "../services/calculatorService.js";
import { getTodayMeal, removeMeal, sumMacros, clearMeals } from "../services/mealService.js";
import { getDateKey } from "../utils/date.js";
import { navigateTo } from "../router.js";
import { trapFocus } from "../utils/focusTrap.js";

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

// Plan z kalkulatora i wpis posiłku używają tych samych nazw pól,
// więc jeden `key` czyta cel, spożycie i nazwę modyfikatora CSS.
const BALANCE_ROWS = [
    { key: "calories", label: "Kalorie", unit: "kcal" },
    { key: "protein", label: "Białko", unit: "g" },
    { key: "fats", label: "Tłuszcz", unit: "g" },
    { key: "carbs", label: "Węgle", unit: "g" },
];

const checkWeightReminder = (user) => {
    const lastRecord = user.weightHistory[user.weightHistory.length - 1];
    const lastDate = new Date(lastRecord.date);
    const today = new Date();
    const diffTime = today - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 7;
};

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

const generateBalanceRowsHTML = (plan, eaten) => {
    return BALANCE_ROWS.map(({ key, label, unit }) => {
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
                    <div class="meter meter--${key}">
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
                            <span class="meal-log__title">${meal.title}</span>
                            <span class="meal-log__kcal">${meal.calories} kcal</span>
                            <span class="meal-log__macros">B ${meal.protein} · T ${meal.fats} · W ${meal.carbs}</span>
                            <button
                                type="button"
                                class="meal-log__remove"
                                data-meal-id="${meal.id}"
                                aria-label="Usuń: ${meal.title}"
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
                        <h2 class="journal__title" id="journal-title">Bilans dnia</h2>
                        <span class="tag journal__date">${formatDate(new Date())}</span>
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

                    <p class="stamp balance__alert is-hidden" id="carbs-alert" role="status">
                        Limit węgli przekroczony
                    </p>

                    <h3 class="journal__section-title">Posiłki dziś</h3>
                    <div id="meal-log"></div>
                </section>

                <aside class="trend" aria-label="Trend wagi">
                    <div class="reminder-banner is-hidden" id="weight-reminder">
                        <div class="reminder-banner__text">
                            <i data-lucide="bell" class="reminder-icon"></i>
                            <span>Minęło 7 dni! Podaj dzisiejszą wagę:</span>
                        </div>
                        <div class="reminder-banner__actions">
                            <input type="number" class="banner-input" id="banner-input-weight" placeholder="kg" step="0.1" />
                            <button class="btn btn--primary btn--small" id="btn-banner-save">Zapisz</button>
                        </div>
                    </div>

                    <section class="trend__panel">
                        <div class="trend__header">
                            <h2 class="trend__title">Trend wagi</h2>
                            <button class="btn-icon-text" id="btn-add-weight">
                                <i data-lucide="plus"></i>
                                <span>Pomiar</span>
                            </button>
                        </div>
                        <div class="line-chart-wrapper">
                            <canvas id="weight-chart" aria-label="Wykres wagi w kolejnych pomiarach" role="img"></canvas>
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
                />
                <div class="modal__actions">
                    <button class="btn btn--primary" id="btn-save-weight">Zapisz</button>
                    <button class="btn btn--secondary" id="btn-exit">Wyjdź</button>
                </div>
            </div>
        </div>
    `;
};

export const initDashboard = () => {
    const userProfile = getUser();

    if (!userProfile) return;

    const balanceBody = document.getElementById("balance-body");
    const carbsAlert = document.getElementById("carbs-alert");
    const mealLog = document.getElementById("meal-log");

    // JEDNO miejsce, które rysuje stan dnia. Każda zmiana danych (waga, posiłek)
    // woła tylko tę funkcję — "zostało" nigdy nie jest zapisywane, zawsze liczone.
    const refreshDay = () => {
        const plan = generateDietPlan(userProfile);
        const meals = getTodayMeal();
        const eaten = sumMacros(meals);

        balanceBody.innerHTML = generateBalanceRowsHTML(plan, eaten);
        carbsAlert.classList.toggle("is-hidden", eaten.carbs <= plan.carbs);
        mealLog.innerHTML = generateMealLogHTML(meals);

        window.lucide?.createIcons();
    };

    refreshDay();

    // Delegacja zdarzeń: lista jest przerysowywana, kontener zostaje ten sam.
    mealLog.addEventListener("click", (event) => {
        const removeButton = event.target.closest(".meal-log__remove");
        if (!removeButton) return;

        removeMeal(removeButton.dataset.mealId);
        refreshDay();
    });

    const reminderBanner = document.getElementById("weight-reminder");
    if (checkWeightReminder(userProfile)) {
        reminderBanner.classList.remove("is-hidden");
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

    // Jeden zapis wagi dla banera i modala (wcześniej ta logika była skopiowana dwa razy).
    const recordWeight = (rawValue) => {
        if (!rawValue) {
            alert("Najpierw wpisz wagę!");
            return false;
        }

        const newWeight = parseFloat(rawValue);
        const today = getDateKey();

        userProfile.weightHistory.push({ date: today, weight: newWeight });
        userProfile.weight = newWeight;
        saveUser(userProfile);

        weightChartInstance.data.labels.push(today);
        weightChartInstance.data.datasets[0].data.push(newWeight);
        weightChartInstance.update();

        refreshDay(); // nowa waga = nowy cel = nowy bilans
        return true;
    };

    const bannerInput = document.getElementById("banner-input-weight");
    document.getElementById("btn-banner-save").addEventListener("click", () => {
        if (!recordWeight(bannerInput.value)) return;

        bannerInput.value = "";
        reminderBanner.classList.add("is-hidden");
    });

    const modalOverlay = document.getElementById("modal-overlay");
    const modalDialog = modalOverlay.querySelector('[role="dialog"]');
    const modalInput = document.getElementById("input-weight");

    const openWeightModal = () => {
        modalOverlay.classList.remove("is-hidden");

        // trapFocus zapamiętuje aktywny element (przycisk "Pomiar"), więc wołamy go przed focus().
        const releaseFocus = trapFocus(modalDialog, { onEscape: () => closeWeightModal() });

        closeWeightModal = () => {
            modalOverlay.classList.add("is-hidden");
            modalInput.value = "";
            closeWeightModal = null;
            releaseFocus();
        };

        modalInput.focus();
    };

    document.getElementById("btn-add-weight").addEventListener("click", openWeightModal);
    document.getElementById("btn-exit").addEventListener("click", () => closeWeightModal?.());

    // Klik w tło (poza kartą) zamyka modal
    modalOverlay.addEventListener("click", (event) => {
        if (event.target === modalOverlay) closeWeightModal?.();
    });

    document.getElementById("btn-save-weight").addEventListener("click", () => {
        if (!recordWeight(modalInput.value)) return;

        closeWeightModal?.();
    });

    document.getElementById("btn-delete").addEventListener("click", () => {
        clearUser();
        clearMeals();
        navigateTo("/onboarding");
    });
};

export const cleanupDashboard = () => {
    closeWeightModal?.(); // zdejmuje listener klawiatury, jeśli modal był otwarty
    weightChartInstance?.destroy();
};
