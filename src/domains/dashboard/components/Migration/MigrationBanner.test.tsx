import React from "react";
import { MigrationBanner } from "./MigrationBanner";
import { render, screen } from "@/utils/testing-library";

describe("MigrationBanner", () => {
	it("should render", () => {
		const { asFragment } = render(<MigrationBanner />);

		expect(screen.getByTestId("MigrationBanner")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
