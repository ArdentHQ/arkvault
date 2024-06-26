import userEvent from "@testing-library/user-event";
import React from "react";

import { ApplicationError } from "./ApplicationError";
import { translations } from "@/domains/error/i18n";
import { render, screen } from "@/utils/testing-library";

describe("ApplicationError", () => {
	const { reload: originalReload } = window.location; 
	
	beforeAll(() => {
		Object.defineProperty(window.location, 'reload', {
		  configurable: true,
		  value: vi.fn(),
		});
	});
	
	afterAll(() => {
		Object.defineProperty(window.location, 'reload', {
			configurable: true,
			value: originalReload,
		});
	});

	it("should render without error message", () => {
		const { asFragment, container } = render(<ApplicationError />);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("ApplicationError__text")).toHaveTextContent(translations.APPLICATION.TITLE);
		expect(screen.getByTestId("ApplicationError__text")).toHaveTextContent(translations.APPLICATION.DESCRIPTION);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with error message and reload", async () => {
		const { asFragment, container } = render(<ApplicationError error={{ message: "some error", name: "error" }} />);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("ApplicationError__text")).toHaveTextContent(translations.APPLICATION.TITLE);
		expect(screen.getByTestId("ApplicationError__text")).toHaveTextContent(translations.APPLICATION.DESCRIPTION);

		Object.defineProperty(window, "location", {
			value: {
				reload: vi.fn(),
			},
		});

		await userEvent.click(screen.getByTestId("ApplicationError__button--reload"));

		const { reload } = window.location;
		expect(reload).toHaveBeenCalled();

		expect(asFragment()).toMatchSnapshot();
	});
});
