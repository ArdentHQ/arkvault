import path from "path";
import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";

import viteConfig from "./vite.config";

export default mergeConfig(viteConfig, defineConfig({
  test: {
		globals: true,
		environment: "jsdom",
		setupFiles: [
      "./vitest.setup.ts",
    ],
    deps: {
      fallbackCJS: true,
    },
	},
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
