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

	it.each(["Settings", "Documentation"])("should handle '%s' click on user actions dropdown", async (label) => {
		const windowSpy = vi.spyOn(window, "open").mockImplementation(vi.fn());
		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

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

		await userEvent.click(toggle);

		await expect(screen.findByText(label)).resolves.toBeVisible();

		await userEvent.click(await screen.findByText(label));

		if (label === "Documentation") {
			expect(windowSpy).toHaveBeenCalledWith("https://arkvault.io/docs", "_blank");
		} else {
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/${label.toLowerCase()}`);
		}

		windowSpy.mockRestore();
		historySpy.mockRestore();
	});

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

		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

		await expect(screen.findByTestId("UserMenu")).resolves.toBeVisible();

		const toggle = screen.getByTestId("UserMenu");

		await userEvent.click(toggle);

		await expect(screen.findByText("Sign Out")).resolves.toBeVisible();

		await userEvent.click(await screen.findByText("Sign Out"));

		expect(historySpy).toHaveBeenCalledWith("/");

		historySpy.mockRestore();
	});
});
