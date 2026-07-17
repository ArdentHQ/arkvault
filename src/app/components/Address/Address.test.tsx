import React from "react";

import { Address } from "./Address";
import { render, screen } from "@/utils/testing-library";

const address = "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6";

describe("Address", () => {
	it("should render address only", () => {
		const { container } = render(<Address address={address} />);

		expect(container).toMatchSnapshot();
	});

	it("should render with wallet name", () => {
		const { container } = render(<Address address={address} walletName="Alice" />);

		expect(screen.getByTestId("Address__alias")).toHaveTextContent("Alice");
		expect(container).toMatchSnapshot();
	});

	it("should truncate long wallet names", () => {
		const { container } = render(<Address address={address} walletName="ThisIsAVeryLongWalletName" />);

		expect(screen.getByTestId("Address__alias")).toHaveTextContent("ThisIsAVeryLongW…");
		expect(container).toMatchSnapshot();
	});

	it("should render copy button", () => {
		const { container } = render(<Address address={address} showCopyButton />);

		expect(container).toMatchSnapshot();
	});

	it("should render with wallet name and copy button", () => {
		const { container } = render(<Address address={address} walletName="Bob" showCopyButton />);

		expect(screen.getByTestId("Address__alias")).toHaveTextContent("Bob");
		expect(container).toMatchSnapshot();
	});
});
