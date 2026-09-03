import { html } from "../utils/template.js";

import { RECIPES_DATA } from "../data/recipesData.js";


export const renderRecipes = () => {
    return html` <main class="page-container">
        <header class="page-header">
            <h1 class="page-header__title">Przepisy Keto</h1>
            <p class="page-header__desc">Tluste smaki ,metaboliczna dyscyplina</p>
        </header>

        <div class="filters">
            <div class="filters__search">
                <input type="number" class="filters__input" id="input-calories" placeholder="Przeszukaj po kaloriach" />
                <button class="btn btn--primary" id="btn-search-calories">Szukaj</button>
            </div>

            <div class="filters__categories">
                <button class="filter-btn is-active" data-category="all">Wszystkie</button>
                <button class="filter-btn" data-category="śniadanie">Śniadanie</button>
                <button class="filter-btn" data-category="obiad">Obiad</button>
                <button class="filter-btn" data-category="kolacja">Kolacja</button>
            </div>
        </div>
        <section class="grid-layout">${generateCardsHTML(RECIPES_DATA)}</section>
    </main>`;
};

const generateCardsHTML = (recepiesArray) => {
    return recepiesArray
        .map(
            (recipe) =>
                html`<article class="card" data-id="${recipe.id}">
                    <div class="card__image-container">
                        <img src="${recipe.imageUrl}" alt="${recipe.title}" class="card__image" loading="lazy" />
                        <span class="card__badge">${recipe.calories} kcal</span>
                        <span class="card__time">${recipe.time}</span>
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
        )
        .join("");
};

export const initRecipes = () => {
    const gridLayout = document.querySelector(".grid-layout");
    const btnsCategorys = document.querySelectorAll(".filter-btn");

    gridLayout.addEventListener('click', (e) => {
        const clickedCard = e.target.closest('.card')
        if(!clickedCard) return

        const mealId = clickedCard.dataset.id

        const foundRecipe = RECIPES_DATA.find(x => x.id === mealId)

        console.log(foundRecipe)
    })

    const updateGrid = (recipesToRender) => {
        gridLayout.innerHTML = generateCardsHTML(recipesToRender);

        if (window.lucide) {
            window.lucide.createIcons();
        }
    };

    btnsCategorys.forEach((button) => {
        button.addEventListener("click", (e) => {
            btnsCategorys.forEach((btn) => {
                btn.classList.remove("is-active");
            });

            const selectedCategory = button.dataset.category;
            let newRecipes = [];

            button.classList.add("is-active");

            if (selectedCategory === "all") {
                newRecipes = RECIPES_DATA;
            } else {
                newRecipes = RECIPES_DATA.filter((rec) => rec.category === selectedCategory);
            }

            updateGrid(newRecipes);
        });
    });

    const filtersInput = document.getElementById("input-calories");
    const btnSearchCalories = document.getElementById("btn-search-calories");

    btnSearchCalories.addEventListener("click", () => {
        if (!filtersInput.value) {
            updateGrid(RECIPES_DATA);
            return;
        }

        const calories = parseInt(filtersInput.value);

        const caloriesArray = RECIPES_DATA.filter((rec) => rec.calories <= calories);

        updateGrid(caloriesArray);
    });
};
