import { renderHook } from "@testing-library/react";
import React from "react";

import { Contracts } from "@ardenthq/sdk-profiles";
import { useNetworkOptions } from "./use-network-options";
import { EnvironmentProvider } from "@/app/contexts";
import {
	env,
	mockProfileWithOnlyPublicNetworks,
	mockProfileWithPublicAndTestNetworks,
	getDefaultProfileId,
} from "@/utils/testing-library";
const fixtureProfileId = getDefaultProfileId();
let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

describe("useNetworkOptions hook", () => {
	beforeEach(() => {
		profile = env.profiles().findById(fixtureProfileId);

		resetProfileNetworksMock = mockProfileWithOnlyPublicNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should return network options", () => {
		resetProfileNetworksMock();

		const resetProfileNetworksMock2 = mockProfileWithPublicAndTestNetworks(profile);

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const { result } = renderHook(() => useNetworkOptions({ profile }), { wrapper });

		const networks = result.current.networkOptions();

		expect(networks).toContainEqual({ isTestNetwork: true, label: "ARK Devnet", value: "ark.devnet" });
		expect(networks).toContainEqual({ isTestNetwork: true, label: "ARK", value: "random.custom" });

		resetProfileNetworksMock2();
	});

	it("should return network options including test networks", () => {
		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const { result } = renderHook(() => useNetworkOptions({ profile }), { wrapper });

		const networks = result.current.networkOptions();

		expect(networks).toContainEqual({ isTestNetwork: false, label: "ARK", value: "ark.mainnet" });
		expect(networks).not.toContainEqual({ isTestNetwork: true, label: "ARK Devnet", value: "ark.devnet" });
	});

	it("should get a network by its id", () => {
		const id = "ark.mainnet";

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}> {children} </EnvironmentProvider>;
		const { result } = renderHook(() => useNetworkOptions({ profile }), { wrapper });

		const network = result.current.networkById(id);

		expect(network?.id()).toBe(id);
	});
});
