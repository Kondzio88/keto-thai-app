import { html } from "../utils/template.js";
import { getBase } from "../utils/env.js";

export const renderCamp = () => {
    return html`
        <section class="camp-hero">
            <div class="camp-hero__container page-container">
                <div class="camp-hero__layout">
                    <!-- LEWA KOLUMNA -->
                    <div class="camp-hero__content">
                        <span class="camp-hero__kicker">12-Tygodniowy Program Hybrydowy</span>
                        <h1 class="camp-hero__title">Zbuduj Formę życia Na Ketogenicznym Paliwie</h1>

                        <p class="camp-hero__desc">
                            12-tygodniowa, bezkompromisowa transformacja sylwetki i wydolności. Metodykę testowaną w
                            skrajnych warunkach tajskich campów Muay Thai przekładam na Twój sport – siłownię, bieganie,
                            sporty walki czy rekreację. Otrzymujesz indywidualną strategię makro, cotygodniową kontrolę
                            i stały kontakt 1 na 1.
                        </p>

                        <div class="camp-hero__badges">
                            <span class="camp-hero__badge"
                                ><i data-lucide="users" class="badge-icon"></i> Limit: 5 miejsc</span
                            >
                            <span class="camp-hero__badge"
                                ><i data-lucide="shield-check" class="badge-icon"></i> Prowadzenie 1 na 1</span
                            >
                            <span class="camp-hero__badge"
                                ><i data-lucide="flame" class="badge-icon"></i> Doświadczenie prosto z Tajlandii</span
                            >
                        </div>

                        <div class="camp-hero__actions">
                            <a href="#apply" class="btn btn--primary">Aplikuj do Campu</a>
                            <a href="#phases" class="btn btn--secondary">Zobacz Fazy Programu</a>
                        </div>
                    </div>

                    <!-- PRAWA KOLUMNA (KARTA VIP) -->
                    <div class="camp-hero__visual">
                        <div class="fighter-card">
                            <div class="fighter-card__header">
                                <span class="fighter-card__tag">VIP ACCESS</span>
                                <i data-lucide="zap" class="fighter-card__icon"></i>
                            </div>

                            <div class="fighter-card__body">
                                <h3 class="fighter-card__title">FIGHTER'S CAMP // MENTORING 1-ON-1</h3>
                                <p class="fighter-card__edition">BATCH #04 &bull; SEZON 2026</p>
                            </div>

                            <div class="fighter-card__footer">
                                <span class="fighter-card__protocol">ELITE BODY & PERFORMANCE</span>
                                <span class="fighter-card__code">#KT-8842-PRO</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CAMP PHASES SECTION -->

        <section class="camp-phases" id="phases">
            <div class="camp-phases__container container">
                <!-- NAGŁÓWEK SEKCJI -->
                <div class="camp-phases__header">
                    <span class="camp-phases__kicker">Plan Działania Krok Po Kroku</span>
                    <h2 class="camp-phases__title">12 Tygodni do Szczytowej Formy</h2>
                    <p class="camp-phases__desc">
                        Trzy precyzyjne, 4-tygodniowe etapy. Przekładamy rygorystyczne metody z campów na Twój sport,
                        byś osiągnął życiową sylwetkę bez zgadywania.
                    </p>
                </div>

                <!-- SIATKA 3 KART -->
                <div class="camp-phases__grid">
                    <!-- FAZA 01 -->
                    <article class="phase-card phase-card--phase-1">
                        <div class="phase-card__header">
                            <div class="phase-card__icon-box">
                                <i data-lucide="zap" class="phase-card__icon"></i>
                            </div>
                            <span class="phase-card__timeline">Tygodnie 1–4</span>
                            <span class="phase-card__number">01</span>
                        </div>

                        <div class="phase-card__body">
                            <h3 class="phase-card__title">Adaptacja Metaboliczna</h3>
                            <p class="phase-card__lead">
                                Przestawienie organizmu na czyste paliwo tłuszczowe przy zachowaniu 100% siły na
                                treningach.
                            </p>
                        </div>

                        <div class="phase-card__schedule">
                            <ul class="phase-card__steps">
                                <li>
                                    <strong>Tydzień 1:</strong> Pełna diagnostyka, wyliczenie makro i start adaptacji
                                </li>
                                <li>
                                    <strong>Tydzień 2:</strong> Stabilizacja elektrolitów i eliminacja spadków energii
                                </li>
                                <li><strong>Tydzień 3:</strong> Pierwsza weryfikacja pomiarów i dynamiki wagi</li>
                                <li>
                                    <strong>Tydzień 4:</strong> Wejście w głęboką ketozę i pełna wydolność w Twoim
                                    sporcie
                                </li>
                            </ul>
                        </div>

                        <div class="phase-card__footer">
                            <div class="phase-card__progress-bar">
                                <div class="phase-card__progress-fill" style="width: 33%;"></div>
                            </div>
                            <div class="phase-card__progress-info">
                                <span class="phase-card__progress-label">Etap 1: Fundament</span>
                                <span class="phase-card__progress-value">33%</span>
                            </div>
                        </div>
                    </article>

                    <!-- FAZA 02 -->
                    <article class="phase-card phase-card--phase-2">
                        <div class="phase-card__header">
                            <div class="phase-card__icon-box">
                                <i data-lucide="flame" class="phase-card__icon"></i>
                            </div>
                            <span class="phase-card__timeline">Tygodnie 5–8</span>
                            <span class="phase-card__number">02</span>
                        </div>

                        <div class="phase-card__body">
                            <h3 class="phase-card__title">Maksymalna Rekompozycja</h3>
                            <p class="phase-card__lead">
                                Twoje ciało staje się piecem do spalania tłuszczu, odsłaniając twardą, atletyczną
                                sylwetkę.
                            </p>
                        </div>

                        <div class="phase-card__schedule">
                            <ul class="phase-card__steps">
                                <li><strong>Tydzień 5:</strong> Podkręcenie lipolizy i ochrona tkanki mięśniowej</li>
                                <li>
                                    <strong>Tydzień 6:</strong> Korekta kaloryczna na podstawie cotygodniowego raportu
                                </li>
                                <li><strong>Tydzień 7:</strong> Wyraźny spadek obwodów w talii i lepsza definicja</li>
                                <li><strong>Tydzień 8:</strong> Szczytowa wydolność i przyspieszona regeneracja</li>
                            </ul>
                        </div>

                        <div class="phase-card__footer">
                            <div class="phase-card__progress-bar">
                                <div class="phase-card__progress-fill" style="width: 66%;"></div>
                            </div>
                            <div class="phase-card__progress-info">
                                <span class="phase-card__progress-label">Etap 2: Transformacja</span>
                                <span class="phase-card__progress-value">66%</span>
                            </div>
                        </div>
                    </article>

                    <!-- FAZA 03 -->
                    <article class="phase-card phase-card--phase-3">
                        <div class="phase-card__header">
                            <div class="phase-card__icon-box">
                                <i data-lucide="trophy" class="phase-card__icon"></i>
                            </div>
                            <span class="phase-card__timeline">Tygodnie 9–12</span>
                            <span class="phase-card__number">03</span>
                        </div>

                        <div class="phase-card__body">
                            <h3 class="phase-card__title">Szczyt Formy i Utrwalenie</h3>
                            <p class="phase-card__lead">
                                Ostateczny szlif detali, docięcie opornego tłuszczu i wypracowanie nawyków na lata.
                            </p>
                        </div>

                        <div class="phase-card__schedule">
                            <ul class="phase-card__steps">
                                <li><strong>Tydzień 9:</strong> Docięcie ostatnich opornych partii tłuszczowych</li>
                                <li><strong>Tydzień 10:</strong> Strategia żywieniowa wokół najcięższych jednostek</li>
                                <li><strong>Tydzień 11:</strong> Końcowa sesja pomiarowa i podsumowanie metamorfozy</li>
                                <li><strong>Tydzień 12:</strong> Protokół wyjścia z redukcji bez efektu jojo</li>
                            </ul>
                        </div>

                        <div class="phase-card__footer">
                            <div class="phase-card__progress-bar">
                                <div class="phase-card__progress-fill" style="width: 100%;"></div>
                            </div>
                            <div class="phase-card__progress-info">
                                <span class="phase-card__progress-label">Etap 3: Mistrzostwo</span>
                                <span class="phase-card__progress-value">100%</span>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <!-- CAMP FEATURES SECTION -->

        <section class="camp-features" id="features">
            <div class="camp-features__container container">
                <div class="camp-features__header">
                    <span class="camp-features__kicker">Kompleksowe wsparcie</span>
                    <h2 class="camp-features__title">Co otrzymasz w ramach Campu</h2>
                    <p class="camp-features__desc">
                        Pełny ekosystem narzędzi ,wiedzy i indywidualnej opieki. Zero przypadkowości!
                    </p>
                </div>

                <div class="camp-features__grid">
                    <article class="camp-bento camp-bento--wide">
                        <div class="camp-bento__icon-box">
                            <i data-lucide="sliders" class="camp-bento__icon"></i>
                        </div>
                        <h3 class="camp-bento__title">Indywidualny protokół żywieniowy pod Twój Sport</h3>
                        <p class="camp-bento__desc">
                            "Koniec ze schematycznymi dietami z internetu. Układam precyzyjny bilans kalorii i proporcji
                            tłuszczu do białka, dopasowany do specyfiki Twojej dyscypliny – siłowni, biegania, sportów
                            walki czy rekreacji. Otrzymujesz elastyczny system, w którym │ jesz sycące posiłki, spalasz
                            tłuszcz i chronisz 100% tkanki mięśniowej."
                        </p>
                        <div class="camp-bento__tags">
                            <span class="bento-tag">Elastyczne Makro</span>
                            <span class="bento-tag">Ochrona Mięśni</span>
                            <span class="bento-tag">Dopasowanie idealnie pod Ciebie</span>
                        </div>
                    </article>

                    <article class="camp-bento">
                        <div class="camp-bento__icon-box">
                            <i data-lucide="video" class="camp-bento__icon"></i>
                        </div>
                        <h3 class="camp-bento__title">Cotygodniowa Wideo-Analiza i Raporty</h3>
                        <p class="camp-bento__desc">
                            "Co 7 dni przesyłasz krótki raport: aktualną wagę, pomiary obwodów i wnioski z jednostek
                            treningowych. W odpowiedzi nagrywam dla Ciebie spersonalizowany komentarz wideo, w którym
                            analizuję postępy i w razie potrzeby koryguję kaloryczność w │ locie."
                        </p>
                        <div class="camp-bento__tags">
                            <span class="bento-tag">Raport co 7 Dni</span>
                            <span class="bento-tag">Feedback Wideo</span>
                            <span class="bento-tag">Korekta Kalorii w Locie</span>
                        </div>
                    </article>

                    <article class="camp-bento">
                        <div class="camp-bento__icon-box">
                            <i data-lucide="message-square" class="camp-bento__icon"></i>
                        </div>
                        <h3 class="camp-bento__title">Prywatny Kontakt 24/7 (Komunikator)</h3>
                        <p class="camp-bento__desc">
                            "Masz stały dostęp do mojego bezpośredniego komunikatora. Niezależnie czy stoisz przed półką
                            w markecie, masz wątpliwości co do dania w restauracji, czy potrzebujesz wsparcia przed
                            ciężkim treningiem – piszesz i otrzymujesz szybką, ekspercką │ odpowiedź."
                        </p>
                        <div class="camp-bento__tags">
                            <span class="bento-tag">Bezpośredni Komunikator</span>
                            <span class="bento-tag">Szybka Odpowiedź</span>
                            <span class="bento-tag">Wsparcie w Restauracji</span>
                        </div>
                    </article>

                    <article class="camp-bento camp-bento--wide camp-bento--highlight">
                        <div class="camp-bento__icon-box">
                            <i data-lucide="shield-check" class="camp-bento__icon"></i>
                        </div>
                        <h3 class="camp-bento__title">Dożywotnia Samodzielność & Protokół Bezpiecznego Wyjścia</h3>
                        <p class="camp-bento__desc">
                            "Program nie kończy się nagłym porzuceniem. W 12. tygodniu wdrażamy strategię stabilizacji
                            wagi i bezpiecznego podnoszenia kalorii (Reverse Dieting). Kończysz Camp z kompletną wiedzą,
                            jak sterować własną sylwetką na lata bez efektu jojo."
                        </p>
                        <div class="camp-bento__tags">
                            <span class="bento-tag">Zero Efektu Jojo</span>
                            <span class="bento-tag">Reverse Dieting</span>
                            <span class="bento-tag">Wiedza na Lata</span>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    `;
};

export const initCamp = () => {};
