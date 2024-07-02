import React from "react";

import { render, screen } from "@/utils/testing-library";

import { TransactionRowRecipientIcon } from "./TransactionRowRecipientIcon";

describe("TransactionRowRecipientIcon", () => {
	it("should render avatar", () => {
		const { asFragment } = render(<TransactionRowRecipientIcon type="transfer" recipient="test" />);

		expect(screen.getByTestId("Avatar")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render icon", () => {
		const { asFragment } = render(<TransactionRowRecipientIcon type="secondSignature" />);

		expect(screen.getByTestId("TransactionRowRecipientIcon")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render compact", () => {
		const { asFragment } = render(<TransactionRowRecipientIcon type="secondSignature" isCompact />);

		expect(screen.getByTestId("TransactionRowRecipientIcon")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
