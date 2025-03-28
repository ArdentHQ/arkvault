import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { Dashboard } from "./Dashboard";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import { translations as profileTranslations } from "@/domains/profile/i18n";
import * as usePortfolio from "@/domains/portfolio/hooks/use-portfolio";

import {
	env,
	render,
	screen,
	syncDelegates,
	waitFor,
	within,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";

import { BigNumber } from "@ardenthq/sdk-helpers";

const history = createHashHistory();
let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const fixtureProfileId = getMainsailProfileId();
let dashboardURL: string;
let mockTransactionsAggregate;

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

process.env.RESTORE_MAINSAIL_PROFILE = "true";
process.env.USE_MAINSAIL_NETWORK = "true";

describe("Dashboard", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(fixtureProfileId);

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();

		vi.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);

		const all = await profile.transactionAggregate().all({ limit: 10 });
		const transactions = all.items();

		mockTransactionsAggregate = vi
			.spyOn(profile.transactionAggregate(), "all")
			.mockImplementation(() => Promise.resolve({ hasMorePages: () => false, items: () => transactions } as any));
	});

	afterAll(() => {
		useRandomNumberHook.useRandomNumber.mockRestore();
	});

	beforeEach(() => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
		history.push(dashboardURL);

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
		mockTransactionsAggregate.mockRestore();
	});

	it("should render", async () => {
		const wallet = profile.wallets().first();

		const usePortfolioMock = vi.spyOn(usePortfolio, "usePortfolio").mockReturnValue({
			allWallets: [wallet],
			balance: {
				total: () => BigNumber.make("25"),
				totalConverted: () => BigNumber.make("45"),
			},
			selectedAddresses: [wallet.address()],
			selectedWallets: [wallet],
			setSelectedAddresses: () => {},
		});

		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10),
		);

		await waitFor(() => {
			expect(screen.getByTestId("WalletVote__button")).toBeVisible();
		});

		expect(asFragment()).toMatchSnapshot();

		usePortfolioMock.mockRestore();
	});

	it("should render with two wallets", async () => {
		const wallet1 = profile.wallets().first();
		const wallet2 = profile.wallets().last();

		const wallet1SynchroniserMock = vi
			.spyOn(wallet1.synchroniser(), "votes")
			.mockImplementation(() => Promise.resolve([]));
		const wallet2SynchroniserMock = vi
			.spyOn(wallet2.synchroniser(), "votes")
			.mockImplementation(() => Promise.resolve([]));

		const usePortfolioMock = vi.spyOn(usePortfolio, "usePortfolio").mockReturnValue({
			allWallets: [wallet1, wallet2],
			balance: {
				total: () => BigNumber.make("25"),
				totalConverted: () => BigNumber.make("45"),
			},
			selectedAddresses: [wallet1.address(), wallet2.address()],
			selectedWallets: [wallet1, wallet2],
			setSelectedAddresses: () => {},
		});

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("WalletMyVotes__button")).toBeVisible();
		});

		usePortfolioMock.mockRestore();
		wallet1SynchroniserMock.mockRestore();
		wallet2SynchroniserMock.mockRestore();
	});

	it("should render with two wallets and handle exceptions", async () => {
		const wallet1 = profile.wallets().first();
		const wallet2 = profile.wallets().last();

		const wallet1SynchroniserMock = vi
			.spyOn(wallet1.synchroniser(), "votes")
			.mockRejectedValue(new Error("Error syncing votes"));
		const wallet2SynchroniserMock = vi
			.spyOn(wallet2.synchroniser(), "votes")
			.mockImplementation(() => Promise.resolve([]));

		const usePortfolioMock = vi.spyOn(usePortfolio, "usePortfolio").mockReturnValue({
			allWallets: [wallet1, wallet2],
			balance: {
				total: () => BigNumber.make("25"),
				totalConverted: () => BigNumber.make("45"),
			},
			selectedAddresses: [wallet1.address(), wallet2.address()],
			selectedWallets: [wallet1, wallet2],
			setSelectedAddresses: () => {},
		});

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("WalletMyVotes__button")).toBeVisible();
		});

		usePortfolioMock.mockRestore();
		wallet1SynchroniserMock.mockRestore();
		wallet2SynchroniserMock.mockRestore();
	});

	it.skip("should show introductory tutorial", async () => {
		const mockHasCompletedTutorial = vi.spyOn(profile, "hasCompletedIntroductoryTutorial").mockReturnValue(false);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await expect(screen.findByText(profileTranslations.MODAL_WELCOME.STEP_1.TITLE)).resolves.toBeVisible();

		mockHasCompletedTutorial.mockRestore();
	});

	it("should navigate to wallet votes when more than one wallet is selected", async () => {
		const wallet = profile.wallets().first();
		const wallet2 = profile.wallets().last();

		const usePortfolioMock = vi.spyOn(usePortfolio, "usePortfolio").mockReturnValue({
			allWallets: [wallet, wallet2],
			balance: {
				total: () => BigNumber.make("25"),
				totalConverted: () => BigNumber.make("45"),
			},
			selectedAddresses: [wallet.address(), wallet2.address()],
			selectedWallets: [wallet, wallet2],
			setSelectedAddresses: () => {},
		});

		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("WalletMyVotes__button")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("WalletMyVotes__button"));

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith({ pathname: `/profiles/${profile.id()}/votes` });
		});

		usePortfolioMock.mockRestore();

		historySpy.mockRestore();
	});

	it("should navigate to wallet votes when one wallet is selected", async () => {
		const wallet = profile.wallets().first();

		const usePortfolioMock = vi.spyOn(usePortfolio, "usePortfolio").mockReturnValue({
			allWallets: [wallet],
			balance: {
				total: () => BigNumber.make("25"),
				totalConverted: () => BigNumber.make("45"),
			},
			selectedAddresses: [wallet.address()],
			selectedWallets: [wallet],
			setSelectedAddresses: () => {},
		});

		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

		render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("WalletVote__button")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("WalletVote__button"));

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}/votes`);
		});

		usePortfolioMock.mockRestore();

		historySpy.mockRestore();
	});
});
