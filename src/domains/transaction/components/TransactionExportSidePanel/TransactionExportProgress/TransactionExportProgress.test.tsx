import React from "react";

import { TransactionExportProgress } from "./TransactionExportProgress";
import { render, screen } from "@/utils/testing-library";
import { translations } from "@/domains/transaction/i18n";

const file = {
	content: "",
	extension: "csv",
	name: "name",
};

describe("TransactionExportProgress", () => {
	it("should render with zero progress", () => {
		render(<TransactionExportProgress count={0} file={file} />);

		expect(screen.getByText(translations.EXPORT.PROGRESS.DESCRIPTION_START)).toBeInTheDocument();
	});

	it("should render with progress count", () => {
		const { asFragment } = render(<TransactionExportProgress count={10} file={file} />);

		expect(screen.getByTestId("TransactionExportProgress")).toBeInTheDocument();
		expect(screen.queryByText(translations.EXPORT.PROGRESS.DESCRIPTION_START)).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});
});
