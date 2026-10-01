// Zrzuty ekranów do sekcji Steps na stronie głównej — z PRAWDZIWEJ, zbudowanej aplikacji.
// Uruchamiany ręcznie po każdej zmianie wyglądu, poza bundlem (jak build-products.js).
//
// Wymaga puppeteer-core (bez własnego Chrome — używa zainstalowanego), instalowanego
// tymczasowo, żeby nie zaśmiecać package.json:
//   npm install --no-save puppeteer-core
//   node scripts/screenshot-steps.js
// Inna ścieżka do Chrome: CHROME_PATH="..." node scripts/screenshot-steps.js
//
// Wynik: public/images/steps/*.webp (390×844 CSS px, gęstość 2× — jak telefon).

import { mkdir } from "node:fs/promises";
import { build, preview } from "vite";
import puppeteer from "puppeteer-core";
import { RECIPES_DATA } from "../src/data/recipesData.js";

const CHROME_PATH = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUTPUT_DIR = "public/images/steps";
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

// Data w formacie getDateKey() (czas lokalny, nie UTC) — przesunięta o `daysAgo` dni.
const dateKey = (daysAgo = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// ---------- Dane przykładowego dnia (zrzut podpisany na stronie jako "przykładowy dzień") ----------

const DEMO_USER = {
    gender: "male",
    age: 32,
    height: 180,
    weight: 82,
    activity: "moderate",
    sport: "combat",
    goal: "reduction",
    // Ostatni pomiar dzisiaj — inaczej Dashboard pokazałby baner "minęło 7 dni".
    weightHistory: [
        { date: dateKey(28), weight: 85.1 },
        { date: dateKey(21), weight: 84.2 },
        { date: dateKey(14), weight: 83.6 },
        { date: dateKey(7), weight: 82.7 },
        { date: dateKey(0), weight: 82 },
    ],
};

// Wpisy w tym samym kształcie, co zapisuje addMeal() (snapshot przepisu).
const DEMO_MEAL_IDS = [
    { recipeId: "r1", time: "08:10" },
    { recipeId: "r20", time: "13:40" },
];

const buildDemoMeals = () =>
    DEMO_MEAL_IDS.map(({ recipeId, time }, index) => {
        const recipe = RECIPES_DATA.find((item) => item.id === recipeId);
        if (!recipe) throw new Error(`Brak przepisu ${recipeId} w RECIPES_DATA`);

        return {
            id: `demo-${index}`,
            recipeId: recipe.id,
            title: recipe.title,
            category: recipe.category,
            calories: recipe.calories,
            protein: recipe.protein,
            fats: recipe.fats,
            carbs: recipe.carbs,
            fiber: recipe.fiber ?? 0,
            imageUrl: recipe.imageUrl,
            time,
        };
    });

// ---------- Zrzuty ----------

const SHOTS = [
    {
        file: "onboarding.webp",
        path: "onboarding",
        withProfile: false,
        // Wypełniony formularz pokazuje więcej niż puste pola.
        prepare: async (page) => {
            await page.select("#gender", "male");
            await page.type("#age", "32");
            await page.type("#height", "180");
            await page.type("#weight", "82");
            await page.select("#activity", "moderate");
            await page.select("#sport", "combat");
            await page.evaluate(() => document.activeElement?.blur());
        },
    },
    {
        file: "recipes.webp",
        path: "recipes",
        withProfile: true,
        // Filtry na górze ekranu, pod nimi pierwsza karta — tak, jak widzi to użytkownik po przewinięciu.
        prepare: async (page) => {
            await page.evaluate(() => {
                const target = document.querySelector(".filters");
                const topbar = document.querySelector(".topbar");
                const offset = (topbar?.offsetHeight ?? 0) + 12;
                window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - offset);
            });
        },
    },
    {
        file: "dashboard.webp",
        path: "dashboard",
        withProfile: true,
        prepare: async () => {},
    },
];

const waitForAssets = (page) =>
    page.evaluate(async () => {
        await document.fonts.ready;
        // Czekamy tylko na obrazki W KADRZE — leniwe (loading="lazy") poza ekranem
        // nigdy nie zaczną się ładować, więc czekanie na wszystkie zawiesza skrypt.
        const isInViewport = (img) => {
            const rect = img.getBoundingClientRect();
            return rect.bottom > 0 && rect.top < window.innerHeight;
        };
        await Promise.all(
            [...document.images]
                .filter((img) => isInViewport(img) && !img.complete)
                .map(
                    (img) =>
                        new Promise((resolve) => {
                            img.addEventListener("load", resolve, { once: true });
                            img.addEventListener("error", resolve, { once: true });
                        }),
                ),
        );
    });

const run = async () => {
    console.log("Build aplikacji...");
    await build({ logLevel: "warn" });

    const server = await preview({ preview: { port: 4179, strictPort: true }, logLevel: "warn" });
    const baseUrl = server.resolvedUrls.local[0]; // np. http://localhost:4179/keto-thai-app/

    const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: true });

    try {
        await mkdir(OUTPUT_DIR, { recursive: true });

        for (const shot of SHOTS) {
            // Nowy, czysty kontekst na każdy zrzut — localStorage nie przecieka między ekranami.
            const context = await browser.createBrowserContext();
            const page = await context.newPage();
            await page.setViewport(VIEWPORT);

            // Dane wpisujemy ZANIM wystartuje aplikacja — router od razu widzi profil.
            const storage = shot.withProfile
                ? { keto_user: JSON.stringify(DEMO_USER), keto_meals: JSON.stringify({ [dateKey(0)]: buildDemoMeals() }) }
                : {};
            await page.evaluateOnNewDocument((entries) => {
                Object.entries(entries).forEach(([key, value]) => localStorage.setItem(key, value));
            }, storage);

            await page.goto(`${baseUrl}${shot.path}`, { waitUntil: "networkidle0" });
            await shot.prepare(page);
            await waitForAssets(page);
            // Animacje wejścia (np. wykres Chart.js) muszą się zakończyć.
            await new Promise((resolve) => setTimeout(resolve, 1200));

            await page.screenshot({ path: `${OUTPUT_DIR}/${shot.file}`, type: "webp", quality: 82 });
            console.log(`✓ ${OUTPUT_DIR}/${shot.file}`);

            await context.close();
        }
    } finally {
        await browser.close();
        await new Promise((resolve) => server.httpServer.close(resolve));
    }
};

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
