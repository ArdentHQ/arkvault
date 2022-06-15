/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { useAvailableNetworks } from "@/domains/wallet/hooks/use-available-networks";

import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import { env, getDefaultProfileId, mockProfileWithOnlyPublicNetworks } from "@/utils/testing-library";

describe("useAvailableNetworks", () => {
	let profile: Contracts.IProfile;

	const wrapper = ({ children }) => (
		<EnvironmentProvider env={env}>
			<ConfigurationProvider>{children}</ConfigurationProvider>
		</EnvironmentProvider>
	);

	const renderHookWithProfile = (profile: Contracts.IProfile) =>
		renderHook(
			() =>
				useAvailableNetworks({
					profile: profile,
				}),
			{
				wrapper,
			},
		);

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should return an empty array if profile is not restored", () => {
		const isRestoredSpy = jest.spyOn(profile.status(), "isRestored").mockReturnValue(false);

		const {
			result: { current },
		} = renderHookWithProfile(profile);

		expect(current).toStrictEqual([]);

		isRestoredSpy.mockRestore();
	});

	it("should return the profile networks", () => {
		const resetMock = mockProfileWithOnlyPublicNetworks(profile);

		const {
			result: { current },
		} = renderHookWithProfile(profile);

		expect(current).toHaveLength(1);

		resetMock();
	});

	it("should filter networks", () => {
		const resetMock = mockProfileWithOnlyPublicNetworks(profile);

		const {
			result: { current },
		} = renderHook(
			() =>
				useAvailableNetworks({
					filter: (network) => network.id() === "ark.mainnet",
					profile: profile,
				}),
			{
				wrapper,
			},
		);

		expect(current).toHaveLength(1);
		expect(current[0].id()).toBe("ark.mainnet");

		resetMock();
	});
});
