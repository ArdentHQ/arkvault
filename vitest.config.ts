import path from "path";
import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";

import viteConfig from "./vite.config";

const coverageThreshold = Number(process.env.COVERAGE_THRESHOLD || 100);

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			logHeapUsage: true,
			maxConcurrency: 3,
			globals: true,
			environment: "jsdom",
			isolate: true,
			setupFiles: ["./vitest.setup.ts"],
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
				lines: coverageThreshold,
				functions: coverageThreshold,
				branches: coverageThreshold,
				statements: coverageThreshold,
			},
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
	}),
);
