/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { useAvailableNetworks } from "@/domains/wallet/hooks/use-available-networks";
import DefaultManifest from "@/tests/fixtures/coins/ark/manifest/default.json";
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

	it("should prioritize default networks", () => {
		const mock = jest.spyOn(profile.networks(), "all").mockReturnValue({
			ark: {
				cdevnet: {
					...DefaultManifest,
					coin: "ARK",
					currency: {
						ticker: "ARK",
					},
					id: "ark.devnet",
					name: "Devnet",
					type: "test",
				},
				custom: {
					...DefaultManifest,
					coin: "ARK",
					currency: {
						ticker: "ARK",
					},
					id: "random.custom",
					name: "Custom",
					type: "test",
				},
				custom2: {
					...DefaultManifest,
					coin: "ARK",
					currency: {
						ticker: "ARK",
					},
					id: "random.custom",
					name: "Custom 2",
					type: "test",
				},
				mainnet: {
					...DefaultManifest,
					coin: "ARK",
					currency: {
						ticker: "ARK",
					},
					id: "ark.mainnet",
					name: "Mainnet",
					type: "live",
				},
			},
		});

		const {
			result: { current },
		} = renderHookWithProfile(profile);

		expect(current).toHaveLength(4);

		expect(current[0].name()).toBe("Mainnet");
		expect(current[1].name()).toBe("Devnet");
		expect(current[2].name()).toBe("Custom");
		expect(current[3].name()).toBe("Custom 2");

		mock.mockRestore();
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
