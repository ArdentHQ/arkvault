import React from "react";

import { TransactionExportError } from "./TransactionExportError";
import { screen, renderResponsive } from "@/utils/testing-library";

const file = {
	content: "",
	extension: "csv",
	name: "name",
};

describe("TransactionExportError", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint: string) => {
		const { asFragment } = renderResponsive(<TransactionExportError error="error" file={file} />, breakpoint);

		expect(screen.getByTestId("TransactionExportError")).toHaveTextContent("error");
		expect(asFragment()).toMatchSnapshot();
	});
});
