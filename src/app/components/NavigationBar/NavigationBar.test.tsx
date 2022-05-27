/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React, { useEffect } from "react";
import { Route } from "react-router-dom";

import { NavigationBar } from "./NavigationBar";
import * as navigation from "@/app/constants/navigation";
import * as environmentHooks from "@/app/hooks/env";
import * as useScrollHook from "@/app/hooks/use-scroll";
import { useNavigationContext } from "@/app/contexts";
import {
	env as mockedTestEnvironment,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	renderResponsiveWithRoute,
	mockProfileWithPublicAndTestNetworks,
	mockProfileWithOnlyPublicNetworks,
} from "@/utils/testing-library";

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createHashHistory();

jest.spyOn(environmentHooks, "useActiveProfile").mockImplementation(() =>
	mockedTestEnvironment.profiles().findById(getDefaultProfileId()),
);

jest.spyOn(navigation, "getNavigationMenu").mockReturnValue([
	{
		mountPath: (profileId: string) => `/profiles/${profileId}/dashboard`,
		title: "Portfolio",
	},
	{
		mountPath: () => "/test",
		title: "test",
	},
]);

const ContainerWithFixedFormButtons = ({ children }) => {
	const { setHasFixedFormButtons } = useNavigationContext();
	useEffect(() => {
		setHasFixedFormButtons(true);
	}, []);
	return children;
};

const ContainerWithHiddenNavigation = ({ children }) => {
	const { setShowMobileNavigation } = useNavigationContext();
	useEffect(() => {
		setShowMobileNavigation(false);
	}, []);

	return children;
};

describe("NavigationBar", () => {
	let resetProfileNetworksMock: () => void;
	let profile: Contracts.IProfile;

	beforeAll(async () => {
		profile = mockedTestEnvironment.profiles().findById(getDefaultProfileId());

		history.push(dashboardURL);
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it.each([true, false])("should render full variant when profile restored is %s", (isRestored) => {
		const isRestoredMock = jest.spyOn(profile.status(), "isRestored").mockReturnValue(isRestored);

		const { container, asFragment } = render(<NavigationBar />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		isRestoredMock.mockRestore();
	});

	it("should render as logo-only variant", () => {
		const { container, asFragment } = render(<NavigationBar variant="logo-only" />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with shadow if there is a scroll", () => {
		const scrollSpy = jest.spyOn(useScrollHook, "useScroll").mockImplementation(() => 1);

		const { container, asFragment } = render(<NavigationBar />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		scrollSpy.mockRestore();
	});

	it("should render with title if variant is logo-only", () => {
		const title = "ARKVAULT";

		const { container, asFragment } = render(<NavigationBar variant="logo-only" title={title} />);

		expect(container).toBeInTheDocument();
		expect(container).toHaveTextContent(title);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should not render with title if variant is full", () => {
		const title = "ARKVAULT";

		const { container, asFragment } = render(<NavigationBar variant="full" title={title} />);

		expect(container).toBeInTheDocument();
		expect(container).not.toHaveTextContent(title);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with custom menu", () => {
		const { container, asFragment } = render(<NavigationBar />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render in small screen variant", async () => {
		const { asFragment } = render(<NavigationBar />);

		Object.defineProperty(window, "innerWidth", { configurable: true, value: 700, writable: true });
		window.dispatchEvent(new Event("resize"));

		await expect(screen.findByTestId("NavigationBar__menu-toggle")).resolves.toBeVisible();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md"])("should render in %s", async (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(<NavigationBar />, breakpoint);

		Object.defineProperty(window, "innerWidth", { configurable: true, value: 700, writable: true });
		window.dispatchEvent(new Event("resize"));

		await expect(screen.findByTestId("NavigationBar__menu-toggle")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("NavigationBar__menu-toggle"));

		expect(screen.getByText("Portfolio")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle logo click", () => {
		const { history } = render(<NavigationBar />);

		const historySpy = jest.spyOn(history, "push").mockImplementation();

		userEvent.click(screen.getByTestId("NavigationBarLogo--button"));

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${getDefaultProfileId()}/dashboard`);

		historySpy.mockRestore();
	});

	it("should redirect to home by default on logo click", () => {
		const { history } = render(<NavigationBar variant="logo-only" />);

		const historySpy = jest.spyOn(history, "push").mockImplementation();

		userEvent.click(screen.getByTestId("NavigationBarLogo--button"));

		expect(historySpy).toHaveBeenCalledWith("/");

		historySpy.mockRestore();
	});

	it("should handle menu click", () => {
		const { history } = render(<NavigationBar />);

		userEvent.click(screen.getByText("test"));

		expect(history.location.pathname).toBe("/test");
	});

	it("should handle menu click in small screen variant", async () => {
		Object.defineProperty(window, "innerWidth", { configurable: true, value: 700, writable: true });
		window.dispatchEvent(new Event("resize"));

		const { history } = render(<NavigationBar />);

		userEvent.click(screen.queryAllByTestId("dropdown__toggle")[0]);

		expect(screen.getByTestId("dropdown__options")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--1"));

		expect(history.location.pathname).toBe("/test");
	});

	it("should open user actions dropdown on click", () => {
		const getUserMenuActionsMock = jest.spyOn(navigation, "getUserMenuActions").mockReturnValue([
			{ label: "Option 1", mountPath: () => "/test", title: "test", value: "/test" },
			{ label: "Option 2", mountPath: () => "/test2", title: "test2", value: "/test2" },
		]);

		const { history } = render(<NavigationBar />);
		const toggle = screen.getByTestId("UserMenu");

		userEvent.click(toggle);

		expect(screen.getByText("Option 1")).toBeInTheDocument();

		userEvent.click(screen.getByText("Option 1"));

		expect(history.location.pathname).toBe("/test");

		getUserMenuActionsMock.mockRestore();
	});

	it("should handle click to send button", () => {
		const mockProfile = environmentHooks.useActiveProfile();
		const { history } = render(<NavigationBar />);

		const sendButton = screen.getByTestId("NavigationBar__buttons--send");

		userEvent.click(sendButton);

		expect(history.location.pathname).toBe(`/profiles/${mockProfile.id()}/send-transfer`);
	});

	it("should handle click to send button from mobile menu", () => {
		const mockProfile = environmentHooks.useActiveProfile();
		const { history } = renderResponsiveWithRoute(<NavigationBar />, "xs");

		const sendButton = screen.getByTestId("NavigationBar__buttons__mobile--send");

		userEvent.click(sendButton);

		expect(history.location.pathname).toBe(`/profiles/${mockProfile.id()}/send-transfer`);
	});

	it("should handle receive funds", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<NavigationBar />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		userEvent.click(screen.getByTestId("NavigationBar__buttons--receive"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toHaveTextContent("Select Address");

		userEvent.click(screen.getAllByText("Select")[0]);

		await expect(screen.findByTestId("ReceiveFunds__name")).resolves.toBeVisible();
		await expect(screen.findByTestId("ReceiveFunds__address")).resolves.toBeVisible();

		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__qrcode")).toHaveLength(1));

		userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
	});

	it.each(["lg", "md", "xs"])("should have modal in different screen sizes", async (breakpoint) => {
		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<NavigationBar />
			</Route>,
			breakpoint,
			{
				history,
				route: dashboardURL,
			},
		);

		userEvent.click(screen.getByTestId("NavigationBar__buttons--receive"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toHaveTextContent("Select Address");

		userEvent.click(screen.getAllByText("Select")[0]);

		await expect(screen.findByTestId("ReceiveFunds__name")).resolves.toBeVisible();
		await expect(screen.findByTestId("ReceiveFunds__address")).resolves.toBeVisible();

		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__qrcode")).toHaveLength(1));

		userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
	});

	it("should handle receive funds from mobile menu", async () => {
		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<NavigationBar />
			</Route>,
			"xs",
			{
				history,
				route: dashboardURL,
			},
		);

		userEvent.click(screen.getByTestId("NavigationBar__buttons__mobile--receive"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toHaveTextContent("Select Address");

		userEvent.click(screen.getAllByText("Select")[0]);

		await expect(screen.findByTestId("ReceiveFunds__name")).resolves.toBeVisible();
		await expect(screen.findByTestId("ReceiveFunds__address")).resolves.toBeVisible();

		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__qrcode")).toHaveLength(1));

		userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
	});

	it("should update the mobile menu when the has fixed form context is updated", async () => {
		renderResponsiveWithRoute(
			<ContainerWithFixedFormButtons>
				<Route path="/profiles/:profileId/dashboard">
					<NavigationBar />
				</Route>
				,
			</ContainerWithFixedFormButtons>,
			"xs",
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("NavigationBar__buttons-separator")).toBeInTheDocument();
	});

	it("should show the mobile menu on xs screen", async () => {
		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<NavigationBar />
			</Route>,
			"xs",
			{
				history,
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("NavigationBarMobile")).toBeInTheDocument();
	});

	it("should hide the mobile menu when the show mobile navigation is set to `false`", async () => {
		renderResponsiveWithRoute(
			<ContainerWithHiddenNavigation>
				<Route path="/profiles/:profileId/dashboard">
					<NavigationBar />
				</Route>
				,
			</ContainerWithHiddenNavigation>,
			"xs",
			{
				history,
				route: dashboardURL,
			},
		);

		await waitFor(() => expect(screen.queryByTestId("NavigationBarMobile")).not.toBeInTheDocument());
	});

	it("should handle mobile menu home button", () => {
		const { history: renderHistory } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/send-transfer">
				<NavigationBar />
			</Route>,
			"xs",
			{
				history,
				route: "/profiles/:profileId/send-transfer",
			},
		);

		userEvent.click(screen.getByTestId("NavigationBar__buttons__mobile--home"));

		expect(renderHistory.location.pathname).toBe(dashboardURL);
	});

	it("should close the search wallet modal", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<NavigationBar />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		const receiveFundsButton = screen.getByTestId("NavigationBar__buttons--receive");

		userEvent.click(receiveFundsButton);

		await expect(screen.findByTestId("Modal__inner")).resolves.toHaveTextContent("Select Address");

		userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
	});

	it("should disable send transfer button when no Live wallets in test network", () => {
		const resetProfileNetworksMock = mockProfileWithOnlyPublicNetworks(profile);
		const mockProfile = environmentHooks.useActiveProfile();
		const profileSettingsMock = jest.spyOn(mockProfile.settings(), "get").mockImplementation((key: string) => {
			if (key === Contracts.ProfileSetting.Name) {
				return "John Doe";
			}
			if (key === Contracts.ProfileSetting.ExchangeCurrency) {
				return "USD";
			}

			return "";
		});

		const { container } = render(<NavigationBar />);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("NavigationBar__buttons--send")).toHaveAttribute("disabled");

		profileSettingsMock.mockRestore();
		resetProfileNetworksMock();
	});
});
