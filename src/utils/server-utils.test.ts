import { sortByName } from "./server-utils";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";

describe("Server utils", () => {
	it("#sortByName", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const network = profile.availableNetworks()[0];

		const normalizedNetwork = {
			address: "https://test-address.com",
			enabled: true,
			name: "test",
			network: network,
			serverType: "full",
		};

		const networks: NormalizedNetwork[] = [
			{
				...normalizedNetwork,
				name: "B",
			},
			{
				...normalizedNetwork,
				name: "A",
			},
			{
				...normalizedNetwork,
				name: "C",
			},
		];

		expect(sortByName(networks)).toEqual([
			{
				...normalizedNetwork,
				name: "A",
			},
			{
				...normalizedNetwork,
				name: "B",
			},
			{
				...normalizedNetwork,
				name: "C",
			},
		]);
	});
});
