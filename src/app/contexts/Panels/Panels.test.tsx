import React from "react";

import { ActionsProvider } from "./Panels";
import { render, screen } from "@/utils/testing-library";

describe("Panels Context Provider", () => {
	it("should render provider", () => {
		const { container } = render(
			<ActionsProvider>
				<span data-testid="PanelsProvider">Content</span>
			</ActionsProvider>,
		);

		expect(screen.getByTestId("PanelsProvider")).toBeInTheDocument();

		expect(container).toBeInTheDocument();
	});
});
