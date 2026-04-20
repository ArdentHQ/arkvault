import userEvent from "@testing-library/user-event";
import React from "react";

import { SelectFileStep } from "@/domains/profile/pages/ImportProfile/SelectFileStep";
import { render, screen } from "@/utils/testing-library";

describe("Import Profile Select File Step", () => {
	it("should render with wwe fileFormat selected", () => {
		render(<SelectFileStep fileFormat=".wwe" />);

		expect(screen.getByText("Import Profile")).toBeInTheDocument();
	});

	it("should handle back event", async () => {
		const onBack = vi.fn();

		render(<SelectFileStep fileFormat=".wwe" onBack={onBack} />);

		await userEvent.click(screen.getByTestId("SelectFileStep__back"));

		expect(onBack).toHaveBeenCalled();
	});
});
