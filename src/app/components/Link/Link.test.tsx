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

		expect(screen.getByTestId("Link")).toHaveTextContent("Test");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render external", () => {
		render(
			<Link to="https://arkvault.io/" isExternal>
				ARK.io
			</Link>,
		);

		expect(screen.getByTestId("Link")).toHaveAttribute("rel", "noopener noreferrer");
		expect(screen.getByTestId("Link__external")).toBeInTheDocument();
	});

	it("should render disabled", () => {
		render(
			<Link to="https://arkvault.io/" isExternal isDisabled>
				ARK.io
			</Link>,
		);

		expect(screen.getByTestId("Link")).toHaveAttribute("rel", "noopener noreferrer");
		expect(screen.getByTestId("Link__external")).toBeInTheDocument();
	});

	it("should do nothing on click when disabled", () => {
		const windowSpy = jest.spyOn(window, "open").mockImplementation();
		const externalLink = "https://arkvault.io/";

		const { asFragment } = render(
			<Link to={externalLink} isExternal isDisabled>
				ARK.io
			</Link>,
		);

		expect(screen.getByTestId("Link")).toHaveAttribute("rel", "noopener noreferrer");
		expect(screen.getByTestId("Link__external")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("Link"));

		expect(windowSpy).not.toHaveBeenCalledWith(externalLink, "_blank");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render external without children", () => {
		const { asFragment } = render(<Link to="https://arkvault.io" isExternal />);

		expect(screen.getByTestId("Link__external")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should open an external link", () => {
		const windowSpy = jest.spyOn(window, "open").mockImplementation();

		const externalLink = "https://arkvault.io/";

		const { asFragment } = render(<Link to={externalLink} isExternal />);

		userEvent.click(screen.getByTestId("Link"));

		expect(windowSpy).toHaveBeenCalledWith(externalLink, "_blank");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show a toast when trying to open an invalid external link", () => {
		const externalLink = "invalid-url";

		const toastSpy = jest.spyOn(toasts, "error");

		const { asFragment } = render(<Link to={externalLink} isExternal />);

		userEvent.click(screen.getByTestId("Link"));

		expect(toastSpy).toHaveBeenCalledWith(translations.COMMON.ERRORS.INVALID_URL.replace("{{url}}", "invalid-url"));
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with tooltip", () => {
		const { asFragment, baseElement } = render(
			<Link to="/test" tooltip="Custom Tooltip">
				Test
			</Link>,
		);
		const link = screen.getByTestId("Link");

		userEvent.hover(link);

		expect(baseElement).toHaveTextContent("Custom Tooltip");

		userEvent.click(link);

		expect(asFragment()).toMatchSnapshot();
	});
});
