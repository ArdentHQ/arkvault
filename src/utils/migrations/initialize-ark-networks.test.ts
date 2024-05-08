import { ARK } from "@ardenthq/sdk-ark";
import { initializeArkNetworks } from "./initialize-ark-networks";
import * as testHelpers from "@/utils/test-helpers";

describe("initializeArkNetworks", () => {
	it("should initialize the ARK mainnet network", () => {
		const data = { networks: {} };

		initializeArkNetworks({ data });

		expect(data.networks.ark.mainnet).toEqual(ARK.manifest.networks["ark.mainnet"]);
	});

	it("should not initialize the ARK devnet network ", () => {
		const data = { networks: {} };

		initializeArkNetworks({ data });

		expect(data.networks.ark.devnet).toBeUndefined();
	});

	it("should not initialize the ARK devnet network if is preview ", () => {
		const isPreviewMock = vi.spyOn(testHelpers, "isPreview").mockReturnValue(true);

		const data = { networks: {} };

		initializeArkNetworks({ data });

		expect(data.networks.ark.devnet).toEqual(ARK.manifest.networks["ark.devnet"]);

		isPreviewMock.mockRestore();
	});
	it("should not initialize the ARK devnet network if is e2e ", () => {
		const isE2EMock = vi.spyOn(testHelpers, "isE2E").mockReturnValue(true);

		const data = { networks: {} };

		initializeArkNetworks({ data });

		expect(data.networks.ark.devnet).toEqual(ARK.manifest.networks["ark.devnet"]);

		isE2EMock.mockRestore();
	});
});
