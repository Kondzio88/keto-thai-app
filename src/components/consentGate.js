import { trapFocus } from "../utils/focusTrap.js";
import { CONSENTS } from "../services/consentService.js";

// Ekran zgód po zalogowaniu (PRAWO.md §14, warstwa B). Pokazuje się, gdy
// konto nie ma w bazie zgód w aktualnej wersji — np. ktoś założył konto
// przyciskiem "Zaloguj przez Google" na ekranie logowania, z pominięciem
// formularza rejestracji, albo zmienił się tekst regulaminu.
//
// Nie da się go pominąć: Esc i klik w tło nic nie robią. Są dwa wyjścia —
// zgoda albo wylogowanie — bo bez zgody nie wolno zapisać na koncie danych
// o zdrowiu, a pół-zalogowany stan "konto bez zgody" nie ma sensu.
//
// Zwraca Promise<"granted" | "declined">. `save()` → true/false; przy błędzie
// okno zostaje otwarte z komunikatem, żeby można było spróbować ponownie.
export const askForConsents = ({ save }) =>
    new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";

        // TODO etap 7 (RODO): podlinkować regulamin i politykę prywatności, gdy powstaną.
        overlay.innerHTML = `
            <div class="modal__content" role="dialog" aria-modal="true" aria-labelledby="consent-gate-title" aria-describedby="consent-gate-text">
                <h3 class="modal__title" id="consent-gate-title">Zanim zapiszemy Twoje dane</h3>
                <p class="modal__text" id="consent-gate-text">
                    Na koncie trzymamy profil, pomiary wagi i dziennik — to dane o zdrowiu, więc potrzebujemy Twojej zgody.
                    Bez niej wylogujemy Cię, a dane z tego urządzenia zostaną tylko tutaj.
                </p>
                <fieldset class="consent">
                    <legend class="visually-hidden">Zgody</legend>
                    <label class="consent__check">
                        <input type="checkbox" name="terms" />
                        <span>${CONSENTS.terms.label}</span>
                    </label>
                    <label class="consent__check">
                        <input type="checkbox" name="health" />
                        <span>${CONSENTS.health.label}</span>
                    </label>
                </fieldset>
                <p class="form__error is-hidden" role="alert"></p>
                <div class="modal__actions">
                    <button type="button" class="btn btn--secondary consent-gate__decline">Wyloguj</button>
                    <button type="button" class="btn btn--primary consent-gate__accept" disabled>Zapisz zgody</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const dialog = overlay.querySelector(".modal__content");
        const checkboxes = [...overlay.querySelectorAll('input[type="checkbox"]')];
        const errorBox = overlay.querySelector(".form__error");
        const acceptBtn = overlay.querySelector(".consent-gate__accept");
        const declineBtn = overlay.querySelector(".consent-gate__decline");

        const releaseFocus = trapFocus(dialog, { onEscape: () => {} });

        const close = (choice) => {
            overlay.remove();
            releaseFocus();
            resolve(choice);
        };

        // Przycisk aktywny dopiero przy obu zgodach — zgoda musi być aktywna
        // i dotyczyć obu oświadczeń osobno (art. 7 ust. 2 RODO).
        const updateAccept = () => {
            acceptBtn.disabled = !checkboxes.every((box) => box.checked);
        };
        checkboxes.forEach((box) => box.addEventListener("change", updateAccept));

        acceptBtn.addEventListener("click", async () => {
            acceptBtn.disabled = true;
            declineBtn.disabled = true;
            acceptBtn.textContent = "Zapisuję…";
            errorBox.classList.add("is-hidden");

            if (await save()) {
                close("granted");
                return;
            }

            acceptBtn.textContent = "Zapisz zgody";
            declineBtn.disabled = false;
            updateAccept();
            errorBox.textContent = "Nie udało się zapisać zgód. Sprawdź internet i spróbuj ponownie.";
            errorBox.classList.remove("is-hidden");
        });

        declineBtn.addEventListener("click", () => close("declined"));

        checkboxes[0].focus();
    });
