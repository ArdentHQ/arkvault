import { Contracts } from "@ardenthq/sdk-profiles";
import { Networks } from "@ardenthq/sdk";
import { customNetworks, hasAvailableMusigServer, sortByName } from "./server-utils";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
let profile: Contracts.IProfile;
let network: Networks.Network;

const musigHostLive = "https://ark-live-musig.arkvault.io";
const musigHostTest = "https://ark-test-musig.arkvault.io";

const peerHostLive = "https://ark-live.arkvault.io";

const networksStub: any = {
	ark: {
		devnet: [
			{
				host: {
					custom: true,
					host: musigHostTest,
					type: "musig",
				},
				name: "ARK Devnet Musig #1",
			},
		],
		mainnet: [
			{
				host: {
					custom: true,
					host: musigHostLive,
					type: "musig",
				},
				name: "ARK Musig #1",
			},
			{
				host: {
					custom: true,
					height: 99_999,
					host: `${peerHostLive}/api`,
					type: "full",
				},
				name: "ARK #1",
			},
		],
	},
};

describe("Server utils", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		network = profile
			.wallets()
			.findByAddressWithNetwork("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", "ark.devnet")!
			.network();
	});

	it("#sortByName", async () => {
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

	describe("#customNetworks", () => {
		it("returns custom networks", () => {
			const profileHostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue(networksStub);

			expect(customNetworks(env, profile)).toEqual([
				{
					address: "https://ark-test-musig.arkvault.io",
					enabled: undefined,
					height: undefined,
					name: "ARK Devnet Musig #1",
					network,
					serverType: "musig",
				},
				{
					address: "https://ark-live-musig.arkvault.io",
					enabled: undefined,
					height: undefined,
					name: "ARK Musig #1",
					network,
					serverType: "musig",
				},
				{
					address: "https://ark-live.arkvault.io/api",
					enabled: undefined,
					height: 99_999,
					name: "ARK #1",
					network: network,
					serverType: "full",
				},
			]);

			profileHostsSpy.mockRestore();
		});
	});

	describe("#hasAvailableMusigServer", () => {
		it("should return false if no profile is provided", () => {
			expect(hasAvailableMusigServer({ network })).toBe(false);
		});

		it("temporary should return true if profile provided", () => {
			expect(hasAvailableMusigServer({ network, profile })).toBe(true);
		});
	});
});
