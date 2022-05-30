import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { Page } from "./Page";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createHashHistory();

describe("Page", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		history.push(dashboardURL);
	});

	it.each([true, false])("should render with sidebar = %s", (sidebar) => {
		const { container, asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<Page sidebar={sidebar}>{}</Page>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["Contacts", "Votes", "Settings", "Support"])(
		"should handle '%s' click on user actions dropdown",
		async (label) => {
			const windowSpy = jest.spyOn(window, "open").mockImplementation();
			const historySpy = jest.spyOn(history, "push").mockImplementation();

			render(
				<Route path="/profiles/:profileId/dashboard">
					<Page>{}</Page>
				</Route>,
				{
					history,
					route: dashboardURL,
				},
			);

			await expect(screen.findByTestId("UserMenu")).resolves.toBeVisible();

			const toggle = screen.getByTestId("UserMenu");

			userEvent.click(toggle);

			await expect(screen.findByText(label)).resolves.toBeVisible();

			userEvent.click(await screen.findByText(label));

			if (label === "Support") {
				expect(windowSpy).toHaveBeenCalledWith("https://arkvault.io/contact", "_blank");
			} else {
				expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/${label.toLowerCase()}`);
			}

			windowSpy.mockRestore();
			historySpy.mockRestore();
		},
	);

	it("should handle 'Sign Out' click on user actions dropdown", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<Page>{}</Page>
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		const historySpy = jest.spyOn(history, "push").mockImplementation();

		await expect(screen.findByTestId("UserMenu")).resolves.toBeVisible();

		const toggle = screen.getByTestId("UserMenu");

		userEvent.click(toggle);

		await expect(screen.findByText("Sign Out")).resolves.toBeVisible();

		userEvent.click(await screen.findByText("Sign Out"));

		expect(historySpy).toHaveBeenCalledWith("/");

		historySpy.mockRestore();
	});
});
