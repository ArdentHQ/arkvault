import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React, { useEffect, useState } from "react";
import { Route } from "react-router-dom";

import { Page } from "./Page";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";
import { useNavigationContext } from "@/app/contexts";
let profile: Contracts.IProfile;

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createHashHistory();

const TestComponent = ({
	hasFixedFormButtons,
	showMobileNavigation,
}: {
	hasFixedFormButtons: boolean;
	showMobileNavigation: boolean;
}) => {
	const { setHasFixedFormButtons, setShowMobileNavigation } = useNavigationContext();

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setShowMobileNavigation(showMobileNavigation);
		setHasFixedFormButtons(hasFixedFormButtons);
		setMounted(true);
	}, []);

	if (!mounted) {
		return <></>;
	}

	return (
		<Page title="Test">
			<div data-testid="Content" />
		</Page>
	);
};

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

	it.each([
		[true, true],
		[true, false],
		[false, false],
	])("should render with navigation context", (showMobileNavigation, hasFixedFormButtons) => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<TestComponent hasFixedFormButtons={hasFixedFormButtons} showMobileNavigation={showMobileNavigation} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Content")).toBeInTheDocument();

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
				expect(windowSpy).toHaveBeenCalledWith(
					"mailto:contact@arkvault.io?subject=I+have+a+question+about+ARKVault",
				);
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
