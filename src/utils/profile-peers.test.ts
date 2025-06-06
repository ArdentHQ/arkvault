import { describe, it, expect, beforeAll, vi } from "vitest";
import { env, getMainsailProfileId } from "./testing-library";
import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import { ProfilePeers } from "./profile-peers";
import { server, requestMock } from "@/tests/mocks/server";

let profile: Contracts.IProfile;
let network: Networks.Network;

beforeAll(() => {
	profile = env.profiles().findById(getMainsailProfileId());
	network = profile.availableNetworks()[0];
});

describe("ProfilePeers", () => {
	beforeEach(() => {
		server.use(
			requestMock(
				"https://custom.example.com",
				{
					data: "hello world",
				},
				{ status: 200 },
			),
			requestMock("https://default.example.com", {}, { status: 404 }),
		);
	});

	it("returns health status for all peers", async () => {
		vi.spyOn(profile.hosts(), "all").mockReturnValue({
			mainsail: {
				mainnet: [
					{
						host: { enabled: true, height: 123, host: "https://custom.example.com", type: "full" },
						name: "CustomNode",
					},
					{
						host: { enabled: true, host: "https://custom.example.com/tx", type: "tx" },
						name: "CustomNode",
					},
					{
						host: { enabled: true, host: "https://custom.example.com/evm", type: "evm" },
						name: "CustomNode",
					},
					{
						host: { enabled: true, host: "https://custom.example.com/musig", type: "musig" },
						name: "CustomNode",
					},
					{
						host: { enabled: true, host: "https://custom.example.com/explorer", type: "explorer" },
						name: "CustomNode",
					},
				],
			},
		});

		vi.spyOn(network, "toObject").mockReturnValue({
			hosts: [
				{ host: "https://default.example.com", type: "full" },
				{ host: "https://evm.example.com", type: "evm" },
				{ host: "https://tx.example.com", type: "tx" },
			],
		});

		vi.spyOn(profile, "availableNetworks").mockReturnValue([network]);

		const { healthStatusByNetwork } = ProfilePeers(env, profile);
		const status = await healthStatusByNetwork();

		const fakeNetworkId = "mainsail.mainnet";
		expect(Object.keys(status)).toHaveLength(1);
		expect(status[fakeNetworkId]["https://default.example.com"]).toBe(false);
		expect(status[fakeNetworkId]["https://custom.example.com"]).toBe(true);
	});
});
