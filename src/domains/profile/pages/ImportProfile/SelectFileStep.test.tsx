import userEvent from "@testing-library/user-event";
import React from "react";

import { SelectFileStep } from "@/domains/profile/pages/ImportProfile/SelectFileStep";
import { render, screen } from "@/utils/testing-library";

describe("Import Profile Select File Step", () => {
	it("should render with wwe fileFormat selected", () => {
		render(<SelectFileStep fileFormat=".wwe" />);

		expect(screen.getByTestId("SelectFileStep__WweImport")).toBeInTheDocument();
	});

	it("should render with json fileFormat selected", () => {
		render(<SelectFileStep fileFormat=".json" />);

		expect(screen.getByTestId("SelectFileStep__JsonImport")).toBeInTheDocument();
	});

	it("should render file selection for wwe and switch to json", () => {
		const onFileFormatChange = vi.fn();

		render(<SelectFileStep fileFormat=".wwe" onFileFormatChange={onFileFormatChange} />);

		expect(screen.getByTestId("SelectFileStep__WweImport")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectFileStep__change-file"));

		expect(onFileFormatChange).toHaveBeenCalledWith(".json");
	});

	it("should handle back event", () => {
		const onBack = vi.fn();

		render(<SelectFileStep fileFormat=".wwe" onBack={onBack} />);

		userEvent.click(screen.getByTestId("SelectFileStep__back"));

		expect(onBack).toHaveBeenCalledWith();
	});

	it("should change back from json to wwe", async () => {
		const onFileFormatChange = vi.fn();

		render(<SelectFileStep fileFormat=".json" onFileFormatChange={onFileFormatChange} />);

		expect(screen.getByTestId("SelectFileStep__JsonImport")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectFileStep__back"));

		expect(onFileFormatChange).toHaveBeenCalledWith(".wwe");
	});
});
