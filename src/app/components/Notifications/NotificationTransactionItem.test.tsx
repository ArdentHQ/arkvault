import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";

import { NotificationTransactionItem } from "./NotificationTransactionItem";
import { httpClient } from "@/app/services";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getMainsailProfileId, render, screen, waitFor, renderResponsive } from "@/utils/testing-library";

import { server, requestMock } from "@/tests/mocks/server";

import NotificationTransactionsFixtures from "@/tests/fixtures/coins/mainsail/devnet/notification-transactions.json";
import TransactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";

let profile: Contracts.IProfile;
let notificationTransaction: DTO.ExtendedConfirmedTransactionData;

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

describe("Notifications", () => {
	beforeEach(async () => {
		httpClient.clearCache();

		server.use(
			requestMock("https://dwallets-evm.mainsailhq.com/api/transactions", {
				data: NotificationTransactionsFixtures.data,
				meta: TransactionsFixture.meta,
			}),
		);

		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();
		await profile.notifications().transactions().sync();
		notificationTransaction = profile.notifications().transactions().transaction("4dc401ca6683b7c2bc380165204e3a291c66b0648dbc43a04e76b6d130e5cb5f");
	});

	it("should render notification item", async () => {
		const { container } = render(
			<table>
				<tbody>
					<NotificationTransactionItem transaction={notificationTransaction!} profile={profile} />
				</tbody>
			</table>,
		);
		await waitFor(() => expect(screen.getAllByTestId("TableRow")).toHaveLength(1));

		expect(container).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in xs", (breakpoint) => {
		const { container } = renderResponsive(
			<table>
				<tbody>
					<NotificationTransactionItem transaction={notificationTransaction!} profile={profile} />
				</tbody>
			</table>,
			breakpoint,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render notification item with wallet alias", async () => {
		render(
			<table>
				<tbody>
					<NotificationTransactionItem transaction={notificationTransaction!} profile={profile} />
				</tbody>
			</table>,
		);
		await waitFor(() => expect(screen.getAllByTestId("TableRow")).toHaveLength(1));

		expect(screen.getByTestId("Address__alias").textContent).contains("Mainsail Wallet");
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should emit events onTransactionClick in xs", async (breakpoint) => {
		const onTransactionClick = vi.fn();

		renderResponsive(
			<table>
				<tbody>
					<NotificationTransactionItem
						transaction={notificationTransaction!}
						profile={profile}
						onTransactionClick={onTransactionClick}
					/>
				</tbody>
			</table>,
			breakpoint,
		);

		await waitFor(() => expect(screen.getAllByTestId("TableRow")).toHaveLength(1));

		userEvent.click(screen.getByTestId("TableRow"));

		await waitFor(() => expect(onTransactionClick).toHaveBeenCalledWith(notificationTransaction));
	});
});
