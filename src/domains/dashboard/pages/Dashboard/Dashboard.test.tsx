import * as useRandomNumberHook from "@/app/hooks/use-random-number";

import {
	env,
	getMainsailProfileId,
	mockProfileWithPublicAndTestNetworks,
	render,
	screen,
	syncValidators,
	waitFor,
	within,
} from "@/utils/testing-library";

import { Contracts } from "@/app/lib/profiles";
import { Dashboard } from "./Dashboard";
import React from "react";
import { translations as profileTranslations } from "@/domains/profile/i18n";
import userEvent from "@testing-library/user-event";

let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const fixtureProfileId = getMainsailProfileId();
let dashboardURL: string;
let mockTransactionsAggregate;

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe("Dashboard", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(fixtureProfileId);

		await syncValidators(profile);

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
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
		mockTransactionsAggregate.mockRestore();
	});

	it("should render", async () => {
		const { asFragment } = render(<Dashboard />, {
			route: dashboardURL,
			withProfileSynchronizer: true,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8),
		);

		await waitFor(() => {
			expect(screen.getAllByTestId("WalletVote__button")).toHaveLength(2);
		});

		expect(asFragment()).toMatchSnapshot();
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

		const selectedWalletsMock = vi.spyOn(profile.wallets(), "selected").mockReturnValue([wallet1, wallet2]);

		render(<Dashboard />, {
			route: dashboardURL,
			withProfileSynchronizer: true,
		});

		await waitFor(() => {
			expect(screen.getAllByTestId("WalletMyVotes__button")).toHaveLength(2);
		});

		wallet1SynchroniserMock.mockRestore();
		wallet2SynchroniserMock.mockRestore();
		selectedWalletsMock.mockRestore();
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

		const selectedWalletsMock = vi.spyOn(profile.wallets(), "selected").mockReturnValue([wallet1, wallet2]);

		render(<Dashboard />, {
			route: dashboardURL,
			withProfileSynchronizer: true,
		});

		await waitFor(() => {
			expect(screen.getAllByTestId("WalletMyVotes__button")).toHaveLength(2);
		});

		selectedWalletsMock.mockRestore();
		wallet1SynchroniserMock.mockRestore();
		wallet2SynchroniserMock.mockRestore();
	});

	it.skip("should show introductory tutorial", async () => {
		const mockHasCompletedTutorial = vi.spyOn(profile, "hasCompletedIntroductoryTutorial").mockReturnValue(false);

		render(<Dashboard />, {
			route: dashboardURL,
			withProfileSynchronizer: true,
		});

		await expect(screen.findByText(profileTranslations.MODAL_WELCOME.STEP_1.TITLE)).resolves.toBeVisible();

		mockHasCompletedTutorial.mockRestore();
	});

	it("should navigate to wallet votes when more than one wallet is selected", async () => {
		const wallet = profile.wallets().first();
		const wallet2 = profile.wallets().last();

		const selectedWalletsMock = vi.spyOn(profile.wallets(), "selected").mockReturnValue([wallet, wallet2]);

		const { router } = render(<Dashboard />, {
			route: dashboardURL,
			withProfileSynchronizer: true,
		});

		await waitFor(() => {
			expect(screen.getAllByTestId("WalletMyVotes__button")).toHaveLength(2);
		});

		await userEvent.click(screen.getAllByTestId("WalletMyVotes__button")[0]);

		await waitFor(() => {
			expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/votes`);
		});

		selectedWalletsMock.mockRestore();
	});

	it("should navigate to wallet votes when one wallet is selected", async () => {
		const wallet = profile.wallets().first();

		const selectedWalletsMock = vi.spyOn(profile.wallets(), "selected").mockReturnValue([wallet]);

		const { router } = render(<Dashboard />, {
			route: dashboardURL,
			withProfileSynchronizer: true,
		});

		await waitFor(() => {
			expect(screen.getAllByTestId("WalletVote__button")).toHaveLength(2);
		});

		await userEvent.click(screen.getAllByTestId("WalletVote__button")[0]);

		await waitFor(() => {
			expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/wallets/${wallet.id()}/votes`);
		});

		selectedWalletsMock.mockRestore();
	});

	it("should render and handle sign message deeplink", async () => {
		render(<Dashboard />, {
			route: `/profiles/${fixtureProfileId}/dashboard?method=sign`,
			withProfileSynchronizer: true,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8),
		);

		await waitFor(() => {
			expect(screen.getByTestId("SignMessageSidePanel")).toBeVisible();
		});
	});
});
