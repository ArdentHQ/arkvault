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
	publicApiEndpoint: "",
	transactionApiEndpoint: "",
	evmApiEndpoint: "",
	name: "",
	network: network,
	online: false,
	enabled: false,
	height: 0,
	...data,
});

describe("sortByName", () => {
	it("sorts by name ascending", () => {
		const arr = [
			makeNormalizedNetwork({ name: "Charlie" }),
			makeNormalizedNetwork({ name: "Bravo" }),
			makeNormalizedNetwork({ name: "Alpha" }),
		];

		sortByName(arr);
		expect(arr.map((n: any) => n.name)).toEqual(["Alpha", "Bravo", "Charlie"]);
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
			type: "full",
			host: "https://dwallets-evm.mainsailhq.com/api",
			enabled: true,
			height: 123,
		};
		const txHost: any = { type: "tx", host: "https://dwallets-evm.mainsailhq.com/tx/api" };
		const musigHost: any = { type: "musig", host: "https://musig-demo.mainsailhq.com" };
		const explorerHost: any = { type: "explorer", host: "https://explorer-evm-test.mainsailhq.com" };
		const evmHost: any = { type: "evm", host: "https://dwallets-evm.mainsailhq.com/evm/api" };
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
			name: hostName,
			publicApiEndpoint: fullHost.host,
			transactionApiEndpoint: txHost.host,
			evmApiEndpoint: evmHost.host,
			enabled: true,
			height: fullHost.height,
			network: fakeNetwork,
		});
		profileHostsSpy.mockRestore();
		profileAvailableNetworksSpy.mockRestore();
	});
});

describe("hasAvailableMusigServer", () => {
	it("returns false if no profile", () => {
		expect(hasAvailableMusigServer({ profile: undefined, network: {} as any })).toBe(false);
	});

	it("returns false if profile present but not implemented", () => {
		const profile = {} as any;
		expect(hasAvailableMusigServer({ profile, network: {} as any })).toBe(false);
	});
});
