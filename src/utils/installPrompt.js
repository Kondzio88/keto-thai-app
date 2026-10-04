// Współdzielony stan zdarzenia `beforeinstallprompt` — łapany raz, globalnie
// w main.js, bo może odpalić się na dowolnej trasie, zanim jeszcze wylądujemy
// na home. installBanner.js subskrybuje go przez `onPromptAvailable`.
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

// Tylko najnowsze wywołanie ma znaczenie — nadpisujemy, nie kolejkujemy.
// Dziś subskrybent jest jeden (globalny baner), więc kolejka nie byłaby potrzebna.
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

// Appka uruchomiona z ikonki działa bez paska adresu. `display-mode` to standard;
// `navigator.standalone` rozumieją tylko starsze iOS, więc sprawdzamy oba.
export const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

// Wyjątek od feature detection: brak `beforeinstallprompt` niczego nie dowodzi
// (Firefox też go nie ma), więc iOS rozpoznajemy po user agencie.
// iPadOS 13+ przedstawia się jako Mac — odróżnia go ekran dotykowy.
export const isIOS = () => {
    const ua = window.navigator.userAgent;
    return /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && window.navigator.maxTouchPoints > 1);
};
