// Przełączniki funkcji (feature flags). Każdy `git push` publikuje stronę,
// więc niedokończona funkcja musi być wyłączona na produkcji.
//
// Konta: włączone tylko na serwerze deweloperskim (`npm run dev`). Vite podmienia
// `import.meta.env.DEV` przy buildzie na `false`, więc w wersji na GitHub Pages
// trasy /konto nie istnieją, a nawigacja nie pokazuje pozycji konta.
// Przy prawdziwym Supabase (etap 4) zmieniamy to na `true`.
export const ACCOUNTS_ENABLED = import.meta.env.DEV;
