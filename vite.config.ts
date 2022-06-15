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
					sdk: ["@ardenthq/sdk"],
					"sdk-ark": ["@ardenthq/sdk-ark"],
					"sdk-cryptography": ["@ardenthq/sdk-cryptography"],
					"sdk-helpers": ["@ardenthq/sdk-helpers"],
					"sdk-intl": ["@ardenthq/sdk-intl"],
					"sdk-ledger": ["@ardenthq/sdk-ledger"],
					"sdk-news": ["@ardenthq/sdk-news"],
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
			includeAssets: [
				"favicon.svg",
				"favicon.ico",
				"favicon-32x32.png",
				"favicon-16x16.png",
				"robots.txt",
				"app-icon-192.png",
				"app-maskable-icon-512.png",
				"splashscreens/iphone5_splash.png",
				"splashscreens/iphone6_splash.png",
				"splashscreens/iphoneplus_splash.png",
				"splashscreens/iphonex_splash.png",
				"splashscreens/iphonexr_splash.png",
				"splashscreens/iphonexsmax_splash.png",
				"splashscreens/ipad_splash.png",
				"splashscreens/ipadpro1_splash.png",
				"splashscreens/ipadpro3_splash.png",
				"splashscreens/ipadpro2_splash.png",
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
				theme_color: "#FFFFFF",
				background_color: "#235B95",
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
