import { ARK } from "@ardenthq/sdk-ark";
import { updateArkNethashes } from "./update-ark-nethashes";

describe("updateArkNethashes", () => {
	let data;
	const mockNethash = "1234567890abcdef";

	beforeEach(() => {
		ARK.manifest = {
			networks: {
				"ark.devnet": {
					meta: {
						nethash: mockNethash,
					},
				},
				"ark.mainnet": {
					meta: {
						nethash: mockNethash,
					},
				},
			},
		};

		data = {
			networks: {
				ark: {
					"ark.devnet": {
						id: "ark.devnet",
					},
					"ark.mainnet": {
						id: "ark.mainnet",
					},
				},
			},
		};
	});

	it("should not modify anything if the ark property is not defined", () => {
		const emptyData = { networks: {} };
		updateArkNethashes({ data: emptyData });
		expect(emptyData.networks.ark).toBeUndefined();
	});

	it("should set the nethash for ark.devnet and ark.mainnet", () => {
		updateArkNethashes({ data });
		expect(data.networks.ark["ark.devnet"].meta.nethash).toEqual(mockNethash);
		expect(data.networks.ark["ark.mainnet"].meta.nethash).toEqual(mockNethash);
	});

	it("should initialize meta if it does not exist", () => {
		delete data.networks.ark["ark.devnet"].meta;
		updateArkNethashes({ data });
		expect(data.networks.ark["ark.devnet"].meta).toBeDefined();
		expect(data.networks.ark["ark.devnet"].meta.nethash).toEqual(mockNethash);
	});

	it("should not modify other networks", () => {
		data.networks.ark["ark.someothernet"] = { id: "ark.someothernet" };
		updateArkNethashes({ data });
		expect(data.networks.ark["ark.someothernet"].meta).toBeUndefined();
	});
});
