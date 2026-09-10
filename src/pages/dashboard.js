import { html } from "../utils/template.js";
import { getUser, clearUser, saveUser } from "../services/userService.js";
import { generateDietPlan } from "../services/calculatorService.js";
import { navigateTo } from "../router.js";

let macroChartInstance = null;
let weightChartInstance = null;

// Odpowiednik tokenów z global.css — Chart.js potrzebuje literalnych wartości,
// nie może czytać CSS custom properties.
const CHART_COLORS = {
    red: "#C23B2E",
    amber: "#D98C2B",
    blue: "#3E6E86",
    bone: "#EFE9D8",
    boneDim: "#A79E88",
    gridLine: "rgba(239, 233, 216, 0.08)",
};

const checkWeightReminder = (user) => {
    const lastRecord = user.weightHistory[user.weightHistory.length - 1];
    const lastDate = new Date(lastRecord.date);
    const today = new Date();
    const diffTime = today - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 7;
};

export const renderDashboard = () => {
    return html`
        <div class="page-container">
            <header class="page-header">
                <h1 class="page-header__title">Dashboard</h1>
                <p class="page-header__desc">Twój dzienny cel Keto</p>
            </header>

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

            <div class="bento-grid">
                <div class="bento-card bento-card--accent">
                    <span class="bento-card__title">Dzienny limit kalorii</span>
                    <span class="bento-card__value">
                        <span id="calories-value">0</span>
                    </span>
                </div>

                <div class="bento-card bento-card--proteins">
                    <i data-lucide="beef" class="bento-card__icon"></i>
                    <span class="bento-card__title">Białko</span>
                    <span class="bento-card__value"><span id="proteins-value">0</span></span>
                </div>

                <div class="bento-card bento-card--fats">
                    <i data-lucide="droplet" class="bento-card__icon"></i>
                    <span class="bento-card__title">Tłuszcz</span>
                    <span class="bento-card__value"><span id="fats-value">0</span></span>
                </div>

                <div class="bento-card bento-card--carbs">
                    <i data-lucide="wheat" class="bento-card__icon"></i>
                    <span class="bento-card__title">Węglowodany</span>
                    <span class="bento-card__value"><span id="carbs-value">0</span></span>
                </div>

                <div class="bento-card bento-card--chart">
                    <span class="bento-card__title">Rozkład Makroskładników</span>
                    <div class="chart-wrapper">
                        <canvas id="macro-chart"></canvas>
                    </div>
                </div>

                <div class="bento-card bento-card--chart">
                    <div class="bento-card__header">
                        <span class="bento-card__title">Historia Wagi</span>
                        <button class="btn-icon-text" id="btn-add-weight">
                            <i data-lucide="plus"></i>
                            <span>Pomiar</span>
                        </button>
                    </div>
                    <div class="line-chart-wrapper">
                        <canvas id="weight-chart"></canvas>
                    </div>
                </div>
            </div>

            <div class="page-actions">
                <button class="btn btn-delete" id="btn-delete">Skasuj dane aplikacji</button>
            </div>
        </div>

        <div class="modal-overlay is-hidden" id="modal-overlay">
            <div class="modal__content">
                <h3 class="modal__title">Podaj aktualną wage</h3>
                <input type="number" class="modal__input" id="input-weight" />
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

    const reminderBanner = document.getElementById("weight-reminder");
    const bannerInput = document.getElementById("banner-input-weight");
    const btnBannerSave = document.getElementById("btn-banner-save");

    if (checkWeightReminder(userProfile)) {
        reminderBanner.classList.remove("is-hidden");
    }

    const dietPlan = generateDietPlan(userProfile);

    const caloriesLimit = document.getElementById("calories-value");
    const proteins = document.getElementById("proteins-value");
    const fats = document.getElementById("fats-value");
    const carbs = document.getElementById("carbs-value");
    const btnDelete = document.getElementById("btn-delete");
    const macroChartCanvas = document.getElementById("macro-chart");

    // Przypisujemy wykres do zmiennej, aby móc go później aktualizować
    macroChartInstance = new Chart(macroChartCanvas, {
        type: "doughnut",
        data: {
            labels: ["Białko", "Tłuszcze", "Węglowodany"],
            datasets: [
                {
                    data: [dietPlan.proteins, dietPlan.fats, dietPlan.carbs],
                    backgroundColor: [CHART_COLORS.red, CHART_COLORS.amber, CHART_COLORS.blue],
                    borderWidth: 0,
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            cutout: "60%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: CHART_COLORS.bone,
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 14, family: '"Public Sans", sans-serif' },
                    },
                },
            },
        },
    });

    const weightChartsCanvas = document.getElementById("weight-chart");
    const dates = userProfile.weightHistory.map((entry) => entry.date);
    const weights = userProfile.weightHistory.map((entry) => entry.weight);

    weightChartInstance = new Chart(weightChartsCanvas, {
        type: "line",
        data: {
            labels: dates,
            datasets: [
                {
                    label: "Moja waga (kg)",
                    data: weights,
                    borderColor: CHART_COLORS.amber,
                    backgroundColor: "rgba(217, 140, 43, 0.12)",
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true,
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: CHART_COLORS.bone, font: { family: '"Public Sans", sans-serif' } } },
            },
            scales: {
                y: { grid: { color: CHART_COLORS.gridLine }, ticks: { color: CHART_COLORS.boneDim } },
                x: { grid: { color: CHART_COLORS.gridLine }, ticks: { color: CHART_COLORS.boneDim } },
            },
        },
    });

    // Ustawienie początkowych wartości
    caloriesLimit.textContent = dietPlan.calories;
    proteins.textContent = dietPlan.proteins;
    fats.textContent = dietPlan.fats;
    carbs.textContent = dietPlan.carbs;

    // MAGIA REAKTYWNOŚCI: Funkcja aktualizująca UI w locie
    const updateMacrosUI = () => {
        const newDietPlan = generateDietPlan(userProfile); // Przelicza makro na podstawie NOWEJ wagi

        // 1. Aktualizacja tekstów
        caloriesLimit.textContent = newDietPlan.calories;
        proteins.textContent = newDietPlan.proteins;
        fats.textContent = newDietPlan.fats;
        carbs.textContent = newDietPlan.carbs;

        // 2. Aktualizacja wykresu kołowego
        macroChartInstance.data.datasets[0].data = [newDietPlan.proteins, newDietPlan.fats, newDietPlan.carbs];
        macroChartInstance.update();
    };

    btnBannerSave.addEventListener("click", () => {
        if (!bannerInput.value) {
            alert("Najpierw wpisz wagę!");
            return;
        }

        const newWeight = parseFloat(bannerInput.value);
        const today = new Date().toISOString().split("T")[0];
        const newWeightData = { date: today, weight: newWeight };

        userProfile.weightHistory.push(newWeightData);
        userProfile.weight = newWeight;
        saveUser(userProfile);

        weightChartInstance.data.labels.push(today);
        weightChartInstance.data.datasets[0].data.push(newWeight);
        weightChartInstance.update();

        // Odświeżamy kafelki!
        updateMacrosUI();

        bannerInput.value = "";
        document.getElementById("weight-reminder").classList.add("is-hidden");
    });

    btnDelete.addEventListener("click", () => {
        clearUser();
        navigateTo("/onboarding");
    });

    // MODAL SAVE WEIGHT FUNCTION
    const modalOverlay = document.getElementById("modal-overlay");
    const btnAddWeight = document.getElementById("btn-add-weight");
    const btnExit = document.getElementById("btn-exit");
    const btnSaveWeight = document.getElementById("btn-save-weight");

    btnAddWeight.addEventListener("click", () => {
        modalOverlay.classList.remove("is-hidden");
    });

    btnExit.addEventListener("click", () => {
        modalOverlay.classList.add("is-hidden");
    });

    btnSaveWeight.addEventListener("click", () => {
        const inputElement = document.getElementById("input-weight");
        const inputModalWeight = inputElement.value;

        if (!inputModalWeight) {
            alert("Proszę podać wagę przed zapisem!");
            return;
        }

        const today = new Date().toISOString().split("T")[0];
        const newWeight = parseFloat(inputModalWeight);
        const dateWeight = { date: today, weight: newWeight };

        userProfile.weightHistory.push(dateWeight);
        userProfile.weight = newWeight;
        saveUser(userProfile);

        weightChartInstance.data.labels.push(today);
        weightChartInstance.data.datasets[0].data.push(newWeight);
        weightChartInstance.update();

        // Odświeżamy kafelki!
        updateMacrosUI();

        inputElement.value = "";
        modalOverlay.classList.add("is-hidden");
    });
};

export const cleanupDashboard = () => {
    macroChartInstance?.destroy();
    weightChartInstance?.destroy();
};
