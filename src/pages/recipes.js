import { html } from "../utils/template.js";

const RECIPES_DATA = [
    // --- ŚNIADANIA (10) ---
    {
        id: "r1",
        title: "Keto Omlet po Tajsku",
        category: "śniadanie",
        calories: 420,
        protein: 25,
        fats: 32,
        carbs: 4,
        imageUrl: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r2",
        title: "Jajka Sadzone na Boczku",
        category: "śniadanie",
        calories: 550,
        protein: 30,
        fats: 45,
        carbs: 2,
        imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r3",
        title: "Awokado Zapiekane z Jajkiem",
        category: "śniadanie",
        calories: 380,
        protein: 14,
        fats: 34,
        carbs: 6,
        imageUrl: "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r4",
        title: "Keto Naleśniki Migdałowe",
        category: "śniadanie",
        calories: 410,
        protein: 18,
        fats: 36,
        carbs: 5,
        imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r5",
        title: "Szakszuka z Oliwkami",
        category: "śniadanie",
        calories: 350,
        protein: 16,
        fats: 28,
        carbs: 8,
        imageUrl: "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r6",
        title: "Łosoś Wędzony z Serkiem",
        category: "śniadanie",
        calories: 460,
        protein: 28,
        fats: 38,
        carbs: 3,
        imageUrl: "https://images.unsplash.com/photo-1519340088954-20235e808298?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r7",
        title: "Keto Owsianka Kokosowa",
        category: "śniadanie",
        calories: 390,
        protein: 12,
        fats: 35,
        carbs: 7,
        imageUrl: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r8",
        title: "Jajecznica na Maśle z Kurkami",
        category: "śniadanie",
        calories: 480,
        protein: 22,
        fats: 42,
        carbs: 4,
        imageUrl: "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r9",
        title: "Keto Tosty z Guacamole",
        category: "śniadanie",
        calories: 440,
        protein: 15,
        fats: 40,
        carbs: 6,
        imageUrl: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r10",
        title: "Muffiny Jajeczne ze Szpinakiem",
        category: "śniadanie",
        calories: 320,
        protein: 24,
        fats: 22,
        carbs: 3,
        imageUrl: "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?auto=format&fit=crop&q=80&w=800",
    },

    // --- OBIADY (10) ---
    {
        id: "r11",
        title: "Keto Pad Thai z Kurczakiem",
        category: "obiad",
        calories: 650,
        protein: 42,
        fats: 50,
        carbs: 8,
        imageUrl: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r12",
        title: "Czerwone Curry na Mleku Kokosowym",
        category: "obiad",
        calories: 520,
        protein: 38,
        fats: 40,
        carbs: 6,
        imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r13",
        title: "Sałatka Wołowa Yum Nua",
        category: "obiad",
        calories: 480,
        protein: 45,
        fats: 32,
        carbs: 4,
        imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r14",
        title: "Krewetki w Sosie Czosnkowym",
        category: "obiad",
        calories: 410,
        protein: 35,
        fats: 28,
        carbs: 5,
        imageUrl: "https://images.unsplash.com/photo-1548943487-a2e4d43b4859?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r15",
        title: "Zupa Tom Kha Gai (Keto)",
        category: "obiad",
        calories: 490,
        protein: 30,
        fats: 42,
        carbs: 7,
        imageUrl: "https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r16",
        title: "Burger Keto w Liściu Sałaty",
        category: "obiad",
        calories: 720,
        protein: 48,
        fats: 58,
        carbs: 4,
        imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r17",
        title: "Skrzydełka Złociste (Air Fryer)",
        category: "obiad",
        calories: 600,
        protein: 40,
        fats: 48,
        carbs: 2,
        imageUrl: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r18",
        title: "Keto Pizza Krewetkowa (Spód Kalafior)",
        category: "obiad",
        calories: 550,
        protein: 38,
        fats: 42,
        carbs: 9,
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r19",
        title: "Schabowy w Panierce z Wieprzowiny",
        category: "obiad",
        calories: 680,
        protein: 55,
        fats: 48,
        carbs: 1,
        imageUrl: "https://images.unsplash.com/photo-1599921841143-819065a55cc6?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r20",
        title: "Keto Lazania z Cukinii",
        category: "obiad",
        calories: 510,
        protein: 42,
        fats: 35,
        carbs: 8,
        imageUrl: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=800",
    },

    // --- KOLACJE (10) ---
    {
        id: "r21",
        title: "Stek z Rostbefu z Masłem Ziołowym",
        category: "kolacja",
        calories: 750,
        protein: 60,
        fats: 55,
        carbs: 0,
        imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r22",
        title: "Sałatka z Tuńczykiem i Oliwkami",
        category: "kolacja",
        calories: 380,
        protein: 32,
        fats: 26,
        carbs: 4,
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r23",
        title: "Szaszłyki Wieprzowe Satay",
        category: "kolacja",
        calories: 540,
        protein: 45,
        fats: 38,
        carbs: 5,
        imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r24",
        title: "Pieczony Łosoś ze Szparagami",
        category: "kolacja",
        calories: 490,
        protein: 40,
        fats: 35,
        carbs: 4,
        imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r25",
        title: "Keto Taco Bowl (Wołowina)",
        category: "kolacja",
        calories: 620,
        protein: 48,
        fats: 45,
        carbs: 6,
        imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r26",
        title: "Tajski Bulion z Makaronem Konjac",
        category: "kolacja",
        calories: 280,
        protein: 20,
        fats: 22,
        carbs: 2,
        imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r27",
        title: "Sałatka z Burratą i Pesto",
        category: "kolacja",
        calories: 450,
        protein: 18,
        fats: 42,
        carbs: 5,
        imageUrl: "https://images.unsplash.com/photo-1529312266912-b33cfce2eefd?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r28",
        title: "Keto Sushi (Ryż z Kalafiora)",
        category: "kolacja",
        calories: 390,
        protein: 22,
        fats: 30,
        carbs: 8,
        imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r29",
        title: "Ser Halloumi z Grilla z Cukinią",
        category: "kolacja",
        calories: 510,
        protein: 28,
        fats: 42,
        carbs: 5,
        imageUrl: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: "r30",
        title: "Roladki z Kurczaka z Boczkiem",
        category: "kolacja",
        calories: 580,
        protein: 50,
        fats: 40,
        carbs: 2,
        imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800",
    },
];

export const renderRecipes = () => {
    return html` <main class="page-container">
        <header class="page-header">
            <h1 class="page-header__title">Przepisy Keto</h1>
            <p class="page-header__desc">Tluste smaki ,metaboliczna dyscyplina</p>
        </header>

        <div class="filters">
            <button class="filter-btn is-active" data-category="all">Wszystkie</button>
            <button class="filter-btn" data-category="śniadanie">Śniadanie</button>
            <button class="filter-btn" data-category="obiad">Obiad</button>
            <button class="filter-btn" data-category="kolacja">Kolacja</button>
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

            gridLayout.innerHTML = generateCardsHTML(newRecipes);

            if (window.lucide) {
                window.lucide.createIcons();
            }
        });
    });
};
