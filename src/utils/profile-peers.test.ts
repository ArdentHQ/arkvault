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

	it.only("returns health status for all peers", async () => {
		vi.spyOn(profile.hosts(), "all").mockReturnValue({
			mainsail: {
				mainnet: [
					{
						host: { type: "full", host: "https://custom.example.com", enabled: true, height: 123 },
						name: "CustomNode",
					},
					{
						host: { type: "tx", host: "https://custom.example.com/tx", enabled: true },
						name: "CustomNode",
					},
					{
						host: { type: "evm", host: "https://custom.example.com/evm", enabled: true },
						name: "CustomNode",
					},
					{
						host: { type: "musig", host: "https://custom.example.com/musig", enabled: true },
						name: "CustomNode",
					},
					{
						host: { type: "explorer", host: "https://custom.example.com/explorer", enabled: true },
						name: "CustomNode",
					},
				],
			},
		});

		vi.spyOn(network, "toObject").mockReturnValue({
			hosts: [
				{ type: "full", host: "https://default.example.com" },
				{ type: "evm", host: "https://evm.example.com" },
				{ type: "tx", host: "https://tx.example.com" },
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
