import { html } from "../utils/template.js";
import { getBase } from "../utils/env.js";

export const renderHome = () => {
    return html`
        <main>
            <!-- 1. HERO SECTION -->
            <section class="hero paper">
            <span class="hero__stamp stamp">SEZON 01</span>
                <div class="hero__container page-container">
                    <div class="hero__content">
                        <h1 class="hero__title">
                            <span class="hero__title-sub">TWOJE CIAŁO</span>
                            <span class="hero__title-sub">TWOJA WALKA</span>
                        </h1>
                        <p class="hero__tag tag">Kalkulator makro i przepisy keto — dla aktywnych i dla tych, którzy dopiero zaczynają</p>
                        <p class="hero__desc">
                            Stabilna energia, zero zjazdów mocy — metoda wykuta w 15 latach treningu Muay Thai
                            i dopracowana w tajskich campach, przełożona na precyzyjny plan makro i sprawdzone
                            przepisy. Bez rejestracji, wynik od razu.
                        </p>
                        <div class="hero__actions">
                            <a href="/dashboard" class="btn btn--primary" data-link>Oblicz swój plan</a>
                            <a href="#steps" class="btn btn--secondary">Zobacz, jak to działa</a>
                        </div>
                    </div>

                    <div class="hero__media">
                        <div class="hero__photo-card">
                            <span class="tape tape--tl" aria-hidden="true"></span>
                            <span class="tape tape--br" aria-hidden="true"></span>
                            <img
                                src="${getBase()}/src/assets/homePicture.jpg"
                                alt="Trening Muay Thai"
                                class="hero__photo"
                            />
                            <figcaption class="hero__caption mono">FOTO 01 — LAMAI CAMP, KOH SAMUI</figcaption>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 2. PHILOSOPHY SECTION -->
            <section class="philosophy">
                <div class="philosophy__container container">
                    <h2 class="philosophy__title reveal">Dlaczego Keto Thai?</h2>
                    <span class="philosophy__kicker tag">3 filary systemu</span>
                    <div class="philosophy__grid">
                        <!-- KARTA 1 -->
                        <article class="philosophy__card philosophy__card--scorecard reveal">
                            <header class="philosophy__card-header">
                                <i data-lucide="beef" class="philosophy__naked-icon"></i>
                              
                            </header>
                            <h3 class="philosophy__card-title">Czyste Paliwo</h3>
                            <p class="philosophy__card-desc">
                                Przeprogramuj organizm na spalanie tłuszczu. Stabilna energia i brak zjazdów cukrowych.
                            </p>
                            <div class="philosophy__mockup">
                                <span class="mockup__label">ROZKŁAD MAKRO</span>
                                <div class="macro-bar">
                                    <div class="macro-segment macro-segment--fat" style="width: 70%"></div>
                                    <div class="macro-segment macro-segment--protein" style="width: 20%"></div>
                                    <div class="macro-segment macro-segment--carbs" style="width: 10%"></div>
                                </div>
                            </div>
                        </article>

                        <!-- KARTA 2 -->
                        <article class="philosophy__card philosophy__card--note reveal">
                            <header class="philosophy__card-header">
                                <i data-lucide="brain" class="philosophy__naked-icon"></i>
                            </header>
                            <h3 class="philosophy__card-title">Umysł Wojownika</h3>
                            <p class="philosophy__card-desc">
                                Dyscyplina, którą wykułem na tajskich matach. Ten sam reżim buduje w Tobie charakter,
                                który nie odpuszcza — w treningu i przy każdym posiłku.
                            </p>
                            <div class="philosophy__mockup">
                                <span class="mockup__label">SERIA [PRZYKŁAD]</span>
                                <div class="streak-grid">
                                    <div class="streak-box is-active"></div>
                                    <div class="streak-box is-active"></div>
                                    <div class="streak-box is-active"></div>
                                    <div class="streak-box is-active"></div>
                                    <div class="streak-box is-active"></div>
                                    <div class="streak-box"></div>
                                    <div class="streak-box"></div>
                                </div>
                            </div>
                        </article>

                        <!-- KARTA 3 -->
                        <article class="philosophy__card reveal">
                            <header class="philosophy__card-header">
                                <i data-lucide="line-chart" class="philosophy__naked-icon"></i>
                            </header>
                            <h3 class="philosophy__card-title">Pełna Kontrola</h3>
                            <p class="philosophy__card-desc">
                                Panel analityczny monitoruje Twoje makro i wagę z precyzją. Zawsze wiesz, gdzie jesteś.
                            </p>
                            <div class="philosophy__mockup philosophy__mockup--stamped">
                                <span class="mockup__label">METRYKA</span>
                                <div class="metrics-grid">
                                    <div class="metric-box">
                                        <span class="metric-value">2450</span>
                                        <span class="metric-unit">KCAL</span>
                                    </div>
                                    <div class="metric-box">
                                        <span class="metric-value">-0.8</span>
                                        <span class="metric-unit">KG/TYDZ</span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            <!-- 3. ABOUT & GALLERY SECTION -->
            <section class="about">
                <div class="about__container container">
                    <div class="about__layout reveal">
                        <!-- Lewa Kolumna: Tekst -->
                        <div class="about__content">
                            <h2 class="about__title">Z tajskiej maty do Twojej kuchni</h2>
                            <span class="about__kicker tag">Historia i filozofia</span>
                            <p class="about__desc">
                                Przez lata trenowałem sztuki walki, szukając idealnego sposobu na budowanie formy i
                                zbijanie wagi przed startami. Klasyczne diety często kończyły się spadkiem mocy i
                                frustracją.
                            </p>
                            <p class="about__desc">
                                Przełom nastąpił, gdy połączyłem
                                <strong>żelazny reżim Muay Thai z dietą ketogeniczną</strong>. Właśnie ten system
                                szlifowałem trenując w <strong>Lamai Muay Thai Camp na Koh Samui</strong>, czerpiąc
                                wiedzę od najlepszych.
                            </p>
                            <p class="about__desc">
                                Stworzyłem aplikację Keto Thai, żeby dać Ci gotowe,
                                <strong>sprawdzone na własnej skórze</strong>
                                narzędzie. Bez wymówek, z konkretnymi wynikami.
                            </p>
                            <div class="about__author">
                                <div class="about__author-name">Konrad Jacoszek</div>
                                <div class="about__author-role">Instruktor Muay Thai (MEN) · dietetyka kliniczna (w trakcie)</div>
                            </div>
                        </div>

                        <!-- Prawa Kolumna: Galeria -->
                        <div class="about__gallery">
                            <div class="about__image-wrapper">
                                <img
                                    src="${getBase()}/src/assets/kopniak w tarcze.jpg"
                                    alt="Trening Muay Thai"
                                    class="about__image"
                                    loading="lazy"
                                />
                                <span class="about__image-caption mono">FOTO 02 — TRENING, LAMAI CAMP</span>
                            </div>
                            <div class="about__image-wrapper">
                                <img
                                    src="https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=600"
                                    alt="Keto jedzenie"
                                    class="about__image"
                                    loading="lazy"
                                />
                                <span class="about__image-caption mono">FOTO 03 — KUCHNIA KETO</span>
                            </div>
                            <div class="about__image-wrapper">
                                <img
                                    src="https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=600"
                                    alt="Walka w ringu"
                                    class="about__image"
                                    loading="lazy"
                                />
                                <span class="about__image-caption mono">FOTO 04 — WALKA W RINGU</span>
                            </div>
                        </div>
                    </div>

                    <div class="years-proof reveal">
                        <h3 class="years-proof__title">Bez efektu jo-jo od lat</h3>
                        <span class="years-proof__kicker tag">Ta sama forma, różne lata</span>
                        <div class="years-proof__strip">
                            <div class="years-proof__item">
                                <div class="years-proof__photo-card">
                                    <div class="years-proof__snap"></div>
                                </div>
                                <span class="years-proof__caption mono">FOTO 05 — [ROK] (do uzupełnienia)</span>
                            </div>
                            <div class="years-proof__item">
                                <div class="years-proof__photo-card">
                                    <div class="years-proof__snap"></div>
                                </div>
                                <span class="years-proof__caption mono">FOTO 06 — [ROK] (do uzupełnienia)</span>
                            </div>
                            <div class="years-proof__item">
                                <div class="years-proof__photo-card">
                                    <div class="years-proof__snap"></div>
                                </div>
                                <span class="years-proof__caption mono">FOTO 07 — [ROK] (do uzupełnienia)</span>
                            </div>
                            <div class="years-proof__item">
                                <div class="years-proof__photo-card">
                                    <div class="years-proof__snap"></div>
                                </div>
                                <span class="years-proof__caption mono">FOTO 08 — [ROK] (do uzupełnienia)</span>
                            </div>
                            <div class="years-proof__item">
                                <div class="years-proof__photo-card">
                                    <div class="years-proof__snap"></div>
                                </div>
                                <span class="years-proof__caption mono">FOTO 09 — [ROK] (do uzupełnienia)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 4. STEPS -->

            <section class="steps" id="steps">
                <div class="steps__container container">
                    <h2 class="steps__title reveal">Twój plan działania</h2>

                    <div class="timeline">
                        <!-- Wpis 01 (Onboarding) -->
                        <div class="timeline__item reveal">
                            <div class="timeline__content reveal reveal--left">
                                <h3 class="timeline__subtitle">Oblicz swoje makro</h3>
                                <span class="timeline__step-num">Krok 1</span>
                                <p class="timeline__desc">
                                    Koniec ze zgadywaniem. Wypełnij krótki kwestionariusz, a nasz system wyliczy
                                    dokładne zapotrzebowanie na czyste, ketogeniczne paliwo na podstawie Twojego celu.
                                </p>
                            </div>

                            <div class="timeline__visual reveal reveal--right">
                                <!-- Podmień ścieżkę do swojego zdjęcia Onboardingu -->
                                <span class="tape tape--tl" aria-hidden="true"></span>
                                <span class="tape tape--br" aria-hidden="true"></span>
                                <img
                                    src="${getBase()}/src/assets/iphonMobileOnboarding.png"
                                    alt="Widok kwestionariusza aplikacji"
                                    class="timeline__image"
                                />
                            </div>
                        </div>

                        <!-- Wpis 02 (Przepisy) -->
                        <div class="timeline__item reveal">
                            <div class="timeline__content reveal reveal--left">
                                <h3 class="timeline__subtitle">Odkrywaj keto smaki</h3>
                                <span class="timeline__step-num">Krok 2</span>
                                <p class="timeline__desc">
                                    Otrzymujesz dostęp do bazy tajskich i klasycznych dań. Filtruj posiłki po kaloriach
                                    i kategoriach, by zawsze trzymać się wytyczonego planu.
                                </p>
                            </div>

                            <div class="timeline__visual reveal reveal--right">
                                <!-- Podmień ścieżkę do swojego zdjęcia Przepisów -->
                                <span class="tape tape--tl" aria-hidden="true"></span>
                                <span class="tape tape--br" aria-hidden="true"></span>
                                <img
                                    src="${getBase()}/src/assets/iphonMobileRecipes.png"
                                    alt="Widok bazy przepisów w aplikacji"
                                    class="timeline__image"
                                />
                            </div>
                        </div>

                        <!-- Wpis 03 (Dashboard) -->
                        <div class="timeline__item reveal">
                            <div class="timeline__content reveal reveal--left">
                                <h3 class="timeline__subtitle">Śledź swój progres</h3>
                                <span class="timeline__step-num">Krok 3</span>
                                <p class="timeline__desc">
                                    Zapisuj wagę, analizuj wykresy i obserwuj, jak Twoje ciało staje się maszyną do
                                    spalania tłuszczu. Liczby na Twoim Dashboardzie nie kłamią.
                                </p>
                            </div>

                            <div class="timeline__visual reveal reveal--right">
                                <!-- Podmień ścieżkę do swojego zdjęcia Dashboardu -->
                                <span class="tape tape--tl" aria-hidden="true"></span>
                                <span class="tape tape--br" aria-hidden="true"></span>
                                <img
                                    src="${getBase()}/src/assets/iphonMobileDashboard.png"
                                    alt="Widok wykresów progresu"
                                    class="timeline__image"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 5. CAMP OFFER SECTION -->

            <section class="camp-offer">
                <div class="camp-offer__container container">
                    <div class="camp-offer__card reveal">
                        <div class="camp-offer__content">
                            <span class="camp-offer__stamp stamp">Program Hybrydowy</span>

                            <div class="camp-offer__weeks">
                                <span class="camp-offer__weeks-num">12</span>
                                <span class="camp-offer__weeks-unit">Tygodni<br />Transformacji</span>
                            </div>

                            <h2 class="camp-offer__title">12-Tygodniowy Fighter's Camp</h2>
                            <p class="camp-offer__desc">
                                To nie kolejna apka z licznikiem kalorii. Codzienny kontakt, cotygodniowa analiza
                                wideo i korekta makro w czasie rzeczywistym — dokładnie tak, jak rozliczam
                                zawodników na macie.
                            </p>
                            <ul class="camp-offer__list">
                                <li>
                                    <i data-lucide="message-circle" class="camp-offer--icon"></i>Codzienny kontakt i rozliczanie
                                </li>
                                <li>
                                    <i data-lucide="video" class="camp-offer--icon"></i>Cotygodniowa sesja wideo (30 min)
                                </li>
                                <li>
                                    <i data-lucide="activity" class="camp-offer--icon"></i>Korekta makro w czasie rzeczywistym
                                </li>
                            </ul>

                            <a data-link href="/camp" class="btn btn--primary camp-offer__btn">Aplikuj do Campu</a>
                        </div>

                        <div class="camp-offer__image">
                            <img
                                src="${getBase()}/src/assets/homePicture.jpg"
                                alt="Muay Thai Fighter"
                                class="camp-offer__img"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <!-- 6 FAQ SECTION -->

            <section class="faq">
                <div class="faq__container container">
                    <h2 class="faq__title reveal">Najczęściej zadawane pytania</h2>

                    <div class="accordion">
                        <div class="accordion__item">
                            <button class="accordion__header">
                                <span class="accordion__question">Czym właściwie jest dieta ketogeniczna?</span>
                                <i data-lucide="chevron-down" class="accordion__icon"></i>
                            </button>

                            <div class="accordion__content">
                                <p class="accordion__answer">
                                    To sposób odżywiania, który przestawia organizm z czerpania energii z węglowodanów
                                    na spalanie tłuszczu (stan ketozy) — bardzo niska podaż węglowodanów, wysoka
                                    tłuszczów, umiarkowana białka.
                                </p>
                            </div>
                        </div>

                        <div class="accordion__item">
                            <button class="accordion__header">
                                <span class="accordion__question">Czy dieta keto jest bezpieczna?</span>
                                <i data-lucide="chevron-down" class="accordion__icon"></i>
                            </button>

                            <div class="accordion__content">
                                <p class="accordion__answer">
                                    Tak , o ile jest prowadzona z głową. Mam w tym kilku letnie doświadczenie.
                                </p>
                            </div>
                        </div>

                        <div class="accordion__item">
                            <button class="accordion__header">
                                <span class="accordion__question"
                                    >Czy na keto nie spadnie mi moc i szybkość na sparingach / treningach?</span
                                >
                                <i data-lucide="chevron-down" class="accordion__icon"></i>
                            </button>

                            <div class="accordion__content">
                                <p class="accordion__answer">
                                    Wręcz przeciwnie – po okresie adaptacji organizm czerpie stabilną energię z tłuszczu
                                    bez nagłych "zjazdów energetycznych" i wahań glukozy.
                                </p>
                            </div>
                        </div>

                        <div class="accordion__item">
                            <button class="accordion__header">
                                <span class="accordion__question">Dla kogo jest aplikacja</span>
                                <i data-lucide="chevron-down" class="accordion__icon"></i>
                            </button>

                            <div class="accordion__content">
                                <p class="accordion__answer">
                                    Dla każdego kto chce zadbać o swoje zdrowie , zgubić tkanke tłuszczową oraz poprawić
                                    swoje wyniki sportowe.
                                </p>
                            </div>
                        </div>

                        <div class="accordion__item">
                            <button class="accordion__header">
                                <span class="accordion__question"
                                    >Słyszałem o tzw. "Keto Flu" (grypie ketogenicznej). Jak tego uniknąć?</span
                                >
                                <i data-lucide="chevron-down" class="accordion__icon"></i>
                            </button>

                            <div class="accordion__content">
                                <p class="accordion__answer">
                                    Kluczem jest odpowiednia podaż sodu, potasu i magnezu, co nasz system i przepisy
                                    uwzględniają od pierwszego dnia.
                                </p>
                            </div>
                        </div>

                        <div class="accordion__item">
                            <button class="accordion__header">
                                <span class="accordion__question"
                                    >Czy na diecie keto można skutecznie budować beztłuszczową masę mięśniową?</span
                                >
                                <i data-lucide="chevron-down" class="accordion__icon"></i>
                            </button>

                            <div class="accordion__content">
                                <p class="accordion__answer">
                                    Tak, odpowiednia podaż białka (ok. 2g/kg m.c.) w połączeniu z nadwyżką kaloryczną
                                    zapewnia optymalne środowisko anaboliczne.
                                </p>
                            </div>
                        </div>

                        <div class="accordion__item">
                            <button class="accordion__header">
                                <span class="accordion__question"
                                    >Dlaczego warto korzystać z Keto Thai zamiast zwykłego licznika kalorii?</span
                                >
                                <i data-lucide="chevron-down" class="accordion__icon"></i>
                            </button>

                            <div class="accordion__content">
                                <p class="accordion__answer">
                                    Nasz kalkulator opiera się na specyfice sportów o wysokiej intensywności,
                                    automatycznie wylicza sztywny keto-split i daje gotowe, przetestowane receptury.
                                </p>
                            </div>
                        </div>

                        <div class="accordion__item">
                            <button class="accordion__header">
                                <span class="accordion__question">Czy aplikacja jest płatna?</span>
                                <i data-lucide="chevron-down" class="accordion__icon"></i>
                            </button>

                            <div class="accordion__content">
                                <p class="accordion__answer">
                                    Kalkulator, przepisy i tracker są całkowicie darmowe. Jeśli chcesz przyspieszyć
                                    efekty pod moim okiem, oferuję dodatkowo płatny 12-tygodniowy Fighter's Camp
                                    z indywidualnym mentoringiem.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    `;
};

export const initHome = () => {
    const revealElements = document.querySelectorAll(".reveal");

    const scrollObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("reveal--visible");
                    scrollObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    revealElements.forEach((el) => scrollObserver.observe(el));

    const accordionBtns = document.querySelectorAll(".accordion__header");

    accordionBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            btn.parentElement.classList.toggle("is-active");
        });
    });

    const yearsStrip = document.querySelector(".years-proof__strip");

    if (yearsStrip) {
        yearsStrip.addEventListener(
            "wheel",
            (event) => {
                if (event.deltaY === 0) return;
                event.preventDefault();
                yearsStrip.scrollLeft += event.deltaY;
            },
            { passive: false },
        );
    }
};
