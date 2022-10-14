import React from "react";
import { TransactionDelegateIcon } from "./TransactionResponsiveIcon";
import { queryElementForSvg, renderResponsive } from "@/utils/testing-library";

describe("TransactionDelegateIcon", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container } = renderResponsive(<TransactionDelegateIcon />, breakpoint);

		expect(queryElementForSvg(container, "delegate-registration")).toBeInTheDocument();
	});
});
