import { describe } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { Contact } from "./contact";
import { ContactAddressRepository } from "./contact-address.repository";
import { Profile } from "./profile";

describe("Contact", ({ assert, it, beforeEach }) => {
	beforeEach((context) => {
		bootContainer();

		const profile = new Profile({ avatar: "avatar", data: "", id: "uuid", name: "name" });
		profile.coins().set("ARK", "ark.devnet");

		context.subject = new Contact(
			{
				id: "uuid",
				name: "John Doe",
				starred: true,
			},
			profile,
		);
	});

	it("should have an id", (context) => {
		assert.is(context.subject.id(), "uuid");
	});

	it("should have a name", (context) => {
		assert.is(context.subject.name(), "John Doe");
	});

	it("should be able to change name", (context) => {
		context.subject.setName("Jane Doe");
		assert.is(context.subject.name(), "Jane Doe");
	});

	it("should have starred state", (context) => {
		assert.true(context.subject.isStarred());
	});

	it("should be able to toggle starred state", (context) => {
		context.subject.toggleStarred();
		assert.false(context.subject.isStarred());
	});

	it("should have an avatar", (context) => {
		assert.string(context.subject.avatar());
	});

	it("should map to object", (context) => {
		assert.equal(context.subject.toObject(), {
			addresses: [],
			id: "uuid",
			name: "John Doe",
			starred: true,
		});
	});

	it("should return addresses", (context) => {
		assert.instance(context.subject.addresses(), ContactAddressRepository);
	});

	it("should be able to set addresses", (context) => {
		assert.throws(() => context.subject.setAddresses([]), '"addresses" must contain at least 1 items');

		context.subject.setAddresses([
			{
				address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
				coin: "ARK",
			},
		]);

		assert.is(context.subject.addresses().count(), 1);
	});
});
