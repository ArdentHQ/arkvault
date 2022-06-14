import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";

import { NotificationsDropdown } from "./NotificationsDropdown";
import { env, getDefaultProfileId, renderResponsive, render, screen, waitFor } from "@/utils/testing-library";

const NotificationTransactionsFixtures = require("tests/fixtures/coins/ark/devnet/notification-transactions.json");
const TransactionsFixture = require("tests/fixtures/coins/ark/devnet/transactions.json");

const history = createHashHistory();
let profile: Contracts.IProfile;

describe("Notifications", () => {
	beforeEach(async () => {
		const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
		history.push(dashboardURL);

		nock("https://ark-test.arkvault.io").get("/api/transactions").query(true).reply(200, {
			data: NotificationTransactionsFixtures.data,
			meta: TransactionsFixture.meta,
		});

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

	it.each(["xs", "sm", "md", "lg", "xl"])("should render with transactions in %s", async (breakpoint) => {
		const { container } = renderResponsive(<NotificationsDropdown profile={profile} />, breakpoint);

		userEvent.click(screen.getAllByRole("button")[0]);

		await waitFor(() => expect(screen.getAllByTestId("NotificationItem")).toHaveLength(2));
		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(3));

		expect(container).toMatchSnapshot();
	});

	it("should open and close transaction details modal", async () => {
		await profile.sync();

		const { container } = render(
			<Route path="/profiles/:profileId/dashboard">
				<NotificationsDropdown profile={profile} />
			</Route>,
			{
				history,
				route: `/profiles/${getDefaultProfileId()}/dashboard`,
			},
		);

		userEvent.click(screen.getAllByRole("button")[0]);

		await waitFor(() => expect(screen.getAllByTestId("NotificationItem")).toHaveLength(2));
		await waitFor(() => expect(screen.queryAllByTestId("TransactionRowMode")).toHaveLength(3));

		userEvent.click(screen.getAllByTestId("TransactionRowMode")[0]);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		expect(screen.getAllByTestId("Address__alias")).toHaveLength(5);

		expect(container).toMatchSnapshot();

		userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());
	});
});
