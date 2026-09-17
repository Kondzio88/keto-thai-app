import { trapFocus } from "../utils/focusTrap.js";

export const showSubmitSuccessModal = ({ title, message }) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    overlay.innerHTML = `
        <div class="submit-success paper" role="dialog" aria-modal="true" aria-labelledby="submit-success-title">
            <div class="submit-success__holes" aria-hidden="true">
                <span class="hole"></span>
                <span class="hole"></span>
            </div>
            <span class="submit-success__stamp stamp">Przyjęte</span>
            <h3 class="submit-success__title" id="submit-success-title">${title}</h3>
            <p class="submit-success__text">${message}</p>
            <button type="button" class="btn btn--primary submit-success__close">Zamknij</button>
        </div>
    `;

    document.body.appendChild(overlay);

    const dialog = overlay.querySelector(".submit-success");
    const closeBtn = overlay.querySelector(".submit-success__close");

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
