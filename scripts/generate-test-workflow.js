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

const directories = [
	"app",
	"domains/contact",
	"domains/dashboard",
	"domains/error",
	"domains/exchange",
	"domains/message",
	"domains/network",
	"domains/profile",
	"domains/setting",
	"domains/transaction",
	"domains/vote",
	"domains/wallet",
	"router",
	"utils",
];

for (const directory of directories) {
	const job = {
		"runs-on": "ubuntu-latest",
		env: {
			COVERAGE_INCLUDE_PATH: `src/${directory}`,
		},
		strategy: {
			matrix: {
				"node-version": ["20.12.2"],
			},
		},
		concurrency: {
			group: `\${{ github.head_ref }}-test-${slugify(directory)}`,
			"cancel-in-progress": true,
		},
		steps: [
			{
				uses: "actions/checkout@v3",
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
