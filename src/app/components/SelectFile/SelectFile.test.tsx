import * as browserAccess from "browser-fs-access";
import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { useTranslation } from "react-i18next";

import { SelectFile } from "./SelectFile";
import { fireEvent, render, screen, waitFor } from "@/utils/testing-library";

const browseFiles = () => screen.getByTestId("SelectFile__browse-files");

const sampleFiles = [new File(["sample"], "sample-export.json")];

describe("SelectFile", () => {
	it("should render with wwe file format", () => {
		const { container } = render(<SelectFile fileFormat=".wwe" onSelect={vi.fn} />);

		expect(container).toMatchSnapshot();
	});

	it("should render with json file format", () => {
		const { container } = render(<SelectFile fileFormat=".json" onSelect={vi.fn} />);

		expect(container).toMatchSnapshot();
	});

	it("should open dialog to select file", async () => {
		const browserAccessMock = vi.spyOn(browserAccess, "fileOpen").mockResolvedValue(sampleFiles[0]);

		const onSelect = vi.fn();
		render(<SelectFile fileFormat=".json" onSelect={onSelect} />);

		await userEvent.click(browseFiles());

		await waitFor(() => expect(browserAccessMock).toHaveBeenCalledWith({ extensions: [".json"] }));

		await waitFor(() =>
			expect(onSelect).toHaveBeenCalledWith({
				content: expect.any(String),
				extension: expect.any(String),
				name: expect.any(String),
			}),
		);

		browserAccessMock.mockRestore();
	});

	it("should not select the corrupted file", async () => {
		const corruptedFile = new File([""], "sample.json");

		const browserAccessMock = vi.spyOn(browserAccess, "fileOpen").mockResolvedValue(corruptedFile);

		const onSelect = vi.fn();
		render(<SelectFile fileFormat=".json" onSelect={onSelect} />);

		await userEvent.click(browseFiles());

		await waitFor(() => expect(browserAccessMock).toHaveBeenCalledWith({ extensions: [".json"] }));

		await waitFor(() => expect(onSelect).not.toHaveBeenCalled());

		// drag and drop
		fireEvent.dragOver(browseFiles(), {
			dataTransfer: {
				files: [corruptedFile],
			},
		});

		fireEvent.dragEnter(browseFiles(), {
			dataTransfer: {
				files: [corruptedFile],
			},
		});

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: [corruptedFile],
			},
		});

		await waitFor(() => expect(onSelect).not.toHaveBeenCalled());

		browserAccessMock.mockRestore();
	});

	it("should change background when dragging over drop zone", async () => {
		render(<SelectFile fileFormat=".json" onSelect={vi.fn} />);

		expect(screen.getByTestId("SelectFile__drop-zone")).toHaveClass("bg-theme-primary-50 dark:bg-black");

		fireEvent.dragEnter(screen.getByTestId("SelectFile__drop-zone"), {
			dataTransfer: {
				files: sampleFiles,
			},
		});

		await waitFor(() =>
			expect(screen.getByTestId("SelectFile__drop-zone")).toHaveClass(
				"bg-theme-primary-100 dark:bg-theme-secondary-800",
			),
		);

		fireEvent.dragLeave(screen.getByTestId("SelectFile__drop-zone"), {
			dataTransfer: {
				files: sampleFiles,
			},
		});
	});

	it("should handle file drop", async () => {
		//@ts-ignore
		const onSelect = vi.fn();
		render(<SelectFile fileFormat=".json" onSelect={onSelect} />);

		fireEvent.dragOver(browseFiles(), {
			dataTransfer: {
				files: sampleFiles,
			},
		});

		fireEvent.dragEnter(browseFiles(), {
			dataTransfer: {
				files: sampleFiles,
			},
		});

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: sampleFiles,
			},
		});

		await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
	});

	it("should show error if the dropped file has wrong type", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const fileFormat = ".json";

		const { container } = render(<SelectFile fileFormat={fileFormat} onSelect={vi.fn} />);

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: [{ name: "sample-export.wwe", path: "path/to/sample-export.wwe" }],
			},
		});

		const errorHtml = t("PROFILE.IMPORT.SELECT_FILE_STEP.ERRORS.NOT_SUPPORTED", { fileFormat });

		expect(container).toContainHTML(errorHtml);

		await userEvent.click(screen.getByRole("button"));

		expect(container).not.toContainHTML(errorHtml);
	});

	it("should show error if multiple files are dropped", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const { container } = render(<SelectFile fileFormat=".json" onSelect={vi.fn} />);

		fireEvent.drop(browseFiles(), {
			dataTransfer: {
				files: [
					{ name: "sample-export-1.json", path: "path/to/sample-export-1.json" },
					{ name: "sample-export-2.json", path: "path/to/sample-export-2.json" },
				],
			},
		});

		const errorHtml = t("PROFILE.IMPORT.SELECT_FILE_STEP.ERRORS.TOO_MANY", { fileCount: 2 });

		expect(container).toContainHTML(errorHtml);

		await userEvent.click(screen.getByRole("button"));

		expect(container).not.toContainHTML(errorHtml);
	});
});
