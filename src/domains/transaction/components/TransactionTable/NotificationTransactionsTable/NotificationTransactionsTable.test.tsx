import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";

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

vi.mock("react-visibility-sensor", () => ({
	/* eslint-disable react-hooks/rules-of-hooks */
	default: ({ children, onChange }) => {
		useEffect(() => {
			if (onChange) {
				onChange(false);
			}
		}, [onChange]);

		return <div>{children}</div>;
	},
}));

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

	it("should render compact skeleton", () => {
		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, true);

		const { asFragment } = render(
			<NotificationTransactionsTable transactions={transactions} profile={profile} isLoading />,
		);

		expect(asFragment()).toMatchSnapshot();

		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, false);
	});

	it("should render skeleton for small screens", () => {
		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, true);

		const { asFragment } = renderResponsive(
			<NotificationTransactionsTable transactions={transactions} profile={profile} isLoading />,
			"xs",
		);

		expect(screen.getAllByTestId("TransactionRow__skeleton__mobile")).toHaveLength(10);

		expect(asFragment()).toMatchSnapshot();

		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, false);
	});

	it("should render loading state", () => {
		render(<NotificationTransactionsTable transactions={transactions} profile={profile} />);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(10);
	});

	it("should emit on visibility change event", async () => {
		const onVisibilityChange = vi.fn();
		render(
			<NotificationTransactionsTable
				transactions={transactions}
				profile={profile}
				isLoading={false}
				onVisibilityChange={onVisibilityChange}
			/>,
		);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(transactions.length);

		await waitFor(() => expect(onVisibilityChange).toHaveBeenCalledWith(false));
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
