import { describe } from "@ardenthq/sdk-test";

import { cloneDeep } from "./clone-deep";

describe("cloneDeep", async ({ assert, it, nock, loader }) => {
	it("should work with objects", () => {
		const object = { a: 1 };

		assert.equal(cloneDeep(object), object);
	});

	it("should work with class instances", () => {
		class Wallet {
			constructor(address) {
				this.address = address;
			}

			isDelegate() {
				return true;
			}
		}

		const original = new Wallet("address");

		assert.equal(original, original);
		assert.true(original.isDelegate());
		assert.is(original.address, "address");

		const clone = cloneDeep(original);

		assert.equal(clone, original);
		assert.true(clone.isDelegate());
		assert.is(clone.address, "address");
	});
});
