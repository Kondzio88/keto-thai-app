import { html } from "../utils/template.js";

export const renderHome = () => {
    return html`
        <main>
            <!-- 1. HERO SECTION -->
            <section class="hero">
                <div class="hero__content">
                    <h1 class="hero__title">Forma życia czeka na Ciebie</h1>
                    <p class="hero__desc">Nowy Ty w zdrowym, metabolicznym stylu Keto Thai.</p>
                    <div class="hero__actions">
                        <a href="/dashboard" class="btn btn--primary" data-link>Twój Dashboard</a>
                        <a href="/recipes" class="btn btn--secondary" data-link>Przepisy Keto</a>
                    </div>
                </div>
            </section>

            <!-- 2. PHILOSOPHY SECTION -->
            <section class="philosophy">
                <div class="philosophy__container container">
                    <h2 class="philosophy__title">Dlaczego Keto Thai?</h2>
                    <div class="philosophy__grid">
                        
                        <article class="philosophy__card philosophy__card--keto">
                            <div class="philosophy__card-header">
                                <i data-lucide="beef" class="philosophy__card-icon"></i>
                                <h3 class="philosophy__card-title">Czyste Paliwo</h3>
                            </div>
                            <p class="philosophy__card-desc">
                                Przeprogramuj swój organizm na spalanie tłuszczu. Stabilna energia przez cały dzień, brak zjazdów cukrowych i jedzenie, które smakuje obłędnie.
                            </p>
                        </article>

                        <article class="philosophy__card philosophy__card--fight">
                            <div class="philosophy__card-header">
                                <i data-lucide="brain" class="philosophy__card-icon"></i>
                                <h3 class="philosophy__card-title">Umysł Wojownika</h3>
                            </div>
                            <p class="philosophy__card-desc">
                                Czerpiemy dyscyplinę prosto z obozów Muay Thai. Budujemy charakter i wytrzymałość, która nie poddaje się ani na macie, ani w życiu.
                            </p>
                        </article>

                        <article class="philosophy__card philosophy__card--track">
                            <div class="philosophy__card-header">
                                <i data-lucide="line-chart" class="philosophy__card-icon"></i>
                                <h3 class="philosophy__card-title">Pełna Kontrola</h3>
                            </div>
                            <p class="philosophy__card-desc">
                                Nie musisz zgadywać. Nasz panel analityczny pozwala Ci śledzić makroskładniki i wagę z precyzją, byś zawsze był na właściwym kursie.
                            </p>
                        </article>

                    </div>
                </div>
            </section>

            <!-- 3. ABOUT & GALLERY SECTION -->
            <section class="about">
                <div class="about__container container">
                    <div class="about__layout">
                        
                        <!-- Lewa Kolumna: Tekst -->
                        <div class="about__content">
                            <h2 class="about__title">Z tajskiej maty do Twojej kuchni</h2>
                            <p class="about__desc">
                                Przez lata trenowałem sztuki walki, szukając idealnego sposobu na budowanie formy i zbijanie wagi przed startami. Klasyczne diety często kończyły się spadkiem mocy i frustracją.
                            </p>
                            <p class="about__desc">
                                Przełom nastąpił, gdy połączyłem żelazny reżim Muay Thai z dietą ketogeniczną. Właśnie ten system szlifowałem trenując w Lamai Muay Thai Camp na Koh Samui, czerpiąc wiedzę od najlepszych.
                            </p>
                            <p class="about__desc">
                                Stworzyłem aplikację Keto Thai, żeby dać Ci gotowe, sprawdzone na własnej skórze narzędzie. Bez wymówek, z konkretnymi wynikami.
                            </p>
                        </div>

                        <!-- Prawa Kolumna: Galeria -->
                        <div class="about__gallery">
                            <img src="https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=600" alt="Trening Muay Thai" class="about__image">
                            <img src="https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=600" alt="Keto jedzenie" class="about__image">
                            <img src="https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=600" alt="Walka w ringu" class="about__image">
                            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600" alt="Tajlandia trening" class="about__image">
                        </div>

                    </div>
                </div>
            </section>
        </main>
    `;
};