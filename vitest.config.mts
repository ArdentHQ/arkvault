import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config.mts";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const coverageThresholdLines = Number(process.env.COVERAGE_THRESHOLD_LINES || 100);
const coverageThresholdFunctions = Number(process.env.COVERAGE_THRESHOLD_FUNCTIONS || 100);
const coverageThresholdStatements = Number(process.env.COVERAGE_THRESHOLD_STATEMENTS || 100);
const coverageThresholdBranches = Number(process.env.COVERAGE_THRESHOLD_BRANCHES || 100);

const toCoverageGlob = (p: string) => {
	const trimmed = p.trim().replace(/\/$/, "");
	// Already a file path or glob with extension — leave as-is
	if (trimmed.includes("*") || /\.\w+$/.test(trimmed)) return trimmed;
	// Directory path — scope to TS files only
	return `${trimmed}/**/*.{ts,tsx}`;
};

export default defineConfig(async () => {
	const tailwindcss = (await import("@tailwindcss/vite")).default;

	return mergeConfig(
		viteConfig,
		defineConfig({
			define: {
				"process.env.APP_VERSION": JSON.stringify(pkg.version),
			},
			test: {
				css: false,
				logHeapUsage: true,
				maxConcurrency: 4,
				maxWorkers: 1,
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
					include: process.env.COVERAGE_INCLUDE_PATH
						? process.env.COVERAGE_INCLUDE_PATH.split(",").map(toCoverageGlob)
						: ["src/**/*.{ts,tsx}"],
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
						"src/utils/testing-library.tsx",
						"src/utils/vitest-mocks.ts",
						"src/utils/ledger-test-helpers.ts",
						"src/utils/test-plugins.ts",
						"src/utils/test-helpers.ts",
						"**/*.test.{ts,tsx}",
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
					"identity-obj-proxy": require.resolve("identity-obj-proxy"),
				},
			},
			plugins: [tailwindcss(), svgr(), VitePWA({ registerType: "autoUpdate" })],
		}),
	);
});
