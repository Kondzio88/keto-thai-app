import { html } from "../utils/template.js";
import { showSubmitSuccessModal } from "../components/submitSuccessModal.js";

export const renderContact = () => {
    return html` <div class="page-container">
        <header class="page-header">
            <h1 class="page-header__title">Kontakt</h1>
            <p class="page-header__desc">Napisz w sprawie współpracy — odpowiadam osobiście.</p>
        </header>

        <div class="contact-layout">
            <form class="form" id="contact-form">
                <div class="form__group">
                    <label for="contact-name" class="form__label">Imię i nazwisko</label>
                    <input
                        type="text"
                        id="contact-name"
                        name="name"
                        class="form__input"
                        placeholder="np. Jan Kowalski"
                        required
                    />
                    <p class="form__note">Żebym wiedział, z kim rozmawiam — nie z jakim formularzem.</p>
                </div>

                <div class="form__group">
                    <label for="contact-email" class="form__label">Adres e-mail</label>
                    <input
                        type="email"
                        id="contact-email"
                        name="email"
                        class="form__input"
                        placeholder="jan@example.com"
                        required
                    />
                </div>

                <div class="form__group">
                    <label for="contact-message" class="form__label">Wiadomość</label>
                    <textarea
                        id="contact-message"
                        name="message"
                        class="form__input contact-form__textarea"
                        rows="5"
                        placeholder="W czym mogę pomóc?"
                        required
                    ></textarea>
                    <p class="form__note">Im więcej kontekstu, tym szybciej i konkretniej odpowiem.</p>
                </div>

                <input type="hidden" name="subject" value="Nowa wiadomość z /contact — Keto Thai App" />

                <p class="form__error is-hidden" id="contact-form-error" role="alert"></p>

                <button type="submit" class="btn btn--primary contact-form__submit">
                    <span>Wyślij wiadomość</span>
                </button>
            </form>

            <aside class="contact-trust paper reveal">
                <div class="contact-trust__holes" aria-hidden="true">
                    <span class="hole"></span>
                    <span class="hole"></span>
                </div>
                <span class="contact-trust__stamp stamp-off">Kontakt</span>
                <p class="contact-trust__name">Konrad Jacoszek</p>
                <p class="contact-trust__role">Instruktor Muay Thai (MEN) · dietetyka kliniczna (w trakcie)</p>
                <p class="contact-trust__text">
                    Odpisuję osobiście, zwykle w ciągu 24h. Zero automatycznych odpowiedzi, zero pośredników.
                </p>
                <a href="mailto:KetoThai@o2.pl" class="contact-trust__email">
                    Wolisz mail bezpośrednio? KetoThai@o2.pl
                </a>
            </aside>
        </div>

        <div class="privacy-note">
            <button
                type="button"
                class="privacy-note__toggle"
                id="contact-privacy-toggle"
                aria-expanded="false"
                aria-controls="contact-privacy-content"
            >
                * Jak przetwarzam Twoje dane — rozwiń
            </button>
            <div class="privacy-note__content" id="contact-privacy-content">
                <p class="privacy-note__text">
                    Administratorem Twoich danych jest Konrad Jacoszek (działalność nierejestrowana). Dane z formularza
                    (imię i nazwisko, e-mail, treść wiadomości) przetwarzam wyłącznie w celu odpowiedzi na Twoje
                    zapytanie (art. 6 ust. 1 lit. b lub f RODO — czynności przedumowne lub prawnie uzasadniony interes w
                    postaci obsługi korespondencji). Formularz obsługuje zewnętrzny dostawca Web3Forms (Indie) — dane
                    przechodzą przez jego infrastrukturę wyłącznie w celu doręczenia mi wiadomości, na podstawie
                    Standardowych Klauzul Umownych zabezpieczających transfer poza UE. Dane przechowuję do 12 miesięcy
                    od ostatniego kontaktu w danej sprawie (Web3Forms usuwa dane po swojej stronie najpóźniej po 3
                    latach). Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania,
                    sprzeciwu oraz wniesienia skargi do Prezesa UODO. Podanie danych jest dobrowolne, ale niezbędne do
                    udzielenia odpowiedzi. Kontakt: KetoThai@o2.pl.
                </p>
            </div>
        </div>
    </div>`;
};

export const initContact = () => {
    const form = document.getElementById("contact-form");
    const submitBtn = form.querySelector(".contact-form__submit");
    const submitLabel = submitBtn.querySelector("span");
    const errorBox = document.getElementById("contact-form-error");

    const WEB3FORMS_ACCESS_KEY = "b2347caf-0ab6-49bd-843c-ab27e8bfe210";

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        errorBox.classList.add("is-hidden");
        submitBtn.disabled = true;
        submitLabel.textContent = "Wysyłanie...";

        const formData = new FormData(e.target);
        formData.append("access_key", WEB3FORMS_ACCESS_KEY);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || "Formularz odrzucony przez serwer.");
            }

            form.reset();
            submitBtn.disabled = false;
            submitLabel.textContent = "Wyślij wiadomość";

            showSubmitSuccessModal({
                title: "Wiadomość wysłana",
                message: "Odpiszę w ciągu 24h na podany adres e-mail.",
            });
        } catch (error) {
            errorBox.textContent =
                "Nie udało się wysłać wiadomości — sprawdź połączenie z internetem i spróbuj ponownie, albo napisz bezpośrednio na KetoThai@o2.pl.";
            errorBox.classList.remove("is-hidden");
            submitBtn.disabled = false;
            submitLabel.textContent = "Wyślij wiadomość";
        }
    });

    const privacyToggle = document.getElementById("contact-privacy-toggle");
    const privacyContent = document.getElementById("contact-privacy-content");

    privacyToggle.addEventListener("click", () => {
        const isOpen = privacyToggle.getAttribute("aria-expanded") === "true";
        privacyToggle.setAttribute("aria-expanded", String(!isOpen));
        privacyContent.classList.toggle("is-open");
    });
};
