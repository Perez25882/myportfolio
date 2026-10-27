import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      // The root layout only wires fonts and global chrome; next/font cannot run outside Next.
      // MuseumCanvas needs WebGL, which jsdom lacks; it is verified in the browser (docs/phase-2-checkpoint-d.md).
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/app/layout.tsx",
        "src/content/types.ts",
        "src/components/museum/MuseumCanvas.tsx",
      ],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
