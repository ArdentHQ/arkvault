import path from "path";
import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";

import viteConfig from "./vite.config";

export default mergeConfig(viteConfig, defineConfig({
  test: {
    logHeapUsage: true,
    maxConcurrency: 3,
		globals: true,
		environment: "jsdom",
    isolate: true,
		setupFiles: [
      "./vitest.setup.ts",
    ],
    deps: {
      fallbackCJS: true,
    },
    coverage: {
      all: false,
      include: [process.env.COVERAGE_INCLUDE_PATH || "src/"],
      exclude: [
        "**/build/*",
        "**/dist/*",
        "data.ts",
        "index.ts",
        "index.tsx",
        "src/**/*.e2e.ts",
        "src/**/*.models.{js,jsx,ts,tsx}",
        "src/**/*.styles.{js,jsx,ts,tsx}",
        "src/**/cucumber/*.ts",
        "src/**/e2e/*.ts",
        "src/i18n/**/*",
        "src/polyfill/**/*",
        "src/tailwind.config.js",
        "src/tests/**/*",
        "src/utils/e2e-utils.ts",
      ],
      provider: "istanbul",
      reporter: ["json", "lcov", "text", "clover", "html"],
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
    },
	},
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
