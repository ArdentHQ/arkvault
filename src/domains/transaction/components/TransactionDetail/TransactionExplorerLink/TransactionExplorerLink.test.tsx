import React from "react";

import * as reactResizeDetector from "react-resize-detector";
import { TransactionExplorerLink } from "./TransactionExplorerLink";
import { translations } from "@/domains/transaction/i18n";
import { render } from "@/utils/testing-library";

describe("TransactionExplorerLink", () => {
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
