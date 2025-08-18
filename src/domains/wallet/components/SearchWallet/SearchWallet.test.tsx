/* eslint-disable @typescript-eslint/require-await */
import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { SearchWallet } from "./SearchWallet";
import { translations } from "@/domains/wallet/i18n";
import {
	act,
	env,
	render,
	screen,
	waitFor,
	renderResponsiveWithRoute,
	getMainsailProfileId,
} from "@/utils/testing-library";

const dashboardURL = `/profiles/${getMainsailProfileId()}/dashboard`;
let wallets: Contracts.IReadWriteWallet[];
let profile: Contracts.IProfile;

const walletAlias = "Sample Wallet";

describe("SearchWallet", () => {
	beforeEach(() => {
		profile = env.profiles().findById(getMainsailProfileId());

		wallets = profile.wallets().values();
		wallets[0].settings().set(Contracts.WalletSetting.Alias, walletAlias);
	});

	it("should render", async () => {
		const { asFragment } = renderResponsiveWithRoute(
			<SearchWallet
				profile={profile}
				isOpen={true}
				title={translations.MODAL_SELECT_ACCOUNT.TITLE}
				description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
				wallets={wallets}
				onSelectWallet={() => void 0}
			/>,
			"md",
			{
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
	});

	it("should render with incompatible ledger wallet", async () => {
		process.env.REACT_APP_IS_UNIT = undefined;

		const wallet = await profile.walletFactory().fromAddressWithDerivationPath({
			address: "0x125b484e51Ad990b5b3140931f3BD8eAee85Db23",
			path: "m/44'/1'/0'/0/3",
		});

		profile.wallets().push(wallet);

		const { asFragment } = renderResponsiveWithRoute(
			<SearchWallet
				profile={profile}
				isOpen={true}
				title={translations.MODAL_SELECT_ACCOUNT.TITLE}
				description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
				wallets={[wallet]}
				onSelectWallet={() => void 0}
			/>,
			"md",
			{
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		profile.wallets().forget(wallet.id());

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render compact on md screen", async () => {
		const { asFragment } = renderResponsiveWithRoute(
			<SearchWallet
				profile={profile}
				isOpen={true}
				title={translations.MODAL_SELECT_ACCOUNT.TITLE}
				description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
				wallets={wallets}
				onSelectWallet={() => void 0}
			/>,
			"md",
			{
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm"])("has a search input on responsive screen", async (breakpoint) => {
		renderResponsiveWithRoute(
			<SearchWallet
				profile={profile}
				isOpen={true}
				title={translations.MODAL_SELECT_ACCOUNT.TITLE}
				description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
				wallets={wallets}
				onSelectWallet={() => void 0}
			/>,
			breakpoint,
			{
				route: dashboardURL,
			},
		);

		const searchInput = screen.getByTestId("HeaderSearchInput__input__input");

		expect(searchInput).toBeInTheDocument();
		expect(searchInput).toHaveValue("");

		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, "something");

		expect(searchInput).toHaveValue("something");

		const resetSearchButton = screen.getByTestId("HeaderSearchInput__input__reset");

		expect(resetSearchButton).toBeInTheDocument();

		await userEvent.click(resetSearchButton);

		expect(searchInput).toHaveValue("");
	});

	it.each(["xs"])("should render responsive item", async (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(
			<SearchWallet
				profile={profile}
				isOpen={true}
				title={translations.MODAL_SELECT_ACCOUNT.TITLE}
				description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
				wallets={wallets}
				onSelectWallet={() => void 0}
			/>,
			breakpoint,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getAllByTestId("ReceiverItemMobile")).toHaveLength(wallets.length);

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs"])("should handle wallet selection on responsive items", async (breakpoint) => {
		const onSelectWalletMock = vi.fn();

		renderResponsiveWithRoute(
			<SearchWallet
				profile={profile}
				isOpen={true}
				title={translations.MODAL_SELECT_ACCOUNT.TITLE}
				description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
				wallets={wallets}
				onSelectWallet={onSelectWalletMock}
			/>,
			breakpoint,
			{
				route: dashboardURL,
			},
		);

		const walletItems = screen.getAllByTestId("ReceiverItemMobile--Select");

		await userEvent.click(walletItems[0]);

		await waitFor(() => {
			expect(onSelectWalletMock).toHaveBeenCalledTimes(1);
		});

		onSelectWalletMock.mockReset();
	});

	it("should render with the default exchange currency enabled from profile settings", async () => {
		const walletWithExchangeCurrencyMock = vi
			.spyOn(wallets[0], "exchangeCurrency")
			.mockReturnValue(undefined as any);
		const { asFragment } = render(
			<SearchWallet
				profile={profile}
				isOpen={true}
				title={translations.MODAL_SELECT_ACCOUNT.TITLE}
				description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
				wallets={wallets}
				onSelectWallet={() => void 0}
			/>,
			{
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
			<SearchWallet
				profile={profile}
				isOpen={true}
				title={translations.MODAL_SELECT_ACCOUNT.TITLE}
				description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
				wallets={wallets}
				onSelectWallet={onSelectWallet}
				selectedAddress="0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6"
			/>,
			{
				route: dashboardURL,
			},
		);

		await expect(screen.findByTestId("SearchWalletListItem__selected-0")).resolves.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SearchWalletListItem__selected-0"));

		await waitFor(() => {
			expect(onSelectWallet).toHaveBeenNthCalledWith(
				1,
				expect.objectContaining({
					address: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
					name: wallets[0].alias(),
					network: expect.any(Networks.Network),
				}),
			);
		});

		await userEvent.click(screen.getByTestId("SearchWalletListItem__select-1"));

		await waitFor(() => {
			expect(onSelectWallet).toHaveBeenNthCalledWith(
				2,
				expect.objectContaining({
					address: wallets[1].address(),
					name: wallets[1].alias(),
					network: expect.any(Networks.Network),
				}),
			);
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render compact with selected address", async () => {
		const onSelectWallet = vi.fn();

		const { asFragment } = renderResponsiveWithRoute(
			<SearchWallet
				profile={profile}
				isOpen={true}
				title={translations.MODAL_SELECT_ACCOUNT.TITLE}
				description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
				wallets={wallets}
				onSelectWallet={onSelectWallet}
				selectedAddress="0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6"
			/>,
			"md",
			{
				route: dashboardURL,
			},
		);

		await expect(screen.findByTestId("SearchWalletListItem__selected-0")).resolves.toBeInTheDocument();

		userEvent.click(screen.getByTestId("SearchWalletListItem__selected-0"));

		await waitFor(() => {
			expect(onSelectWallet).toHaveBeenNthCalledWith(
				1,
				expect.objectContaining({
					address: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
					name: wallets[0].alias(),
					network: expect.any(Networks.Network),
				}),
			);
		});

		userEvent.click(screen.getByTestId("SearchWalletListItem__select-1"));

		await waitFor(() => {
			expect(onSelectWallet).toHaveBeenNthCalledWith(
				2,
				expect.objectContaining({
					address: wallets[1].address(),
					name: wallets[1].alias(),
					network: expect.any(Networks.Network),
				}),
			);
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render responsive with selected address", async () => {
		const onSelectWallet = vi.fn();

		const { asFragment } = renderResponsiveWithRoute(
			<SearchWallet
				profile={profile}
				isOpen={true}
				title={translations.MODAL_SELECT_ACCOUNT.TITLE}
				description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
				wallets={wallets}
				onSelectWallet={onSelectWallet}
				selectedAddress="0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6"
			/>,
			"xs",
			{
				route: dashboardURL,
			},
		);

		expect(screen.getAllByTestId("ReceiverItemMobile")).toHaveLength(wallets.length);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle close", async () => {
		const onClose = vi.fn();

		render(
			<SearchWallet
				profile={profile}
				isOpen={true}
				onClose={onClose}
				wallets={[]}
				title={"title"}
				onSelectWallet={() => void 0}
			/>,
			{
				route: dashboardURL,
			},
		);

		await expect(screen.findByTestId("Modal__close-button")).resolves.toBeInTheDocument();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => {
			expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
		});
	});

	it("should filter wallets by address", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		render(
			<SearchWallet
				profile={profile}
				isOpen={true}
				title={translations.MODAL_SELECT_ACCOUNT.TITLE}
				description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
				wallets={wallets}
				onSelectWallet={() => void 0}
			/>,
			{
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);
		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		await waitFor(() => expect(screen.queryAllByTestId("ReceiverItem")).toHaveLength(2));

		const searchInput = screen.getByTestId("HeaderSearchInput__input__input");

		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, "0xcd15953dD076e56");

		act(() => {
			vi.advanceTimersByTime(100);
		});

		await waitFor(() => expect(screen.queryAllByTestId("ReceiverItem")).toHaveLength(1));
		vi.useRealTimers();
	});

	it("should filter wallets by alias", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		render(
			<SearchWallet
				profile={profile}
				isOpen={true}
				title={translations.MODAL_SELECT_ACCOUNT.TITLE}
				description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
				wallets={wallets}
				onSelectWallet={() => void 0}
			/>,
			{
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);
		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		await waitFor(() => expect(screen.queryAllByTestId("ReceiverItem")).toHaveLength(2));

		const searchInput = screen.getByTestId("HeaderSearchInput__input__input");

		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, walletAlias);

		act(() => {
			vi.advanceTimersByTime(100);
		});

		await waitFor(() => expect(screen.queryAllByTestId("ReceiverItem")).toHaveLength(1));

		vi.useRealTimers();
	});

	it("should reset wallet search", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		render(
			<SearchWallet
				profile={profile}
				isOpen={true}
				title={translations.MODAL_SELECT_ACCOUNT.TITLE}
				description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
				wallets={wallets}
				onSelectWallet={() => void 0}
			/>,
			{
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);
		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		await waitFor(() => expect(screen.queryAllByTestId("ReceiverItem")).toHaveLength(2));

		const searchInput = screen.getByTestId("HeaderSearchInput__input__input");

		// Search by wallet alias
		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, walletAlias);

		act(() => {
			vi.advanceTimersByTime(100);
		});

		await waitFor(() => expect(screen.queryAllByTestId("ReceiverItem")).toHaveLength(1));

		// Reset search
		await userEvent.click(screen.getByTestId("HeaderSearchInput__input__reset"));

		await waitFor(() => expect(searchInput).not.toHaveValue());
		await waitFor(() => expect(screen.queryAllByTestId("ReceiverItem")).toHaveLength(2));

		vi.useRealTimers();
	});

	it("should not find search wallet and show empty results screen", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		render(
			<SearchWallet
				profile={profile}
				isOpen={true}
				title={translations.MODAL_SELECT_ACCOUNT.TITLE}
				description={translations.MODAL_SELECT_ACCOUNT.DESCRIPTION}
				wallets={wallets}
				onSelectWallet={() => void 0}
			/>,
			{
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.TITLE),
		);
		await waitFor(() =>
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SELECT_ACCOUNT.DESCRIPTION),
		);

		await waitFor(() => expect(screen.queryAllByTestId("ReceiverItem")).toHaveLength(2));

		const searchInput = screen.getByTestId("HeaderSearchInput__input__input");

		// Search by wallet alias
		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, "non existent wallet name");

		act(() => {
			vi.advanceTimersByTime(100);
		});

		await waitFor(() => expect(screen.queryAllByTestId("ReceiverItem")).toHaveLength(0));

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
				disableAction={(wallet: Contracts.IReadWriteWallet) => wallet.alias() === walletAlias}
				onSelectWallet={() => void 0}
			/>,
		);

		await waitFor(() => expect(screen.getAllByTestId("ReceiverItem")).toHaveLength(2));

		expect(screen.getAllByTestId("ReceiverItem")[0]).toHaveTextContent(walletAlias);
		expect(screen.getByTestId("SearchWalletListItem__select-0")).toBeDisabled();

		expect(screen.getAllByTestId("ReceiverItem")[1]).not.toHaveTextContent(walletAlias);
		expect(screen.getByTestId("SearchWalletListItem__select-1")).not.toBeDisabled();
	});
});
