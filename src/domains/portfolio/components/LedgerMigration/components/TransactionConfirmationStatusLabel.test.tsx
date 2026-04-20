import { render } from "@/utils/testing-library";
import { expect, it, describe } from "vitest";
import { TransactionConfirmationStatusLabel } from "./TransactionConfirmationStatusLabel";

describe("TransactionConfirmationStatusLabel", () => {
	it("should render completed label", async () => {
		const { asFragment } = render(<TransactionConfirmationStatusLabel isCompleted />);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render pending label", async () => {
		const { asFragment } = render(<TransactionConfirmationStatusLabel isPending />);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render awaiting label", async () => {
		const { asFragment } = render(<TransactionConfirmationStatusLabel />);
		expect(asFragment()).toMatchSnapshot();
	});
});
