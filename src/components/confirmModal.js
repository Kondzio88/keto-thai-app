import { trapFocus } from "../utils/focusTrap.js";

export const showConfirmModal = ({
    title,
    message,
    confirmLabel = "Potwierdź",
    cancelLabel = "Anuluj",
    onConfirm,
    // Opcjonalne — dla okien, w których "Anuluj" to osobna decyzja (np. "Odrzuć"),
    // a zamknięcie bez wyboru (Esc, klik w tło) znaczy co innego.
    onCancel,
    onDismiss,
    // "cancel" dla akcji niszczących (domyślnie); "confirm", gdy to przycisk
    // anulowania niszczy dane.
    initialFocus = "cancel",
}) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    overlay.innerHTML = `
        <div class="modal__content" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
            <h3 class="modal__title" id="confirm-modal-title">${title}</h3>
            <p class="modal__text">${message}</p>
            <div class="modal__actions">
                <button type="button" class="btn btn--secondary confirm-modal__cancel">${cancelLabel}</button>
                <button type="button" class="btn btn--primary confirm-modal__confirm">${confirmLabel}</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const dialog = overlay.querySelector(".modal__content");
    const cancelBtn = overlay.querySelector(".confirm-modal__cancel");
    const confirmBtn = overlay.querySelector(".confirm-modal__confirm");

    // Pułapkę zakładamy PRZED przeniesieniem fokusu, żeby zapamiętała element sprzed otwarcia.
    const releaseFocus = trapFocus(dialog, { onEscape: () => dismiss() });

    const closeModal = () => {
        overlay.remove();
        releaseFocus();
    };

    const dismiss = () => {
        closeModal();
        onDismiss?.();
    };

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) dismiss();
    });

    cancelBtn.addEventListener("click", () => {
        closeModal();
        onCancel?.();
    });
    confirmBtn.addEventListener("click", () => {
        closeModal();
        onConfirm?.();
    });

    // Fokus domyślnie na bezpiecznej opcji — akcja jest niszcząca i nieodwracalna.
    (initialFocus === "confirm" ? confirmBtn : cancelBtn).focus();
};
