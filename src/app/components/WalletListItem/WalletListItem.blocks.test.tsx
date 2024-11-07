import { Contracts } from "@ardenthq/sdk-profiles";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { env, getDefaultProfileId, render, waitFor } from "@/utils/testing-library";
import * as useConfigurationModule from "@/app/contexts/Configuration/Configuration";
import {
	ButtonsCell,
	Currency,
	WalletCell,
	Starred,
	Info,
	Balance,
	WalletListItemMobile,
} from "@/app/components/WalletListItem/WalletListItem.blocks";
import { translations as walletTranslations } from "@/domains/wallet/i18n";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";

vi.mock("@/domains/wallet/pages/WalletDetails/hooks/use-wallet-transactions", () => ({
	useWalletTransactions: () => ({
		hasUnsignedPendingTransaction: true,
		syncPending: () => {},
	}),
}));

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createHashHistory();

describe("WalletListItem.blocks", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		history.push(dashboardURL);
	});

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render with pending transactions icon", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<table>
					<tbody>
						<tr>
							<Info wallet={wallet} isCompact={true} />
						</tr>
					</tbody>
				</table>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("PendingTransactionIcon")).toBeInTheDocument();
		});

		expect(asFragment).toMatchSnapshot();
	});

	it("should render WalletListItemMobile", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletListItemMobile wallet={wallet} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await userEvent.hover(screen.getByTestId("WalletListItemMobile"));

		expect(asFragment).toMatchSnapshot();
	});

	it("should render WalletListItemMobile when selected", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletListItemMobile wallet={wallet} selected />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await userEvent.hover(screen.getByTestId("WalletListItemMobile--selected"));

		expect(asFragment).toMatchSnapshot();
	});

	it("should render StarredCell", async () => {
		const walletSpy = vi.spyOn(wallet, "isStarred").mockReturnValue(false);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<table>
					<tbody>
						<tr>
							<Starred wallet={wallet} onToggleStar={vi.fn()} isCompact={true} />
						</tr>
					</tbody>
				</table>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await userEvent.hover(screen.getByTestId("WalletIcon__Starred"));

		expect(screen.getByText(walletTranslations.PAGE_WALLET_DETAILS.STAR_WALLET)).toBeInTheDocument();

		// eslint-disable-next-line testing-library/no-node-access
		expect(document.querySelector("svg#star-filled")).toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();

		walletSpy.mockRestore();
	});

	it("should render StarredCell in small screen", async () => {
		const walletSpy = vi.spyOn(wallet, "isStarred").mockReturnValue(false);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Starred wallet={wallet} onToggleStar={vi.fn()} isCompact={true} isLargeScreen={false} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await userEvent.hover(screen.getByTestId("WalletIcon__Starred"));

		expect(asFragment).toMatchSnapshot();

		walletSpy.mockRestore();
	});

	it("should render WalletCell", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<table>
					<tbody>
						<tr>
							<WalletCell wallet={wallet} onToggleStar={vi.fn()} isCompact={true} />
						</tr>
					</tbody>
				</table>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByText(wallet.address())).toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render Currency", () => {
		const useConfigurationReturn = { profileIsSyncingExchangeRates: true };
		const useConfigurationSpy = vi
			.spyOn(useConfigurationModule, "useConfiguration")
			.mockReturnValue(useConfigurationReturn);

		let walletSpy = vi.spyOn(wallet.network(), "isTest").mockReturnValue(false);

		const { asFragment, rerender } = render(
			<Route path="/profiles/:profileId/dashboard">
				<table>
					<tbody>
						<tr>
							<Currency wallet={wallet} isSynced={true} isCompact={true} />
						</tr>
					</tbody>
				</table>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		// eslint-disable-next-line testing-library/no-node-access
		expect(screen.getByTestId("CurrencyCell").querySelector(".react-loading-skeleton")).toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();

		useConfigurationReturn.profileIsSyncingExchangeRates = false;

		rerender(
			<Route path="/profiles/:profileId/dashboard">
				<table>
					<tbody>
						<tr>
							<Currency wallet={wallet} isSynced={false} isCompact={true} />
						</tr>
					</tbody>
				</table>
			</Route>,
		);

		// eslint-disable-next-line testing-library/no-node-access
		expect(screen.getByTestId("CurrencyCell").querySelector(".react-loading-skeleton")).toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();

		rerender(
			<Route path="/profiles/:profileId/dashboard">
				<table>
					<tbody>
						<tr>
							<Currency wallet={wallet} isSynced={true} isCompact={true} />
						</tr>
					</tbody>
				</table>
			</Route>,
		);

		expect(screen.getByTestId("Amount")).toBeInTheDocument();

		walletSpy = vi.spyOn(wallet.network(), "isTest").mockReturnValue(true);

		rerender(
			<Route path="/profiles/:profileId/dashboard">
				<table>
					<tbody>
						<tr>
							<Currency wallet={wallet} isSynced={true} isCompact={true} />
						</tr>
					</tbody>
				</table>
			</Route>,
		);

		expect(screen.getByText(commonTranslations.NOT_AVAILABLE)).toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();

		walletSpy.mockRestore();
		useConfigurationSpy.mockRestore();
	});

	it("should render Currency in small screen", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Currency wallet={wallet} isSynced={true} isCompact={true} isLargeScreen={false} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment).toMatchSnapshot();
	});

	it("should avoid click on ButtonsCell when Send button is disabled", async () => {
		const walletSpy = vi.spyOn(wallet, "balance").mockReturnValue(0);
		const handleSend = vi.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<table>
					<tbody>
						<tr>
							<ButtonsCell
								wallet={wallet}
								isCompact={true}
								onSelectOption={vi.fn()}
								onSend={handleSend}
							/>
						</tr>
					</tbody>
				</table>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await userEvent.click(screen.getByTestId("WalletListItem__send-button"));

		expect(handleSend).not.toHaveBeenCalled();

		expect(history.location.pathname).toBe(dashboardURL);

		walletSpy.mockRestore();
	});

	it("should render Info in small screen", () => {
		const walletSpy = vi.spyOn(wallet, "isStarred").mockReturnValue(false);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Info wallet={wallet} onToggleStar={vi.fn()} isCompact={true} isLargeScreen={false} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment).toMatchSnapshot();

		walletSpy.mockRestore();
	});

	it("should render Balance in small screen", () => {
		const walletSpy = vi.spyOn(wallet, "isStarred").mockReturnValue(false);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<table>
					<tbody>
						<tr>
							<td>
								<Balance
									wallet={wallet}
									onToggleStar={vi.fn()}
									isCompact={true}
									isLargeScreen={false}
								/>
							</td>
						</tr>
					</tbody>
				</table>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment).toMatchSnapshot();

		walletSpy.mockRestore();
	});
});
