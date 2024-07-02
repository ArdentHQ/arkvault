import React from "react";

import { queryElementForSvg, renderResponsive } from "@/utils/testing-library";

import { TransactionDelegateIcon } from "./TransactionResponsiveIcon";

describe("TransactionDelegateIcon", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container } = renderResponsive(<TransactionDelegateIcon />, breakpoint);

		expect(queryElementForSvg(container, "delegate-registration")).toBeInTheDocument();
	});
});
