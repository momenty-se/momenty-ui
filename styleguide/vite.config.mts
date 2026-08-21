import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Styleguiden importerar paketets KÄLLKOD direkt, inte ett bygge. Det som
 * renderas här är alltså exakt de filer en app får när den installerar
 * paketet — inte en kopia som kan ha drivit isär.
 */
export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  plugins: [react()],
  server: { port: 5199, open: true },
});
