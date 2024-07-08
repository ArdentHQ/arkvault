import userEvent from "@testing-library/user-event";
import React from "react";

import { SelectFileStep } from "@/domains/profile/pages/ImportProfile/SelectFileStep";
import { render, screen } from "@/utils/testing-library";

describe("Import Profile Select File Step", () => {
	it("should render with wwe fileFormat selected", () => {
		const { container } = render(<SelectFileStep fileFormat=".wwe" />);

		expect(container).toMatchSnapshot();
	});

	it("should render with json fileFormat selected", () => {
		const { container } = render(<SelectFileStep fileFormat=".json" />);

		expect(container).toMatchSnapshot();
	});

	it("should render file selection for wwe and switch to json", async () => {
		const onFileFormatChange = vi.fn();

		const { container } = render(<SelectFileStep fileFormat=".wwe" onFileFormatChange={onFileFormatChange} />);

		await userEvent.click(screen.getByTestId("SelectFileStep__change-file"));

		expect(onFileFormatChange).toHaveBeenCalledWith(".json");
		expect(container).toMatchSnapshot();
	});

	it("should handle back event", async () => {
		const onBack = vi.fn();

		const { container } = render(<SelectFileStep fileFormat=".wwe" onBack={onBack} />);

		await userEvent.click(screen.getByTestId("SelectFileStep__back"));

		expect(onBack).toHaveBeenCalledWith();
		expect(container).toMatchSnapshot();
	});

	it("should change back from json to wwe", async () => {
		const onFileFormatChange = vi.fn();

		const { container } = render(<SelectFileStep fileFormat=".json" onFileFormatChange={onFileFormatChange} />);

		await userEvent.click(screen.getByTestId("SelectFileStep__back"));

		expect(onFileFormatChange).toHaveBeenCalledWith(".wwe");
		expect(container).toMatchSnapshot();
	});
});
