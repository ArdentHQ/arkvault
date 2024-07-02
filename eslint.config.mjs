import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import promise from "eslint-plugin-promise";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";
import sonarjs from "eslint-plugin-sonarjs";
import sortKeysFix from "eslint-plugin-sort-keys-fix";
import testcafe from "eslint-plugin-testcafe";
import testingLibrary from "eslint-plugin-testing-library";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	{
		ignores: [
			"build/",
			"config-overrides.js",
			"coverage/",
			"dist/",
			"vitest.setup.ts",
			"public/",
			"scripts/",
			"src/i18n",
			"src/resources/*",
			"src/tailwind.config.js",
			"src/tests",
			"react-app-env.d.ts",
			"*.d.ts",
		],
	},
	...fixupConfigRules(
		compat.extends(
			"eslint:recommended",
			"plugin:@typescript-eslint/eslint-recommended",
			"plugin:@typescript-eslint/recommended-requiring-type-checking",
			"plugin:@typescript-eslint/recommended",
			// "plugin:import/errors",
			// "plugin:import/typescript",
			// "plugin:import/warnings",
			"plugin:prettier/recommended",
			"plugin:promise/recommended",
			"plugin:react-hooks/recommended",
			"plugin:react/recommended",
			"plugin:sonarjs/recommended",
			"plugin:testcafe/recommended",
			"plugin:testing-library/react",
			"plugin:unicorn/recommended",
		),
	),
	{
		plugins: {
			"@typescript-eslint": fixupPluginRules(typescriptEslint),
			prettier: fixupPluginRules(prettier),
			promise: fixupPluginRules(promise),
			"react-hooks": fixupPluginRules(reactHooks),
			react: fixupPluginRules(react),
			sonarjs: fixupPluginRules(sonarjs),
			"sort-keys-fix": sortKeysFix,
			testcafe: fixupPluginRules(testcafe),
			"testing-library": fixupPluginRules(testingLibrary),
			unicorn: fixupPluginRules(unicorn),
			"unused-imports": unusedImports,
		},

		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				vi: false,
			},

			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},

				project: "./tsconfig.eslint.json",
				tsconfigRootDir: __dirname,
				projectFolderIgnoreList: ["build", "coverage", "node_modules", "public", "dist", "src/tests/mocks"],
			},
		},

		settings: {
			react: {
				version: "detect",
			},
		},

		rules: {
			"@typescript-eslint/ban-ts-comment": "warn",
			"@typescript-eslint/ban-types": "warn",
			"@typescript-eslint/consistent-type-definitions": ["error", "interface"],
			"@typescript-eslint/explicit-module-boundary-types": "warn",
			"@typescript-eslint/no-empty-function": "warn",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-floating-promises": "off",
			"@typescript-eslint/no-misused-promises": "warn",
			"@typescript-eslint/no-non-null-assertion": "warn",
			"@typescript-eslint/no-unnecessary-condition": "warn",
			"@typescript-eslint/no-unsafe-argument": "warn",
			"@typescript-eslint/no-unsafe-assignment": "warn",
			"@typescript-eslint/no-unsafe-call": "warn",
			"@typescript-eslint/no-unsafe-member-access": "warn",
			"@typescript-eslint/no-unsafe-return": "warn",
			"@typescript-eslint/no-unused-expressions": "warn",
			"@typescript-eslint/await-thenable": "off",

			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					varsIgnorePattern: "_",
				},
			],

			"@typescript-eslint/no-var-requires": "warn",
			"@typescript-eslint/prefer-regexp-exec": "warn",
			"@typescript-eslint/restrict-plus-operands": "warn",
			"@typescript-eslint/restrict-template-expressions": "warn",
			"@typescript-eslint/unbound-method": "warn",
			"arrow-body-style": ["error", "as-needed"],
			curly: "error",
			// "import/order": "error",
			// "import/default": "error",
			// "import/export": "warn",
			// "import/exports-last": "warn",
			// "import/extensions": "off",
			// "import/first": "error",
			// "import/group-exports": "off",
			// "import/namespace": "error",
			// "import/no-absolute-path": "error",
			// "import/no-anonymous-default-export": "error",
			// "import/no-cycle": "warn",
			// "import/no-deprecated": "error",
			// "import/no-duplicates": "error",
			// "import/no-dynamic-require": "off",
			// "import/no-extraneous-dependencies": "error",
			// "import/no-mutable-exports": "error",
			// "import/no-namespace": "warn",
			// "import/no-relative-parent-imports": "error",
			// "import/no-restricted-paths": "error",
			// "import/no-self-import": "error",
			// "import/no-unresolved": "off",
			// "import/no-unused-modules": "error",
			// "import/no-useless-path-segments": "error",
			// "import/no-webpack-loader-syntax": "error",

			"max-lines": [
				"warn",
				{
					max: 300,
					skipBlankLines: true,
					skipComments: true,
				},
			],

			"max-lines-per-function": [
				"warn",
				{
					max: 40,
					skipBlankLines: true,
					skipComments: true,
				},
			],

			"no-negated-condition": "error",
			"no-nested-ternary": "error",
			"no-unneeded-ternary": "error",
			"no-unused-expressions": "off",
			"no-unused-vars": "off",

			"prefer-const": [
				"warn",
				{
					destructuring: "all",
				},
			],

			"prettier/prettier": [
				"off",
				{
					endOfLine: "auto",
				},
			],

			"promise/param-names": "warn",
			"react-hooks/rules-of-hooks": "error",

			"react/no-unknown-property": [
				"error",
				{
					ignore: ["css"],
				},
			],

			"react/prop-types": "off",
			"react/self-closing-comp": "error",
			"sonarjs/cognitive-complexity": "error",
			"sonarjs/no-all-duplicated-branches": "error",
			"sonarjs/no-collapsible-if": "error",
			"sonarjs/no-duplicate-string": ["error", 5],
			"sonarjs/no-identical-expressions": "error",
			"sonarjs/no-identical-functions": "error",
			"sonarjs/no-redundant-jump": "error",
			"sonarjs/no-small-switch": "error",
			"sonarjs/no-use-of-empty-return-value": "error",
			"sonarjs/no-nested-template-literals": "warn",
			"sonarjs/prefer-single-boolean-return": "off",

			"sort-keys-fix/sort-keys-fix": [
				"error",
				"asc",
				{
					caseSensitive: true,
				},
			],

			"testing-library/await-async-queries": "warn",
			"testing-library/await-async-utils": "error",
			"testing-library/consistent-data-testid": "off",
			"testing-library/no-await-sync-events": "error",
			"testing-library/no-await-sync-queries": "error",
			"testing-library/no-container": "error",
			"testing-library/no-debugging-utils": "error",
			"testing-library/no-dom-import": "error",
			"testing-library/no-manual-cleanup": "error",
			"testing-library/no-node-access": "error",
			"testing-library/no-promise-in-fire-event": "error",
			"testing-library/no-render-in-lifecycle": "error",
			"testing-library/no-unnecessary-act": "error",
			"testing-library/no-wait-for-multiple-assertions": "error",
			"testing-library/no-wait-for-side-effects": "error",
			"testing-library/no-wait-for-snapshot": "error",
			"testing-library/prefer-explicit-assert": "error",
			"testing-library/prefer-find-by": "error",
			"testing-library/prefer-presence-queries": "error",
			"testing-library/prefer-screen-queries": "error",
			"testing-library/prefer-user-event": "error",
			"testing-library/render-result-naming-convention": "error",
			"unicorn/consistent-destructuring": "error",
			"unicorn/consistent-function-scoping": "error",
			"unicorn/error-message": "error",
			"unicorn/explicit-length-check": "error",
			"unicorn/filename-case": "warn",
			"unicorn/import-style": "error",
			"unicorn/no-abusive-eslint-disable": "error",
			"unicorn/no-array-callback-reference": "warn",
			"unicorn/no-array-for-each": "error",
			"unicorn/no-array-method-this-argument": "warn",
			"unicorn/no-array-reduce": "error",
			"unicorn/no-await-expression-member": "error",
			"unicorn/no-new-array": "error",
			"unicorn/no-null": "warn",
			"unicorn/no-object-as-default-parameter": "error",

			"unicorn/no-useless-undefined": [
				"error",
				{
					checkArguments: false,
				},
			],

			"unicorn/prefer-array-some": "error",
			"unicorn/prefer-at": "off",
			"unicorn/prefer-module": "off",
			"unicorn/prefer-node-protocol": "off",
			"unicorn/prefer-number-properties": "error",
			"unicorn/prefer-prototype-methods": "error",
			"unicorn/prefer-spread": "error",
			"unicorn/prefer-string-slice": "error",
			"unicorn/prefer-ternary": "off",
			"unicorn/prefer-top-level-await": "error",
			"unicorn/prefer-blob-reading-methods": "off",

			"unicorn/prevent-abbreviations": [
				"error",
				{
					ignore: [{}, "i18n", "e2e"],
				},
			],

			// "unused-imports/no-unused-imports-ts": "error",
		},
	},
	{
		files: ["**/e2e/*.ts", "**/cucumber/*.ts", "**/cucumber/*.feature"],

		rules: {
			"import/no-relative-parent-imports": "off",
			"sort-keys-fix/sort-keys-fix": "off",
		},
	},
];
