// Tekst wpisany przez użytkownika (np. nazwa posiłku) trafia do innerHTML.
// Bez zamiany znaków "<b>Obiad" pogrubiłoby resztę strony, a "<img onerror=...>"
// wykonałoby kod. Zamieniamy znaki specjalne HTML na encje.
const HTML_ENTITIES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

export const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
