import React from "react";

import { ActionsProvider } from "./Actions";
import { render, screen } from "@/utils/testing-library";

describe("Actions Context Provider", () => {
	it("should render provider", () => {
		const { container } = render(
			<ActionsProvider>
				<span data-testid="ActionsProvider">Content</span>
			</ActionsProvider>,
		);

		expect(screen.getByTestId("ActionsProvider")).toBeInTheDocument();

		expect(container).toBeInTheDocument();
	});
});
