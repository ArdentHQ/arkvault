import { ARK } from "@ardenthq/sdk-ark";
import { updateArkNethashes } from "./update-ark-nethashes";

const arkMainnet = "ark.mainnet";
const arkDevnet = "ark.devnet";
describe("updateArkNethashes", () => {
	let data;
	const mockNethash = "1234567890abcdef";

	beforeEach(() => {
		ARK.manifest = {
			networks: {
				[arkDevnet]: {
					meta: {
						nethash: mockNethash,
					},
				},
				[arkMainnet]: {
					meta: {
						nethash: mockNethash,
					},
				},
			},
		};

		data = {
			networks: {
				ark: {
					[arkDevnet]: {
						id: "ark.devnet",
					},
					[arkMainnet]: {
						id: "ark.mainnet",
					},
				},
			},
		};
	});

	it("should set the nethash for ark.devnet and ark.mainnet", () => {
		updateArkNethashes({ data });
		expect(data.networks.ark[arkDevnet].meta.nethash).toEqual(mockNethash);
		expect(data.networks.ark[arkMainnet].meta.nethash).toEqual(mockNethash);
	});

	it("should initialize meta if it does not exist", () => {
		delete data.networks.ark[arkDevnet].meta;
		updateArkNethashes({ data });
		expect(data.networks.ark[arkDevnet].meta).toBeDefined();
		expect(data.networks.ark[arkDevnet].meta.nethash).toEqual(mockNethash);
	});

	it("should not modify other networks", () => {
		data.networks.ark["ark.someothernet"] = { id: "ark.someothernet" };
		updateArkNethashes({ data });
		expect(data.networks.ark["ark.someothernet"].meta).toBeUndefined();
	});
});
