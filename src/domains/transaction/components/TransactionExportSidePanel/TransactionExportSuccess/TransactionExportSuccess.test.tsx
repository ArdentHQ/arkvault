import React from "react";

import { TransactionExportSuccess } from "./TransactionExportSuccess";
import { translations } from "@/domains/transaction/i18n";
import { screen, renderResponsive, render } from "@/utils/testing-library";

const file = {
	content: "",
	extension: "csv",
	name: "name",
};

describe("TransactionExportSuccess", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint: string) => {
		const { asFragment } = renderResponsive(<TransactionExportSuccess count={10} file={file} />, breakpoint);

		expect(screen.getByTestId("TransactionExportSuccess")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render warning if count is zero", () => {
		const { asFragment, container } = render(<TransactionExportSuccess count={0} file={file} />);

		expect(container).toHaveTextContent(translations.EXPORT.EMPTY.DESCRIPTION);

		expect(asFragment()).toMatchSnapshot();
	});
});
