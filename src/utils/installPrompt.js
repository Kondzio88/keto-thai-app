// Współdzielony stan zdarzenia `beforeinstallprompt` — łapany raz, globalnie
// w main.js, bo może odpalić się na dowolnej trasie, zanim jeszcze wylądujemy
// na home. Strony (np. home.js) subskrybują go przez `onPromptAvailable`.
let deferredPrompt = null;
let pendingCallback = null;

export const initInstallPromptCapture = () => {
    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        deferredPrompt = event;
        pendingCallback?.(deferredPrompt);
    });

    window.addEventListener("appinstalled", () => {
        deferredPrompt = null;
        pendingCallback = null;
    });
};

// Tylko najnowsze wywołanie ma znaczenie — nadpisujemy, nie kolejkujemy,
// żeby wielokrotne wejścia na home przed odpaleniem eventu nie gromadziły
// referencji do odłączonych już węzłów DOM z poprzednich renderów.
export const onPromptAvailable = (callback) => {
    if (deferredPrompt) {
        callback(deferredPrompt);
        return;
    }
    pendingCallback = callback;
};

export const clearDeferredPrompt = () => {
    deferredPrompt = null;
};
