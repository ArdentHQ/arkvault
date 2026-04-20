import { vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHosts } from "./use-hosts";
import { Contracts } from "@/app/lib/profiles";
import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { Networks } from "@/app/lib/mainsail";

describe("useHosts", () => {
	let profile: Contracts.IProfile;
	let hostsAllSpy: vi.SpyInstance;
	let hostsPushSpy: vi.SpyInstance;
	let hostsForgetSpy: vi.SpyInstance;
	let hostsFillSpy: vi.SpyInstance;

	const mockNormalizedNetwork: NormalizedNetwork = {
		enabled: true,
		evmApiEndpoint: "https://testnet.mainsail.io/evm",
		height: 1000,
		name: "Test Network",
		network: {
			id: () => "testnet.mainsail",
		} as Networks.Network,
		publicApiEndpoint: "https://testnet.mainsail.io",
		transactionApiEndpoint: "https://testnet.mainsail.io/tx",
	};

	beforeEach(() => {
		profile = env.profiles().findById(getMainsailProfileId());

		hostsAllSpy = vi.spyOn(profile.hosts(), "all");
		hostsPushSpy = vi.spyOn(profile.hosts(), "push");
		hostsForgetSpy = vi.spyOn(profile.hosts(), "forget");
		hostsFillSpy = vi.spyOn(profile.hosts(), "fill");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should handle empty profile hosts in updateNetwork", () => {
		hostsAllSpy.mockReturnValue({});

		const { result } = renderHook(() => useHosts({ profile }));

		result.current.updateNetwork(mockNormalizedNetwork, mockNormalizedNetwork);

		expect(hostsPushSpy).toHaveBeenCalledTimes(3);
	});

	it("should handle existing profile hosts in updateNetwork", () => {
		hostsAllSpy.mockReturnValue({
			testnet: {
				mainsail: [
					{
						host: { host: "https://testnet.mainsail.io", type: "full" },
						name: "Test Network",
					},
				],
			},
		});

		const { result } = renderHook(() => useHosts({ profile }));

		result.current.updateNetwork(mockNormalizedNetwork, mockNormalizedNetwork);

		expect(hostsForgetSpy).toHaveBeenCalled();
		expect(hostsPushSpy).toHaveBeenCalledTimes(3);
	});

	it("should clear and re-add networks in updateNetworks", () => {
		hostsAllSpy.mockReturnValue({
			testnet: {
				mainsail: [
					{
						host: { host: "https://old.mainsail.io", type: "full" },
						name: "Old Network",
					},
				],
			},
		});

		const { result } = renderHook(() => useHosts({ profile }));

		result.current.updateNetworks([mockNormalizedNetwork]);

		expect(hostsFillSpy).toHaveBeenCalled();
		expect(hostsPushSpy).toHaveBeenCalledTimes(3);
	});
});
