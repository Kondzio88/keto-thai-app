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
                    <canvas id="macro-chart"></canvas>
                </div>

                <div class="bento-card bento-card--chart">
                    <span class="bento-card__title">Historia Wagi</span>
                    <canvas id="weight-chart"></canvas>
                </div>

                <button class="btn btn-delete" id="btn-delete">Skasuj dane</button>
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

    caloriesLimit.textContent = dietPlan.calories;
    proteins.textContent = dietPlan.proteins;
    fats.textContent = dietPlan.fats;
    carbs.textContent = dietPlan.carbs;

    btnDelete.addEventListener("click", () => {
        clearUser();
        navigateTo("/onboarding");
    });
};
