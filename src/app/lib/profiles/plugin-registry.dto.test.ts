import { describe } from "@ardenthq/sdk-test";

import { RegistryPlugin } from "./plugin-registry.dto.js";

describe("RegistryPlugin #sourceProvider", ({ it, assert, each }) => {
	each(
		"should handle github source provider",
		async ({ dataset }) => {
			const [company, project] = dataset;

			const subject = new RegistryPlugin(
				{
					links: {
						repository: `https://github.com/${company}/${project}`,
					},
				},
				{},
			);

			assert.is(subject.sourceProvider().url, `https://github.com/${company}/${project}`);
		},
		[
			["company", "project"],
			["COMPANY", "PROJECT"],
		],
	);

	each(
		"should handle bitbucket source provider",
		async ({ dataset }) => {
			const [company, project] = dataset;

			const subject = new RegistryPlugin(
				{
					links: {
						repository: `https://bitbucket.com/${company}/${project}`,
					},
				},
				{},
			);

			assert.is(subject.sourceProvider().url, `https://bitbucket.com/${company}/${project}`);
		},
		[
			["company", "project"],
			["COMPANY", "PROJECT"],
		],
	);

	each(
		"should handle gitlab source provider",
		async ({ dataset }) => {
			const [company, project] = dataset;

			const subject = new RegistryPlugin(
				{
					links: {
						repository: `https://gitlab.com/${company}/${project}`,
					},
				},
				{},
			);

			assert.is(subject.sourceProvider().url, `https://gitlab.com/${company}/${project}`);
		},
		[
			["company", "project"],
			["COMPANY", "PROJECT"],
		],
	);

	it("should handle unknown source provider", async () => {
		const subject = new RegistryPlugin(
			{
				links: {
					repository: "https://mycompany.com/project",
				},
			},
			{},
		);

		assert.null(subject.sourceProvider());
	});
});

describe("RegistryPlugin #getMetadata", ({ it, assert }) => {
	it("should find the requested key", async () => {
		const subject = new RegistryPlugin(
			{},
			{
				title: "someValue",
			},
		);

		assert.is(subject.alias(), "someValue");
	});

	it("should find the requested desktop-wallet key", async () => {
		const subject = new RegistryPlugin(
			{},
			{
				"desktop-wallet": {
					logo: "someValue",
				},
			},
		);

		assert.is(subject.logo(), "someValue");
	});

	it("should miss the requested desktop-wallet key", async () => {
		const subject = new RegistryPlugin(
			{},
			{
				"desktop-wallet": {
					title: "someValue",
				},
			},
		);

		assert.undefined(subject.logo());
	});

	it("should miss the requested key", async () => {
		const subject = new RegistryPlugin(
			{},
			{
				title: "someValue",
			},
		);

		assert.undefined(subject.logo());
	});
});
