import { describeWithContext } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { PluginRepository } from "./plugin.repository";
import { PluginRegistry } from "./plugin-registry.service.js";

describeWithContext(
	"PluginRepository",
	{
		stubPlugin: {
			isEnabled: true,
			name: "@hello/world",
			permissions: ["something"],
			urls: ["https://google.com"],
			version: "1.0.0",
		},
	},
	({ beforeEach, it, assert }) => {
		beforeEach((context) => {
			bootContainer();

			context.subject = new PluginRepository();
		});

		it("should return all data", (context) => {
			assert.object(context.subject.all());
		});

		it("should return the first item", (context) => {
			assert.undefined(context.subject.first());
		});

		it("should return the last item", (context) => {
			assert.undefined(context.subject.last());
		});

		it("should return all data keys", (context) => {
			assert.array(context.subject.keys());
		});

		it("should return all data values", (context) => {
			assert.array(context.subject.values());
		});

		it("should find a plugin by its ID", (context) => {
			const { id } = context.subject.push(context.stubPlugin);

			assert.is(context.subject.findById(id).name, context.stubPlugin.name);
		});

		it("should throw if a plugin cannot be found by its ID", (context) => {
			assert.throws(() => context.subject.findById("fake"), `Failed to find a plugin for [fake].`);
		});

		it("should restore previously created data", (context) => {
			context.subject.fill({ ["fake"]: context.stubPlugin });

			assert.is(context.subject.findById("fake"), context.stubPlugin);
		});

		it("should forget specific data", (context) => {
			const { id } = context.subject.push(context.stubPlugin);

			assert.is(context.subject.count(), 1);

			context.subject.forget(id);

			assert.is(context.subject.count(), 0);
		});

		it("should flush the data", (context) => {
			context.subject.push(context.stubPlugin);

			assert.is(context.subject.count(), 1);

			assert.undefined(context.subject.flush());

			assert.is(context.subject.count(), 0);
		});

		it("should count the data", (context) => {
			assert.is(context.subject.count(), 0);
		});

		it("should access the plugin registry", (context) => {
			assert.instance(context.subject.registry(), PluginRegistry);
		});
	},
);
