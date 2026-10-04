import { trapFocus } from "../utils/focusTrap.js";

// Instrukcja ręcznej instalacji na iOS — Safari nie pozwala stronie wywołać
// systemowego okna, więc pokazujemy drogę krok po kroku. Modal, a nie toast,
// bo otwiera się tylko na wyraźne „Pokaż jak" i trzeba go spokojnie przeczytać.
export const showInstallGuide = () => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    overlay.innerHTML = `
        <div class="install-guide paper" role="dialog" aria-modal="true" aria-labelledby="install-guide-title">
            <div class="install-guide__holes" aria-hidden="true">
                <span class="hole"></span>
                <span class="hole"></span>
            </div>
            <h3 class="install-guide__title" id="install-guide-title">Dodaj do ekranu</h3>
            <ol class="install-guide__steps">
                <li class="install-guide__step">
                    <i data-lucide="share" class="install-guide__icon" aria-hidden="true"></i>
                    <span>Stuknij <strong>Udostępnij</strong>. Nie widzisz tej ikony na pasku Safari? Jest w menu pod trzema kropkami.</span>
                </li>
                <li class="install-guide__step">
                    <i data-lucide="square-plus" class="install-guide__icon" aria-hidden="true"></i>
                    <span>Przewiń listę i wybierz <strong>Do ekranu początkowego</strong>.</span>
                </li>
                <li class="install-guide__step">
                    <i data-lucide="check" class="install-guide__icon" aria-hidden="true"></i>
                    <span>Stuknij <strong>Dodaj</strong>. Od teraz otwierasz Keto Thai z ikonki.</span>
                </li>
            </ol>
            <p class="install-guide__note">W Chrome ikona Udostępnij jest w pasku adresu. Link otwarty z Messengera lub Instagrama trzeba najpierw otworzyć w Safari.</p>
            <button type="button" class="btn btn--primary install-guide__close">Rozumiem</button>
        </div>
    `;

    document.body.appendChild(overlay);
    window.lucide?.createIcons();

    const dialog = overlay.querySelector(".install-guide");
    const closeBtn = overlay.querySelector(".install-guide__close");

    // Pułapkę zakładamy PRZED przeniesieniem fokusu, żeby zapamiętała element sprzed otwarcia.
    const releaseFocus = trapFocus(dialog, { onEscape: () => closeModal() });

    const closeModal = () => {
        overlay.remove();
        releaseFocus();
    };

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeModal();
    });

    closeBtn.addEventListener("click", closeModal);
    closeBtn.focus();
};
