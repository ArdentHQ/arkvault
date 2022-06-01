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

	it("should render file selection for wwe and switch to json", () => {
		const onFileFormatChange = jest.fn();

		const { container } = render(<SelectFileStep fileFormat=".wwe" onFileFormatChange={onFileFormatChange} />);

		userEvent.click(screen.getByTestId("SelectFileStep__change-file"));

		expect(onFileFormatChange).toHaveBeenCalledWith(".json");
		expect(container).toMatchSnapshot();
	});

	it("should handle back event", () => {
		const onBack = jest.fn();

		const { container } = render(<SelectFileStep fileFormat=".wwe" onBack={onBack} />);

		userEvent.click(screen.getByTestId("SelectFileStep__back"));

		expect(onBack).toHaveBeenCalledWith();
		expect(container).toMatchSnapshot();
	});

	it("should change back from json to wwe", () => {
		const onFileFormatChange = jest.fn();

		const { container } = render(<SelectFileStep fileFormat=".json" onFileFormatChange={onFileFormatChange} />);

		userEvent.click(screen.getByTestId("SelectFileStep__back"));

		expect(onFileFormatChange).toHaveBeenCalledWith(".wwe");
		expect(container).toMatchSnapshot();
	});
});
