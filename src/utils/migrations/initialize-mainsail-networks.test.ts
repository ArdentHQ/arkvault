import { Mainsail } from "@ardenthq/sdk-mainsail";
import { initializeMainsailNetworks } from "./initialize-mainsail-networks";

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
});
