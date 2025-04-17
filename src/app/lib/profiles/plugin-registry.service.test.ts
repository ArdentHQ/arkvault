import { describe } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { PluginRegistry } from "./plugin-registry.service.js";

describe("PluginRegistry", ({ beforeEach, afterEach, it, assert, nock, loader }) => {
	beforeEach((context) => {
		bootContainer();

		nock.fake("https://raw.githubusercontent.com")
			.get("/ArdentHQ/wallet-plugins/master/whitelist.json")
			.once()
			.reply(200, loader.json("test/fixtures/plugins/whitelist.json"));

		nock.fake("https://registry.npmjs.com")
			.get("/-/v1/search")
			.query(true)
			.once()
			.reply(200, loader.json("test/fixtures/plugins/index.json"))
			.get("/-/v1/search")
			.query(true)
			.once()
			.reply(200, {});

		const plugins = loader.json("test/fixtures/plugins/index.json").objects;

		for (const { package: plugin } of plugins) {
			if (plugin.links?.repository === undefined) {
				continue;
			}

			nock.fake("https://registry.npmjs.com")
				.get(`/${plugin.name}`)
				.reply(200, loader.json("test/fixtures/plugins/npm.json"));
		}

		context.subject = new PluginRegistry();
	});

	afterEach(() => {});

	it("should list all plugins", async (context) => {
		const result = await context.subject.all();

		assert.length(result, 2);
		assert.object(result[1].toObject());
	});

	it("should get the size of the given plugin", async (context) => {
		nock.fake("https://registry.npmjs.com")
			.get("/@dated/delegate-calculator-plugin")
			.reply(200, loader.json("test/fixtures/plugins/npm.json"))
			.persist();

		const [plugin] = await context.subject.all();

		assert.is(await context.subject.size(plugin), 22_025);
	});

	it("should get the download count of the given plugin", async (context) => {
		nock.fake("https://api.npmjs.org")
			.get(`/downloads/range/2005-01-01:${new Date().getFullYear() + 1}-01-01/@dated/delegate-calculator-plugin`)
			.reply(200, loader.json("test/fixtures/plugins/downloads.json"))
			.persist();

		assert.is(await context.subject.downloads((await context.subject.all())[0]), 446);
	});
});
