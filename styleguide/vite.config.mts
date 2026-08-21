import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Styleguiden importerar paketets KÄLLKOD direkt, inte ett bygge. Det som
 * renderas här är alltså exakt de filer en app får när den installerar
 * paketet — inte en kopia som kan ha drivit isär.
 *
 * BASE-SÖKVÄGEN. På GitHub Pages ligger sidan under `/momenty-ui/`, inte i
 * roten. Utan `base` skriver Vite absoluta asset-sökvägar från `/`, och då
 * hittar sidan varken sin CSS eller sin JS — den laddar, men vitt och tomt.
 * Lokalt ska den däremot ligga i roten, därför villkoret.
 */
export default defineConfig(({ command }) => ({
  root: dirname(fileURLToPath(import.meta.url)),
  base: command === "build" ? "/momenty-ui/" : "/",
  plugins: [react()],
  server: { port: 5199, open: true },
  build: { outDir: "dist", emptyOutDir: true },
}));
