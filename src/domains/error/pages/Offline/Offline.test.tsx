import React from "react";

import { Offline } from "./Offline";
import { translations } from "@/domains/error/i18n";
import { render, screen } from "@/utils/testing-library";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

describe("Offline", () => {
	it("should render", () => {
		const { container, asFragment } = render(<Offline />);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("Offline__text")).toHaveTextContent(translations.OFFLINE.TITLE);
		expect(screen.getByTestId("Offline__text")).toHaveTextContent(translations.OFFLINE.DESCRIPTION);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should contain reload button", async () => {
		render(<Offline />);

		expect(screen.getByTestId("Offline__button")).toBeInTheDocument();

		const reloadSpy = vi.fn();

		Object.defineProperty(window, "location", {
			value: {
				reload: reloadSpy,
			},
		});

		await userEvent.click(screen.getByTestId("Offline__button"));

		expect(reloadSpy).toHaveBeenCalledWith();
	});
});
