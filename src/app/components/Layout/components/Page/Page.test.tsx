import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect, useState } from "react";

import { Page } from "./Page";
import { env, getMainsailProfileId, render, screen } from "@/utils/testing-library";
import { useNavigationContext } from "@/app/contexts";
let profile: Contracts.IProfile;

const dashboardURL = `/profiles/${getMainsailProfileId()}/dashboard`;

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
		profile = env.profiles().findById(getMainsailProfileId());
	});

	it.each([true, false])("should render with sidebar = %s", (sidebar) => {
		const { container, asFragment } = render(<Page sidebar={sidebar}>{}</Page>, {
			route: dashboardURL,
		});

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each([
		[true, true],
		[true, false],
		[false, false],
	])("should render with navigation context", (showMobileNavigation, hasFixedFormButtons) => {
		const { asFragment } = render(
			<TestComponent hasFixedFormButtons={hasFixedFormButtons} showMobileNavigation={showMobileNavigation} />,
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("Content")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["Settings", "Docs"])("should handle '%s' click on user actions dropdown", async (label) => {
		const windowSpy = vi.spyOn(window, "open").mockImplementation(vi.fn());

		const { router } = render(<Page>{}</Page>, {
			route: dashboardURL,
		});

		await expect(screen.findByTestId("UserMenu")).resolves.toBeVisible();

		const toggle = screen.getByTestId("UserMenu");

		await userEvent.click(toggle);

		await expect(screen.findByText(label)).resolves.toBeVisible();

		await userEvent.click(await screen.findByText(label));

		if (label === "Docs") {
			expect(windowSpy).toHaveBeenCalledWith("https://arkvault.io/docs", "_blank");
		} else {
			expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/${label.toLowerCase()}`);
		}

		windowSpy.mockRestore();
	});

	it("should handle 'Sign Out' click on user actions dropdown", async () => {
		const { router } = render(<Page>{}</Page>, {
			route: dashboardURL,
		});

		await expect(screen.findByTestId("UserMenu")).resolves.toBeVisible();

		const toggle = screen.getByTestId("UserMenu");

		await userEvent.click(toggle);

		await expect(screen.findByText("Sign Out")).resolves.toBeVisible();

		await userEvent.click(await screen.findByText("Sign Out"));

		expect(router.state.location.pathname).toBe("/");
	});
});
