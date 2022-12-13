import React from "react";

import { TransactionExportProgress } from "./TransactionExportProgress";
import { render, screen } from "@/utils/testing-library";
import { translations } from "@/domains/transaction/i18n";

describe("TransactionExportProgress", () => {
	it("should render", () => {
		render(<TransactionExportProgress />);

		expect(screen.getByTestId("TransactionExportProgress__cancel-button")).toBeInTheDocument();
	});

	it("should render with zero progress", () => {
		render(<TransactionExportProgress count={0} />);

		expect(screen.getByText(translations.EXPORT.PROGRESS.DESCRIPTION_START)).toBeInTheDocument();
		expect(screen.getByTestId("TransactionExportProgress__cancel-button")).toBeInTheDocument();
	});

	it("should render with progress count", () => {
		const { asFragment } = render(<TransactionExportProgress count={10} />);

		expect(screen.getByTestId("TransactionExportProgress__cancel-button")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});
});
