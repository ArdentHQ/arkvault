import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";

import { BackButton } from "./BackButton";
import { render, screen } from "@/utils/testing-library";

const history = createHashHistory();

const leftIcon = "chevron-left-small.svg";

describe("BackButton", () => {
	it("should render", () => {
		const { container } = render(<BackButton />, { history });

		expect(container).toHaveTextContent(leftIcon);
		expect(container).toMatchSnapshot();
	});

	it("should render when disabled", () => {
		const { container } = render(<BackButton disabled />, { history });

		expect(container).toHaveTextContent(leftIcon);
		expect(container).toMatchSnapshot();
	});

	it("should redirect to previous page", () => {
		const historySpy = vi.spyOn(history, "go").mockImplementation();

		const { container } = render(<BackButton />, { history });

		userEvent.click(screen.getByRole("button"));

		expect(historySpy).toHaveBeenCalledWith(-1);

		expect(container).toHaveTextContent(leftIcon);
		expect(container).toMatchSnapshot();

		historySpy.mockRestore();
	});

	it("should redirect to given url", () => {
		const historySpy = vi.spyOn(history, "push").mockImplementation();

		const { container } = render(<BackButton backToUrl="new-url" />, { history });

		userEvent.click(screen.getByRole("button"));

		expect(historySpy).toHaveBeenCalledWith("new-url");

		expect(container).toHaveTextContent(leftIcon);
		expect(container).toMatchSnapshot();

		historySpy.mockRestore();
	});

	it("should not redirect to previous page when disabled", () => {
		const historySpy = vi.spyOn(history, "go").mockImplementation();

		const { container } = render(<BackButton disabled />, { history });

		userEvent.click(screen.getByRole("button"));

		expect(historySpy).not.toHaveBeenCalled();

		expect(container).toHaveTextContent(leftIcon);
		expect(container).toMatchSnapshot();

		historySpy.mockRestore();
	});

	it("should not redirect to given url when disabled", () => {
		const historySpy = vi.spyOn(history, "push").mockImplementation();

		const { container } = render(<BackButton backToUrl="new-url" disabled />, { history });

		userEvent.click(screen.getByRole("button"));

		expect(historySpy).not.toHaveBeenCalled();

		expect(container).toHaveTextContent(leftIcon);
		expect(container).toMatchSnapshot();

		historySpy.mockRestore();
	});
});
