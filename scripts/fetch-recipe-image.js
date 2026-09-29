// Jednorazowy pomocnik — pobiera zdjęcie przepisu (CC0, np. Unsplash) i zapisuje
// lokalnie do public/images/recipes/, zamiast trzymać hotlink do cudzego CDN
// (patrz RAPORT.md: 0/30 zdjęć hostowanych lokalnie było udokumentowanym ryzykiem).
// Brak nowych zależności npm — fetch() jest natywne w Node ≥18 (tak jak wymaga Vite).
//
// Użycie (pojedynczy przepis):
//   node scripts/fetch-recipe-image.js <url-zdjecia> <id-przepisu>
//
// Użycie (paczka, do jednorazowego uzupełnienia wielu przepisów naraz):
//   node scripts/fetch-recipe-image.js <ścieżka-do-manifestu.json>
//   — manifest to tablica obiektów [{ "id": "r1", "url": "https://..." }, ...]

import { writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "..", "public", "images", "recipes");

const guessExtension = (contentType) => {
    if (contentType?.includes("png")) return "png";
    if (contentType?.includes("webp")) return "webp";
    return "jpg";
};

const fetchOne = async (url, id) => {
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`✗ ${id}: HTTP ${response.status} przy pobieraniu ${url}`);
        return false;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const ext = guessExtension(response.headers.get("content-type"));
    const filePath = path.join(OUTPUT_DIR, `${id}.${ext}`);

    writeFileSync(filePath, buffer);

    const kb = Math.round(statSync(filePath).size / 1024);
    const warning = kb > 500 ? " ⚠ >500KB — rozważ mniejszy wariant URL-a ze źródła (np. dopisz ?w=800 do linku Unsplash)" : "";
    console.log(`✓ ${id}.${ext} — ${kb}KB${warning}`);
    return true;
};

const main = async () => {
    if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

    const [first, second] = process.argv.slice(2);

    if (!first) {
        console.error("Użycie: node fetch-recipe-image.js <url> <id>  ALBO  node fetch-recipe-image.js <manifest.json>");
        process.exit(1);
    }

    if (first.endsWith(".json")) {
        const manifest = JSON.parse(await (await import("node:fs/promises")).readFile(first, "utf-8"));
        let ok = 0;
        for (const { id, url } of manifest) {
            if (await fetchOne(url, id)) ok += 1;
        }
        console.log(`\nGotowe: ${ok}/${manifest.length} zdjęć pobranych do ${OUTPUT_DIR}`);
        return;
    }

    if (!second) {
        console.error("Podaj też id przepisu: node fetch-recipe-image.js <url> <id>");
        process.exit(1);
    }
    await fetchOne(first, second);
};

main();
