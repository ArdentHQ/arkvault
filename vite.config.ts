import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import macrosPlugin from "vite-plugin-babel-macros";
import OptimizationPersist from "vite-plugin-optimize-persist";
import PkgConfig from "vite-plugin-package-config";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

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
						"react-datepicker",
						"react-dom",
						"react-error-boundary",
						"react-hook-form",
						"react-i18next",
						"react-idle-timer",
						"react-linkify",
						"react-loading-skeleton",
						"react-qr-reader",
						"react-range",
						"react-router",
						"react-router-dom",
						"react-table",
						"react-toastify",
						"react-visibility-sensor",
					],
					sdk: ["@ardenthq/sdk"],
					"sdk-mainsail": ["@ardenthq/sdk-mainsail"],
					"sdk-cryptography": ["@ardenthq/sdk-cryptography"],
					"sdk-helpers": ["@ardenthq/sdk-helpers"],
					"sdk-intl": ["@ardenthq/sdk-intl"],
					"sdk-ledger": ["@ardenthq/sdk-ledger"],
					"sdk-profiles": ["@ardenthq/sdk-profiles"],
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
			ZENDESK_WIDGET_KEY: process.env.ZENDESK_WIDGET_KEY,
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
		VitePWA({
			workbox: {
				// Prevent from precaching html files. Caching index.html causes white-screen after each deployment.
				// See: https://vite-plugin-pwa.netlify.app/guide/static-assets.html#globpatterns
				globPatterns: ["**/*.{js,css}"],
			},
			includeAssets: [
				"favicon.svg",
				"favicon.ico",
				"favicon-32x32.png",
				"favicon-16x16.png",
				"robots.txt",
				"app-icon-192.png",
				"app-maskable-icon-512.png",
				"splashscreens/apple_320x568x2.png",
				"splashscreens/apple_375x667x2.png",
				"splashscreens/apple_375x812x3.png",
				"splashscreens/apple_390x844x3.png",
				"splashscreens/apple_414x736x2.6.png",
				"splashscreens/apple_414x896x2.png",
				"splashscreens/apple_414x896x3.png",
				"splashscreens/apple_428x926x3.png",
				"splashscreens/apple_768x1024x2.png",
				"splashscreens/apple_834x1112x2.png",
				"splashscreens/apple_834x1194x2.png",
				"splashscreens/apple_1024x1366x2.png",
			],
			registerType: "autoUpdate",
			manifest: {
				display: "standalone",
				lang: "en-US",
				orientation: "portrait-primary",
				start_url: "/",
				name: "ARKVault",
				short_name: "ARKVault",
				description: "Control Your Assets",
				theme_color: "#235b95",
				background_color: "#235b95",
				icons: [
					{
						src: "app-icon-192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "app-maskable-icon-512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
		}),
	],
});
