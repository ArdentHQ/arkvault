import userEvent from "@testing-library/user-event";
import React from "react";

import { ApplicationError } from "./ApplicationError";
import { translations } from "@/domains/error/i18n";
import { render, screen } from "@/utils/testing-library";

describe("ApplicationError", () => {
	const { reload } = window.location;

	afterAll(() => {
		Object.defineProperty(window, "location", { value: reload });
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

		const { reload: mockedReload } = window.location;

		await userEvent.click(screen.getByTestId("ApplicationError__button--reload"));

		expect(mockedReload).toHaveBeenCalledWith();

		expect(asFragment()).toMatchSnapshot();
	});
});
