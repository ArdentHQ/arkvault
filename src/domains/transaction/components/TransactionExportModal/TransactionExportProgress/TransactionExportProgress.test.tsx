import React from "react";

import { render, screen, waitFor, within } from "@/utils/testing-library";
import { TransactionExportProgress } from "./TransactionExportProgress";
import { translations } from "@/domains/transaction/i18n";

const dateToggle = () =>
	within(screen.getByTestId("TransactionExportForm--daterange-options")).getByTestId("CollapseToggleButton");

describe("TransactionExportProgress", () => {
	it("should render", async () => {
		render(<TransactionExportProgress />);

		expect(screen.getByTestId("TransactionExportProgress__cancel-button")).toBeInTheDocument();
	});

	it("should render with zero progress", async () => {
		render(<TransactionExportProgress count={0} />);

		expect(screen.getByText(translations.EXPORT.PROGRESS.DESCRIPTION_START)).toBeInTheDocument();
		expect(screen.getByTestId("TransactionExportProgress__cancel-button")).toBeInTheDocument();
	});

	it("should render with progress count", async () => {
		const { asFragment } = render(<TransactionExportProgress count={10} />);

		expect(screen.getByTestId("TransactionExportProgress__cancel-button")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});
});
