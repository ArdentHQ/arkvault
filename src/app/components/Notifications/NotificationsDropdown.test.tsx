import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { NotificationsDropdown } from "./NotificationsDropdown";
import { env, getMainsailProfileId, renderResponsive, render, screen, waitFor } from "@/utils/testing-library";

import { server, requestMock } from "@/tests/mocks/server";

import NotificationTransactionsFixtures from "@/tests/fixtures/coins/mainsail/devnet/notification-transactions.json";
import TransactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";

const history = createHashHistory();
let profile: Contracts.IProfile;

describe("Notifications", () => {
	beforeEach(async () => {
		const dashboardURL = `/profiles/${getMainsailProfileId()}/dashboard`;
		history.push(dashboardURL);

		server.use(
			requestMock("https://dwallets-evm.mainsailhq.com/api/transactions", {
				data: NotificationTransactionsFixtures.data,
				meta: TransactionsFixture.meta,
			}),
		);

		profile = env.profiles().findById(getMainsailProfileId());

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

		await userEvent.click(screen.getAllByRole("button")[0]);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(3));

		expect(container).toMatchSnapshot();
	});

	it("should open and close transaction details modal", async () => {
		await profile.sync();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<NotificationsDropdown profile={profile} />
			</Route>,
			{
				history,
				route: `/profiles/${getMainsailProfileId()}/dashboard`,
			},
		);

		await userEvent.click(screen.getAllByRole("button")[0]);

		await waitFor(() => expect(screen.queryAllByTestId("TableRow")).toHaveLength(3));

		await userEvent.click(screen.getAllByTestId("TableRow")[0]);

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());
	});
});
