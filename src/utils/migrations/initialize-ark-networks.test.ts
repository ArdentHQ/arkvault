import { ARK } from "@ardenthq/sdk-ark";
import { initializeArkNetworks } from "./initialize-ark-networks";
import * as testHelpers from "@/utils/test-helpers";

describe("initializeArkNetworks", () => {
	it("should initialize the ARK mainnet network", () => {
		const data = { networks: {} };

		initializeArkNetworks({ data });

		expect(data.networks.ark.mainnet).toEqual(ARK.manifest.networks["ark.mainnet"]);
	});

	it("should initialize the ARK mainnet network if networks property is undefined", () => {
		const data = {};

		initializeArkNetworks({ data });

		expect(data.networks.ark.mainnet).toEqual(ARK.manifest.networks["ark.mainnet"]);
	});
});
