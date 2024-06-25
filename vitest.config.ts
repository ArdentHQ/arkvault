import path from "path";
import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";

import viteConfig from "./vite.config";

const coverageThresholdLines = Number(process.env.COVERAGE_THRESHOLD_LINES || 100);
const coverageThresholdFunctions = Number(process.env.COVERAGE_THRESHOLD_FUNCTIONS || 100);
const coverageThresholdStatements = Number(process.env.COVERAGE_THRESHOLD_STATEMENTS || 100);
const coverageThresholdBranches = Number(process.env.COVERAGE_THRESHOLD_BRANCHES || 100);

export default defineConfig((env) => {
	return mergeConfig(
		viteConfig(env),
		defineConfig({
			test: {
				logHeapUsage: true,
				maxConcurrency: 4,
				maxWorkers: 1,
				minWorkers: 1,
				globals: true,
				environment: "jsdom",
				isolate: true,
				setupFiles: ["./vitest.setup.ts"],
				server: {
					deps: {
						fallbackCJS: true,
					},
				},
				coverage: {
					all: false,
					include: process.env.COVERAGE_INCLUDE_PATH
						? process.env.COVERAGE_INCLUDE_PATH.split(",")
						: ["src/"],
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
					thresholds: {
						lines: coverageThresholdLines,
						functions: coverageThresholdFunctions,
						branches: coverageThresholdBranches,
						statements: coverageThresholdStatements,
					},
				},
			},
			resolve: {
				alias: {
					"@": path.resolve(__dirname, "./src"),
				},
			},
		}),
	);
});
