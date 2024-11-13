import React, { useRef } from "react";
import userEvent from "@testing-library/user-event";
import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import { renderHook } from "@testing-library/react";
import { Context as ResponsiveContext } from "react-responsive";
import { Route } from "react-router-dom";
import { env, getDefaultProfileId, render, screen, syncDelegates, waitFor, within } from "@/utils/testing-library";
import { PortfolioHeader } from "@/domains/wallet/components/PortfolioHeader";
import * as envHooks from "@/app/hooks/env";
import * as configurationModule from "@/app/contexts/Configuration/Configuration";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { translations as walletTranslations } from "@/domains/wallet/i18n";
import * as useDisplayWallets from "@/domains/wallet/hooks/use-display-wallets";
import { GroupNetworkTotal } from "@/domains/wallet/components/WalletsGroup/WalletsGroup.blocks";
import { UseDisplayWallets } from "@/domains/wallet/hooks/use-display-wallets.contracts";
import { WalletsGroupsList } from "@/domains/wallet/components/WalletsGroup/WalletsGroupsList";
import { WalletsGroup } from "@/domains/wallet/components/WalletsGroup/WalletsGroup";
import * as useThemeHook from "@/app/hooks/use-theme";
import { server, requestMock } from "@/tests/mocks/server";

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createHashHistory();

const WalletsGroupsResponsive = () => (
	<ResponsiveContext.Provider value={{ width: 1024 }}>
		<WalletsGroupsList />
	</ResponsiveContext.Provider>
);

describe("WalletsGroup", () => {
	let profile: Contracts.IProfile;
	let wallets: Contracts.IReadWriteWallet[];
	let mainnetWallet: Contracts.IReadWriteWallet;

	let duplicateWallets: Contracts.IReadWriteWallet[];

	let useDisplayWalletsResult: Partial<ReturnType<UseDisplayWallets>>;
	let useDisplayWalletsSpy: vi.SpyInstance;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		mainnetWallet = await profile.walletFactory().fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: "ark.mainnet",
		});

		mainnetWallet.mutator().alias("AAA");

		profile.wallets().push(mainnetWallet);
		wallets = profile.wallets().valuesWithCoin();

		await syncDelegates(profile);

		duplicateWallets = [mainnetWallet];
		for (const _ of Array.from({ length: 12 })) {
			duplicateWallets.push(wallets[0]);
		}

		vi.spyOn(envHooks, "useActiveProfile").mockReturnValue(profile);
	});

	beforeEach(() => {
		history.push(dashboardURL);

		useDisplayWalletsResult = {
			filteredWalletsGroupedByNetwork: [
				[mainnetWallet.network(), [mainnetWallet]],
				[wallets[0].network(), duplicateWallets],
			],
			hasWalletsMatchingOtherNetworks: false,
		};

		useDisplayWalletsSpy = vi.spyOn(useDisplayWallets, "useDisplayWallets").mockReturnValue({
			...useDisplayWalletsResult,
			availableWallets: duplicateWallets,
		} as ReturnType<UseDisplayWallets>);

		server.use(requestMock("https://ark-test-musig.arkvault.io", undefined, { method: "post" }));
	});

	afterEach(() => {
		useDisplayWalletsSpy.mockRestore();
	});

	it("should render GroupNetworkTotal with amounts", () => {
		const useConfigurationSpy = vi
			.spyOn(configurationModule, "useConfiguration")
			.mockReturnValue({ profileIsSyncing: false, profileIsSyncingExchangeRates: false });

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<GroupNetworkTotal network={wallets[0].network()} wallets={wallets} isSinglePageMode={false} />
				<GroupNetworkTotal network={mainnetWallet.network()} wallets={wallets} isSinglePageMode={false} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();

		useConfigurationSpy.mockRestore();
	});

	it("should handle list wallet click", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsResponsive />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();

		expect(screen.getAllByText(wallets[2].address())[0]).toBeInTheDocument();

		expect(screen.getAllByTestId("WalletsGroupHeader")[0].classList.contains("md:border-b")).toBeTruthy();
		expect(screen.queryAllByTestId("WalletsGroupHeader")[1].classList.contains("border-b")).toBeFalsy();

		expect(screen.getAllByText(wallets[0].alias()!)[0]).toBeInTheDocument();
		expect(screen.getAllByText(wallets[2].address())[0]).toBeInTheDocument();

		expect(screen.getAllByText(wallets[0].alias()!)[0]).toBeInTheDocument();

		await userEvent.click(screen.getAllByText(wallets[0].alias()!)[0]);

		expect(history.location.pathname).toBe(`/profiles/${profile.id()}/wallets/${wallets[0].id()}`);
	});

	it("should rename wallet through wallet dropdown", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsResponsive />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		const name = "New Name";

		await userEvent.click(screen.getAllByTestId("Accordion__toggle")[1]);

		await waitFor(() => {
			expect(screen.getByTestId("WalletTable")).toBeInTheDocument();
		});

		const walletRow = screen.getAllByTestId("TableRow")[0];

		expect(within(walletRow).queryByText(name)).not.toBeInTheDocument();

		await userEvent.click(within(walletRow).getByTestId("dropdown__toggle"));

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();
		expect(screen.getByText(walletTranslations.PAGE_WALLET_DETAILS.OPTIONS.WALLET_NAME)).toBeInTheDocument();

		await userEvent.click(screen.getByText(walletTranslations.PAGE_WALLET_DETAILS.OPTIONS.WALLET_NAME));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(walletTranslations.MODAL_NAME_WALLET.TITLE);

		const inputElement: HTMLInputElement = screen.getByTestId("UpdateWalletName__input");

		await waitFor(() => {
			expect(inputElement).toBeInTheDocument();
		});

		inputElement.select();
		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, name);

		await waitFor(() => expect(inputElement).toHaveValue(name));

		await expect(screen.findByTestId("UpdateWalletName__submit")).resolves.toBeVisible();
		await expect(screen.findByTestId("UpdateWalletName__submit")).resolves.toBeEnabled();

		await userEvent.click(screen.getByTestId("UpdateWalletName__submit"));

		await waitFor(() => {
			expect(within(walletRow).getAllByText(name).length).toBe(2);
		});

		await waitFor(() => expect(profile.wallets().findById(mainnetWallet.id()).alias()).toBe(name));
	});

	it("should delete wallet through wallet dropdown", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<PortfolioHeader />
				<WalletsGroupsResponsive />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		const count = profile.wallets().count();

		await userEvent.click(screen.getAllByTestId("Accordion__toggle")[1]);

		await waitFor(() => {
			expect(screen.getAllByTestId("WalletTable")[0]).toBeInTheDocument();
		});

		await userEvent.click(within(screen.getAllByTestId("TableRow")[0]).getByTestId("dropdown__toggle"));

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();
		expect(screen.getByText(commonTranslations.DELETE)).toBeInTheDocument();

		await userEvent.click(screen.getByText(commonTranslations.DELETE));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(walletTranslations.MODAL_DELETE_WALLET.TITLE);

		await userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => expect(profile.wallets().count()).toBe(count - 1));

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});
	});

	it.each([-500, 0, 500])("should render group with different widths", (width) => {
		const { result: balanceWidthReference } = renderHook(() => useRef(width));
		const { result: currencyWidthReference } = renderHook(() => useRef(width));

		const { asFragment } = render(
			<WalletsGroup
				wallets={profile.wallets().values()}
				network={mainnetWallet.network()}
				maxWidthReferences={{
					balance: balanceWidthReference.current,
					currency: currencyWidthReference.current,
				}}
			/>,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it.each([true, false])("should render with dark mode = %s", (isDarkMode) => {
		const useThemeMock = vi.spyOn(useThemeHook, "useTheme").mockReturnValue({ isDarkMode } as never);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsGroupsResponsive />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();

		useThemeMock.mockRestore();
	});

	it("should render skeleton when there are no available wallets yet and profile is syncing", () => {
		const useConfigurationSpy = vi
			.spyOn(configurationModule, "useConfiguration")
			.mockReturnValue({ profileIsSyncing: true });

		useDisplayWalletsSpy = vi.spyOn(useDisplayWallets, "useDisplayWallets").mockReturnValue({
			...useDisplayWalletsResult,
			availableWallets: [],
		} as ReturnType<UseDisplayWallets>);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsGroupsResponsive />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("WalletsGroupHeaderSkeleton")).toBeInTheDocument();

		useConfigurationSpy.mockRestore();
		useDisplayWalletsSpy.mockRestore();
	});

	it("should render skeleton as placeholder when there are no wallets grouped by network and profile is restored", () => {
		const useConfigurationSpy = vi
			.spyOn(configurationModule, "useConfiguration")
			.mockReturnValue({ profileIsSyncing: false });

		useDisplayWalletsSpy = vi.spyOn(useDisplayWallets, "useDisplayWallets").mockReturnValue({
			...useDisplayWalletsResult,
			filteredWalletsGroupedByNetwork: [],
		} as ReturnType<UseDisplayWallets>);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsGroupsResponsive />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("WalletsGroupHeaderSkeleton")).toBeInTheDocument();

		useConfigurationSpy.mockRestore();
		useDisplayWalletsSpy.mockRestore();
	});

	it("should show skeleton when syncing exchange rates", () => {
		const useConfigurationSpy = vi
			.spyOn(configurationModule, "useConfiguration")
			.mockReturnValue({ profileIsSyncingExchangeRates: true });

		useDisplayWalletsSpy = vi.spyOn(useDisplayWallets, "useDisplayWallets").mockReturnValue({
			...useDisplayWalletsResult,
			availableWallets: [],
		} as ReturnType<UseDisplayWallets>);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsGroupsResponsive />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		const currencyCell = screen.getAllByTestId("CurrencyCell")[0];
		expect(currencyCell).toBeInTheDocument();

		// eslint-disable-next-line testing-library/no-node-access
		const skeletons = currencyCell.querySelectorAll(".react-loading-skeleton");
		expect(skeletons.length).toBeGreaterThan(0);
		expect(skeletons[0]).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		useConfigurationSpy.mockRestore();
	});
});
