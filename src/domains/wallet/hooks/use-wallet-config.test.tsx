import { uniq } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import { act, renderHook } from "@testing-library/react-hooks";
import React from "react";

import { useWalletConfig } from "./use-wallet-config";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import { env, getDefaultProfileId, waitFor, mockProfileWithPublicAndTestNetworks } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const wrapper = ({ children }) => (
	<EnvironmentProvider env={env}>
		<ConfigurationProvider>{children}</ConfigurationProvider>
	</EnvironmentProvider>
);

describe("useWalletConfig", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should have default configuration", () => {
		const {
			result: { current },
		} = renderHook(() => useWalletConfig({ profile }), { wrapper });

		expect(current.selectedWallets).toHaveLength(2);

		const defaultNetworkIds = uniq(
			profile
				.wallets()
				.values()
				.map((wallet) => wallet.network().id()),
		);

		expect(current.selectedNetworkIds).toStrictEqual(defaultNetworkIds);
		expect(current.walletsDisplayType).toBe("all");
	});

	it("should hide wallets that are not part of the available networks", () => {
		const availableNetworksSpy = vi.spyOn(profile, "availableNetworks").mockReturnValue([]);

		const {
			result: { current },
		} = renderHook(() => useWalletConfig({ profile }), { wrapper });

		expect(current.selectedWallets).toHaveLength(0);

		availableNetworksSpy.mockRestore();
	});

	it("should render with ledger wallet display type", async () => {
		const walletIsLedgerSpy = vi.spyOn(profile.wallets().first(), "isLedger").mockReturnValue(true);
		const starredSpy = vi.spyOn(profile.wallets().first(), "isStarred").mockReturnValue(true);

		const { result } = renderHook(
			() =>
				useWalletConfig({
					defaults: { selectedNetworkIds: ["ark.devnet"], walletsDisplayType: "ledger" },
					profile,
				}),
			{
				wrapper,
			},
		);

		await waitFor(() => {
			expect(result.current.walletsDisplayType).toBe("ledger");
		});

		expect(result.current.selectedWallets).toHaveLength(1);
		expect(result.current.selectedWallets[0].alias()).toBe(profile.wallets().first().alias());

		walletIsLedgerSpy.mockRestore();
		starredSpy.mockRestore();
	});

	it("should render with star wallet display type", async () => {
		const starredSpy = vi.spyOn(profile.wallets().first(), "isStarred").mockReturnValue(true);

		const { result } = renderHook(
			() =>
				useWalletConfig({
					defaults: { selectedNetworkIds: ["ark.devnet"], walletsDisplayType: "starred" },
					profile,
				}),
			{
				wrapper,
			},
		);

		await waitFor(() => {
			expect(result.current.walletsDisplayType).toBe("starred");
		});

		expect(result.current.selectedWallets).toHaveLength(1);
		expect(result.current.selectedWallets[0].alias()).toBe(profile.wallets().first().alias());

		starredSpy.mockRestore();
	});

	it.each([undefined, []])("should render with no networks selected (%s)", async (selectedNetworkIds) => {
		const starredSpy = vi.spyOn(profile.wallets().first(), "isStarred").mockReturnValue(true);

		const { result } = renderHook(() => useWalletConfig({ defaults: { selectedNetworkIds } as any, profile }), {
			wrapper,
		});

		await waitFor(() => {
			expect(result.current.selectedNetworkIds).toStrictEqual([]);
		});
		starredSpy.mockRestore();
	});

	it("should set value", async () => {
		const starredSpy = vi.spyOn(profile.wallets().first(), "isStarred").mockReturnValue(true);

		const { result, waitForNextUpdate } = renderHook(
			() =>
				useWalletConfig({
					defaults: { selectedNetworkIds: ["ark.devnet", "ark.mainnet"], walletsDisplayType: "all" },
					profile,
				}),
			{
				wrapper,
			},
		);

		act(() => {
			result.current.setValue("selectedNetworkIds", ["ark.devnet"]);
		});

		await waitForNextUpdate();

		await waitFor(() => {
			expect(result.current.selectedNetworkIds).toStrictEqual(["ark.devnet"]);
		});
		starredSpy.mockRestore();
	});
});
