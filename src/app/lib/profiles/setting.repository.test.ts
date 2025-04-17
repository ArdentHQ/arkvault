import { describeEach } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { ProfileSetting, WalletSetting } from "./contracts";
import { Profile } from "./profile";
import { SettingRepository } from "./setting.repository";

describeEach(
	"SettingRepository (%s)",
	({ beforeAll, beforeEach, assert, it, dataset }) => {
		beforeAll(() => {
			bootContainer();
		});

		beforeEach((context) => {
			context.subject = new SettingRepository(
				new Profile({ avatar: "avatar", data: "", id: "uuid", name: "name" }),
				Object.values(dataset === "profile" ? ProfileSetting : WalletSetting),
			);

			context.subject.flush();

			context.key = dataset === "profile" ? ProfileSetting.Locale : WalletSetting.Peer;
		});

		it("#all", async (context) => {
			assert.equal(context.subject.all(), {});

			context.subject.set(context.key, "value");

			assert.equal(context.subject.all(), { [context.key]: "value" });
			assert.equal(context.subject.keys(), [context.key]);

			context.subject.flush();

			assert.equal(context.subject.all(), {});
			assert.equal(context.subject.keys(), []);
		});

		it("#get", async (context) => {
			context.subject.set(context.key, "value");

			assert.is(context.subject.get(context.key), "value");
		});

		it("#set", async (context) => {
			assert.undefined(context.subject.set(context.key, "value"));
		});

		it("#has", async (context) => {
			assert.false(context.subject.has(context.key));

			context.subject.set(context.key, "value");

			assert.true(context.subject.has(context.key));
		});

		it("#missing", async (context) => {
			assert.true(context.subject.missing(context.key));

			context.subject.set(context.key, "value");

			assert.false(context.subject.missing(context.key));
		});

		it("#forget", async (context) => {
			assert.false(context.subject.has(context.key));

			context.subject.set(context.key, "value");

			assert.true(context.subject.has(context.key));

			context.subject.forget(context.key);

			assert.false(context.subject.has(context.key));
		});

		it("#flush", async (context) => {
			assert.false(context.subject.has(context.key));

			context.subject.set(context.key, "value");

			assert.true(context.subject.has(context.key));

			context.subject.flush();

			assert.false(context.subject.has(context.key));
		});
	},
	["profile", "wallet"],
);
