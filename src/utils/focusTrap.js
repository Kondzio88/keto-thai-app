const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// Zamyka Tab/Shift+Tab w obrębie `container` i woła `onEscape` po wciśnięciu Esc.
// Zwraca funkcję zwalniającą pułapkę (zdejmuje listener, oddaje fokus).
// Cały stan jest lokalny dla wywołania — dwa otwarte dialogi nie dzielą zmiennych.
export const trapFocus = (container, { onEscape } = {}) => {
    const previouslyFocused = document.activeElement;

    const keydownHandler = (event) => {
        if (event.key === "Escape") {
            onEscape?.();
            return;
        }

        if (event.key !== "Tab") return;

        const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
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

    return () => {
        document.removeEventListener("keydown", keydownHandler);

        if (previouslyFocused && typeof previouslyFocused.focus === "function" && !previouslyFocused.disabled) {
            previouslyFocused.focus();
        }
    };
};
