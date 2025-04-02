import { cloneDeep } from "./clone-deep";

describe("cloneDeep", () => {
	it("should work with objects", () => {
		const object = { a: 1 };

		expect(cloneDeep(object)).toEqual(object);
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

		expect(original).toEqual(original);
		expect(original.isDelegate()).toBe(true);
		expect(original.address).toBe("address");

		const clone = cloneDeep(original);

		expect(clone).toEqual(original);
		expect(clone.isDelegate()).toBe(true);
		expect(clone.address).toBe("address");
	});
});
