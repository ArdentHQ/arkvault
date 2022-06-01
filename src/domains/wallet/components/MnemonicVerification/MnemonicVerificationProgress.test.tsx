import React from "react";

import { MnemonicVerificationProgress } from "./MnemonicVerificationProgress";
import { render, screen } from "@/utils/testing-library";

describe("MnemonicVerificationProgress", () => {
	it("should render tabs", () => {
		const positions = [1, 2, 3];
		const { asFragment } = render(<MnemonicVerificationProgress activeTab={1} wordPositions={positions} />);
		const tabs = screen.getAllByTestId("MnemonicVerificationProgress__Tab");

		expect(tabs).toHaveLength(positions.length);
		expect(asFragment()).toMatchSnapshot();
	});
});
