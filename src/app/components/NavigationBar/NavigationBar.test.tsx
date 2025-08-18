import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";

import { NavigationBar } from "./NavigationBar";
import * as navigation from "@/app/constants/navigation";
import * as environmentHooks from "@/app/hooks/env";
import { useNavigationContext } from "@/app/contexts";
import {
	env as mockedTestEnvironment,
	getMainsailProfileId,
	render,
	screen,
	waitFor,
	renderResponsiveWithRoute,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

const dashboardURL = `/profiles/${getMainsailProfileId()}/dashboard`;
const webWidgetSelector = "#webWidget";
const navigationBarLogoButtonSelector = "NavigationBarLogo--button";

vi.spyOn(environmentHooks, "useActiveProfile").mockImplementation(() =>
	mockedTestEnvironment.profiles().findById(getMainsailProfileId()),
);

vi.spyOn(navigation, "getNavigationMenu").mockReturnValue([
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
		process.env.MOCK_AVAILABLE_NETWORKS = "false";
		profile = mockedTestEnvironment.profiles().findById(getMainsailProfileId());
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it.each([true, false])("should render full variant when profile restored is %s", (isRestored) => {
		const isRestoredMock = vi.spyOn(profile.status(), "isRestored").mockReturnValue(isRestored);

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

	it("should render with title if variant is logo-only", () => {
		const title = "ARK VAULT";

		const { container, asFragment } = render(<NavigationBar variant="logo-only" title={title} />);

		expect(container).toBeInTheDocument();
		expect(container).toHaveTextContent(title);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should not render with title if variant is full", () => {
		const title = "ARK VAULT";

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

	it.each(["xs", "sm", "md", "lg"])("should render in %s", async (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(<NavigationBar />, breakpoint);

		Object.defineProperty(window, "innerWidth", { configurable: true, value: 700, writable: true });
		window.dispatchEvent(new Event("resize"));

		await expect(screen.findByTestId("NavigationBar__menu-toggle")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("NavigationBar__menu-toggle"));

		expect(screen.getByText("Portfolio")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle logo click", async () => {
		const { router } = render(<NavigationBar />);

		await userEvent.click(screen.getByTestId(navigationBarLogoButtonSelector));

		expect(router.state.location.pathname).toBe(`/profiles/${getMainsailProfileId()}/dashboard`);
	});

	it("should render logo with 16 pixels height on mobile", () => {
		const { container } = renderResponsiveWithRoute(<NavigationBar />, "xs");

		expect(container).toBeInTheDocument();
		const button = screen.getByTestId(navigationBarLogoButtonSelector);
		// eslint-disable-next-line testing-library/no-node-access
		const svg = button.querySelector("svg");

		expect(svg).toHaveAttribute("height", "16");
	});

	it("should render logo with 16 pixels height on desktop", () => {
		const { container } = renderResponsiveWithRoute(<NavigationBar />, "lg");

		expect(container).toBeInTheDocument();
		const button = screen.getByTestId(navigationBarLogoButtonSelector);

		// eslint-disable-next-line testing-library/no-node-access
		const svg = button.querySelector("svg");

		expect(svg).toHaveAttribute("height", "16");
	});

	it("should redirect to dashboard by default on logo click", async () => {
		const { router } = render(<NavigationBar variant="default" />);

		await userEvent.click(screen.getByTestId(navigationBarLogoButtonSelector));

		expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);
	});

	it("should handle menu click", async () => {
		const { router } = render(<NavigationBar />);

		await userEvent.click(screen.getByText("test"));

		expect(router.state.location.pathname).toBe("/test");
	});

	it("should handle menu click in small screen variant", async () => {
		Object.defineProperty(window, "innerWidth", { configurable: true, value: 700, writable: true });
		window.dispatchEvent(new Event("resize"));

		const { router } = render(<NavigationBar />);

		await userEvent.click(screen.queryAllByTestId("dropdown__toggle")[0]);

		expect(screen.getByTestId("dropdown__options")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("dropdown__option--1"));

		expect(router.state.location.pathname).toBe("/test");
	});

	it("should open user actions dropdown on click", async () => {
		const getUserMenuActionsMock = vi.spyOn(navigation, "getUserMenuActions").mockReturnValue([
			{ label: "Option 1", mountPath: () => "/test", title: "test", value: "/test" },
			{ label: "Option 2", mountPath: () => "/test2", title: "test2", value: "/test2" },
		]);

		const { router } = render(<NavigationBar />);
		const toggle = screen.getByTestId("UserMenu");

		await userEvent.click(toggle);

		expect(screen.getByText("Option 1")).toBeInTheDocument();

		await userEvent.click(screen.getByText("Option 1"));

		expect(router.state.location.pathname).toBe("/test");

		getUserMenuActionsMock.mockRestore();
	});

	it("should open support chat when clicking contact menu", async () => {
		// @ts-ignore
		const widgetMock = vi.spyOn(window.document, "querySelector").mockImplementation((selector: string) => {
			if (selector === webWidgetSelector) {
				return {
					contentWindow: {
						document: {
							body: {
								classList: {
									add: vi.fn(),
									remove: vi.fn(),
								},
								insertAdjacentHTML: vi.fn(),
							},
						},
					},
				};
			}
		});

		const getUserMenuActionsMock = vi
			.spyOn(navigation, "getUserMenuActions")
			.mockReturnValue([{ label: "Option 1", mountPath: () => "/", title: "test2", value: "contact" }]);

		const { router } = render(<NavigationBar />);
		const toggle = screen.getByTestId("UserMenu");

		await userEvent.click(toggle);

		expect(screen.getByText("Option 1")).toBeInTheDocument();

		await userEvent.click(screen.getByText("Option 1"));

		expect(router.state.location.pathname).toBe("/");

		await waitFor(() => expect(widgetMock).toHaveBeenCalledWith(webWidgetSelector));

		getUserMenuActionsMock.mockRestore();

		widgetMock.mockRestore();
	});

	it("should handle click to send button", async () => {
		const mockProfile = environmentHooks.useActiveProfile();
		const { router } = render(<NavigationBar />);

		const sendButton = screen.getByTestId("NavigationBar__buttons--send");

		await userEvent.click(sendButton);

		expect(router.state.location.pathname).toBe(`/profiles/${mockProfile.id()}/send-transfer`);
	});

	it("should handle click to send button from mobile menu", async () => {
		const mockProfile = environmentHooks.useActiveProfile();
		const { router } = renderResponsiveWithRoute(<NavigationBar />, "xs");

		const sendButton = screen.getByTestId("NavigationBar__buttons__mobile--send");

		await userEvent.click(sendButton);

		expect(router.state.location.pathname).toBe(`/profiles/${mockProfile.id()}/send-transfer`);
	});

	it("should handle receive funds", async () => {
		render(<NavigationBar />, {
			route: dashboardURL,
		});

		await userEvent.click(screen.getByTestId("NavigationBar__buttons--receive"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toHaveTextContent("Select Address");

		await userEvent.click(screen.getAllByText("Select")[0]);

		await expect(screen.findByTestId("ReceiveFunds__Name_Address")).resolves.toBeVisible();

		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__qrcode")).toHaveLength(1));

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
	});

	it("should handle receive funds from mobile menu", async () => {
		renderResponsiveWithRoute(<NavigationBar />, "xs", {
			route: dashboardURL,
		});

		await userEvent.click(screen.getByTestId("NavigationBar__buttons__mobile--receive"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toHaveTextContent("Select Address");

		await userEvent.click(screen.getAllByTestId("ReceiverItemMobile--Select")[0]);

		await expect(screen.findByTestId("ReceiveFunds__Name_Address")).resolves.toBeVisible();

		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__qrcode")).toHaveLength(1));

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
	});

	it("should update the mobile menu when the has fixed form context is updated", async () => {
		renderResponsiveWithRoute(
			<ContainerWithFixedFormButtons>
				<NavigationBar />
			</ContainerWithFixedFormButtons>,
			"xs",
			{
				route: dashboardURL,
			},
		);

		expect(screen.getByTestId("NavigationBar__buttons-separator")).toBeInTheDocument();
	});

	it("should show the mobile menu on xs screen", async () => {
		renderResponsiveWithRoute(<NavigationBar />, "xs", {
			route: dashboardURL,
		});

		expect(screen.getByTestId("NavigationBarMobile")).toBeInTheDocument();
	});

	it("should hide the mobile menu when the show mobile navigation is set to `false`", async () => {
		renderResponsiveWithRoute(
			<ContainerWithHiddenNavigation>
				<NavigationBar />
			</ContainerWithHiddenNavigation>,
			"xs",
			{
				route: dashboardURL,
			},
		);

		await waitFor(() => expect(screen.queryByTestId("NavigationBarMobile")).not.toBeInTheDocument());
	});

	it("should handle mobile menu home button", async () => {
		const { router } = renderResponsiveWithRoute(<NavigationBar />, "xs", {
			route: "/profiles/:profileId/send-transfer",
		});

		await userEvent.click(screen.getByTestId("NavigationBar__buttons__mobile--home"));

		expect(router.state.location.pathname).toBe(dashboardURL);
	});

	it("should close the search wallet modal", async () => {
		render(<NavigationBar />, {
			route: dashboardURL,
		});

		const receiveFundsButton = screen.getByTestId("NavigationBar__buttons--receive");

		await userEvent.click(receiveFundsButton);

		await expect(screen.findByTestId("Modal__inner")).resolves.toHaveTextContent("Select Address");

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
	});

	it("should disable send transfer button when no Live wallets in test network", () => {
		const walletsSpy = vi.spyOn(profile.wallets(), "values").mockReturnValue([]);
		const mockProfile = environmentHooks.useActiveProfile();
		const profileSettingsMock = vi.spyOn(mockProfile.settings(), "get").mockImplementation((key: string) => {
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
		walletsSpy.mockRestore();
	});

	it("should hide the mobile menu if an input is focused", async () => {
		renderResponsiveWithRoute(
			<div>
				<input data-testid="input" />
				<NavigationBar />
			</div>,
			"xs",
			{
				route: dashboardURL,
			},
		);

		await userEvent.type(screen.getByTestId("input"), "text");

		await expect(screen.findByTestId("NavigationBarMobile")).rejects.toThrow(/Unable to find/);
	});

	it("should render logo-only variant", () => {
		render(<NavigationBar variant="logo-only" />);

		expect(screen.getByRole("navigation")).toHaveClass("h-21");
	});

	it("should render default variant", () => {
		render(<NavigationBar variant="default" />);
		expect(screen.getByRole("navigation")).toHaveClass("h-12");
	});

	it("should render logo-only variant on xs screen", () => {
		const { asFragment } = renderResponsiveWithRoute(<NavigationBar variant="logo-only" />, "xs");

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render logo-only variant on large screen", () => {
		const { container, asFragment } = renderResponsiveWithRoute(<NavigationBar variant="logo-only" />, "lg");

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
