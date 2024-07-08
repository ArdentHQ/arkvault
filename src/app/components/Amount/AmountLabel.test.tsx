import userEvent from "@testing-library/user-event";
import React from "react";

import { AmountLabel } from "./AmountLabel";
import { render, screen } from "@/utils/testing-library";

describe("AmountLabel", () => {
	it("should render", () => {
		const { asFragment } = render(<AmountLabel isNegative={false} value={10} ticker="ARK" />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render negative", () => {
		const { asFragment } = render(<AmountLabel isNegative value={10} ticker="ARK" />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render compact", () => {
		const { asFragment } = render(<AmountLabel isNegative={false} isCompact value={10} ticker="ARK" />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render zero", () => {
		const { asFragment } = render(<AmountLabel isNegative={false} value={0} ticker="ARK" />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with hint", async () => {
		const { asFragment } = render(<AmountLabel isNegative={false} value={10} ticker="ARK" hint="I am an hint" />);

		expect(screen.getByTestId("AmountLabel__hint")).toBeInTheDocument();

		await userEvent.hover(screen.getByTestId("AmountLabel__hint"));

		expect(screen.getByText("I am an hint")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render compact with hint", async () => {
		const { asFragment } = render(
			<AmountLabel isCompact isNegative={false} value={10} ticker="ARK" hint="I am an hint" />,
		);

		expect(screen.getByTestId("AmountLabel__hint")).toBeInTheDocument();

		await userEvent.hover(screen.getByTestId("AmountLabel__hint"));

		expect(screen.getByText("I am an hint")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});
});
