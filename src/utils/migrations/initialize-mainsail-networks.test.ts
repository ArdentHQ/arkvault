import { Mainsail } from "@ardenthq/sdk-mainsail";
import { initializeMainsailNetworks } from "./initialize-mainsail-networks";
import * as testHelpers from "@/utils/test-helpers";

describe("initializeMainsailNetworks", () => {
	it("should initialize the mainsail devnet network", () => {
		const data = { networks: {} };

		initializeMainsailNetworks({ data });

		expect(data.networks.mainsail.devnet).toEqual(Mainsail.manifest.networks["mainsail.devnet"]);
	});

	it("should initialize the mainsail devnet network if network property is undefined", () => {
		const data = {};

		initializeMainsailNetworks({ data });

		expect(data.networks.mainsail.devnet).toEqual(Mainsail.manifest.networks["mainsail.devnet"]);
	});

	it("should not initialize the mainsail devnet network if it is e2e", () => {
		const isE2EMock = vi.spyOn(testHelpers, "isE2E").mockReturnValue(true);

		const data = { networks: {} };

		initializeMainsailNetworks({ data });

		expect(data.networks.mainsail).toBeUndefined();

		isE2EMock.mockRestore();
	});
});
