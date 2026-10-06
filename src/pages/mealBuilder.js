import { html } from "../utils/template.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { navigateTo } from "../router.js";
import { getCurrentPath } from "../utils/env.js";
import { countTodayMealsByRecipe, updateTodayMealsFromRecipe } from "../services/mealService.js";
import { addRecipeToDay } from "../components/addToDay.js";
import {
    searchProducts,
    getProductById,
    calculateIngredientMacros,
    sumIngredients,
    getNetCarbs,
    portionToGrams,
} from "../services/productService.js";
import {
    createCustomRecipe,
    updateCustomRecipe,
    getCustomRecipeById,
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

const formatMacroLine = (macros) =>
    `${Math.round(macros.calories)} kcal · B ${formatNumber(macros.protein)} · T ${formatNumber(macros.fats)} · W netto ${formatNumber(getNetCarbs(macros))}`;

// Wartość opcji "gramy" w liście jednostek. Miary domowe mają wartość = indeks w product.portions.
const UNIT_GRAMS = "g";

// Miara wybrana w liście jednostek albo null, gdy liczymy w gramach
// (także gdy produkt nie ma miar i listy w ogóle nie ma).
const getSelectedPortion = (product, unitSelect) =>
    unitSelect && unitSelect.value !== UNIT_GRAMS ? product.portions[Number(unitSelect.value)] : null;

// Podpowiedź pod polem ilości. "≈", bo waga miary to średnia z USDA, nie pomiar —
// użytkownik ma widzieć, że "łyżka" to szacunek, a gramy z wagi kuchennej są dokładne.
const describeAmount = (product, portion, count) => {
    if (!(count > 0)) {
        return portion ? `${portion.label} ≈ ${formatNumber(portion.grams)} g` : "Podaj wagę produktu.";
    }
    const grams = portion ? portionToGrams(portion, count) : count;
    const macros = formatMacroLine(calculateIngredientMacros(product, grams));
    return portion ? `${formatNumber(count)} × ${portion.label} ≈ ${formatNumber(grams)} g = ${macros}` : `= ${macros}`;
};

// Tryb kreatora wynika z adresu: /recipes/new albo /recipes/edit?id=user-123.
// Render i init wołają to osobno — obaj czytają ten sam adres, więc się zgadzają.
// Edytować można tylko własne przepisy: getCustomRecipeById nie widzi RECIPES_DATA.
const getEditContext = () => {
    if (getCurrentPath() !== "/recipes/edit") return { isEdit: false, recipe: null };

    const recipeId = new URLSearchParams(window.location.search).get("id");
    return { isEdit: true, recipe: recipeId ? getCustomRecipeById(recipeId) : null };
};

// Zły lub nieaktualny link (np. przepis usunięty w innej karcie) — mówimy wprost, co się stało.
const renderMissingRecipe = () => html`
    <main class="page-container builder">
        <header class="page-header">
            <h1 class="page-header__title">Nie ma takiego przepisu</h1>
            <p class="page-header__desc">Mógł zostać usunięty. Edytować można tylko własne posiłki.</p>
        </header>
        <a href="/recipes" class="btn btn--secondary" data-link>Wróć do przepisów</a>
    </main>
`;

export const renderMealBuilder = () => {
    const { isEdit, recipe } = getEditContext();
    if (isEdit && !recipe) return renderMissingRecipe();

    return html`
    <main class="page-container builder">
        <nav class="builder__nav">
            <a href="/recipes" class="btn-icon-text" data-link>
                <i data-lucide="arrow-left" aria-hidden="true"></i>
                Przepisy
            </a>
        </nav>

        <header class="page-header">
            <h1 class="page-header__title">${isEdit ? "Edytuj posiłek" : "Nowy posiłek"}</h1>
            <p class="page-header__desc">
                ${isEdit
                    ? "Popraw nazwę, porę albo składniki — makro przeliczy się samo."
                    : "Wybierz produkty i podaj ilość — w gramach, łyżkach albo sztukach."}
            </p>
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
                    <button type="button" class="btn btn--primary" id="builder-create">
                        ${isEdit ? "Zapisz zmiany" : "Stwórz posiłek"}
                    </button>
                </div>
            </section>
        </div>

        <section id="builder-success" class="builder-success paper is-hidden" aria-labelledby="builder-success-title"></section>

        <p class="visually-hidden" id="builder-status" role="status" aria-live="polite"></p>
    </main>
`;
};

const generateResultsHTML = (products, expandedId) =>
    products
        .map((product) => {
            const isExpanded = product.id === expandedId;
            const formId = `amount-form-${product.id}`;
            const hasPortions = Boolean(product.portions?.length);

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
                                  <label for="amount-input" class="form__label">${hasPortions ? "Ilość" : "Ilość (g)"}</label>
                                  <div class="product-result__row">
                                      <input
                                          type="number"
                                          id="amount-input"
                                          class="form__input product-result__amount"
                                          min="0"
                                          step="any"
                                          inputmode="decimal"
                                          aria-describedby="amount-preview"
                                      />
                                      ${hasPortions
                                          ? html`
                                                <label for="unit-select" class="visually-hidden">Jednostka</label>
                                                <select id="unit-select" class="form__input product-result__unit">
                                                    ${product.portions
                                                        .map(
                                                            (portion, index) =>
                                                                `<option value="${index}" ${index === 0 ? "selected" : ""}>${portion.label} (${formatNumber(portion.grams)} g)</option>`,
                                                        )
                                                        .join("")}
                                                    <option value="${UNIT_GRAMS}">gramy</option>
                                                </select>
                                            `
                                          : ""}
                                      <button type="submit" class="btn btn--primary">Dodaj</button>
                                  </div>
                                  <p class="form__note" id="amount-preview">
                                      ${describeAmount(product, product.portions?.[0] ?? null, 0)}
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
            Jeszcze nic tu nie ma. Wyszukaj produkt, podaj ilość i kliknij „Dodaj".
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
    <div class="builder-totals__item"><dt>Węgle netto</dt><dd>${getNetCarbs(totals)} g</dd></div>
`;

const generateSuccessHTML = (recipe, isEdit) => html`
    <span class="stamp builder-success__stamp">Zapisano</span>
    <h2 class="builder-success__title" id="builder-success-title" tabindex="-1">${escapeHtml(recipe.title)}</h2>
    <p class="builder-success__meta">${formatMacroLine(recipe)}</p>
    <p class="builder-success__text" id="builder-success-text">
        ${isEdit ? "Zmiany zapisane w Twoim przepisie." : "Posiłek jest teraz na liście przepisów jako Twój własny."}
    </p>
    <div class="builder__actions">
        <a href="/recipes" class="btn btn--secondary builder__cancel" data-link>Zobacz w przepisach</a>
        <button type="button" class="btn btn--primary" id="builder-add-to-day">Dodaj do dziś</button>
    </div>
`;

export const initMealBuilder = () => {
    const { isEdit, recipe: editedRecipe } = getEditContext();
    if (isEdit && !editedRecipe) return; // render pokazał "Nie ma takiego przepisu"
    const editId = editedRecipe?.id ?? null;

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

    // Punkt wyjścia: niedokończony szkic > zapisany przepis (edycja) > pusty kreator.
    const initial = getMealDraft(editId) ?? editedRecipe;

    // Jedyny stan kreatora. Wszystko na ekranie jest z niego wyliczane.
    // Składniki kopiujemy: addIngredient zmienia `grams` w miejscu, a nie wolno
    // ruszyć obiektu przepisu, zanim użytkownik kliknie "Zapisz zmiany".
    const state = {
        title: initial?.title ?? "",
        category: initial?.category ?? guessCategory(),
        ingredients: (initial?.ingredients ?? []).map((item) => ({ ...item })),
        expandedId: null,
    };

    titleInput.value = state.title;
    categorySelect.value = state.category;

    const persistDraft = () => saveMealDraft(state, editId);

    // Czy jest co stracić przy "Anuluj"? Nowy posiłek: cokolwiek wpisano.
    // Edycja: cokolwiek różni się od zapisanego przepisu.
    const snapshotForm = ({ title, category, ingredients }) => JSON.stringify({ title: title.trim(), category, ingredients });
    const hasUnsavedWork = () =>
        isEdit
            ? snapshotForm(state) !== snapshotForm(editedRecipe)
            : Boolean(state.title.trim() || state.ingredients.length > 0);

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
        // Zaokrąglenie do 0,1 g: miary dają ułamki (4,7 + 4,7 + 4,7), a JS sumuje je
        // z ogonkiem w stylu 14,100000000000001.
        const existing = state.ingredients.find((item) => item.productId === productId);
        if (existing) {
            existing.grams = Math.round((existing.grams + grams) * 10) / 10;
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
            document.getElementById("amount-input")?.focus();
        } else {
            resultsList.querySelector(`[data-id="${productId}"] .product-result__toggle`)?.focus();
        }
    });

    // Podgląd makro na żywo — przy wpisywaniu ilości i przy zmianie jednostki
    // (<select> też wysyła zdarzenie "input", więc jeden listener obsługuje oba pola).
    resultsList.addEventListener("input", (event) => {
        if (event.target.id !== "amount-input" && event.target.id !== "unit-select") return;

        const product = getProductById(state.expandedId);
        const preview = document.getElementById("amount-preview");
        if (!product || !preview) return;

        const portion = getSelectedPortion(product, document.getElementById("unit-select"));
        preview.textContent = describeAmount(product, portion, Number(document.getElementById("amount-input").value));
    });

    resultsList.addEventListener("submit", (event) => {
        event.preventDefault();

        const product = getProductById(state.expandedId);
        if (!product) return;

        const amountInput = document.getElementById("amount-input");
        const portion = getSelectedPortion(product, document.getElementById("unit-select"));
        const count = Number(amountInput.value);
        // Do przepisu trafiają zawsze gramy — miara to tylko sposób ich wpisania.
        const grams = portion ? portionToGrams(portion, count) : count;

        if (!(count > 0 && grams > 0 && grams <= MAX_GRAMS)) {
            document.getElementById("amount-preview").textContent = portion
                ? `Podaj liczbę większą od zera (łącznie maks. ${MAX_GRAMS} g).`
                : `Podaj ilość od 1 do ${MAX_GRAMS} g.`;
            amountInput.focus();
            return;
        }

        addIngredient(product.id, grams);
        hideError();
        announce(
            portion
                ? `Dodano: ${product.name}, ${formatNumber(count)} × ${portion.label} (${formatNumber(grams)} g).`
                : `Dodano: ${product.name}, ${formatNumber(grams)} g.`,
        );

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
        const leave = () => {
            clearMealDraft(editId);
            navigateTo("/recipes");
        };

        if (!hasUnsavedWork()) {
            leave();
            return;
        }

        showConfirmModal({
            title: isEdit ? "Porzucić zmiany?" : "Porzucić ten posiłek?",
            message: isEdit
                ? "Przepis zostanie taki, jak przed edycją."
                : "Nazwa i dodane składniki zostaną usunięte.",
            confirmLabel: "Porzuć",
            cancelLabel: "Wróć do edycji",
            onConfirm: leave,
        });
    });

    const showSuccess = (recipe) => {
        successView.innerHTML = generateSuccessHTML(recipe, isEdit);
        builderView.classList.add("is-hidden");
        successView.classList.remove("is-hidden");
        document.getElementById("builder-success-title").focus();

        // Toast ma własny region role="status" — osobny announce() czytałby to samo dwa razy.
        document.getElementById("builder-add-to-day").addEventListener("click", (event) => {
            addRecipeToDay(recipe, event.currentTarget);
        });
    };

    // Po edycji: wpisy w dzienniku to kopie (snapshot), więc same się nie zmienią.
    // Jeśli przepis jest w dzisiejszym dzienniku — pytamy, czy je poprawić.
    // Wcześniejsze dni zostają bez zmian niezależnie od odpowiedzi.
    const offerTodayUpdate = (recipe) => {
        const todayCount = countTodayMealsByRecipe(recipe.id);
        if (todayCount === 0) return;

        showConfirmModal({
            title: "Poprawić też dzisiejszy wpis?",
            message: `Ten posiłek jest dziś w dzienniku${todayCount > 1 ? ` (${todayCount}×)` : ""} ze starymi wartościami. Wcześniejsze dni zostaną bez zmian.`,
            confirmLabel: "Popraw wpis",
            cancelLabel: "Zostaw",
            onConfirm: async () => {
                const { error } = await updateTodayMealsFromRecipe(recipe);
                document.getElementById("builder-success-text").textContent = error
                    ? `Przepis zapisany, ale dzisiejszego wpisu nie udało się poprawić. ${error}`
                    : "Zmiany zapisane w przepisie i w dzisiejszym dzienniku.";
            },
        });
    };

    const createButton = document.getElementById("builder-create");
    createButton.addEventListener("click", async () => {
        if (createButton.disabled) return;
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

        const formData = { title, category: state.category, ingredients: state.ingredients };

        // Zalogowany czeka na bazę — blokada chroni przed dwoma przepisami z dwóch kliknięć.
        const idleLabel = createButton.textContent;
        createButton.disabled = true;
        createButton.textContent = "Zapisuję…";
        const { recipe, error } = isEdit
            ? await updateCustomRecipe(editId, formData)
            : await createCustomRecipe(formData);
        createButton.disabled = false;
        createButton.textContent = idleLabel;

        // Szkic zostaje przy błędzie — nic z wpisanego składu nie przepada.
        if (error) {
            showError(error);
            return;
        }

        if (!isEdit) {
            clearMealDraft();
            showSuccess(recipe);
            return;
        }

        if (!recipe) {
            // Przepis zniknął w międzyczasie (np. usunięty w innej karcie) — nie udajemy sukcesu.
            showError("Tego przepisu już nie ma — mógł zostać usunięty. Wróć do przepisów.");
            return;
        }
        clearMealDraft(editId);
        showSuccess(recipe);
        offerTodayUpdate(recipe);
    });

    renderIngredients();
};
