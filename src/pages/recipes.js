import { html } from "../utils/template.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { getBase } from "../utils/env.js";
import { RECIPES_DATA } from "../data/recipesData.js";
import { addMeal } from "../services/mealService.js";
import { getUser } from "../services/userService.js";
import { getProductById, calculateIngredientMacros } from "../services/productService.js";
import { formatDateKey } from "../utils/date.js";
import { getCustomRecipes, deleteCustomRecipe } from "../services/customRecipeService.js";
import { showConfirmModal } from "../components/confirmModal.js";

const MACROS = [
    { key: "protein", icon: "beef", label: "Białko" },
    { key: "fats", icon: "droplet", label: "Tłuszcz" },
    { key: "carbs", icon: "wheat", label: "Węgle" },
];

// Własne przepisy użytkownika na początku listy — to te, po które wraca najczęściej.
// Funkcja, nie stała: lista zmienia się po utworzeniu lub usunięciu przepisu.
const getAllRecipes = () => [...getCustomRecipes(), ...RECIPES_DATA];

const isUserRecipe = (recipe) => recipe.source === "user";

const generateMacrosHTML = (recipe) => html`
    <div class="card__macros">
        ${MACROS.map(
            ({ key, icon, label }) => html`
                <div class="macro macro--${key}">
                    <i data-lucide="${icon}" class="macro__icon" aria-hidden="true"></i>
                    <span class="macro__value">${recipe[key]}g</span>
                    <span class="macro__label">${label}</span>
                </div>
            `,
        ).join("")}
    </div>
`;

export const renderRecipes = () => {
    // Kreator wymaga profilu (guard w router.js) — bez profilu nie pokazujemy
    // przycisku, który i tak przerzuciłby na onboarding.
    const canCreate = Boolean(getUser());

    return html` <main class="page-container">
        <header class="page-header">
            <h1 class="page-header__title">Przepisy Keto</h1>
            <p class="page-header__desc">Tluste smaki ,metaboliczna dyscyplina</p>
        </header>

        ${canCreate
            ? html`<div class="recipes__actions">
                  <a href="/recipes/new" class="btn btn--primary btn--icon" id="btn-create-meal" data-link>
                      <i data-lucide="plus" aria-hidden="true"></i>
                      Stwórz swój posiłek
                  </a>
              </div>`
            : ""}

        <div class="filters">
            <div class="filters__search">
                <input type="number" class="filters__input" id="input-calories" placeholder="Max kalorii" />
                <button class="btn btn--primary" id="btn-search-calories">Szukaj</button>
            </div>

            <div class="filters__categories">
                <button class="filter-btn is-active" data-category="all">Wszystkie</button>
                ${canCreate ? html`<button class="filter-btn" data-category="user">Moje</button>` : ""}
                <button class="filter-btn" data-category="śniadanie">Śniadanie</button>
                <button class="filter-btn" data-category="obiad">Obiad</button>
                <button class="filter-btn" data-category="kolacja">Kolacja</button>
            </div>
        </div>
        <section class="grid-layout">${generateCardsHTML(getAllRecipes())}</section>
        <section class="recipe-detail is-hidden" id="recipe-detail"></section>
    </main>`;
};

// Przepis użytkownika nie ma zdjęcia, więc w jego miejscu stoi blok z ikoną
// sztućców. Te same plakietki co na zdjęciach (kcal po prawej, oznaczenie po
// lewej) — dzięki temu karta i szczegóły wyglądają jak jedna rodzina.
// Klasa kontenera przychodzi z zewnątrz: inna na karcie, inna w szczegółach.
const generateUserImageHTML = (recipe, containerClass) => html`
    <div class="${containerClass}">
        <i data-lucide="utensils" class="card__placeholder-icon" aria-hidden="true"></i>
        <span class="card__badge">${recipe.calories} kcal</span>
        <span class="card__owner">Twój przepis</span>
    </div>
`;

const generateUserCardHTML = (recipe) => html`<article class="card card--user" data-id="${recipe.id}">
    ${generateUserImageHTML(recipe, "card__image-container card__image-container--user")}

    <div class="card__content">
        <h3 class="card__title">
            <button type="button" class="card__open">${escapeHtml(recipe.title)}</button>
        </h3>
        <p class="card__ingredients">${recipe.ingredients.map((item) => getProductById(item.productId)?.name ?? "Produkt usunięty z bazy").join(" · ")}</p>

        ${generateMacrosHTML(recipe)}
    </div>
</article>`;

const generateCardsHTML = (recepiesArray) => {
    if (recepiesArray.length === 0) {
        return html`<p class="recipes__empty">Brak przepisów w tym widoku. Wybierz inny filtr albo stwórz własny posiłek.</p>`;
    }

    return recepiesArray
        .map((recipe) =>
            isUserRecipe(recipe)
                ? generateUserCardHTML(recipe)
                : html`<article class="card" data-id="${recipe.id}">
                      <div class="card__image-container">
                          <img src="${getBase()}${recipe.imageUrl}" alt="" class="card__image" loading="lazy" />
                          <span class="card__badge">${recipe.calories} kcal</span>
                          <span class="card__time">${recipe.time}</span>
                      </div>

                      <div class="card__content">
                          <h3 class="card__title">
                              <!-- Prawdziwy przycisk = fokus, Enter i Spacja za darmo. ::after rozciąga go na całą kartę. -->
                              <button type="button" class="card__open">${recipe.title}</button>
                          </h3>

                          ${generateMacrosHTML(recipe)}
                      </div>
                  </article> `,
        )
        .join("");
};

const CATEGORY_LABELS = { śniadanie: "Śniadanie", obiad: "Obiad", kolacja: "Kolacja" };

// Składniki własnego przepisu jako tabela: nazwa, ilość, kcal. Kcal składnika
// liczymy z bazy produktów tą samą funkcją co kreator, więc liczby zgadzają się
// z tym, co użytkownik widział przy komponowaniu.
// Wiersze są zaokrąglone osobno, "Razem" to zapisana suma liczona z niezaokrąglonych
// wartości — może się różnić od sumy wierszy o 1 kcal (patrz sumIngredients).
const generateIngredientsTableHTML = (recipe) => html`
    <table class="ingredients-table">
        <thead>
            <tr>
                <th scope="col">Składnik</th>
                <th scope="col">Ilość</th>
                <th scope="col">kcal</th>
            </tr>
        </thead>
        <tbody>
            ${recipe.ingredients
                .map((item) => {
                    const product = getProductById(item.productId);
                    const kcal = product ? Math.round(calculateIngredientMacros(product, item.grams).calories) : "—";
                    // Nazwa z bazy naszej aplikacji, ale przy usuniętym produkcie mówimy wprost, co się stało.
                    return html`<tr>
                        <td>${product ? product.name : "Produkt usunięty z bazy"}</td>
                        <td>${item.grams} g</td>
                        <td>${kcal}</td>
                    </tr>`;
                })
                .join("")}
        </tbody>
        <tfoot>
            <tr>
                <th scope="row" colspan="2">Razem</th>
                <td>${recipe.calories}</td>
            </tr>
        </tfoot>
    </table>
`;

const generateIngredientsListHTML = (recipe) => html`
    <ul class="recipe__list recipe__list--ingredients">
        ${recipe.ingredients.map((item) => html`<li class="recipe__list-item">${item}</li>`).join("")}
    </ul>
`;

const genrateRecipeDetailHTML = (recipe) => {
    const isOwn = isUserRecipe(recipe);

    return html`
        <article class="recipe">
            <nav class="recipe__nav">
                <button class="btn btn--secondary" id="btn-back">← Wróć do przepisów</button>
            </nav>

            ${isOwn
                ? generateUserImageHTML(recipe, "recipe__image-container recipe__image-container--user")
                : html`<div class="recipe__image-container">
                      <img src="${getBase()}${recipe.imageUrl}" alt="${recipe.title}" class="recipe__image" loading="lazy" />
                      <span class="card__badge">${recipe.calories} kcal</span>
                      <span class="card__time">${recipe.time}</span>
                  </div>`}

            <header class="recipe__header">
                <h2 class="recipe__title">${escapeHtml(recipe.title)}</h2>
                ${isOwn
                    ? html`<p class="recipe__meta">
                          ${CATEGORY_LABELS[recipe.category] ?? recipe.category}${recipe.createdAt
                              ? ` · dodano ${formatDateKey(recipe.createdAt)}`
                              : ""}
                      </p>`
                    : ""}

                ${generateMacrosHTML(recipe)}
            </header>

            <section class="recipe__section">
                <h3 class="recipe__section-title">Składniki</h3>
                ${isOwn ? generateIngredientsTableHTML(recipe) : generateIngredientsListHTML(recipe)}
            </section>

            ${recipe.instructions?.length
                ? html`<section class="recipe__section">
                      <h3 class="recipe__section-title">Sposób przygotowania</h3>
                      <ol class="recipe__list recipe__list--instructions">
                          ${recipe.instructions.map((step) => html`<li class="recipe__list-item">${step}</li>`).join("")}
                      </ol>
                  </section>`
                : ""}

            <footer class="recipe__footer">
                <button class="btn btn--primary" id="btn-add-to-day">Dodaj do mojego dnia</button>
                ${isOwn
                    ? html`<button type="button" class="btn-icon-text recipe__delete" id="btn-delete-recipe">
                          <i data-lucide="trash-2" aria-hidden="true"></i>
                          Usuń przepis
                      </button>`
                    : ""}
            </footer>
        </article>
    `;
};

export const initRecipes = () => {
    const gridLayout = document.querySelector(".grid-layout");
    const btnsCategorys = document.querySelectorAll(".filter-btn");
    const recipeDetail = document.querySelector("#recipe-detail");
    const filtersDiv = document.querySelector(".filters");
    const actionsDiv = document.querySelector(".recipes__actions");

    let currentRecipe = null;

    const showGrid = () => {
        gridLayout.classList.remove("is-hidden");
        filtersDiv.classList.remove("is-hidden");
        actionsDiv?.classList.remove("is-hidden");
        recipeDetail.classList.add("is-hidden");
        recipeDetail.innerHTML = "";
    };

    gridLayout.addEventListener("click", (e) => {
        const clickedCard = e.target.closest(".card");
        if (!clickedCard) return;

        const mealId = clickedCard.dataset.id;

        const foundRecipe = getAllRecipes().find((x) => x.id === mealId);
        if (!foundRecipe) return;

        currentRecipe = foundRecipe;

        recipeDetail.innerHTML = genrateRecipeDetailHTML(foundRecipe);

        filtersDiv.classList.add("is-hidden");
        actionsDiv?.classList.add("is-hidden");
        gridLayout.classList.add("is-hidden");
        recipeDetail.classList.remove("is-hidden");

        window.lucide?.createIcons();

        // Karta zniknęła z ekranu — fokus musi trafić do nowego widoku, nie w próżnię.
        document.getElementById("btn-back").focus();
    });

    recipeDetail.addEventListener("click", (e) => {
        const btnBack = e.target.closest("#btn-back");
        const btnAdd = e.target.closest("#btn-add-to-day");
        const btnDelete = e.target.closest("#btn-delete-recipe");

        if (btnBack) {
            showGrid();

            // Powrót fokusu na kartę, z której użytkownik przyszedł.
            gridLayout.querySelector(`.card[data-id="${currentRecipe.id}"] .card__open`)?.focus();
            currentRecipe = null;
        }

        if (btnAdd && currentRecipe) {
            addMeal(currentRecipe);
            btnAdd.textContent = "✓ Dodano do dnia!";
            btnAdd.disabled = true;
        }

        // Przycisk istnieje tylko przy własnych przepisach, ale sprawdzamy
        // też dane — przepisu z RECIPES_DATA nie wolno usunąć żadną drogą.
        if (btnDelete && currentRecipe && isUserRecipe(currentRecipe)) {
            const recipeToDelete = currentRecipe;

            showConfirmModal({
                title: "Usunąć ten przepis?",
                message: `„${escapeHtml(recipeToDelete.title)}" zniknie z listy przepisów. Posiłki już zapisane w dzienniku zostaną.`,
                confirmLabel: "Usuń",
                cancelLabel: "Anuluj",
                onConfirm: () => {
                    deleteCustomRecipe(recipeToDelete.id);
                    currentRecipe = null;
                    resetFilters();
                    updateGrid(getAllRecipes());
                    showGrid();
                    // Karta, z której przyszliśmy, już nie istnieje — fokus na stały element.
                    (document.getElementById("btn-create-meal") ?? gridLayout.querySelector(".card__open"))?.focus();
                },
            });
        }
    });

    const updateGrid = (recipesToRender) => {
        gridLayout.innerHTML = generateCardsHTML(recipesToRender);

        if (window.lucide) {
            window.lucide.createIcons();
        }
    };

    const resetFilters = () => {
        btnsCategorys.forEach((btn) => {
            btn.classList.toggle("is-active", btn.dataset.category === "all");
        });
    };

    btnsCategorys.forEach((button) => {
        button.addEventListener("click", (e) => {
            btnsCategorys.forEach((btn) => {
                btn.classList.remove("is-active");
            });

            const selectedCategory = button.dataset.category;
            const allRecipes = getAllRecipes();
            let newRecipes = [];

            button.classList.add("is-active");

            if (selectedCategory === "all") {
                newRecipes = allRecipes;
            } else if (selectedCategory === "user") {
                newRecipes = allRecipes.filter(isUserRecipe);
            } else {
                newRecipes = allRecipes.filter((rec) => rec.category === selectedCategory);
            }

            updateGrid(newRecipes);
        });
    });

    const filtersInput = document.getElementById("input-calories");
    const btnSearchCalories = document.getElementById("btn-search-calories");

    btnSearchCalories.addEventListener("click", () => {
        if (!filtersInput.value) {
            updateGrid(getAllRecipes());
            return;
        }

        const calories = parseInt(filtersInput.value);

        const caloriesArray = getAllRecipes().filter((rec) => rec.calories <= calories);

        updateGrid(caloriesArray);
    });
};
