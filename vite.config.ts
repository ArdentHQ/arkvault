import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import macrosPlugin from "vite-plugin-babel-macros";
import OptimizationPersist from "vite-plugin-optimize-persist";
import PkgConfig from "vite-plugin-package-config";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

// When you run the command pnpm dev, you can optionally pass the parameter
// `-- --no-optimize` (Notice the double `-- --`) to exclude a specific package
// from optimization. This is useful to ensure that changes made to a package
// linked with a symlink are reflected immediately.
// Example usage: `pnpm dev -- --no-optimize=@ardenthq/sdk-profiles,@ardenthq/sdk-mainsail`
const noOptimize =
	(process.env.npm_lifecycle_script ?? "").match(/--no-optimize=([^\s"]+)(?=")/)?.[1]?.split(",") ?? [];

export default defineConfig(() => {
	return {
		define: {
			"process.env": {
				REACT_APP_IS_E2E: process.env.REACT_APP_IS_E2E,
				REACT_APP_IS_UNIT: process.env.REACT_APP_IS_UNIT,
				ZENDESK_WIDGET_KEY: process.env.ZENDESK_WIDGET_KEY,
			},
		},
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
						"sdk-ark": ["@ardenthq/sdk-ark"],
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
		optimizeDeps: {
			exclude: noOptimize,
			include: [
				"@emotion/cache",
				"@emotion/react",
				"@emotion/styled",
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
				"react-visibility-sensor",
				"semver",
				"socks-proxy-agent",
				"string-hash",
				"twin.macro",
				"yup",
				"react-zendesk",
				"@ardenthq/sdk",
				"@ardenthq/sdk-ark",
				"@ardenthq/sdk-cryptography",
				"@ardenthq/sdk-helpers",
				"@ardenthq/sdk-intl",
				"@ardenthq/sdk-ledger",
				"@ardenthq/sdk-profiles",
				"@ardenthq/sdk-mainsail",
			].filter((pkg) => !noOptimize.includes(pkg)),
		},
	};
});
