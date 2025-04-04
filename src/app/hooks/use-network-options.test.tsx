import { renderHook } from "@testing-library/react";
import React from "react";

import { Contracts } from "@ardenthq/sdk-profiles";
import { useNetworkOptions } from "./use-network-options";
import { EnvironmentProvider } from "@/app/contexts";
import {
	env,
	mockProfileWithOnlyPublicNetworks,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";
import { beforeAll } from "vitest";
const fixtureProfileId = getMainsailProfileId();
let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

process.env.RESTORE_MAINSAIL_PROFILE = "true";

describe("useNetworkOptions hook", () => {
	beforeAll(() => {
		process.env.MOCK_AVAILABLE_NETWORKS = "false";
	});

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

		expect(networks).toContainEqual({ isTestNetwork: true, label: "Mainsail Devnet", value: "mainsail.devnet" });

		resetProfileNetworksMock2();
	});

	it("should return network options including test networks", () => {
		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const { result } = renderHook(() => useNetworkOptions({ profile }), { wrapper });

		const networks = result.current.networkOptions();

		expect(networks).toContainEqual({ isTestNetwork: false, label: "Mainsail", value: "mainsail.mainnet" });
		expect(networks).not.toContainEqual({ isTestNetwork: true, label: "Mainsail Devnet", value: "mainsail.devnet" });
	});

	it("should get a network by its id", () => {
		const id = "mainsail.mainnet";

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}> {children} </EnvironmentProvider>;
		const { result } = renderHook(() => useNetworkOptions({ profile }), { wrapper });

		const network = result.current.networkById(id);

		expect(network?.id()).toBe(id);
	});
});
