import React from "react";
import userEvent from "@testing-library/user-event";
import { MigrationBanner } from "./MigrationBanner";
import { render, screen } from "@/utils/testing-library";

describe("MigrationBanner", () => {
	it("should render", () => {
		const { asFragment } = render(<MigrationBanner />);

		expect(screen.getByTestId("MigrationBanner")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("can click the learn more button", () => {
		const windowOpenSpy = vi.spyOn(window, "open");

		render(<MigrationBanner />);

		userEvent.click(screen.getByTestId("MigrationBanner--learnmore"));

		expect(windowOpenSpy).toHaveBeenCalled();

		windowOpenSpy.mockRestore();
	});
});
