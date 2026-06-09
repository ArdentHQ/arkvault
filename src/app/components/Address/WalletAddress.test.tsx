import React from "react";

import { WalletAddress } from "./WalletAddress";
import { render, screen } from "@/utils/testing-library";

const address = "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6";

describe("WalletAddress", () => {
	it("should render address only", () => {
		const { container } = render(<WalletAddress address={address} />);

		expect(container).toMatchSnapshot();
	});

	it("should render with wallet name", () => {
		const { container } = render(<WalletAddress address={address} walletName="Alice" />);

		expect(screen.getByTestId("WalletAddress__alias")).toHaveTextContent("Alice");
		expect(container).toMatchSnapshot();
	});

	it("should truncate long wallet names", () => {
		const { container } = render(<WalletAddress address={address} walletName="ThisIsAVeryLongWalletName" />);

		expect(screen.getByTestId("WalletAddress__alias")).toHaveTextContent("ThisIsAVeryLongW…");
		expect(container).toMatchSnapshot();
	});

	it("should render copy button", () => {
		const { container } = render(<WalletAddress address={address} showCopyButton />);

		expect(container).toMatchSnapshot();
	});

	it("should render with wallet name and copy button", () => {
		const { container } = render(<WalletAddress address={address} walletName="Bob" showCopyButton />);

		expect(screen.getByTestId("WalletAddress__alias")).toHaveTextContent("Bob");
		expect(container).toMatchSnapshot();
	});
});
