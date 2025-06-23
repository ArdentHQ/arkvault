import { cloneDeep } from "./clone-deep";

describe("cloneDeep", () => {
	it("should work with objects", () => {
		const object = { a: 1 };

		expect(cloneDeep(object)).toEqual(object);
	});

	it("should work with class instances", () => {
		class Wallet {
			public address: string;

			constructor(address) {
				this.address = address;
			}

			isValidator() {
				return true;
			}
		}

		const original = new Wallet("address");

		expect(original).toEqual(original);
		expect(original.isValidator()).toBe(true);
		expect(original.address).toBe("address");

		const clone = cloneDeep(original);

		expect(clone).toEqual(original);
		expect(clone.isValidator()).toBe(true);
		expect(clone.address).toBe("address");
	});
});
