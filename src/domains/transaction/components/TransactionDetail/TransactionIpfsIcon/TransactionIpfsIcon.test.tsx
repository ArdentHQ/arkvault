import React from "react";

import { queryElementForSvg, renderResponsive } from "@/utils/testing-library";

import { TransactionIpfsIcon } from "./TransactionIpfsIcon";

describe("TransactionIpfsIcon", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container } = renderResponsive(<TransactionIpfsIcon />, breakpoint);

		expect(queryElementForSvg(container, "ipfs")).toBeInTheDocument();
	});
});
