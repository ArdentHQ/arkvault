import React from "react";

import * as reactResizeDetector from "react-resize-detector";
import { TransactionPublicKey } from "./TransactionPublicKey";
import { translations } from "@/domains/transaction/i18n";
import { render } from "@/utils/testing-library";

vi.mock("react-resize-detector");

describe("TransactionPublicKey", () => {
	const publicKey = "034cc5de0e7d78bd56706e787c8f1f7c1029eb404c8296d0ee40379d1f0529975f";

	it("should render", () => {
		const { container } = render(<TransactionPublicKey publicKey={publicKey} />);

		expect(container).toHaveTextContent(translations.VALIDATOR_PUBLIC_KEY);
		expect(container).toMatchSnapshot();
	});

	it("should render responsive", () => {
		vi.spyOn(reactResizeDetector, "useResizeDetector").mockReturnValue({ width: 100 });

		const { container } = render(<TransactionPublicKey publicKey={publicKey} />);

		expect(container).toHaveTextContent(translations.VALIDATOR_PUBLIC_KEY);
		expect(container).toMatchSnapshot();
	});
});
