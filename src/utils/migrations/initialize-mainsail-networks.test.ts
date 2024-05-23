import { Mainsail } from "@ardenthq/sdk-mainsail";
import { initializeMainsailNetworks } from "./initialize-mainsail-networks";
import * as testHelpers from "@/utils/test-helpers";

describe("initializeMainsailNetworks", () => {
	it("should initialize the mainsail devnet network", () => {
		const data = { networks: {} };

		initializeMainsailNetworks({ data });

		expect(data.networks.mainsail.devnet).toEqual(Mainsail.manifest.networks["mainsail.devnet"]);
	});

	it("should initialize the mainsail devnet network if not network property defined", () => {
		const data = {};

		initializeMainsailNetworks({ data });

		expect(data.networks.mainsail.devnet).toEqual(Mainsail.manifest.networks["mainsail.devnet"]);
	});

	it("should initialize the mainsail devnet network if is e2e", () => {
		const isE2EMock = vi.spyOn(testHelpers, "isE2E").mockReturnValue(true);

		const data = { networks: {} };

		initializeMainsailNetworks({ data });

		expect(data.networks.mainsail.devnet).toEqual(Mainsail.manifest.networks["mainsail.devnet"]);

		isE2EMock.mockRestore();
	});

	it("should not initialize the mainsail devnet network if already defined", () => {
		const data = {
			networks: {
				mainsail: {},
			},
		};

		initializeMainsailNetworks({ data });

		expect(data.networks.mainsail).toEqual({});
	});
});
