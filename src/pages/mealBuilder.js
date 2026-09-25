import { html } from "../utils/template.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { navigateTo } from "../router.js";
import { addMeal } from "../services/mealService.js";
import {
    searchProducts,
    getProductById,
    calculateIngredientMacros,
    sumIngredients,
} from "../services/productService.js";
import {
    createCustomRecipe,
    getMealDraft,
    saveMealDraft,
    clearMealDraft,
} from "../services/customRecipeService.js";
import { showConfirmModal } from "../components/confirmModal.js";

const MAX_GRAMS = 2000;

const CATEGORIES = [
    { value: "śniadanie", label: "Śniadanie" },
    { value: "obiad", label: "Obiad" },
    { value: "kolacja", label: "Kolacja" },
];

// Domyślna pora z godziny — trafia w większość przypadków, a da się zmienić.
const guessCategory = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "śniadanie";
    if (hour < 17) return "obiad";
    return "kolacja";
};

const formatNumber = (value) => value.toLocaleString("pl-PL", { maximumFractionDigits: 1 });

const formatMacroLine = ({ calories, protein, fats, carbs }) =>
    `${Math.round(calories)} kcal · B ${formatNumber(protein)} · T ${formatNumber(fats)} · W ${formatNumber(carbs)}`;

export const renderMealBuilder = () => html`
    <main class="page-container builder">
        <nav class="builder__nav">
            <a href="/recipes" class="btn-icon-text" data-link>
                <i data-lucide="arrow-left" aria-hidden="true"></i>
                Przepisy
            </a>
        </nav>

        <header class="page-header">
            <h1 class="page-header__title">Nowy posiłek</h1>
            <p class="page-header__desc">Wybierz produkty i podaj gramy — makro liczymy z wartości na 100 g.</p>
        </header>

        <div id="builder-view" class="builder__layout">
            <section class="builder__panel" aria-labelledby="builder-details-title">
                <h2 class="builder__section-title" id="builder-details-title">Posiłek</h2>
                <div class="form__group">
                    <label for="builder-title" class="form__label">Nazwa</label>
                    <input
                        type="text"
                        id="builder-title"
                        class="form__input"
                        maxlength="60"
                        placeholder="np. Omlet z awokado"
                        autocomplete="off"
                    />
                </div>
                <div class="form__group">
                    <label for="builder-category" class="form__label">Pora posiłku</label>
                    <select id="builder-category" class="form__input">
                        ${CATEGORIES.map(({ value, label }) => `<option value="${value}">${label}</option>`).join("")}
                    </select>
                </div>

                <h2 class="builder__section-title" id="builder-search-title">Dodaj produkt</h2>
                <div class="form__group">
                    <label for="builder-search" class="form__label">Szukaj w bazie produktów</label>
                    <input
                        type="search"
                        id="builder-search"
                        class="form__input"
                        placeholder="np. jajko, awokado, łosoś"
                        autocomplete="off"
                        aria-describedby="builder-search-hint"
                    />
                    <p class="form__note" id="builder-search-hint">Wpisz co najmniej 2 litery. Polskie znaki są opcjonalne.</p>
                </div>
                <ul class="product-results" id="product-results" aria-labelledby="builder-search-title"></ul>
            </section>

            <section class="builder__sheet paper" aria-labelledby="builder-sheet-title">
                <div class="builder__sheet-holes" aria-hidden="true">
                    <span class="hole"></span>
                    <span class="hole"></span>
                </div>
                <h2 class="builder__section-title" id="builder-sheet-title">Składniki</h2>
                <ul class="builder-ingredients" id="builder-ingredients"></ul>

                <dl class="builder-totals" id="builder-totals"></dl>

                <p class="form__error is-hidden" id="builder-error" role="alert"></p>

                <div class="builder__actions">
                    <button type="button" class="btn btn--secondary builder__cancel" id="builder-cancel">Anuluj</button>
                    <button type="button" class="btn btn--primary" id="builder-create">Stwórz posiłek</button>
                </div>
            </section>
        </div>

        <section id="builder-success" class="builder-success paper is-hidden" aria-labelledby="builder-success-title"></section>

        <p class="visually-hidden" id="builder-status" role="status" aria-live="polite"></p>
    </main>
`;

const generateResultsHTML = (products, expandedId) =>
    products
        .map((product) => {
            const isExpanded = product.id === expandedId;
            const formId = `grams-form-${product.id}`;

            return html`
                <li class="product-result ${isExpanded ? "is-expanded" : ""}" data-id="${product.id}">
                    <button
                        type="button"
                        class="product-result__toggle"
                        aria-expanded="${isExpanded}"
                        aria-controls="${formId}"
                    >
                        <span class="product-result__name">${product.name}</span>
                        <span class="product-result__meta">${formatMacroLine(product.per100g)} / 100 g</span>
                    </button>
                    ${isExpanded
                        ? html`
                              <form class="product-result__form" id="${formId}" novalidate>
                                  <label for="grams-input" class="form__label">Ilość (g)</label>
                                  <div class="product-result__row">
                                      <input
                                          type="number"
                                          id="grams-input"
                                          class="form__input product-result__grams"
                                          min="1"
                                          max="${MAX_GRAMS}"
                                          step="1"
                                          inputmode="decimal"
                                          aria-describedby="grams-preview"
                                      />
                                      <button type="submit" class="btn btn--primary">Dodaj</button>
                                  </div>
                                  <p class="form__note" id="grams-preview">
                                      ${product.piece ? `${product.piece.label} ≈ ${formatNumber(product.piece.grams)} g` : "Podaj wagę produktu."}
                                  </p>
                              </form>
                          `
                        : ""}
                </li>
            `;
        })
        .join("");

const generateIngredientsHTML = (ingredients) => {
    if (ingredients.length === 0) {
        return html`<li class="builder-ingredients__empty">
            Jeszcze nic tu nie ma. Wyszukaj produkt, podaj gramy i kliknij „Dodaj".
        </li>`;
    }

    return ingredients
        .map(({ productId, grams }) => {
            const product = getProductById(productId);
            if (!product) return "";
            const macros = calculateIngredientMacros(product, grams);

            return html`
                <li class="builder-ingredients__item">
                    <div class="builder-ingredients__info">
                        <span class="builder-ingredients__name">${product.name}</span>
                        <span class="builder-ingredients__meta">${formatNumber(grams)} g · ${formatMacroLine(macros)}</span>
                    </div>
                    <button
                        type="button"
                        class="btn-icon-text builder-ingredients__remove"
                        data-id="${productId}"
                        aria-label="Usuń: ${product.name}"
                    >
                        <i data-lucide="x" aria-hidden="true"></i>
                        Usuń
                    </button>
                </li>
            `;
        })
        .join("");
};

const generateTotalsHTML = (totals) => html`
    <div class="builder-totals__item"><dt>Kalorie</dt><dd>${totals.calories} kcal</dd></div>
    <div class="builder-totals__item"><dt>Białko</dt><dd>${totals.protein} g</dd></div>
    <div class="builder-totals__item"><dt>Tłuszcz</dt><dd>${totals.fats} g</dd></div>
    <div class="builder-totals__item"><dt>Węgle</dt><dd>${totals.carbs} g</dd></div>
`;

const generateSuccessHTML = (recipe) => html`
    <span class="stamp builder-success__stamp">Zapisano</span>
    <h2 class="builder-success__title" id="builder-success-title" tabindex="-1">${escapeHtml(recipe.title)}</h2>
    <p class="builder-success__meta">${formatMacroLine(recipe)}</p>
    <p class="builder-success__text">Posiłek jest teraz na liście przepisów jako Twój własny.</p>
    <div class="builder__actions">
        <a href="/recipes" class="btn btn--secondary builder__cancel" data-link>Zobacz w przepisach</a>
        <button type="button" class="btn btn--primary" id="builder-add-to-day">Dodaj do dziś</button>
    </div>
`;

export const initMealBuilder = () => {
    const titleInput = document.getElementById("builder-title");
    const categorySelect = document.getElementById("builder-category");
    const searchInput = document.getElementById("builder-search");
    const resultsList = document.getElementById("product-results");
    const ingredientsList = document.getElementById("builder-ingredients");
    const totalsList = document.getElementById("builder-totals");
    const errorBox = document.getElementById("builder-error");
    const statusBox = document.getElementById("builder-status");
    const builderView = document.getElementById("builder-view");
    const successView = document.getElementById("builder-success");

    // Jedyny stan kreatora. Wszystko na ekranie jest z niego wyliczane.
    const draft = getMealDraft();
    const state = {
        title: draft?.title ?? "",
        category: draft?.category ?? guessCategory(),
        ingredients: draft?.ingredients ?? [],
        expandedId: null,
    };

    titleInput.value = state.title;
    categorySelect.value = state.category;

    const persistDraft = () => saveMealDraft(state);

    const announce = (message) => {
        statusBox.textContent = message;
    };

    const hideError = () => errorBox.classList.add("is-hidden");

    const showError = (message) => {
        errorBox.textContent = message;
        errorBox.classList.remove("is-hidden");
    };

    const renderIngredients = () => {
        ingredientsList.innerHTML = generateIngredientsHTML(state.ingredients);
        totalsList.innerHTML = generateTotalsHTML(sumIngredients(state.ingredients));
        window.lucide?.createIcons();
    };

    const renderResults = () => {
        resultsList.innerHTML = generateResultsHTML(searchProducts(searchInput.value), state.expandedId);
    };

    const addIngredient = (productId, grams) => {
        // Ten sam produkt drugi raz = więcej gramów, nie drugi wiersz.
        const existing = state.ingredients.find((item) => item.productId === productId);
        if (existing) {
            existing.grams += grams;
        } else {
            state.ingredients.push({ productId, grams });
        }
        persistDraft();
        renderIngredients();
    };

    // ---------- Wyszukiwarka i wybór produktu ----------

    searchInput.addEventListener("input", () => {
        state.expandedId = null;
        renderResults();
    });

    resultsList.addEventListener("click", (event) => {
        const toggle = event.target.closest(".product-result__toggle");
        if (!toggle) return;

        const productId = toggle.closest(".product-result").dataset.id;
        state.expandedId = state.expandedId === productId ? null : productId;
        renderResults();

        if (state.expandedId) {
            document.getElementById("grams-input")?.focus();
        } else {
            resultsList.querySelector(`[data-id="${productId}"] .product-result__toggle`)?.focus();
        }
    });

    // Podgląd makro na żywo podczas wpisywania gramów
    resultsList.addEventListener("input", (event) => {
        if (event.target.id !== "grams-input") return;

        const product = getProductById(state.expandedId);
        const grams = Number(event.target.value);
        const preview = document.getElementById("grams-preview");
        if (!product || !preview) return;

        preview.textContent =
            grams > 0
                ? `= ${formatMacroLine(calculateIngredientMacros(product, grams))}`
                : product.piece
                  ? `${product.piece.label} ≈ ${formatNumber(product.piece.grams)} g`
                  : "Podaj wagę produktu.";
    });

    resultsList.addEventListener("submit", (event) => {
        event.preventDefault();

        const product = getProductById(state.expandedId);
        const gramsInput = document.getElementById("grams-input");
        const grams = Number(gramsInput.value);

        if (!product) return;

        if (!(grams > 0 && grams <= MAX_GRAMS)) {
            document.getElementById("grams-preview").textContent = `Podaj ilość od 1 do ${MAX_GRAMS} g.`;
            gramsInput.focus();
            return;
        }

        addIngredient(product.id, grams);
        hideError();
        announce(`Dodano: ${product.name}, ${formatNumber(grams)} g.`);

        // Czyścimy wyszukiwarkę — lista wyników znika i karta składników
        // podjeżdża pod pole wyszukiwania, więc na telefonie widać efekt.
        state.expandedId = null;
        searchInput.value = "";
        renderResults();
        searchInput.focus();
    });

    // ---------- Karta składników ----------

    ingredientsList.addEventListener("click", (event) => {
        const removeBtn = event.target.closest(".builder-ingredients__remove");
        if (!removeBtn) return;

        const product = getProductById(removeBtn.dataset.id);
        state.ingredients = state.ingredients.filter((item) => item.productId !== removeBtn.dataset.id);
        persistDraft();
        renderIngredients();
        announce(`Usunięto: ${product?.name ?? "składnik"}.`);
        searchInput.focus();
    });

    titleInput.addEventListener("input", () => {
        state.title = titleInput.value;
        persistDraft();
    });

    categorySelect.addEventListener("change", () => {
        state.category = categorySelect.value;
        persistDraft();
    });

    // ---------- Akcje ----------

    document.getElementById("builder-cancel").addEventListener("click", () => {
        const hasWork = state.title.trim() || state.ingredients.length > 0;
        const leave = () => {
            clearMealDraft();
            navigateTo("/recipes");
        };

        if (!hasWork) {
            leave();
            return;
        }

        showConfirmModal({
            title: "Porzucić ten posiłek?",
            message: "Nazwa i dodane składniki zostaną usunięte.",
            confirmLabel: "Porzuć",
            cancelLabel: "Wróć do edycji",
            onConfirm: leave,
        });
    });

    document.getElementById("builder-create").addEventListener("click", () => {
        const title = state.title.trim();

        // Przycisk zostaje aktywny, a brak danych nazywamy wprost —
        // wyszarzony przycisk nie mówi, czego brakuje.
        if (!title) {
            showError("Nadaj posiłkowi nazwę.");
            titleInput.focus();
            return;
        }
        if (state.ingredients.length === 0) {
            showError("Dodaj co najmniej jeden składnik.");
            searchInput.focus();
            return;
        }

        const recipe = createCustomRecipe({
            title,
            category: state.category,
            ingredients: state.ingredients,
        });
        clearMealDraft();

        successView.innerHTML = generateSuccessHTML(recipe);
        builderView.classList.add("is-hidden");
        successView.classList.remove("is-hidden");
        document.getElementById("builder-success-title").focus();

        document.getElementById("builder-add-to-day").addEventListener("click", (event) => {
            addMeal(recipe);
            event.currentTarget.textContent = "Dodano do dnia";
            event.currentTarget.disabled = true;
            announce(`${recipe.title} dodano do dzisiejszego dnia.`);
        });
    });

    renderIngredients();
};
