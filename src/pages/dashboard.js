import { html } from "../utils/template.js";
import { getUser, clearUser } from "../services/userService.js";
import { generateDietPlan } from "../services/calculatorService.js";
import { navigateTo } from "../router.js";

export const renderDashboard = () => {
    return html`
        <div class="page-container">
            <header class="page-header">
                <h1 class="page-header__title">Dashboard</h1>
                <p class="page-header__desc">Twój dzienny cel Keto</p>
            </header>

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
                    <span class="bento-card__title">Fats</span>
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
                        <i data-lucide="flame" class="chart-center-icon"></i>
                    </div>
                </div>

                <div class="bento-card bento-card--chart">
                    <span class="bento-card__title">Historia Wagi</span>
                    <div class="line-chart-wrapper">
                        <canvas id="weight-chart"></canvas>
                    </div>
                </div>

            </div>
            
            <div class="page-actions">
                <button class="btn btn-delete" id="btn-delete">Skasuj dane aplikacji</button>
            </div>

        </div>
    `;
};

export const initDashboard = () => {
    const userProfile = getUser();

    if (!userProfile) return;

    const dietPlan = generateDietPlan(userProfile);

    const caloriesLimit = document.getElementById("calories-value");
    const proteins = document.getElementById("proteins-value");
    const fats = document.getElementById("fats-value");
    const carbs = document.getElementById("carbs-value");

    const btnDelete = document.getElementById("btn-delete");

    const macroChart = document.getElementById("macro-chart");

    new Chart(macroChart, {
        type: "doughnut",
        data: {
            labels: ["Białko", "Tłuszcze", "Węglowodany"],
            backgroundColor: ["#ff4b4b", "#f59e0b", "#34d399"],
            datasets: [
                {
                    data: [dietPlan.proteins, dietPlan.fats, dietPlan.carbs],
                    backgroundColor: ["#ff4b4b", "#f59e0b", "#34d399"],
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
                        color: "#f9fafb",
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 14,
                            family: '"Inter", sans-serif',
                        },
                    },
                },
            },
        },
    });

    const weightChartsCanvas = document.getElementById("weight-chart");

    const dates = userProfile.weightHistory.map((entry) => entry.date);
    const weights = userProfile.weightHistory.map((entry) => entry.weight);

    new Chart(weightChartsCanvas, {
        type: "line",
        data: {
            labels: dates,
            datasets: [
                {
                    // POPRAWKA 1: Dodane "s"
                    label: "Moja waga (kg)",
                    data: weights,
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16,185,129,0.1)",
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true,
                },
            ],
        },
        options: {
            maintainAspectRatio: false, // POPRAWKA 2: Usunięte "n" na końcu
            plugins: {
                legend: {
                    labels: {
                        color: "#f9fafb",
                        font: {
                            family: '"Inter", sans-serif',
                        },
                    },
                },
            },
            // POPRAWKA 3: scales musi być W ŚRODKU options!
            scales: {
                y: {
                    grid: {
                        color: "rgba(255,255,255,0.1)",
                    },
                    ticks: { color: "#9ca3af" },
                },
                x: {
                    grid: { color: "rgba(255,255,255,0.1)" }, // POPRAWKA 4: Domknięty nawias po 0.1
                    ticks: { color: "#9ca3af" },
                },
            },
        }, // <- Tu dopiero zamykamy options
    });

    caloriesLimit.textContent = dietPlan.calories;
    proteins.textContent = dietPlan.proteins;
    fats.textContent = dietPlan.fats;
    carbs.textContent = dietPlan.carbs;

    btnDelete.addEventListener("click", () => {
        clearUser();
        navigateTo("/onboarding");
    });
};
