import path from "path";
import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";

import viteConfig from "./vite.config";

export default mergeConfig(viteConfig, defineConfig({
  test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "@testing-library/jest-dom",
	},
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
