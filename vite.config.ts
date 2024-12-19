import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
import macrosPlugin from "vite-plugin-babel-macros";
import OptimizationPersist from "vite-plugin-optimize-persist";
import PkgConfig from "vite-plugin-package-config";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig(() => {
	return {
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src/"),
			},
		},
		define: {
			"process.env": {
				REACT_APP_IS_E2E: process.env.REACT_APP_IS_E2E,
				REACT_APP_IS_UNIT: process.env.REACT_APP_IS_UNIT,
				ZENDESK_WIDGET_KEY: process.env.ZENDESK_WIDGET_KEY,
			},
		},
		build: {
			rollupOptions: {
				output: {
					manualChunks(id) {
						// Existing manualChunks logic
						if (id.includes("node_modules")) {
							if (
								[
									"react",
									"react-dom",
									"react-datepicker",
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
								].some((pkg) => id.includes(pkg))
							) {
								return "react";
							}

							if (id.includes("@ardenthq/sdk")) return "sdk";
							if (id.includes("@ardenthq/sdk-ark")) return "sdk-ark";
							if (id.includes("@ardenthq/sdk-cryptography")) return "sdk-cryptography";
							if (id.includes("@ardenthq/sdk-helpers")) return "sdk-helpers";
							if (id.includes("@ardenthq/sdk-intl")) return "sdk-intl";
							if (id.includes("@ardenthq/sdk-ledger")) return "sdk-ledger";
							if (id.includes("@ardenthq/sdk-profiles")) return "sdk-profiles";
						}

						// New logic for assets/index
						const assetsIndexPath = path.resolve(__dirname, "src/assets/index");
						if (id.startsWith(assetsIndexPath)) {
							const fileName = path.basename(id, path.extname(id));
							return `assets-index-${fileName}`;
						}

						// Let Rollup decide the rest
						return undefined;
					},
				},
			},
		},
		plugins: [
			react(),
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
					name: "ARK Vault",
					short_name: "ARK Vault",
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
	};
});
