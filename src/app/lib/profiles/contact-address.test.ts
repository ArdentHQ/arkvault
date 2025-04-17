import { describe } from "@ardenthq/sdk-test";

import { identity } from "../../mainsail/test/fixtures/identity";
import { bootContainer } from "../test/mocking";
import { ContactAddress } from "./contact-address.js";
import { Profile } from "./profile";

describe("ContactAddress", async ({ it, assert, beforeEach }) => {
	beforeEach((context) => {
		bootContainer();

		const profile = new Profile({ avatar: "avatar", data: "", id: "profile-id", name: "name" });

		context.subject = new ContactAddress(
			{
				address: identity.address,
				coin: "Mainsail",
				id: "uuid",
			},
			profile,
		);
	});

	it("should have an id", (context) => {
		assert.is(context.subject.id(), "uuid");
	});

	it("should have a coin", (context) => {
		assert.is(context.subject.coin(), "Mainsail");
	});

	it("should have an address", (context) => {
		assert.is(context.subject.address(), identity.address);
	});

	it("should have an avatar", (context) => {
		assert.string(context.subject.avatar());
	});

	it("should turn into an object", (context) => {
		assert.equal(context.subject.toObject(), {
			address: identity.address,
			coin: "Mainsail",
			id: "uuid",
		});
	});

	it("should change the address", (context) => {
		context.subject.setAddress("new address");
		assert.is(context.subject.address(), "new address");
	});
});
