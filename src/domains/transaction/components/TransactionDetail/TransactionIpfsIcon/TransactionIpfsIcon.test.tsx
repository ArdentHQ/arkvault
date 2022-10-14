import React from "react";
import { TransactionIpfsIcon } from "./TransactionIpfsIcon";
import { getSvgById, renderResponsive } from "@/utils/testing-library";

describe("TransactionIpfsIcon", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container } = renderResponsive(<TransactionIpfsIcon />, breakpoint);

		expect(getSvgById(container, "ipfs")).toBeInTheDocument();
	});
});
