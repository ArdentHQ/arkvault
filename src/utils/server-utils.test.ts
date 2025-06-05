import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { sortByName, customNetworks, hasAvailableMusigServer } from "./server-utils";
import { env, getMainsailProfileId } from "./testing-library";
import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";

let network: Networks.Network;
let profile: Contracts.IProfile;

beforeAll(() => {
	profile = env.profiles().findById(getMainsailProfileId());

	network = profile.availableNetworks()[0];
});

const makeNormalizedNetwork = (data: Partial<NormalizedNetwork>): NormalizedNetwork => ({
	enabled: false,
	evmApiEndpoint: "",
	height: 0,
	name: "",
	network: network,
	online: false,
	publicApiEndpoint: "",
	transactionApiEndpoint: "",
	...data,
});

describe("sortByName", () => {
	it("sorts by name ascending", () => {
		const array = [
			makeNormalizedNetwork({ name: "Charlie" }),
			makeNormalizedNetwork({ name: "Bravo" }),
			makeNormalizedNetwork({ name: "Alpha" }),
		];

		sortByName(array);
		expect(array.map((n: any) => n.name)).toEqual(["Alpha", "Bravo", "Charlie"]);
	});
});

describe("customNetworks", () => {
	it("returns empty list if no hosts", () => {
		const profileHostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue({});
		const result = customNetworks(profile);
		expect(result).toEqual([]);
		profileHostsSpy.mockRestore();
	});

	it("returns custom networks correctly", () => {
		const coin = "mainsail";
		const netKey = "devnet";
		const hostName = "RealisticHost";
		const fullHost: any = {
			enabled: true,
			height: 123,
			host: "https://dwallets-evm.mainsailhq.com/api",
			type: "full",
		};
		const txHost: any = { host: "https://dwallets-evm.mainsailhq.com/tx/api", type: "tx" };
		const musigHost: any = { host: "https://musig-demo.mainsailhq.com", type: "musig" };
		const explorerHost: any = { host: "https://explorer-evm-test.mainsailhq.com", type: "explorer" };
		const evmHost: any = { host: "https://dwallets-evm.mainsailhq.com/evm/api", type: "evm" };
		const hostsAll = {
			[coin]: {
				[netKey]: [
					{ host: fullHost, name: hostName },
					{ host: txHost, name: hostName },
					{ host: musigHost, name: hostName },
					{ host: explorerHost, name: hostName },
					{ host: evmHost, name: hostName },
				],
			},
		};
		const fakeNetwork = { id: () => `${coin}.${netKey}` };
		const availableNetworks = [fakeNetwork];

		const profileHostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue(hostsAll);
		const profileAvailableNetworksSpy = vi.spyOn(profile, "availableNetworks").mockReturnValue(availableNetworks);
		const result = customNetworks(profile);

		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			enabled: true,
			evmApiEndpoint: evmHost.host,
			height: fullHost.height,
			name: hostName,
			network: fakeNetwork,
			publicApiEndpoint: fullHost.host,
			transactionApiEndpoint: txHost.host,
		});
		profileHostsSpy.mockRestore();
		profileAvailableNetworksSpy.mockRestore();
	});
});

describe("hasAvailableMusigServer", () => {
	it("returns false if no profile", () => {
		expect(hasAvailableMusigServer({ network: {} as any, profile: undefined })).toBe(false);
	});

	it("returns false if profile present but not implemented", () => {
		const profile = {} as any;
		expect(hasAvailableMusigServer({ network: {} as any, profile })).toBe(false);
	});
});
