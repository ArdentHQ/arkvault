import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { Dashboard } from "./Dashboard";
import {
	env,
	render,
	screen,
	syncValidators,
	waitFor,
	within,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const fixtureProfileId = getMainsailProfileId();
let dashboardURL: string;

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe("Dashboard", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(fixtureProfileId);

		await syncValidators(profile);

		await env.profiles().restore(profile);
		await profile.sync();
	});

	beforeEach(() => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should render loading state when profile is syncing", async () => {
		render(<Dashboard />, {
			route: dashboardURL,
		});

		await userEvent.click(screen.getByTestId("tabs__tab-button-received"));
		await userEvent.click(screen.getByTestId("tabs__tab-button-all"));

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10),
		);
	});

	it("should display empty block when there are no transactions", async () => {
		const mockTransactionsAggregate = vi.spyOn(profile.transactionAggregate(), "all").mockImplementation(() => ({
			hasMorePages: () => false,
			items: () => [],
		}));

		render(<Dashboard />, {
			route: dashboardURL,
			withProfileSynchronizer: true,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByRole("rowgroup")[0]).toBeVisible(),
		);

		await expect(screen.findByTestId("Transactions__no-results")).resolves.toBeVisible();

		mockTransactionsAggregate.mockRestore();
	});

	it("should open side panel when click on a transaction", async () => {
		const all = await profile.transactionAggregate().all({ limit: 10 });
		const transactions = all.items();

		const mockTransactionsAggregate = vi
			.spyOn(profile.transactionAggregate(), "all")
			.mockImplementation(() => Promise.resolve({ hasMorePages: () => false, items: () => transactions } as any));

		render(<Dashboard />, {
			route: dashboardURL,
			withProfileSynchronizer: true,
		});

		await waitFor(() =>
			expect(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")).toHaveLength(10),
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(within(screen.getByTestId("TransactionTable")).getAllByTestId("TableRow")[0]);

		await expect(screen.findByTestId("SidePanel__content")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SidePanel__close-button"));

		await waitFor(() => {
			expect(screen.queryByTestId("SidePanel__content")).not.toBeInTheDocument();
		});

		mockTransactionsAggregate.mockRestore();
	});
});
