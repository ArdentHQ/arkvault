import React from "react";

import * as reactResizeDetector from "react-resize-detector";
import { TransactionExplorerLink } from "./TransactionExplorerLink";
import { translations } from "@/domains/transaction/i18n";
import { render, renderResponsive } from "@/utils/testing-library";

vi.mock("react-resize-detector");

describe("TransactionExplorerLink", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container } = renderResponsive(
			<TransactionExplorerLink
				transaction={{
					explorerLink: () => "transaction-link",
					id: () => "test-id",
				}}
			/>,
			breakpoint,
		);

		expect(container).toHaveTextContent(translations.ID);
	});
	it("should render a transaction link", () => {
		const { container } = render(
			<TransactionExplorerLink
				// @ts-ignore
				transaction={{
					explorerLink: () => "transaction-link",
					id: () => "test-id",
				}}
			/>,
		);

		expect(container).toHaveTextContent(translations.ID);
		expect(container).toMatchSnapshot();
	});

	it("should render a transaction link responsive after the width has calculated", () => {
		vi.spyOn(reactResizeDetector, "useResizeDetector").mockReturnValue({ width: 100 });

		const { container } = render(
			<TransactionExplorerLink
				// @ts-ignore
				transaction={{
					explorerLink: () => "transaction-link",
					id: () => "test-id",
				}}
			/>,
		);

		expect(container).toHaveTextContent(translations.ID);
		expect(container).toMatchSnapshot();
	});
});
