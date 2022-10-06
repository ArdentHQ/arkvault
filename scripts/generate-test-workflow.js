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
		maxWorkers: 2,
	},
	"domains/contact": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: 2,
	},
	"domains/dashboard": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: 2,
	},
	"domains/error": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: 2,
	},
	"domains/exchange": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: 2,
	},
	"domains/message": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: 2,
	},
	"domains/network": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: 2,
	},
	"domains/news": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: 2,
	},
	"domains/profile": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: 2,
	},
	"domains/setting": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: 2,
	},
	"domains/transaction": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: 2,
	},
	"domains/vote": {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: 2,
	},
	"domains/wallet": {
		coverageThreshold: {
			branches: 95,
			functions: 80,
			lines: 60,
			statements: 60,
		},
		maxWorkers: 2,
	},
	router: {
		coverageThreshold: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		maxWorkers: 2,
	},
	utils: {
		coverageThreshold: {
			branches: 55.71,
			functions: 23.4,
			lines: 50,
			statements: 46.94,
		},
		maxWorkers: 2,
	},
};

for (const [directory] of Object.entries(directories)) {
	const job = {
		"runs-on": "ubuntu-latest",
		strategy: {
			matrix: {
				"node-version": ["16.17.1"],
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
					version: 7,
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
				run: "pnpm install --frozen-lockfile",
			},
			{
				name: "Rebuild",
				run: "pnpm rebuild",
			},
			{
				name: "Test",
				uses: "nick-invision/retry@v2",
				with: {
					timeout_minutes: 20,
					max_attempts: 1,
					command: `pnpm vitest run --coverage --dir src/${directory}`,
				},
			},
		],
	};

	workflow.jobs[slugify(directory)] = job;
}

writeFileSync(resolve(".github/workflows/test.yml"), YAML.stringify(workflow, { indent: 4 }));
