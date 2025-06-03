import { Contracts, DTO } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { NotificationTransactionsTable } from "./NotificationTransactionsTable";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletId,
	render,
	screen,
	waitFor,
	renderResponsive,
} from "@/utils/testing-library";

describe("NotificationsTransactionTable", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let transactions: DTO.ExtendedConfirmedTransactionData[];

	beforeAll(() => {
		vi.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);
	});

	afterAll(() => {
		useRandomNumberHook.useRandomNumber.mockRestore();
	});

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById(getDefaultWalletId());

		const allTransactions = await wallet.transactionIndex().all();
		transactions = allTransactions.items();
	});

	it("should render", () => {
		render(<NotificationTransactionsTable transactions={transactions} profile={profile} isLoading={false} />);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(transactions.length);
	});

	it("should render skeleton for small screens", () => {
		const { asFragment } = renderResponsive(
			<NotificationTransactionsTable transactions={transactions} profile={profile} isLoading />,
			"xs",
		);

		expect(screen.getAllByTestId("TransactionRow__skeleton__mobile")).toHaveLength(10);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render loading state", () => {
		render(<NotificationTransactionsTable transactions={transactions} profile={profile} />);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(10);
	});

	it("should emit on click event", async () => {
		const onClick = vi.fn();
		render(
			<NotificationTransactionsTable
				transactions={transactions}
				profile={profile}
				isLoading={false}
				onClick={onClick}
			/>,
		);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(transactions.length);

		userEvent.click(screen.getAllByTestId("TableRow")[0]);

		await waitFor(() => expect(onClick).toHaveBeenCalledWith(expect.any(DTO.ExtendedConfirmedTransactionData)));
	});
});
