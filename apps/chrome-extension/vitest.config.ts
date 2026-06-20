import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom"
  },
  resolve: {
    alias: {
      "@attention-nudge/core": new URL("../../packages/core/src/index.ts", import.meta.url).pathname
    }
  }
});
