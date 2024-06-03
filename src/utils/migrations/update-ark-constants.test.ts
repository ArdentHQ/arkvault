import { ARK } from "@ardenthq/sdk-ark";
import { updateArkConstants } from "./update-ark-constants";

describe("updateArkConstants", () => {
	let data;
	const arkMainnet = "ark.mainnet";

	beforeEach(() => {
		ARK.manifest = {
			networks: {
				[arkMainnet]: {
					constants: {
						epoch: "2023-01-01T00:00:00.000Z",
						slip44: 0,
					},
					hosts: [
						{
							host: "example.payvo.com",
							type: "musig",
						},
						{
							host: "otherhost.com",
							type: "musig",
						},
					],
				},
			},
		};

		data = {
			networks: {
				ark: {
					[arkMainnet]: {
						constants: {
							epoch: undefined,
						},
						hosts: [],
						id: arkMainnet,
					},
				},
			},
		};
	});

	it("should set the epoch constant if undefined", () => {
		updateArkConstants({ data });
		expect(data.networks.ark[arkMainnet].constants.epoch).toEqual("2023-01-01T00:00:00.000Z");
	});

	it("should update hosts if any host contains 'payvo.com'", () => {
		data.networks.ark[arkMainnet].hosts = [{ host: "example.payvo.com" }];
		updateArkConstants({ data });
		expect(data.networks.ark[arkMainnet].hosts).toEqual(ARK.manifest.networks[arkMainnet].hosts);
	});

	it("should leave hosts unchanged if they are already correct", () => {
		const expectedHosts = [...data.networks.ark[arkMainnet].hosts];
		updateArkConstants({ data });
		expect(data.networks.ark[arkMainnet].hosts).toEqual(expectedHosts);
	});
});
