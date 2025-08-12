import userEvent from "@testing-library/user-event";
import React from "react";

import { Link } from "./Link";
import { buildTranslations } from "@/app/i18n/helpers";
import { toasts } from "@/app/services";
import { render, screen } from "@/utils/testing-library";

const translations = buildTranslations();

describe("Link", () => {
	it("should render", () => {
		const { asFragment } = render(<Link to="/test">Test</Link>);

		expect(screen.getByTestId("RouterLink")).toHaveTextContent("Test");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render external", () => {
		render(
			<Link to="https://app.arkvault.io/" isExternal>
				app.arkvault.io
			</Link>,
		);

		expect(screen.getByTestId("Link")).toHaveAttribute("rel", "noopener noreferrer");
		expect(screen.getByTestId("Link__external")).toBeInTheDocument();
	});

	it("should render disabled", () => {
		render(
			<Link to="https://app.arkvault.io/" isExternal isDisabled>
				app.arkvault.io
			</Link>,
		);

		expect(screen.getByTestId("Link")).toHaveAttribute("rel", "noopener noreferrer");
		expect(screen.getByTestId("Link__external")).toBeInTheDocument();
	});

	it("should do nothing on click when disabled", async () => {
		const windowSpy = vi.spyOn(window, "open").mockImplementation(vi.fn());
		const externalLink = "https://app.arkvault.io/";

		const { asFragment } = render(
			<Link to={externalLink} isExternal isDisabled>
				app.arkvault.io
			</Link>,
		);

		expect(screen.getByTestId("Link")).toHaveAttribute("rel", "noopener noreferrer");
		expect(screen.getByTestId("Link__external")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Link"));

		expect(windowSpy).not.toHaveBeenCalledWith(externalLink, "_blank");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render external without children", () => {
		const { asFragment } = render(<Link to="https://app.arkvault.io" isExternal />);

		expect(screen.getByTestId("Link__external")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should open an external link", async () => {
		const windowSpy = vi.spyOn(window, "open").mockImplementation(vi.fn());

		const externalLink = "https://app.arkvault.io/";

		const { asFragment } = render(<Link to={externalLink} isExternal />);

		await userEvent.click(screen.getByTestId("Link"));

		expect(windowSpy).toHaveBeenCalledWith(externalLink, "_blank");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show a toast when trying to open an invalid external link", async () => {
		const externalLink = "invalid-url";

		const toastSpy = vi.spyOn(toasts, "error");

		const { asFragment } = render(<Link to={externalLink} isExternal />);

		await userEvent.click(screen.getByTestId("Link"));

		expect(toastSpy).toHaveBeenCalledWith(translations.COMMON.ERRORS.INVALID_URL.replace("{{url}}", "invalid-url"));
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with tooltip", async () => {
		const { asFragment, baseElement } = render(
			<Link to="/test" tooltip="Custom Tooltip" isExternal>
				Test
			</Link>,
		);
		const link = screen.getByTestId("Link");

		await userEvent.hover(link);

		expect(baseElement).toHaveTextContent("Custom Tooltip");

		await userEvent.click(link);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render internal link with correct styles", () => {
		render(<Link to="/internal">Internal Link</Link>);
		const link = screen.getByTestId("RouterLink");

		expect(link).toHaveTextContent("Internal Link");
		expect(link).toHaveClass("ring-focus", "group/inner", "inline-block");
		expect(link).not.toHaveAttribute("rel");
	});

	it("should render disabled internal link", () => {
		render(
			<Link to="/internal" isDisabled>
				Disabled Internal Link
			</Link>,
		);
		const link = screen.getByTestId("RouterLink");

		expect(link).toHaveTextContent("Disabled Internal Link");
		expect(link).toHaveClass("text-theme-secondary-text", "cursor-not-allowed");
	});

	it("should not show external icon for internal links", () => {
		render(
			<Link to="/internal">
				Internal Link
			</Link>,
		);

		expect(screen.getByTestId("RouterLink")).toBeInTheDocument();
		expect(screen.queryByTestId("RouterLink__external")).not.toBeInTheDocument();
	});

	it("should render internal link with custom className", () => {
		render(
			<Link to="/internal" className="custom-class">
				Internal Link
			</Link>,
		);
		const link = screen.getByTestId("RouterLink");

		expect(link).toHaveClass("custom-class");
	});

	it("should handle complex internal routes", () => {
		render(<Link to="/dashboard/settings?tab=profile#section">Complex Route</Link>);
		const link = screen.getByTestId("RouterLink");

		expect(link).toHaveTextContent("Complex Route");
		expect(link).toHaveAttribute("href", "/dashboard/settings?tab=profile#section");
	});

	it("should render internal link with tooltip", async () => {
		const { baseElement } = render(
			<Link to="/internal" tooltip="Internal Link Tooltip">
				Internal Link
			</Link>,
		);
		const link = screen.getByTestId("RouterLink");

		await userEvent.hover(link);
		expect(baseElement).toHaveTextContent("Internal Link Tooltip");
	});
});
