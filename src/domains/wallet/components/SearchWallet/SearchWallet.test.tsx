/* eslint-disable @typescript-eslint/require-await */
import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { SearchWallet } from "./SearchWallet";
import { translations } from "@/domains/wallet/i18n";
import {
	act,
	env,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	within,
	renderResponsiveWithRoute,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

const history = createHashHistory();
const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
let wallets: Contracts.IReadWriteWallet[];
let profile: Contracts.IProfile;

const walletAlias = "Sample Wallet";

describe.each([true, false])("SearchWallet uses fiat value = %s", (showConvertedValue) => {
	beforeAll(() => {
		// mockProfileWithPublicAndTestNetworks(profile);
		history.push(dashboardURL);
	});

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallets = profile.wallets().values();
		wallets[0].settings().set(Contracts.WalletSetting.Alias, walletAlias);
	});

	it("should render", async () => {
		const networkMocksRestore = mockProfileWithPublicAndTestNetworks(profile);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					showConvertedValue={showConvertedValue}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		expect(asFragment()).toMatchSnapshot();

		networkMocksRestore();
	});

	it("should render compact on md screen", async () => {
		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					showConvertedValue={showConvertedValue}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			"md",
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getAllByTestId("SearchWalletAvatar--compact")).toHaveLength(wallets.length);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render expanded on > md screen according to user settings", async () => {
		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, true);

		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					showConvertedValue={showConvertedValue}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			"lg",
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.queryAllByTestId("SearchWalletAvatar--compact")).toHaveLength(0);

		expect(asFragment()).toMatchSnapshot();

		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, true);
	});

	it.each(["xs", "sm"])("has a search input on responsive screen", async (breakpoint) => {
		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					showConvertedValue={showConvertedValue}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			breakpoint,
			{
				history,
				route: dashboardURL,
			},
		);

		const searchInput = screen.getByTestId("HeaderSearchInput__input__input");

		expect(searchInput).toBeInTheDocument();
		expect(searchInput).toHaveValue("");

		userEvent.paste(searchInput, "something");

		expect(searchInput).toHaveValue("something");

		const resetSearchButton = screen.getByTestId("HeaderSearchInput__input__reset");

		expect(resetSearchButton).toBeInTheDocument();

		userEvent.click(resetSearchButton);

		expect(searchInput).toHaveValue("");
	});

	it.each(["xs", "sm"])("should render responsive item", async (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					showConvertedValue={showConvertedValue}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			breakpoint,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getAllByTestId("SearchWalletListItemResponsive--item")).toHaveLength(wallets.length);

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm"])("should handle wallet selection on responsive items", async (breakpoint) => {
		const onSelectWalletMock = vi.fn();

		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					showConvertedValue={showConvertedValue}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					onSelectWallet={onSelectWalletMock}
				/>
			</Route>,
			breakpoint,
			{
				history,
				route: dashboardURL,
			},
		);

		userEvent.click(screen.getAllByTestId("WalletListItemMobile")[0]);

		expect(onSelectWalletMock).toHaveBeenCalledTimes(1);

		onSelectWalletMock.mockReset();
	});

	it("should render with the default exchange currency enabled from profile settings", async () => {
		const walletWithExchangeCurrencyMock = vi
			.spyOn(wallets[0], "exchangeCurrency")
			.mockReturnValue(undefined as any);
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					showConvertedValue={showConvertedValue}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		expect(asFragment()).toMatchSnapshot();

		walletWithExchangeCurrencyMock.mockRestore();
	});

	it("should render with selected address", async () => {
		const onSelectWallet = vi.fn();

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					showConvertedValue={showConvertedValue}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					onSelectWallet={onSelectWallet}
					selectedAddress="D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD"
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("SearchWalletListItem__selected-0")).toBeInTheDocument();
		expect(screen.getByTestId("SearchWalletListItem__select-1")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SearchWalletListItem__selected-0"));

		expect(onSelectWallet).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
				name: wallets[0].alias(),
				network: expect.any(Networks.Network),
			}),
		);

		userEvent.click(screen.getByTestId("SearchWalletListItem__select-1"));

		expect(onSelectWallet).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				address: wallets[1].address(),
				name: wallets[1].alias(),
				network: expect.any(Networks.Network),
			}),
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render compact with selected address", async () => {
		const onSelectWallet = vi.fn();

		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					showConvertedValue={showConvertedValue}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					onSelectWallet={onSelectWallet}
					selectedAddress="D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD"
				/>
			</Route>,
			"md",
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("SearchWalletListItem__selected-0")).toBeInTheDocument();
		expect(screen.getByTestId("SearchWalletListItem__select-1")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SearchWalletListItem__selected-0"));

		expect(onSelectWallet).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
				name: wallets[0].alias(),
				network: expect.any(Networks.Network),
			}),
		);

		userEvent.click(screen.getByTestId("SearchWalletListItem__select-1"));

		expect(onSelectWallet).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				address: wallets[1].address(),
				name: wallets[1].alias(),
				network: expect.any(Networks.Network),
			}),
		);

		expect(screen.getAllByTestId("SearchWalletAvatar--compact")).toHaveLength(wallets.length);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render responsive with selected address", async () => {
		const onSelectWallet = vi.fn();

		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					showConvertedValue={showConvertedValue}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					onSelectWallet={onSelectWallet}
					selectedAddress="D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD"
				/>
			</Route>,
			"xs",
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getAllByTestId("SearchWalletListItemResponsive--item")).toHaveLength(wallets.length);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle close", () => {
		const onClose = vi.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					isOpen={true}
					onClose={onClose}
					showConvertedValue={showConvertedValue}
					wallets={[]}
					title={"title"}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should filter wallets by address", async () => {
		vi.useFakeTimers();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					showConvertedValue={showConvertedValue}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);
		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		userEvent.paste(searchInput, "D8rr7B1d6TL6pf1");

		act(() => {
			vi.advanceTimersByTime(100);
		});

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));
		vi.useRealTimers();
	});

	it("should filter wallets by alias", async () => {
		vi.useFakeTimers();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					showConvertedValue={showConvertedValue}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);
		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		userEvent.paste(searchInput, walletAlias);

		act(() => {
			vi.advanceTimersByTime(100);
		});

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));

		vi.useRealTimers();
	});

	it("should reset wallet search", async () => {
		vi.useFakeTimers();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					showConvertedValue={showConvertedValue}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);
		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		// Search by wallet alias
		userEvent.paste(searchInput, walletAlias);

		act(() => {
			vi.advanceTimersByTime(100);
		});

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(1));

		// Reset search
		userEvent.click(screen.getByTestId("header-search-bar__reset"));

		await waitFor(() => expect(searchInput).not.toHaveValue());
		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		vi.useRealTimers();
	});

	it("should not find search wallet and show empty results screen", async () => {
		vi.useFakeTimers();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<SearchWallet
					profile={profile}
					isOpen={true}
					title={translations.MODAL_SELECT_ACCOUNT.TITLE}
					description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
					wallets={wallets}
					showConvertedValue={showConvertedValue}
					onSelectWallet={() => void 0}
				/>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);
		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(2));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await expect(screen.findByTestId("HeaderSearchBar__input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");
		await waitFor(() => expect(searchInput).toBeInTheDocument());

		userEvent.paste(screen.getByTestId("Input"), "non existent wallet name");

		act(() => {
			vi.advanceTimersByTime(100);
		});

		await waitFor(() => expect(screen.getByTestId("Input")).toHaveValue("non existent wallet name"));
		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(0));

		await expect(screen.findByTestId("EmptyResults")).resolves.toBeVisible();

		vi.useRealTimers();
	});

	it("should disable the `Select` button if the wallet fulfills the condition", async () => {
		render(
			<SearchWallet
				profile={profile}
				isOpen={true}
				title={translations.MODAL_SELECT_ACCOUNT.TITLE}
				description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
				wallets={wallets}
				showConvertedValue={showConvertedValue}
				disableAction={(wallet: Contracts.IReadWriteWallet) => wallet.alias() === walletAlias}
				onSelectWallet={() => void 0}
			/>,
		);

		await waitFor(() => expect(screen.getAllByTestId("TableRow")).toHaveLength(2));

		expect(screen.getAllByTestId("TableRow")[0]).toHaveTextContent(walletAlias);
		expect(within(screen.getAllByTestId("TableRow")[0]).getByRole("button")).toBeDisabled();

		expect(screen.getAllByTestId("TableRow")[1]).not.toHaveTextContent(walletAlias);
		expect(within(screen.getAllByTestId("TableRow")[1]).getByRole("button")).not.toBeDisabled();
	});
});
