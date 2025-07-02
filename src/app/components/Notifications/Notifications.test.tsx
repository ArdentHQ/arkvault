import { Contracts, DTO } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { Notifications } from "./Notifications";
import { env, getMainsailProfileId, render, screen, waitFor } from "@/utils/testing-library";

import { server, requestMock } from "@/tests/mocks/server";

import NotificationTransactionsFixtures from "@/tests/fixtures/coins/mainsail/devnet/notification-transactions.json";

let profile: Contracts.IProfile;

describe("Notifications", () => {
	beforeEach(async () => {
		server.use(
			requestMock("https://dwallets-evm.mainsailhq.com/api/transactions", {
				data: NotificationTransactionsFixtures.data,
				meta: NotificationTransactionsFixtures.meta,
			}),
		);

		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		await profile.notifications().transactions().sync();
	});

	it("should render with transactions", async () => {
		const { container } = render(<Notifications profile={profile} />);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(3));

		expect(container).toMatchSnapshot();
	});

	it("should emit transactionClick event", async () => {
		const onTransactionClick = vi.fn();

		const { container } = render(<Notifications profile={profile} onTransactionClick={onTransactionClick} />);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(3));

		await userEvent.click(screen.getAllByTestId("TableRow")[0]);

		await waitFor(() =>
			expect(onTransactionClick).toHaveBeenCalledWith(expect.any(DTO.ExtendedConfirmedTransactionData)),
		);

		expect(container).toMatchSnapshot();
	});

	it("should render with empty notifications", async () => {
		const emptyProfile = await env.profiles().create("test2");

		const { container } = render(<Notifications profile={emptyProfile} />);
		await waitFor(() => expect(screen.queryAllByTestId("TransactionRowMode")).toHaveLength(0));

		expect(container).toMatchSnapshot();
	});
});
