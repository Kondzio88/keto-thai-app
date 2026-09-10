import { html } from "../utils/template.js";

export const renderCamp = () => {
    return html`
        <main>
            <!-- 1. HERO -->
            <section class="camp-hero">
                <div class="camp-hero__container page-container">
                    <div class="camp-hero__layout">
                        <div class="camp-hero__content">
                            <h1 class="camp-hero__title">
                                Dwanaście tygodni. Jedna forma, którą utrzymujesz potem samodzielnie.
                            </h1>
                            <span class="camp-hero__tag tag">12-tygodniowy mentoring 1 na 1</span>

                            <p class="camp-hero__desc">
                                Indywidualna praca nad Twoją wydolnością i sylwetką. Metodykę, którą szlifowałem w
                                tajskich campach Muay Thai, przekładam na Twój sport — siłownię, bieganie, sporty
                                walki czy rekreację. Dostajesz precyzyjną strategię makro, cotygodniową kontrolę i
                                stały kontakt 1 na 1.
                            </p>

                            <div class="camp-hero__badges">
                                <span class="camp-hero__badge"
                                    ><i data-lucide="users" class="badge-icon"></i>Pierwsza grupa · 5 miejsc</span
                                >
                                <span class="camp-hero__badge"
                                    ><i data-lucide="shield-check" class="badge-icon"></i>Prowadzenie 1 na 1</span
                                >
                                <span class="camp-hero__badge"
                                    ><i data-lucide="flame" class="badge-icon"></i>Metoda z tajskich campów Muay
                                    Thai</span
                                >
                            </div>

                            <div class="camp-hero__actions">
                                <a href="#apply" class="btn btn--primary">Aplikuj do Campu</a>
                                <a href="#phases" class="btn btn--secondary">Zobacz plan 12 tygodni</a>
                            </div>
                        </div>

                        <div class="camp-hero__visual">
                            <div class="fighter-card paper">
                                <div class="fighter-card__holes" aria-hidden="true">
                                    <span class="hole"></span>
                                    <span class="hole"></span>
                                </div>
                                <span class="fighter-card__stamp stamp">Nabór otwarty</span>

                                <h2 class="fighter-card__title">Fighter's Camp // Mentoring 1-na-1</h2>

                                <dl class="fighter-card__facts">
                                    <div class="fighter-card__fact">
                                        <dt>Czas trwania</dt>
                                        <dd>12 tygodni</dd>
                                    </div>
                                    <div class="fighter-card__fact">
                                        <dt>Miejsc w grupie</dt>
                                        <dd>5</dd>
                                    </div>
                                    <div class="fighter-card__fact">
                                        <dt>Format</dt>
                                        <dd>Codzienny komunikator + wideo co tydzień</dd>
                                    </div>
                                    <div class="fighter-card__fact">
                                        <dt>Cena</dt>
                                        <dd>Ustalana po kwalifikacji</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 2. CAMP COACH -->
            <section class="camp-coach">
                <div class="camp-coach__container container">
                    <div class="camp-coach__layout reveal">
                        <div class="camp-coach__photo">
                            <span class="tape tape--tl" aria-hidden="true"></span>
                            <span class="tape tape--br" aria-hidden="true"></span>
                            <div class="camp-coach__snap"></div>
                            <span class="camp-coach__caption mono">FOTO 01 — KONRAD JACOSZEK (do uzupełnienia)</span>
                        </div>

                        <div class="camp-coach__content">
                            <h2 class="camp-coach__title">Kto Cię poprowadzi</h2>
                            <p class="camp-coach__desc">
                                15 lat treningu Muay Thai, dopracowanego w tajskich campach — m.in. w Lamai Muay
                                Thai Camp na Koh Samui. Nie sprzedaję gotowca z internetu. Prowadzę Cię tak, jak
                                sam trenuję: z dyscypliną, cotygodniową kontrolą i szczerym feedbackiem, nawet gdy
                                jest niewygodny.
                            </p>
                            <div class="camp-coach__byline">
                                <span class="camp-coach__name">Konrad Jacoszek</span>
                                <span class="camp-coach__role"
                                    >Instruktor Muay Thai (MEN) · dietetyka kliniczna (w trakcie)</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 3. OŚ CZASU (WARIANT 1) -->
            <section class="camp-timeline" id="phases">
                <div class="camp-timeline__container container">
                    <h2 class="camp-timeline__title reveal">12 tygodni, trzy fazy</h2>
                    <p class="camp-timeline__desc reveal">
                        Nie zgadujemy. Każda faza ma swój cel, swoją cotygodniową kontrolę i jasne kryterium
                        przejścia do następnej.
                    </p>

                    <div class="timeline">
                        <!-- FAZA 1 -->
                        <div class="timeline__item reveal">
                            <div class="timeline__content reveal reveal--left">
                                <span class="timeline__step-num">Faza 1 · Tygodnie 1–4</span>
                                <h3 class="timeline__subtitle">Adaptacja metaboliczna</h3>
                                <p class="timeline__desc">
                                    Przestawienie organizmu na tłuszcz jako główne paliwo, przy zachowaniu pełnej
                                    siły na treningach.
                                </p>
                                <ul class="timeline__weeks">
                                    <li><strong>Tydzień 1:</strong> Pełna diagnostyka i start protokołu makro</li>
                                    <li>
                                        <strong>Tydzień 2:</strong> Stabilizacja elektrolitów, eliminacja spadków
                                        energii
                                    </li>
                                    <li>
                                        <strong>Tydzień 3:</strong> Pierwsza weryfikacja pomiarów i dynamiki wagi
                                    </li>
                                    <li>
                                        <strong>Tydzień 4:</strong> Wejście w stabilną ketozę przy pełnej
                                        wydolności
                                    </li>
                                </ul>
                            </div>
                            <div class="timeline__visual reveal reveal--right">
                                <div class="phase-marker paper">
                                    <span class="phase-marker__num">04</span>
                                    <span class="phase-marker__unit mono">/ 12 tygodni</span>
                                    <div class="phase-marker__bar">
                                        <div class="phase-marker__fill" style="width: 33%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- FAZA 2 -->
                        <div class="timeline__item reveal">
                            <div class="timeline__content reveal reveal--left">
                                <span class="timeline__step-num">Faza 2 · Tygodnie 5–8</span>
                                <h3 class="timeline__subtitle">Rekompozycja sylwetki</h3>
                                <p class="timeline__desc">
                                    Organizm efektywnie pracuje na tłuszczu — teraz korygujemy kaloryczność co
                                    tydzień na podstawie realnych pomiarów, nie zgadywania.
                                </p>
                                <ul class="timeline__weeks">
                                    <li>
                                        <strong>Tydzień 5:</strong> Pierwsza kalibracja tempa zmiany wagi pod Twój
                                        cel, ochrona tkanki mięśniowej
                                    </li>
                                    <li>
                                        <strong>Tydzień 6:</strong> Korekta kaloryczna na podstawie cotygodniowego
                                        raportu
                                    </li>
                                    <li><strong>Tydzień 7:</strong> Weryfikacja obwodów i postępów wizualnych</li>
                                    <li>
                                        <strong>Tydzień 8:</strong> Szczytowa wydolność i przyspieszona
                                        regeneracja
                                    </li>
                                </ul>
                            </div>
                            <div class="timeline__visual reveal reveal--right">
                                <div class="phase-marker paper">
                                    <span class="phase-marker__num">08</span>
                                    <span class="phase-marker__unit mono">/ 12 tygodni</span>
                                    <div class="phase-marker__bar">
                                        <div class="phase-marker__fill" style="width: 66%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- FAZA 3 -->
                        <div class="timeline__item reveal">
                            <div class="timeline__content reveal reveal--left">
                                <span class="timeline__step-num">Faza 3 · Tygodnie 9–12</span>
                                <h3 class="timeline__subtitle">Szczyt formy i stabilizacja</h3>
                                <p class="timeline__desc">
                                    Ostatni szlif i płynne przejście do fazy utrzymania — kalorie korygowane w
                                    kierunku, który pasuje do Twojego celu, żeby efekt został na stałe, nie tylko
                                    na czas programu.
                                </p>
                                <ul class="timeline__weeks">
                                    <li>
                                        <strong>Tydzień 9:</strong> Finalna korekta pod Twój cel — ostatnie
                                        poprawki tam, gdzie jeszcze są potrzebne
                                    </li>
                                    <li>
                                        <strong>Tydzień 10:</strong> Strategia żywieniowa wokół najcięższych
                                        jednostek
                                    </li>
                                    <li><strong>Tydzień 11:</strong> Końcowa sesja pomiarowa i podsumowanie</li>
                                    <li>
                                        <strong>Tydzień 12:</strong> Protokół stabilizacji — plan na czas po
                                        Campie, żeby efekt nie odbił w drugą stronę
                                    </li>
                                </ul>
                            </div>
                            <div class="timeline__visual reveal reveal--right">
                                <div class="phase-marker paper">
                                    <span class="phase-marker__num">12</span>
                                    <span class="phase-marker__unit mono">/ 12 tygodni</span>
                                    <div class="phase-marker__bar">
                                        <div class="phase-marker__fill" style="width: 100%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 4. WSPARCIE (4 FILARY) -->
            <section class="camp-support" id="support">
                <div class="camp-support__container container">
                    <h2 class="camp-support__title reveal">Co dostajesz co tydzień</h2>
                    <p class="camp-support__desc reveal">
                        Nie zostajesz sam między jedną sesją a drugą. Cztery filary, które trzymają Cię na kursie
                        przez pełne 12 tygodni.
                    </p>

                    <div class="camp-support__grid">
                        <!-- 1: kartka z dziurkami -->
                        <article class="support-card support-card--sheet paper reveal">
                            <div class="support-card__holes" aria-hidden="true">
                                <span class="hole"></span>
                                <span class="hole"></span>
                            </div>
                            <i data-lucide="sliders" class="support-card__icon"></i>
                            <h3 class="support-card__title">Indywidualny protokół</h3>
                            <p class="support-card__desc">
                                Precyzyjny bilans kalorii i proporcji makro dopasowany do Twojej dyscypliny —
                                siłowni, biegania, sportów walki czy rekreacji.
                            </p>
                        </article>

                        <!-- 2: panel wideo -->
                        <article class="support-card support-card--video reveal">
                            <i data-lucide="video" class="support-card__icon"></i>
                            <h3 class="support-card__title">Cotygodniowa wideo-analiza</h3>
                            <p class="support-card__desc">
                                Co 7 dni przesyłasz raport pomiarów. W odpowiedzi nagrywam komentarz wideo z
                                korektą kaloryczności i wskazówkami na kolejny tydzień.
                            </p>
                        </article>

                        <!-- 3: notatka na marginesie -->
                        <article class="support-card support-card--note reveal">
                            <i data-lucide="message-square" class="support-card__icon"></i>
                            <h3 class="support-card__title">Codzienny komunikator</h3>
                            <p class="support-card__desc">
                                Stały dostęp do bezpośredniego kontaktu — pytanie przy półce w markecie czy przed
                                ciężkim treningiem dostaje odpowiedź tego samego dnia.
                            </p>
                        </article>

                        <!-- 4: pieczątka -->
                        <article class="support-card support-card--stamp reveal">
                            <span class="stamp support-card__badge">Efekt na stałe</span>
                            <i data-lucide="shield-check" class="support-card__icon"></i>
                            <h3 class="support-card__title">Protokół stabilizacji</h3>
                            <p class="support-card__desc">
                                W 12. tygodniu wdrażamy plan utrzymania — korektę kalorii w kierunku pasującym do
                                Twojego celu, żebyś kończył Camp z wiedzą, jak utrzymać efekt samodzielnie, bez
                                odbicia w drugą stronę.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            <!-- 5. KWALIFIKACJA -->
            <section class="camp-qual" id="qualification">
                <div class="camp-qual__container container">
                    <h2 class="camp-qual__title reveal">Czy Fighter's Camp jest dla Ciebie?</h2>
                    <p class="camp-qual__desc reveal">
                        Nie przyjmuję każdego zgłoszenia. To 12 tygodni intensywnej, wspólnej pracy opartej na
                        twardych danych, nie kolejna dieta-cud.
                    </p>

                    <div class="camp-qual__grid">
                        <div class="qual-list reveal">
                            <h3 class="qual-list__title">
                                <i data-lucide="check-circle-2" class="qual-list__icon qual-list__icon--yes"></i>
                                Jest dla Ciebie, jeśli:
                            </h3>
                            <ul class="qual-list__items">
                                <li>Trenujesz regularnie i chcesz wejść na wyższy poziom wydolności.</li>
                                <li>Od miesięcy nie widzisz postępów albo tracisz energię w ciągu dnia.</li>
                                <li>
                                    Szukasz precyzyjnego protokołu i cotygodniowej weryfikacji, nie przypadkowych
                                    porad.
                                </li>
                                <li>Jesteś gotowy raportować pomiary co 7 dni i wdrażać plan w całości.</li>
                            </ul>
                        </div>

                        <div class="qual-list reveal">
                            <h3 class="qual-list__title">
                                <i data-lucide="x-circle" class="qual-list__icon qual-list__icon--no"></i>
                                NIE jest dla Ciebie, jeśli:
                            </h3>
                            <ul class="qual-list__items">
                                <li>Szukasz diety-cud bez trzymania założeń kalorycznych i treningu.</li>
                                <li>Znikasz na dwa tygodnie i nie wysyłasz raportów.</li>
                                <li>
                                    Zależy Ci tylko na „kartce z dietą", nie na zrozumieniu własnego metabolizmu.
                                </li>
                                <li>Oczekujesz wyłącznie pochwał — feedback bywa szczery, nie zawsze wygodny.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 6. FORMULARZ ZGŁOSZENIOWY -->
            <section class="camp-apply" id="apply">
                <div class="camp-apply__container container">
                    <div class="camp-apply__layout">
                        <div class="camp-apply__content reveal">
                            <h2 class="camp-apply__title">Zgłoszenie do Fighter's Camp</h2>
                            <p class="camp-apply__desc">
                                Wypełnij formularz. Po analizie Twojego profilu odzywam się w ciągu 24h z
                                informacją, czy się kwalifikujesz.
                            </p>

                            <form class="camp-form" id="camp-apply-form">
                                <div class="camp-form__group">
                                    <label for="apply-name" class="camp-form__label">Imię i nazwisko</label>
                                    <input
                                        type="text"
                                        id="apply-name"
                                        name="name"
                                        class="camp-form__input"
                                        placeholder="np. Jan Kowalski"
                                        required
                                    />
                                    <p class="camp-form__note">
                                        Żebym wiedział, z kim rozmawiam — nie z jakim formularzem.
                                    </p>
                                </div>

                                <div class="camp-form__row">
                                    <div class="camp-form__group">
                                        <label for="apply-email" class="camp-form__label">Adres e-mail</label>
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
                                        <label for="apply-phone" class="camp-form__label">Numer telefonu</label>
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
                                <p class="camp-form__note">
                                    Kontakt w ciągu 24h, bez spamu i bez przekazywania danych dalej.
                                </p>

                                <div class="camp-form__group">
                                    <label for="apply-sport" class="camp-form__label"
                                        >Twój główny sport / aktywność</label
                                    >
                                    <select
                                        id="apply-sport"
                                        name="sport"
                                        class="camp-form__input camp-form__select"
                                        required
                                    >
                                        <option value="" disabled selected>Wybierz dyscyplinę...</option>
                                        <option value="combat">Sztuki walki / boks / Muay Thai</option>
                                        <option value="gym">Trening siłowy / kształtowanie sylwetki</option>
                                        <option value="endurance">Bieganie / kolarstwo / wytrzymałość</option>
                                        <option value="recreation">Aktywność rekreacyjna / zdrowie</option>
                                    </select>
                                    <p class="camp-form__note">
                                        Protokół makro różni się dla sportów walki, siłowni i wytrzymałości.
                                    </p>
                                </div>

                                <div class="camp-form__group">
                                    <label for="apply-goal" class="camp-form__label"
                                        >Aktualna waga i Twój cel</label
                                    >
                                    <input
                                        type="text"
                                        id="apply-goal"
                                        name="goal"
                                        class="camp-form__input"
                                        placeholder="np. 86 kg → cel: redukcja, masa lub utrzymanie formy"
                                        required
                                    />
                                    <p class="camp-form__note">
                                        Punkt startowy do wyliczenia Twojego keto-splitu.
                                    </p>
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
                                    <p class="camp-form__note">
                                        Krótki opis pomaga mi ocenić, czy dobrze się dogadamy.
                                    </p>
                                </div>

                                <button type="submit" class="btn btn--primary camp-form__submit">
                                    <span>Wyślij zgłoszenie do kwalifikacji</span>
                                </button>
                            </form>
                        </div>

                        <aside class="camp-apply__sidebar reveal">
                            <div class="camp-trust-card paper">
                                <div class="camp-trust-card__holes" aria-hidden="true">
                                    <span class="hole"></span>
                                    <span class="hole"></span>
                                </div>
                                <span class="camp-trust-card__stamp stamp">Zasady</span>
                                <h3 class="camp-trust-card__title">Zasady kwalifikacji</h3>

                                <ul class="camp-trust-card__list">
                                    <li class="camp-trust-card__item">
                                        <i data-lucide="clock" class="trust-icon"></i>
                                        <div>
                                            <strong>Feedback w 24h</strong>
                                            <p>Analizuję zgłoszenie i odpowiadam konkretną informacją zwrotną.</p>
                                        </div>
                                    </li>
                                    <li class="camp-trust-card__item">
                                        <i data-lucide="users" class="trust-icon"></i>
                                        <div>
                                            <strong>Maksymalnie 5 miejsc</strong>
                                            <p>Prowadzenie 1 na 1 wymaga pełnego skupienia na każdym podopiecznym.</p>
                                        </div>
                                    </li>
                                    <li class="camp-trust-card__item">
                                        <i data-lucide="banknote" class="trust-icon"></i>
                                        <div>
                                            <strong>Cena po kwalifikacji</strong>
                                            <p>Ustalam ją dopiero po analizie Twojego profilu i celu.</p>
                                        </div>
                                    </li>
                                    <li class="camp-trust-card__item">
                                        <i data-lucide="lock" class="trust-icon"></i>
                                        <div>
                                            <strong>Zero ryzyka</strong>
                                            <p>Brak jakichkolwiek opłat przed formalnym zatwierdzeniem profilu.</p>
                                        </div>
                                    </li>
                                </ul>

                                <div class="camp-trust-card__note">
                                    <i data-lucide="info" class="note-icon"></i>
                                    <span
                                        >Jeśli uznam, że program nie jest dla Ciebie — powiem to wprost i wskażę
                                        darmowe alternatywy.</span
                                    >
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </main>
    `;
};

export const initCamp = () => {
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

    const form = document.getElementById("camp-apply-form");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const dataObject = Object.fromEntries(formData);

        // Realna wysyłka (fetch do usługi/backendu) — poza zakresem tej sesji,
        // patrz priorytet #2 w PROGRES.md.
        form.innerHTML = `
            <div class="success-box">
                <h3>Zgłoszenie przyjęte</h3>
                <p>Odezwę się w ciągu 24h z informacją, czy się kwalifikujesz.</p>
            </div>
        `;
    });
};
