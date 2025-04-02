import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook, act } from "@testing-library/react";
import React from "react";

import { useWalletConfig } from "./use-wallet-config";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import {
	env,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const wrapper = ({ children }) => (
	<EnvironmentProvider env={env}>
		<ConfigurationProvider>{children}</ConfigurationProvider>
	</EnvironmentProvider>
);

process.env.RESTORE_MAINSAIL_PROFILE = "true";
process.env.USE_MAINSAIL_NETWORK = "true";

describe("useWalletConfig", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());

		profile.settings().set(Contracts.ProfileSetting.DashboardConfiguration, undefined);
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile, true);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should render with ledger wallet display type", async () => {
		const walletIsLedgerSpy = vi.spyOn(profile.wallets().first(), "isLedger").mockReturnValue(true);
		profile.wallets().first().toggleStarred();

		const { result } = renderHook(
			() =>
				useWalletConfig({
					defaults: { selectedNetworkIds: ["mainsail.devnet"], walletsDisplayType: "ledger" },
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
			result.current.setValue("selectedNetworkIds", ["mainsail.devnet"]);
		});

		await waitFor(() => {
			expect(result.current.selectedNetworkIds).toStrictEqual(["mainsail.devnet"]);
		});
	});
});
