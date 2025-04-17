import { describeWithContext } from "@ardenthq/sdk-test";

import { identity } from "../../mainsail/test/fixtures/identity";
import { bootContainer } from "../test/mocking";
import { ContactRepository } from "./contact.repository";
import { Profile } from "./profile";

void describeWithContext(
	"ContactRepository",
	{
		addr: { address: identity.address, coin: "Mainsail" },
		addr2: { address: "0x71c3377F6baF114A975A151c4685E600d13636F6", coin: "Mainsail" },
		name: "John Doe",
	},
	async ({ beforeEach, it, assert }) => {
		beforeEach((context) => {
			bootContainer();

			const profile = new Profile({ avatar: "avatar", data: "", id: "profile-id", name: "name" });

			context.subject = new ContactRepository(profile);
			context.subject.flush();
		});

		it("#first | #last", (context) => {
			const john = context.subject.create("John", [context.addr]);
			const jane = context.subject.create("Jane", [context.addr]);

			assert.is(context.subject.first(), john);
			assert.is(context.subject.last(), jane);
		});

		it("#create", (context) => {
			assert.length(context.subject.keys(), 0);

			const result = context.subject.create(context.name, [context.addr]);

			assert.length(context.subject.keys(), 1);

			// @TODO
			// assert.equal(result.toObject(), {
			// 	id: result.id(),
			// 	name,
			// 	starred: false,
			// 	addresses: [
			// 		{
			// 			"id": "37c41631-1452-4d0a-b951-b3a25be96fe9",
			// 			"coin": "ARK",
			// 			"network": "ark.devnet",
			// 			"address": "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW"
			// 			}
			// 	],
			// });

			assert.throws(
				() => context.subject.create(context.name, [context.addr]),
				`The contact [${context.name}] already exists.`,
			);
			assert.throws(() => context.subject.create("Jane Doe", []), '"addresses" must contain at least 1 items');
			assert.is(context.subject.count(), 1);

			assert.throws(
				() =>
					context.subject.create("InvalidAddress", [
						{
							address: undefined,
							coin: "ARK",
						},
					]),
				'addresses[0].address" is required',
			);

			assert.is(context.subject.count(), 1);

			assert.throws(
				() =>
					context.subject.create("InvalidAddress", [
						{
							address: "a",
							coin: undefined,
						},
					]),
				'addresses[0].coin" is required',
			);

			assert.is(context.subject.count(), 1);
		});

		it("#find", (context) => {
			assert.throws(() => context.subject.findById("invalid"), "Failed to find");

			const contact = context.subject.create(context.name, [context.addr]);

			assert.object(context.subject.findById(contact.id()));
		});

		it("#update", (context) => {
			assert.throws(() => context.subject.update("invalid", { name: "Jane Doe" }), "Failed to find");

			const contact = context.subject.create(context.name, [context.addr]);

			context.subject.update(contact.id(), { name: "Jane Doe" });

			assert.is(context.subject.findById(contact.id()).name(), "Jane Doe");

			const anotherContact = context.subject.create("Another name", [context.addr]);

			assert.not.throws(() => context.subject.update(anotherContact.id(), { name: "Dorothy" }));

			const newContact = context.subject.create("Another name", [context.addr]);

			assert.throws(
				() => context.subject.update(newContact.id(), { name: "Jane Doe" }),
				"The contact [Jane Doe] already exists.",
			);
		});

		it("#update with addresses", (context) => {
			const contact = context.subject.create(context.name, [context.addr]);

			assert.throws(
				() => context.subject.update(contact.id(), { addresses: [] }),
				'"addresses" must contain at least 1 items',
			);

			assert.length(context.subject.findById(contact.id()).addresses().keys(), 1);

			context.subject.update(contact.id(), { addresses: [context.addr2] });

			assert.array(contact.toObject().addresses);
		});

		it("#forget", (context) => {
			assert.throws(() => context.subject.forget("invalid"), "Failed to find");

			const contact = context.subject.create(context.name, [context.addr]);

			context.subject.forget(contact.id());

			assert.throws(() => context.subject.findById(contact.id()), "Failed to find");
		});

		it("#findByAddress", (context) => {
			context.subject.create(context.name, [context.addr]);

			assert.length(context.subject.findByAddress(context.addr.address), 1);
			assert.length(context.subject.findByAddress("invalid"), 0);
		});

		it("#findByCoin", (context) => {
			context.subject.create(context.name, [context.addr]);

			assert.length(context.subject.findByCoin(context.addr.coin), 1);
			assert.length(context.subject.findByCoin("invalid"), 0);
		});

		it("#flush", (context) => {
			context.subject.create(context.name, [context.addr]);

			assert.length(context.subject.keys(), 1);

			context.subject.flush();

			assert.length(context.subject.keys(), 0);
		});
	},
);
