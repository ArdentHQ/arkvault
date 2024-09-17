import { sortByDesc } from "@ardenthq/sdk-helpers";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { TransactionTable } from "./TransactionTable";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletId,
	render,
	renderResponsive,
	screen,
	waitFor,
} from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions/byAddress/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD-1-10.json";

describe("TransactionTable", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let transactions: DTO.ExtendedConfirmedTransactionData[];

	beforeEach(async () => {
		server.use(requestMock("https://ark-test.arkvault.io/api/transactions", transactionsFixture));

		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById(getDefaultWalletId());

		const allTransactions = await wallet.transactionIndex().all();
		transactions = allTransactions.items();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render responsive", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<TransactionTable transactions={transactions} profile={profile} wallet={wallet} />,
			breakpoint,
		);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(transactions.length);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with currency", () => {
		render(
			<TransactionTable transactions={transactions} exchangeCurrency="BTC" profile={profile} wallet={wallet} />,
		);

		expect(screen.getAllByTestId("TransactionRow__exchange-currency")).toHaveLength(transactions.length);
	});

	it("should render compact", () => {
		const { asFragment } = render(
			<TransactionTable transactions={transactions} profile={profile} isCompact wallet={wallet} />,
		);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(transactions.length);
		expect(asFragment()).toMatchSnapshot();
	});

	describe("loading state", () => {
		let useRandomNumberSpy: vi.SpyInstance;

		beforeAll(() => {
			useRandomNumberSpy = vi.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);
		});

		afterAll(() => {
			useRandomNumberSpy.mockRestore();
		});

		it("should render", () => {
			const { asFragment } = render(
				<TransactionTable
					transactions={[]}
					isLoading
					skeletonRowsLimit={5}
					profile={profile}
					wallet={wallet}
				/>,
			);

			expect(screen.getAllByTestId("TableRow")).toHaveLength(5);
			expect(asFragment()).toMatchSnapshot();
		});

		it("should render with currency column", () => {
			const { asFragment } = render(
				<TransactionTable
					transactions={[]}
					isLoading
					exchangeCurrency="BTC"
					skeletonRowsLimit={5}
					profile={profile}
					wallet={wallet}
				/>,
			);

			expect(screen.getAllByTestId("TableRow")).toHaveLength(5);
			expect(asFragment()).toMatchSnapshot();
		});

		it("should render compact", () => {
			const { asFragment } = render(
				<TransactionTable
					transactions={[]}
					isLoading
					isCompact
					skeletonRowsLimit={5}
					profile={profile}
					wallet={wallet}
				/>,
			);

			expect(screen.getAllByTestId("TableRow")).toHaveLength(5);
			expect(asFragment()).toMatchSnapshot();
		});
	});

	it("should emit action on the row click", async () => {
		const onClick = vi.fn();
		const sortedByDateDesc = sortByDesc(transactions, (transaction) => transaction.timestamp());

		render(
			<TransactionTable transactions={sortedByDateDesc} onRowClick={onClick} profile={profile} wallet={wallet} />,
		);

		await userEvent.click(screen.getAllByTestId("TableRow")[0]);

		expect(onClick).toHaveBeenCalledWith(sortedByDateDesc[0]);
	});

	it("should emit action on the compact row click", async () => {
		const onClick = vi.fn();

		render(
			<TransactionTable
				transactions={transactions}
				onRowClick={onClick}
				isCompact
				profile={profile}
				wallet={wallet}
			/>,
		);

		await userEvent.click(screen.getAllByTestId("TableRow")[0]);

		await waitFor(() => expect(onClick).toHaveBeenCalledWith(transactions[1]));
	});

	it("should render active wallet's coin name", () => {
		const onClick = vi.fn();

		render(
			<TransactionTable
				transactions={transactions}
				onRowClick={onClick}
				isCompact
				profile={profile}
				wallet={wallet}
				coinName={wallet.currency()}
			/>,
		);

		expect(screen.getByText(`Value (${wallet.currency()})`)).toBeInTheDocument();
	});
});
