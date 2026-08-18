import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    pool: "vmThreads",
    fileParallelism: false,
    setupFiles: ["./vitest.setup.ts"],
  },
});
