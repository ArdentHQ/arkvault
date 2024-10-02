import { createHashHistory } from "history";
import userEvent from "@testing-library/user-event";
import React from "react";

import { TransactionExportError } from "./TransactionExportError";
import { getDefaultProfileId, screen, renderResponsive, render } from "@/utils/testing-library";
import * as browserAccess from "browser-fs-access";

const history = createHashHistory();

const fixtureProfileId = getDefaultProfileId();
let dashboardURL: string;

const downloadButton = () => screen.getByTestId("TransactionExportError__download");

describe("TransactionExportError", () => {
	beforeEach(() => {
		dashboardURL = `/profiles/${fixtureProfileId}/dashboard`;
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint: string) => {
		const { asFragment } = renderResponsive(<TransactionExportError />, breakpoint, {
			history,
			route: dashboardURL,
		});

		expect(screen.getByTestId("TransactionExportError__retry-button")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show the Download button if export has processed partially", () => {
		const function_ = vi.fn();

		const file = {
			content: "",
			extension: "csv",
			name: "name",
		};

		render(<TransactionExportError count={1} file={file} onDownload={function_} onBack={function_} />);

		expect(downloadButton()).toBeInTheDocument();
	});

	it("should handle download", async () => {
		const browserAccessMock = vi.spyOn(browserAccess, "fileSave").mockResolvedValue({ name: "name" });
		const onDownload = vi.fn();

		const file = {
			content: "",
			extension: "csv",
			name: "name",
		};

		render(<TransactionExportError count={1} file={file} onDownload={onDownload} />);

		await userEvent.click(downloadButton());

		expect(downloadButton()).toBeInTheDocument();
		expect(onDownload).toHaveBeenCalled();
		browserAccessMock.mockRestore();
	});
});
