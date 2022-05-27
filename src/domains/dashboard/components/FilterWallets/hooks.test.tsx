import { Contracts } from "@payvo/sdk-profiles";
import { act, renderHook } from "@testing-library/react-hooks";
import React from "react";

import { useWalletFilters } from "./hooks";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import { env, getDefaultProfileId, waitFor, mockProfileWithPublicAndTestNetworks } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const wrapper = ({ children }: any) => (
	<EnvironmentProvider env={env}>
		<ConfigurationProvider>{children}</ConfigurationProvider>
	</EnvironmentProvider>
);

describe("useWalletFilters", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should match default filters", () => {
		const {
			result: { current },
		} = renderHook(() => useWalletFilters({ profile }), { wrapper });

		expect(current.isFilterChanged).toBe(false);
	});

	it("should toggle network selection", async () => {
		const resetProfileNetworksMock2 = mockProfileWithPublicAndTestNetworks(profile);
		const { result, waitForNextUpdate } = renderHook(() => useWalletFilters({ profile }), { wrapper });

		act(() => {
			result.current.update("selectedNetworkIds", []);
		});

		await waitForNextUpdate();

		expect(result.current.isFilterChanged).toBe(true);

		resetProfileNetworksMock2();
	});

	it("should toggle wallet display type filter", async () => {
		const { result, waitForNextUpdate } = renderHook(() => useWalletFilters({ profile }), { wrapper });

		act(() => {
			result.current.update("walletsDisplayType", "starred");
		});

		await waitForNextUpdate();

		expect(result.current.isFilterChanged).toBe(true);

		await waitFor(() => expect(result.current.walletsDisplayType).toBe("starred"));
	});
});
