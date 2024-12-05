import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { Dashboard } from "./Dashboard";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	syncDelegates,
	waitFor,
	within,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

import { requestMock, server } from "@/tests/mocks/server";
import devnetTransactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";
import mainnetTransactionsFixture from "@/tests/fixtures/coins/ark/mainnet/transactions.json";

const history = createHashHistory();
let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

// @TODO: Enable & refactor transaction & network tests once mainsail coin support will be completed.
//        See https://app.clickup.com/t/86dvbvrvf
describe("Dashboard", () => {
	beforeEach(() => {
		server.use(
			requestMock("https://ark-test.arkvault.io/api/transactions", {
				data: devnetTransactionsFixture.data.slice(0, 2),
				meta: devnetTransactionsFixture.meta,
			}),
			requestMock("https://ark-live.arkvault.io/api/transactions", {
				data: [],
				meta: mainnetTransactionsFixture.meta,
			}),
		);
	});

	beforeAll(async () => {
		profile = env.profiles().findById(fixtureProfileId);

		const wallet = await profile.walletFactory().fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: "ark.mainnet",
		});

		profile.wallets().push(wallet);

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();
	});

	beforeEach(() => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
		history.push(dashboardURL);

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it.skip("should render loading state when profile is syncing", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Dashboard />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(8),
		);
	});

	it.skip("should display empty block when there are no transactions", async () => {
		const mockTransactionsAggregate = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		} as any);

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

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByRole("rowgroup")[0]).toBeVisible(),
		);

		await expect(screen.findByTestId("EmptyBlock")).resolves.toBeVisible();

		mockTransactionsAggregate.mockRestore();
	});

	it.skip("should open modal when click on a transaction", async () => {
		const all = await profile.transactionAggregate().all({ limit: 10 });
		const transactions = all.items();

		const mockTransactionsAggregate = vi
			.spyOn(profile.transactionAggregate(), "all")
			.mockImplementation(() => Promise.resolve({ hasMorePages: () => false, items: () => transactions } as any));

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

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(4),
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")[0]);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		mockTransactionsAggregate.mockRestore();
	});
});
