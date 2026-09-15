const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export const showSubmitSuccessModal = ({ title, message }) => {
    const previouslyFocused = document.activeElement;
    let keydownHandler = null;

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

    const closeModal = () => {
        document.removeEventListener("keydown", keydownHandler);
        overlay.remove();

        if (previouslyFocused && typeof previouslyFocused.focus === "function" && !previouslyFocused.disabled) {
            previouslyFocused.focus();
        }
    };

    keydownHandler = (event) => {
        if (event.key === "Escape") {
            closeModal();
            return;
        }

        if (event.key !== "Tab") return;

        const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR));
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    document.addEventListener("keydown", keydownHandler);

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeModal();
    });

    closeBtn.addEventListener("click", closeModal);
    closeBtn.focus();
};
