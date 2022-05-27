import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import macrosPlugin from "vite-plugin-babel-macros";
import OptimizationPersist from "vite-plugin-optimize-persist";
import PkgConfig from "vite-plugin-package-config";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		target: "esnext",
		rollupOptions: {
			// https://rollupjs.org/guide/en/#big-list-of-options
			output: {
				manualChunks: {
					react: [
						"react",
						"react-dom",
						"react-error-boundary",
						"react-hook-form",
						"react-i18next",
						"react-idle-timer",
						"react-is",
						"react-linkify",
						"react-loading-skeleton",
						"react-range",
						"react-router",
						"react-router-dom",
						"react-table",
						"react-toastify",
						"react-visibility-sensor",
					],
					sdk: ["@payvo/sdk"],
					"sdk-ark": ["@payvo/sdk-ark"],
					"sdk-cryptography": ["@payvo/sdk-cryptography"],
					"sdk-helpers": ["@payvo/sdk-helpers"],
					"sdk-intl": ["@payvo/sdk-intl"],
					"sdk-ledger": ["@payvo/sdk-ledger"],
					"sdk-news": ["@payvo/sdk-news"],
					"sdk-profiles": ["@payvo/sdk-profiles"],
				},
			},
			plugins: [
				process.env.ANALYZE_BUNDLE &&
					visualizer({
						open: true,
						brotliSize: true,
						gzipSize: true,
						template: "treemap",
					}),
			],
		},
	},
	define: {
		"process.env": {
			REACT_APP_IS_E2E: process.env.REACT_APP_IS_E2E,
			REACT_APP_IS_UNIT: process.env.REACT_APP_IS_UNIT,
		},
	},
	plugins: [
		react({
			babel: {
				plugins: [
					"babel-plugin-macros",
					[
						"@emotion/babel-plugin-jsx-pragmatic",
						{
							export: "jsx",
							import: "__cssprop",
							module: "@emotion/react",
						},
					],
					["@babel/plugin-transform-react-jsx", { pragma: "__cssprop" }, "twin.macro"],
				],
			},
		}),
		tsconfigPaths(),
		svgrPlugin(),
		macrosPlugin(),
		PkgConfig(),
		OptimizationPersist(),
	],
});
