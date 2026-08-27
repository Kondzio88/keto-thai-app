import { html } from "../utils/template.js";
import { getBase } from "../utils/env.js";

export const renderCamp = () => {
    return html`
        <section class="camp-hero">
            <div class="camp-hero__container page-container">
                <div class="camp-hero__layout">
                    <!-- LEWA KOLUMNA -->
                    <div class="camp-hero__content">
                        <span class="camp-hero__kicker">12-Tygodniowy fighter's camp</span>
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
                    <h2 class="camp-phases__title"><span class="text-accent">12</span> Tygodni do Szczytowej Formy</h2>
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

        <!-- QUALIFICATION SECTION -->

        <section class="camp-qual" id="qualification">
            <div class="camp-qual__container container">
                <div class="camp-qual__header">
                    <span class="camp-qual__kicker">Selekcja do Programu</span>
                    <h2 class="camp-qual__title">Czy Fighter's Camp Jest Dla Ciebie?</h2>
                    <p class="camp-qual__desc">
                        Nie przyjmuję każdego. Ten program to intensywna, 12-tygodniowa współpraca oparta na dyscyplinie
                        i twardych danych, a nie kolejna dieta-cud.
                    </p>
                </div>

                <div class="camp-qual__grid">
                    <article class="qual-card qual-card--positive">
                        <div class="qual-card__header">
                            <i data-lucide="check-circle-2" class="qual-card__icon"></i>
                            <h3 class="qual-card__title">Ten program jest dla Ciebie, jeśli:</h3>
                        </div>
                        <div class="qual-card__body">
                            <ul class="qual-card__list">
                                <li>
                                    Trenujesz regularnie: Uprawiasz siłownię, biegasz, sporty walki lub rekreację i
                                    chcesz wejść na wyższy poziom wydolności.
                                </li>
                                <li>
                                    Masz dość stagnacji: Od miesięcy nie widzisz postępów w redukcji wagi lub
                                    doświadczasz spadków energii w ciągu dnia i na treningu.
                                </li>
                                <li>
                                    Szukasz twardych danych: Chcesz precyzyjnego protokołu makro i cotygodniowej
                                    weryfikacji wideo, a nie przypadkowych porad z internetu.
                                </li>
                                <li>
                                    Jesteś gotowy na dyscyplinę: Traktujesz swoje ciało poważnie, raportujesz pomiary co
                                    7 dni i wdrażasz plan w 100%.
                                </li>
                            </ul>
                        </div>
                    </article>
                    <article class="qual-card qual-card--negative">
                        <div class="qual-card__header">
                            <i data-lucide="x-circle" class="qual-card__icon"></i>
                            <h3 class="qual-card__title">Ten program NIE jest dla Ciebie,jeśli:</h3>
                        </div>
                        <div class="qual-card__body">
                            <ul class="qual-card__list">
                                <li>
                                    Szukasz diety-cud: Oczekujesz magicznych rezultatów bez trzymania założeń
                                    kalorycznych i regularnego treningu.
                                </li>
                                <li>
                                    Brak Ci odpowiedzialności: Znikasz na 2 tygodnie, nie wysyłasz raportów i szukasz
                                    wymówek zamiast rozwiązań.
                                </li>
                                <li>
                                    Chcesz tylko "kartki z dietą": Nie zależy Ci na zrozumieniu swojego metabolizmu i
                                    trwałej samodzielności po 12 tygodniach.
                                </li>
                                <li>
                                    Nie akceptujesz szczerego feedbacku: Oczekujesz wyłącznie głaskania po głowie – ja
                                    mówię wprost, co działa, a co musisz natychmiast poprawić.
                                </li>
                            </ul>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <!-- camp APPLY SECTION -->

        <section class="camp-apply" id="apply">
            <div class="camp-apply__container container">
                <div class="camp-apply__layout">
                    <!-- LEWA KOLUMNA: Formularz Kwalifikacyjny -->
                    <div class="camp-apply__content">
                        <span class="camp-apply__kicker">Kwalifikacja do programu</span>
                        <h2 class="camp-apply__title">Aplikuj do Fighter's Camp</h2>
                        <p class="camp-apply__desc">
                            Wypełnij krótki formularz kwalifikacyjny. Po analizie Twojego profilu i celów skontaktuję
                            się z Tobą w ciągu 24h w celu wstępnej weryfikacji.
                        </p>

                        <form class="camp-form" id="camp-apply-form">
                            <div class="camp-form__group">
                                <label for="apply-name" class="camp-form__label">Imię i Nazwisko</label>
                                <input
                                    type="text"
                                    id="apply-name"
                                    name="name"
                                    class="camp-form__input"
                                    placeholder="np. Jan Kowalski"
                                    required
                                />
                            </div>

                            <div class="camp-form__row">
                                <div class="camp-form__group">
                                    <label for="apply-email" class="camp-form__label">Adres E-mail</label>
                                    <input
                                        type="email"
                                        id="apply-email"
                                        name="email"
                                        class="camp-form__input"
                                        placeholder="jan@example.com"
                                        required
                                    />
                                </div>

                                <div class="camp-form__group">
                                    <label for="apply-phone" class="camp-form__label">Numer Telefonu / WhatsApp</label>
                                    <input
                                        type="tel"
                                        id="apply-phone"
                                        name="phone"
                                        class="camp-form__input"
                                        placeholder="+48 000 000 000"
                                        required
                                    />
                                </div>
                            </div>

                            <div class="camp-form__group">
                                <label for="apply-sport" class="camp-form__label">Twój Główny Sport / Aktywność</label>
                                <select
                                    id="apply-sport"
                                    name="sport"
                                    class="camp-form__input camp-form__select"
                                    required
                                >
                                    <option value="" disabled selected>Wybierz dyscyplinę...</option>
                                    <option value="combat">Sztuki Walki / Boks / Muay Thai</option>
                                    <option value="gym">Trening Siłowy / Kształtowanie Sylwetki</option>
                                    <option value="endurance">Bieganie / Kolarstwo / Wytrzymałość</option>
                                    <option value="recreation">Aktywność Rekreacyjna / Zdrowie</option>
                                </select>
                            </div>

                            <div class="camp-form__group">
                                <label for="apply-goal" class="camp-form__label">Aktualna Waga i Twój Cel</label>
                                <input
                                    type="text"
                                    id="apply-goal"
                                    name="goal"
                                    class="camp-form__input"
                                    placeholder="np. 86 kg -> 79 kg, docięcie i poprawa wydolności"
                                    required
                                />
                            </div>

                            <div class="camp-form__group">
                                <label for="apply-message" class="camp-form__label"
                                    >Z czym masz największy problem?</label
                                >
                                <textarea
                                    id="apply-message"
                                    name="message"
                                    class="camp-form__input camp-form__textarea"
                                    rows="3"
                                    placeholder="Opisz krótko swój staż, dotychczasowe próby z dietą lub spadki energii..."
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" class="btn btn--primary camp-form__submit">
                                <span>Wyślij Zgłoszenie do Kwalifikacji</span>
                            </button>
                        </form>
                    </div>

                    <!-- PRAWA KOLUMNA: Karta Zaufania & Gwarancja -->
                    <aside class="camp-apply__sidebar">
                        <div class="camp-trust-card">
                            <div class="camp-trust-card__header">
                                <div class="camp-trust-card__icon-box">
                                    <i data-lucide="shield-check" class="camp-trust-card__icon"></i>
                                </div>
                                <span class="camp-trust-card__badge">Gwarancja Jakości</span>
                            </div>

                            <h3 class="camp-trust-card__title">Zasady Kwalifikacji Batch #04</h3>

                            <ul class="camp-trust-card__list">
                                <li class="camp-trust-card__item">
                                    <i data-lucide="clock" class="trust-icon"></i>
                                    <div>
                                        <strong>Feedback w 24h:</strong>
                                        <p>Analizuję Twoje zgłoszenie i odpowiadam konkretną informacją zwrotną.</p>
                                    </div>
                                </li>
                                <li class="camp-trust-card__item">
                                    <i data-lucide="users" class="trust-icon"></i>
                                    <div>
                                        <strong>Maksymalnie 5 Miejsc:</strong>
                                        <p>Prowadzenie 1 na 1 wymaga pełnego skupienia na każdym podopiecznym.</p>
                                    </div>
                                </li>
                                <li class="camp-trust-card__item">
                                    <i data-lucide="lock" class="trust-icon"></i>
                                    <div>
                                        <strong>Zero Ryzyka:</strong>
                                        <p>Brak jakichkolwiek opłat przed formalnym zatwierdzeniem profilu.</p>
                                    </div>
                                </li>
                            </ul>

                            <div class="camp-trust-card__note">
                                <i data-lucide="info" class="note-icon"></i>
                                <span
                                    >Jeśli uznam, że ten program nie jest dla Ciebie – powiem Ci to wprost i wskażę
                                    darmowe alternatywy.</span
                                >
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    `;
};

export const initCamp = () => {};
