import React from "react";

import { TransactionExplorerLink } from "./TransactionExplorerLink";
import { translations } from "@/domains/transaction/i18n";
import { render } from "@/utils/testing-library";

vi.mock("react-resize-detector", () => ({
	useResizeDetector: () => ({ width: 100 }),
}));

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
