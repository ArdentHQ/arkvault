import { describe } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { ReadOnlyWallet } from "./read-only-wallet";

describe("ReadOnlyWallet", ({ beforeEach, assert, it, nock, loader }) => {
	beforeEach(async (context) => {
		context.subject = new ReadOnlyWallet({
			address: identity.address,
			explorerLink: "https://google.com",
			governanceIdentifier: "address",
			isDelegate: false,
			isResignedDelegate: false,
			publicKey: identity.publicKey,
			rank: 1,
			username: "arkx",
		});
	});

	it("should have an address", (context) => {
		assert.is(context.subject.address(), identity.address);
	});

	it("should have a publicKey", (context) => {
		assert.is(context.subject.publicKey(), identity.publicKey);
	});

	it("should have an username", (context) => {
		assert.is(context.subject.username(), "arkx");
	});

	it("should have an avatar", (context) => {
		assert.string(context.subject.avatar());
	});

	it("should have an explorer link", (context) => {
		assert.is(context.subject.explorerLink(), "https://google.com");
	});

	it("should have an address as governance identifier", (context) => {
		assert.is(context.subject.governanceIdentifier(), identity.address);
	});

	it("should have an publicKey as governance identifier", (context) => {
		const subject = new ReadOnlyWallet({
			address: identity.address,
			explorerLink: "https://google.com",
			governanceIdentifier: "publicKey",
			isDelegate: false,
			isResignedDelegate: false,
			publicKey: identity.publicKey,
			rank: 1,
			username: "arkx",
		});

		assert.is(subject.governanceIdentifier(), identity.publicKey);
	});
});
