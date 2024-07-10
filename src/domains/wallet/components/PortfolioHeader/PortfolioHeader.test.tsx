import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import * as filterWalletsHooks from "@/domains/dashboard/components/FilterWallets/hooks";
import * as configurationModule from "@/app/contexts/Configuration/Configuration";
import { PortfolioHeader } from "@/domains/wallet/components/PortfolioHeader/PortfolioHeader";
import { WalletsGroupsList } from "@/domains/wallet/components/WalletsGroup";
import * as useDisplayWallets from "@/domains/wallet/hooks/use-display-wallets";
import { UseDisplayWallets } from "@/domains/wallet/hooks/use-display-wallets.contracts";
import * as useWalletAction from "@/domains/wallet/hooks/use-wallet-actions";

import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { translations } from "@/domains/dashboard/i18n";
import {
	env,
	getDefaultProfileId,
	queryElementForSvg,
	render,
	screen,
	syncDelegates,
	waitFor,
	within,
	mockNanoXTransport,
	mockProfileWithPublicAndTestNetworks,
	mockProfileWithOnlyPublicNetworks,
} from "@/utils/testing-library";

const history = createHashHistory();
const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;

let profile: Contracts.IProfile;
let emptyProfile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const useWalletActionReturn = {
	activeModal: undefined,
	handleConfirmEncryptionWarning: vi.fn(),
	handleCreate: vi.fn(),
	handleDelete: vi.fn(),
	handleImport: vi.fn(),
	handleImportLedger: vi.fn(),
	handleOpen: vi.fn(),
	handleSelectOption: vi.fn(),
	handleSend: vi.fn(),
	handleToggleStar: vi.fn(),
	setActiveModal: vi.fn(),
};

describe("Portfolio grouped networks", () => {
	beforeAll(async () => {
		vi.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);

		emptyProfile = await env.profiles().create("Empty");
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		const wallet = await profile.walletFactory().fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: "ark.mainnet",
		});

		profile.wallets().push(wallet);

		await syncDelegates(profile);
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		history.push(dashboardURL);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	afterAll(() => {
		useRandomNumberHook.useRandomNumber.mockRestore();
	});

	it("should render list", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsList />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await expect(screen.findByTestId("NetworkWalletsGroupList")).resolves.toBeVisible();
		await expect(screen.findByTestId("Portfolio__Header")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without testnet wallets", () => {
		const resetProfileNetworksMock = mockProfileWithOnlyPublicNetworks(profile);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsList />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();

		resetProfileNetworksMock();
	});

	// @TODO: Fix test
	/* it("should handle wallet creation", () => {
		const useWalletActionSpy = vi.spyOn(useWalletAction, "useWalletActions").mockReturnValue(useWalletActionReturn);
		render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsList />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		userEvent.click(screen.getByTestId("WalletControls__create-wallet"));

		expect(useWalletActionReturn.handleCreate).toHaveBeenCalledWith(
			expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }),
		);

		useWalletActionSpy.mockRestore();
	});

	it("should handle wallet import", () => {
		const useWalletActionSpy = vi.spyOn(useWalletAction, "useWalletActions").mockReturnValue(useWalletActionReturn);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsList />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		userEvent.click(screen.getByTestId("WalletControls__import-wallet"));

		expect(useWalletActionReturn.handleImport).toHaveBeenCalledWith(
			expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }),
		);

		useWalletActionSpy.mockRestore();
	});

	it("should handle filter change", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsList />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[0]);
		userEvent.click(screen.getByTestId("filter-wallets__wallets"));
		userEvent.click(screen.getByTestId("dropdown__option--1"));

		await waitFor(() =>
			expect(screen.getByTestId("filter-wallets__wallets")).toHaveTextContent(commonTranslations.STARRED),
		);

		userEvent.click(screen.getByTestId("filter-wallets__wallets"));
		userEvent.click(screen.getByTestId("dropdown__option--0"));

		await waitFor(() =>
			expect(screen.getByTestId("filter-wallets__wallets")).toHaveTextContent(commonTranslations.ALL),
		);
	}); */

	it.skip("should render network selection with sorted network filters", async () => {
		const profile = await env.profiles().create("test");
		await env.profiles().restore(profile);

		const { wallet: arkWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: "ark.devnet",
		});
		profile.wallets().push(arkWallet);
		await env.wallets().syncByProfile(profile);

		const route = `/profiles/${profile.id()}/dashboard`;

		render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsList />
			</Route>,
			{
				route: route,
			},
		);

		userEvent.click(within(screen.getByTestId("WalletControls")).getAllByTestId("dropdown__toggle")[0]);

		expect(screen.getByTestId("NetworkOptions")).toBeInTheDocument();
		expect(queryElementForSvg(screen.getByTestId("NetworkOption__ark.devnet"), "ark")).toBeInTheDocument();
	});

	it.skip("should open and close ledger import modal", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsList />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		userEvent.click(screen.getByText(dashboardTranslations.WALLET_CONTROLS.IMPORT_LEDGER));

		await expect(screen.findByText(walletTranslations.MODAL_LEDGER_WALLET.CONNECT_DEVICE)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() =>
			expect(screen.queryByText(walletTranslations.MODAL_LEDGER_WALLET.CONNECT_DEVICE)).not.toBeInTheDocument(),
		);

		userEvent.click(screen.getByText(dashboardTranslations.WALLET_CONTROLS.IMPORT_LEDGER));

		await expect(screen.findByText(walletTranslations.MODAL_LEDGER_WALLET.CONNECT_DEVICE)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	// @TODO: Fix test
	/* it("should apply ledger import", () => {
		const useWalletActionSpy = vi.spyOn(useWalletAction, "useWalletActions").mockReturnValue(useWalletActionReturn);

		const transportMock = mockNanoXTransport();
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsList />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		userEvent.click(screen.getByTestId("WalletControls__import-ledger"));

		expect(useWalletActionReturn.handleImportLedger).toHaveBeenCalledWith(
			expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }),
		);

		expect(asFragment()).toMatchSnapshot();

		useWalletActionSpy.mockRestore();
		transportMock.mockRestore();
	}); */

	it("should show proper message when no wallets match the filters", () => {
		const useDisplayWalletsReturn = {
			availableWallets: [],
			filteredWalletsGroupedByNetwork: [],
			hasWalletsMatchingOtherNetworks: false,
		} as unknown as ReturnType<UseDisplayWallets>;

		const useWalletFiltersReturn = {
			walletsDisplayType: "all",
		} as unknown as ReturnType<typeof filterWalletsHooks.useWalletFilters>;
		const useDisplayWalletsSpy = vi
			.spyOn(useDisplayWallets, "useDisplayWallets")
			.mockReturnValue(useDisplayWalletsReturn);
		const useWalletFiltersSpy = vi
			.spyOn(filterWalletsHooks, "useWalletFilters")
			.mockReturnValue(useWalletFiltersReturn);
		const useConfigurationSpy = vi
			.spyOn(configurationModule, "useConfiguration")
			.mockReturnValue({ profileIsSyncing: false });

		useDisplayWalletsReturn.hasWalletsMatchingOtherNetworks = true;
		useWalletFiltersReturn.walletsDisplayType = "starred";

		const { rerender } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsGroupsList />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("EmptyBlock")).toHaveTextContent(
			translations.WALLET_CONTROLS.EMPTY_MESSAGE_TYPE_FILTERED.replace(
				"<bold>{{type}}</bold>",
				commonTranslations.STARRED,
			),
		);

		useWalletFiltersReturn.walletsDisplayType = "ledger";
		rerender(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsGroupsList />
			</Route>,
		);

		expect(screen.getByTestId("EmptyBlock")).toHaveTextContent(
			translations.WALLET_CONTROLS.EMPTY_MESSAGE_TYPE_FILTERED.replace(
				"<bold>{{type}}</bold>",
				commonTranslations.LEDGER,
			),
		);

		useDisplayWalletsReturn.hasWalletsMatchingOtherNetworks = true;
		useWalletFiltersReturn.walletsDisplayType = "all";
		rerender(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsGroupsList />
			</Route>,
		);

		expect(screen.getByTestId("EmptyBlock")).toHaveTextContent(translations.WALLET_CONTROLS.EMPTY_MESSAGE_FILTERED);

		useDisplayWalletsReturn.hasWalletsMatchingOtherNetworks = false;
		rerender(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsGroupsList />
			</Route>,
		);

		expect(screen.getByTestId("EmptyBlock")).toHaveTextContent(
			translations.WALLET_CONTROLS.EMPTY_MESSAGE.replace("<1>Create</1>", commonTranslations.CREATE).replace(
				"<3>Import</3>",
				commonTranslations.IMPORT,
			),
		);

		useDisplayWalletsSpy.mockRestore();
		useWalletFiltersSpy.mockRestore();
		useConfigurationSpy.mockRestore();
	});

	it("should render empty profile wallets", async () => {
		const useConfigurationSpy = vi
			.spyOn(configurationModule, "useConfiguration")
			.mockReturnValue({ profileIsSyncing: false });

		history.push(`/profiles/${emptyProfile.id()}/dashboard`);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsList />
			</Route>,
			{
				history,
				route: `/profiles/${emptyProfile.id()}/dashboard`,
			},
		);

		const emptyBlock = await screen.findByTestId("EmptyBlock");

		await expect(screen.findByTestId("EmptyBlock")).resolves.toBeVisible();

		expect(within(emptyBlock).getByText(commonTranslations.CREATE)).toBeInTheDocument();
		expect(within(emptyBlock).getByText(commonTranslations.IMPORT)).toBeInTheDocument();

		useConfigurationSpy.mockRestore();
	});
});
