import { html } from "../utils/template.js";

const RECIPES_DATA = [
    {
        id: "r1",
        title: "Keto Pad Thai",
        calories: 650,
        protein: 42,
        fats: 50,
        carbs: 8,
        imageUrl: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r2",
        title: "Red Curry Chicken",
        calories: 520,
        protein: 38,
        fats: 40,
        carbs: 6,
        imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r3",
        title: "Thai Beef Salad",
        calories: 480,
        protein: 45,
        fats: 32,
        carbs: 4,
        imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=800",
    },
];

export const renderRecipes = () => {
    return html` <main class="page-container">
        <header class="page-header">
            <h1 class="page-header__title">Przepisy Keto</h1>
            <p class="page-header__desc">Tluste smaki ,metaboliczna dyscyplina</p>
        </header>

        <section class="grid-layout">
            ${RECIPES_DATA.map(
                (recipe) =>
                    html`<article class="card" data-id="${recipe.id}">
                        <div class="card__image-container">
                            <img src="${recipe.imageUrl}" alt="${recipe.title}" class="card__image" loading="lazy" />
                            <span class="card__badge">${recipe.calories} kcal</span>
                        </div>

                        <div class="card__content">
                            <h3 class="card__title">${recipe.title}</h3>

                            <div class="card__macros">
                                <div class="macro macro--protein" title="Protein">
                                    <i data-lucide="beef" class="macro__icon"></i>
                                    <span class="macro__value">${recipe.protein}g</span>
                                </div>
                                <div class="macro macro--fats" title="Fats">
                                    <i data-lucide="droplet" class="macro__icon"></i>
                                    <span class="macro__value">${recipe.fats}g</span>
                                </div>
                                <div class="macro macro--carbs" title="Carbs">
                                    <i data-lucide="wheat" class="macro__icon"></i>
                                    <span class="macro__value">${recipe.carbs}g</span>
                                </div>
                            </div>
                        </div>
                    </article> `,
            ).join("")}
        </section>
    </main>`;
};
