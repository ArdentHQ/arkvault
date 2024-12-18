import React from "react";
import { render, screen } from "@/utils/testing-library";
import { MobileCard } from "./MobileCard";
describe("MobileCard", () => {
	it("should render", () => {
		render(<MobileCard data-testid="MobileCard__wrapper">Content</MobileCard>);

		expect(screen.getByTestId("MobileCard__wrapper")).toBeInTheDocument();
	});

	it("should render children", () => {
		render(<MobileCard data-testid="MobileCard__wrapper">Content</MobileCard>);

		expect(screen.getByText("Content")).toBeInTheDocument();
	});
});
