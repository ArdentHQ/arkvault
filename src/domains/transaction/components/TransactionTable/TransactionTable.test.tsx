import * as useRandomNumberHook from "@/app/hooks/use-random-number";

import { Contracts, DTO } from "@/app/lib/profiles";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletId,
	render,
	renderResponsive,
	screen,
} from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

import React from "react";
import { TransactionTable } from "./TransactionTable";
import { sortByDesc } from "@/app/lib/helpers";
import transactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";
import userEvent from "@testing-library/user-event";

describe("TransactionTable", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let transactions: DTO.ExtendedConfirmedTransactionData[];

	beforeEach(async () => {
		server.use(requestMock("https://dwallets-evm.mainsailhq.com/api/transactions", transactionsFixture));

		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById(getDefaultWalletId());

		const allTransactions = await wallet.transactionIndex().all();
		transactions = allTransactions.items();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render responsive", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<TransactionTable
				transactions={transactions}
				profile={profile}
				sortBy={{ column: "timestamp", desc: true }}
			/>,
			breakpoint,
		);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(transactions.length);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with currency", () => {
		renderResponsive(
			<TransactionTable
				transactions={transactions}
				exchangeCurrency="BTC"
				profile={profile}
				sortBy={{ column: "timestamp", desc: true }}
			/>,
			"xl"
		);

		expect(screen.getAllByTestId("TransactionRow__exchange-currency")).toHaveLength(transactions.length);
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
					sortBy={{ column: "timestamp", desc: true }}
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
					sortBy={{ column: "timestamp", desc: true }}
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
			<TransactionTable
				sortBy={{ column: "timestamp", desc: true }}
				transactions={sortedByDateDesc}
				onRowClick={onClick}
				profile={profile}
			/>,
		);

		await userEvent.click(screen.getAllByTestId("TableRow")[0]);

		expect(onClick).toHaveBeenCalledWith(sortedByDateDesc[0]);
	});
});
