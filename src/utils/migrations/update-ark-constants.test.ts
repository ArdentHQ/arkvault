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

	it("should not modify networks if ark property is not defined", () => {
		const emptyData = { networks: {} };
		updateArkConstants({ data: emptyData });
		expect(emptyData.networks.ark).toBeUndefined();
	});

	it("should set the epoch constant if undefined", () => {
		updateArkConstants({ data });
		expect(data.networks.ark[arkMainnet].constants.epoch).toEqual("2023-01-01T00:00:00.000Z");
	});

	it("should leave hosts unchanged if they are already correct", () => {
		const expectedHosts = [...data.networks.ark[arkMainnet].hosts];
		updateArkConstants({ data });
		expect(data.networks.ark[arkMainnet].hosts).toEqual(expectedHosts);
	});
});
