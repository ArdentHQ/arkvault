import { uniq } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook, act } from "@testing-library/react";
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

	it("should render with ledger wallet display type", async () => {
		const walletIsLedgerSpy = vi.spyOn(profile.wallets().first(), "isLedger").mockReturnValue(true);
		profile.wallets().first().toggleStarred();

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
	});

	it("should render with star wallet display type", async () => {
		profile.wallets().first().toggleStarred();

		const { result } = renderHook(
			() => useWalletConfig({ defaults: { selectedNetworkIds: [], walletsDisplayType: "starred" }, profile }),
			{
				wrapper,
			},
		);

		await waitFor(() => {
			expect(result.current.walletsDisplayType).toBe("starred");
		});
	});

	it.each([undefined, []])("should render with no networks selected (%s)", async (selectedNetworkIds) => {
		profile.wallets().first().toggleStarred();

		const { result } = renderHook(() => useWalletConfig({ defaults: { selectedNetworkIds } as any, profile }), {
			wrapper,
		});

		await waitFor(() => {
			expect(result.current.selectedNetworkIds).toStrictEqual([]);
		});
	});

	it("should set value", async () => {
		profile.wallets().first().toggleStarred();

		const { result } = renderHook(
			() => useWalletConfig({ defaults: { selectedNetworkIds: [], walletsDisplayType: "all" }, profile }),
			{
				wrapper,
			},
		);

		act(() => {
			result.current.setValue("selectedNetworkIds", ["ark.devnet"]);
		});

		await waitFor(() => {
			expect(result.current.selectedNetworkIds).toStrictEqual(["ark.devnet"]);
		});
	});
});
