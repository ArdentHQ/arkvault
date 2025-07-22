import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
import { visualizer } from "rollup-plugin-visualizer";
import pkg from './package.json'

export default defineConfig(async () => {
	const tailwindcss = (await import("@tailwindcss/vite")).default;

	return {
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src/"),
				"node:fs/promises": path.resolve(__dirname, "./src/app/lib/shims.ts"),
				"node:url": path.resolve(__dirname, "./src/app/lib/shims.ts"),
				"node:process": path.resolve(__dirname, "./src/app/lib/shims.ts"),
				perf_hooks: path.resolve(__dirname, "./src/app/lib/shims.ts"),
				worker_threads: path.resolve(__dirname, "./src/app/lib/shims.ts"),
				"node:util": "util",
			},
		},
		define: {
			"process.browser": true,
			"process.env": {
				REACT_APP_IS_E2E: process.env.REACT_APP_IS_E2E,
				REACT_APP_IS_UNIT: process.env.REACT_APP_IS_UNIT,
				ZENDESK_WIDGET_KEY: process.env.ZENDESK_WIDGET_KEY,
				APP_VERSION: pkg.version,
			},
		},
		build: {
			target: "esnext",
			rollupOptions: {
				// https://rollupjs.org/guide/en/#big-list-of-options
				output: {
					manualChunks: {
						ledger: [
							"@ledgerhq/hw-app-eth",
							"@ledgerhq/hw-transport-webhid",
							"@ledgerhq/hw-transport-webusb",
						],
						react: [
							"react",
							"react-datepicker",
							"react-dom",
							"react-error-boundary",
							"react-hook-form",
							"react-i18next",
							"react-idle-timer",
							"react-loading-skeleton",
							"react-qr-reader",
							"react-router",
							"react-router-dom",
							"react-table",
							"react-toastify",
						],
						"arkvault-crypto": ["@ardenthq/arkvault-crypto"],
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
		plugins: [
			tailwindcss(),
			react(),
			svgrPlugin(),
			VitePWA({
				workbox: {
					// Prevent from precaching html files. Caching index.html causes white-screen after each deployment.
					// See: https://vite-plugin-pwa.netlify.app/guide/static-assets.html#globpatterns
					globPatterns: ["**/*.{js,css}"],
					// `sdk-mainsail` package's build size is approx 6MB and workbox errors with file size error (as the default is 2MB)
					// @see https://app.clickup.com/t/86dvfwnf2
					maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6 MiB
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
			{
				// Vite does not ignore sourcemaps for PSDK files, even when `server.sourcemap` or `rollupOptions.output.sourcemap` are set to `false`.
				// This plugin explicitly removes sourcemaps for psdk files, by unsetting the `mappings` field.
				name: "ignore-sdk-sourcemaps",
				transform(code, path) {
					const sdkPackage = /\/node_modules\/.*@ardenthq\/sdk/;

					if (sdkPackage.test(path)) {
						return {
							code,
							map: { mappings: "" }, // Remove sourcemaps
						};
					}

					return null;
				},
			},
			nodePolyfills({
				// To add only specific polyfills, add them here. If no option is passed, adds all polyfills
				include: [
					"buffer",
					"os",
					"process",
					// "fs",
					"path",
					"http",
					"https",
					// "crypto",
					"module",
					"util",
					"events",
					"string_decoder",
					"url",
				],
				// Whether to polyfill specific globals.
				globals: {
					Buffer: true, // can also be 'build', 'dev', or false
					global: true,
					process: false,
				},
			}),
		],
		optimizeDeps: {
			include: [
				"@ardenthq/arkvault-crypto",
				"rollup-plugin-polyfill-node/polyfills/util",
				"@faustbrian/node-haveibeenpwned",
				"@ardenthq/arkvault-url",
				"@tippyjs/react",
				"assert",
				"browser-fs-access",
				"classnames",
				"cross-fetch",
				"downshift",
				"focus-visible",
				"framer-motion",
				"i18next",
				"locale-currency",
				"multiformats",
				"p-retry",
				"qr-scanner",
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
				"react-resize-detector",
				"react-responsive",
				"react-router",
				"react-router-dom",
				"react-table",
				"react-toastify",
				"semver",
				"socks-proxy-agent",
				"string-hash",
				"yup",
				"react-zendesk",
				"@ledgerhq/hw-app-eth",
				"@ledgerhq/hw-transport-webhid",
				"@ledgerhq/hw-transport-webusb",
			],
		},
	};
});
