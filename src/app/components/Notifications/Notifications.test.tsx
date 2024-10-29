import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";

import { Notifications } from "./Notifications";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

import { server, requestMock } from "@/tests/mocks/server";

import NotificationTransactionsFixtures from "@/tests/fixtures/coins/ark/devnet/notification-transactions.json";
import TransactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";

let profile: Contracts.IProfile;

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
		server.use(
			requestMock("https://ark-test.arkvault.io/api/transactions", {
				data: NotificationTransactionsFixtures.data,
				meta: TransactionsFixture.meta,
			}),
		);

		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		profile
			.notifications()
			.releases()
			.push({
				meta: { version: "3.0.0" },
				name: "Wallet update",
			});

		await profile.notifications().transactions().sync();
	});

	it("should render with transactions and plugins", async () => {
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
