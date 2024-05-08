import { Profile } from "@ardenthq/sdk-profiles";
import { ProfilePeers } from "./profile-peers";
import { env, getDefaultProfileId, mockProfileWithPublicAndTestNetworks } from "@/utils/testing-library";

import * as peersMock from "@/utils/peers";
import * as serverUtilsMock from "@/utils/server-utils";
let profile: Profile;
let restoreProfileNetworksMock: () => void;

describe("ProfilePeers", () => {
	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		restoreProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		restoreProfileNetworksMock();
	});

	it.each([true, false])(
		"should return the health status for peer networks and default networks",
		async (statusResult) => {
			const pingServerAdressMock = vi
				.spyOn(peersMock, "pingServerAddress")
				.mockImplementation(async () => statusResult);

			const network = env.availableNetworks()[0];

			const customNetworksMock = vi.spyOn(serverUtilsMock, "customNetworks").mockReturnValue([
				{
					address: "https://test-address.com",
					enabled: true,
					height: 0,
					name: "test",
					network: network,
					serverType: "full",
				},
			]);

			const { healthStatusByNetwork } = ProfilePeers(env, profile);

			const health = await healthStatusByNetwork();

			expect(health).toEqual({
				"ark.devnet": { "https://ark-live.arkvault.io/api": statusResult },
				"ark.mainnet": {
					"https://ark-live.arkvault.io/api": statusResult,
					"https://test-address.com": statusResult,
				},
			});

			pingServerAdressMock.mockRestore();
			customNetworksMock.mockRestore();
		},
	);
});
