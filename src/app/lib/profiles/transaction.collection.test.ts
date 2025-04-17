import { describe } from "@ardenthq/sdk-test";

import { ExtendedConfirmedTransactionDataCollection } from "./transaction.collection";

const dummy = {
	id: () => "id",
	recipient: () => "recipient",
	sender: () => "sender",
	timestamp: () => "timestamp",
	type: () => "type",
};

describe("ExtendedConfirmedTransactionDataCollection", ({ beforeAll, beforeEach, loader, nock, assert, it, stub }) => {
	beforeEach((context) => {
		context.subject = new ExtendedConfirmedTransactionDataCollection([dummy], {
			last: 3,
			next: 3,
			prev: 1,
			self: 2,
		});
	});

	it("#findById", (context) => {
		assert.is(context.subject.findById("id"), dummy);
	});

	it("#findByType", (context) => {
		assert.is(context.subject.findByType("type"), dummy);
	});

	it("#findByTimestamp", (context) => {
		assert.is(context.subject.findByTimestamp("timestamp"), dummy);
	});

	it("#findBySender", (context) => {
		assert.is(context.subject.findBySender("sender"), dummy);
	});

	it("#findByRecipient", (context) => {
		assert.is(context.subject.findByRecipient("recipient"), dummy);
	});
});
