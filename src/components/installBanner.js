import { onPromptAvailable, clearDeferredPrompt, isStandalone, isIOS } from "../utils/installPrompt.js";
import { showInstallGuide } from "./installGuide.js";

// Globalny baner instalacji — żyje w <body>, poza #app, więc przetrwa każdą
// zmianę trasy. Tworzymy go dopiero w chwili pokazania i usuwamy przy chowaniu:
// każdy pokaz ma świeże węzły i listenery, nic się nie dubluje.

const SHOW_DELAY_MS = 3000;
const DISMISSED_KEY = "installBannerDismissed";

let banner = null;

const hideBanner = () => {
    banner?.remove();
    banner = null;
};

const dismissForSession = () => {
    hideBanner();
    sessionStorage.setItem(DISMISSED_KEY, "1");
};

const showBanner = ({ icon, text, actionLabel, onAction }) => {
    // Sprawdzamy w chwili pokazania, nie przy starcie — przez 3 s opóźnienia
    // stan mógł się zmienić.
    if (banner || sessionStorage.getItem(DISMISSED_KEY)) return;

    banner = document.createElement("aside");
    banner.className = "install-banner";
    banner.setAttribute("aria-label", "Instalacja aplikacji");
    banner.innerHTML = `
        <div class="install-banner__text">
            <i data-lucide="${icon}" aria-hidden="true"></i>
            <span>${text}</span>
        </div>
        <div class="install-banner__actions">
            <button type="button" class="btn btn--secondary install-banner__dismiss">Nie teraz</button>
            <button type="button" class="btn btn--primary install-banner__action">${actionLabel}</button>
        </div>
    `;

    document.body.appendChild(banner);
    window.lucide?.createIcons();

    // Baner jest fixed — mierzymy go po wstawieniu, żeby stopka
    // (banner.css, reguła :has) zrobiła mu dokładnie tyle miejsca.
    document.documentElement.style.setProperty("--install-banner-h", `${banner.offsetHeight}px`);

    banner.querySelector(".install-banner__dismiss").addEventListener("click", dismissForSession);
    banner.querySelector(".install-banner__action").addEventListener("click", onAction);
};

export const initInstallBanner = () => {
    if (isStandalone()) return;

    // Android / desktopowy Chrome: przeglądarka sama zgłasza gotowość do instalacji.
    onPromptAvailable((deferredPrompt) => {
        setTimeout(() => {
            showBanner({
                icon: "download",
                text: "Zainstaluj Keto Thai na ekranie głównym — szybszy dostęp, działa offline.",
                actionLabel: "Zainstaluj",
                onAction: async () => {
                    hideBanner();
                    deferredPrompt.prompt();
                    await deferredPrompt.userChoice;
                    clearDeferredPrompt();
                },
            });
        }, SHOW_DELAY_MS);
    });

    // iOS: zdarzenie nigdy nie przyjdzie, a systemowego okna nie da się
    // wywołać — zostaje instrukcja ręcznej instalacji.
    if (isIOS()) {
        setTimeout(() => {
            showBanner({
                icon: "share",
                text: "Dodaj Keto Thai do ekranu początkowego — otwierasz jak aplikację, działa offline.",
                actionLabel: "Pokaż jak",
                onAction: () => {
                    // Kto obejrzał instrukcję, wie już, jak to zrobić —
                    // nie wracamy z banerem w tej sesji.
                    dismissForSession();
                    showInstallGuide();
                },
            });
        }, SHOW_DELAY_MS);
    }

    window.addEventListener("appinstalled", hideBanner);
};
