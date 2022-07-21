const slugify = require("@sindresorhus/slugify");
const { writeFileSync } = require("fs");
const { resolve } = require("path");
const YAML = require("yaml");

const workflow = {
	name: "Test",
	on: {
		push: {
			branches: ["master", "develop"],
		},
		pull_request: {
			types: ["ready_for_review", "synchronize", "opened"],
		},
	},
	jobs: {},
};

const directories = {
	app: {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: 4,
	},
	"domains/contact": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: "50%",
	},
	"domains/dashboard": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: "50%",
	},
	"domains/error": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: "50%",
	},
	"domains/exchange": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: "50%",
	},
	"domains/network": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: "50%",
	},
	"domains/news": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: "50%",
	},
	"domains/profile": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: "50%",
	},
	"domains/setting": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: "50%",
	},
	"domains/transaction": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: 3,
	},
	"domains/vote": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: "50%",
	},
	"domains/wallet": {
		coverageThreshold: {
			branches: 95,
			functions: 80,
			lines: 60,
			statements: 60,
		},
		maxWorkers: "50%",
	},
	router: {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: "50%",
	},
	utils: {
		coverageThreshold: {
			branches: 55.71,
			functions: 23.4,
			lines: 50,
			statements: 46.94,
		},
		maxWorkers: "50%",
	},
};

for (const [directory, { coverageThreshold, maxWorkers }] of Object.entries(directories)) {
	const collectCoverageFrom = [
		`src/${directory}/**/*.{js,jsx,ts,tsx}`,
		"!<rootDir>/build/*",
		"!<rootDir>/dist/*",
		"!jest.setup.js",
		"!src/**/e2e/*.ts",
		"!src/**/cucumber/*.ts",
		"!src/**/*.e2e.ts",
		"!src/**/*.models.{js,jsx,ts,tsx}",
		"!src/**/*.stories.{js,jsx,ts,tsx}",
		"!src/**/*.styles.{js,jsx,ts,tsx}",
		"!src/i18n/**/*",
		"!src/tests/**/*",
		"!src/tailwind.config.js",
		"!src/utils/e2e-utils.ts",
		"!src/polyfill/**/*",
	];

	const job = {
		"runs-on": "ubuntu-latest",
		strategy: {
			matrix: {
				"node-version": ["16.x"],
			},
		},
		concurrency: {
			group: `\${{ github.head_ref }}-test-${slugify(directory)}`,
			"cancel-in-progress": true,
		},
		steps: [
			{
				uses: "actions/checkout@v2",
				with: {
					ref: "${{ github.head_ref }}",
				},
			},
			{
				uses: "pnpm/action-setup@v2",
				with: {
					version: "6.24.4",
				},
			},
			{
				uses: "actions/setup-node@v2",
				with: {
					"node-version": "${{ matrix.node-version }}",
					cache: "pnpm",
				},
			},
			{
				name: "Update System",
				run: "sudo apt-get update",
			},
			{
				name: "Install (Ledger Requirements)",
				run: "sudo apt-get install libudev-dev libusb-1.0-0-dev",
			},
			{
				name: "Install (pnpm)",
				run: "pnpm install",
			},
			{
				name: "Rebuild",
				run: "pnpm rebuild",
			},
			{
				name: "Test",
				uses: "nick-invision/retry@v2",
				with: {
					timeout_minutes: 10,
					max_attempts: 1,
					command: `.pnpm test --expose-gc test src/${directory} --env=./src/tests/custom-env.js --forceExit --maxWorkers=${maxWorkers} --logHeapUsage --watchAll=false --coverage --collectCoverageFrom='${JSON.stringify(
						collectCoverageFrom,
					)}' --coverageThreshold='${JSON.stringify({
						[`./src/${directory}/`]: coverageThreshold,
					})}'`,
				},
			},
		],
	};

	workflow.jobs[slugify(directory)] = job;
}

writeFileSync(resolve(".github/workflows/test.yml"), YAML.stringify(workflow, { indent: 4 }));
