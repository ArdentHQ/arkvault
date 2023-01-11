import React from "react";

import { MigrationProvider } from "./Migration";
import { render, screen } from "@/utils/testing-library";

describe("Migration Context", () => {
	it("should render the wrapper properly", () => {
		const { container } = render(
			<MigrationProvider>
				<span data-testid="MigrationProvider__content">Migration Provider content</span>
			</MigrationProvider>,
		);

		expect(screen.getByTestId("MigrationProvider__content")).toBeInTheDocument();

		expect(container).toBeInTheDocument();
	});
});
