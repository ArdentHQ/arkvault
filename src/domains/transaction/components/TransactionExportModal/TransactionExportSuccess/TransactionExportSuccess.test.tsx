import React from "react";

import { translations } from "@/domains/transaction/i18n";
import { render, renderResponsive, screen } from "@/utils/testing-library";

import { TransactionExportSuccess } from "./TransactionExportSuccess";

const downloadButton = () => screen.getByTestId("TransactionExportSuccess__download-button");

describe("TransactionExportForm", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint: string) => {
		const { asFragment } = renderResponsive(<TransactionExportSuccess count={10} />, breakpoint);

		expect(downloadButton()).toBeInTheDocument();
		expect(downloadButton()).toBeEnabled();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render warning if count is zero", () => {
		const { asFragment, container } = render(<TransactionExportSuccess count={0} />);

		expect(container).toHaveTextContent(translations.EXPORT.EMPTY.DESCRIPTION);

		expect(downloadButton()).toBeInTheDocument();
		expect(downloadButton()).toBeDisabled();

		expect(asFragment()).toMatchSnapshot();
	});
});
