import React from "react";

import * as useResizeDetectorModule from "react-resize-detector";
import { Address } from "./Address";
import { Size } from "@/types";
import { render, screen } from "@/utils/testing-library";

const sampleAddress = "ASuusXSW9kfWnicScSgUTjttP6T9GQ3kqT";

vi.mock("react-resize-detector", () => ({
	useResizeDetector: () => ({ ref: null }),
}));

describe("Formatted Address", () => {
	it("should render address only", () => {
		const { container } = render(<Address address={sampleAddress} />);

		expect(container).toMatchSnapshot();
	});

	it("should render with wallet name", () => {
		const { container } = render(<Address address={sampleAddress} walletName="Sample Wallet" />);

		expect(container).toMatchSnapshot();
	});

	it.each([true, false])("should render with truncate on table = %s", (truncateOnTable) => {
		const { container } = render(<Address address={sampleAddress} truncateOnTable={truncateOnTable} />);

		expect(container).toMatchSnapshot();
	});

	it.each(["center", "right"])("should render with %s alignment", (alignment) => {
		const { container } = render(<Address address={sampleAddress} alignment={alignment} />);

		expect(container).toMatchSnapshot();
	});

	it.each(["horizontal", "vertical"])("should render with %s orientation", (orientation) => {
		const { container } = render(
			<Address address={sampleAddress} orientation={orientation as "horizontal" | "vertical"} />,
		);

		expect(container).toMatchSnapshot();
	});

	it.each(["horizontal", "vertical"])("should render with %s orientation", (orientation) => {
		const useResizeDetectorSpy = vi.spyOn(useResizeDetectorModule, "useResizeDetector");
		useResizeDetectorSpy.mockReturnValueOnce({ ref: null, width: 50 }).mockReturnValue({ ref: null, width: 30 });

		const { container } = render(
			<Address address={sampleAddress} orientation={orientation as "horizontal" | "vertical"} />,
		);

		expect(container).toMatchSnapshot();

		useResizeDetectorSpy.mockRestore();
	});

	it("should not render without address", () => {
		const { container } = render(<Address />);

		expect(container).toMatchSnapshot();
	});

	it.each(["sm", "lg", "xl"])("should render with size %s", (size) => {
		render(<Address address={sampleAddress} walletName="Sample Wallet" size={size as Size} />);

		expect(screen.getByTestId("Address__alias")).toHaveClass(`text-${size}`);
	});

	it("should render with normal font", () => {
		const { container } = render(
			<Address fontWeight="normal" address={sampleAddress} walletName="Sample Wallet" />,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render with custom class for address", () => {
		render(
			<Address
				addressClass="text-theme-primary-600"
				address={sampleAddress}
				walletName="Sample Wallet"
				size="lg"
			/>,
		);

		expect(screen.getByTestId("Address__address")).toHaveClass("text-theme-primary-600");
	});

	it("should render with custom class for address wrapper", () => {
		render(
			<Address
				addressWrapperClass="text-theme-primary-600"
				address={sampleAddress}
				walletName="Sample Wallet"
				size="lg"
			/>,
		);

		expect(screen.getByTestId("Address__address-container")).toHaveClass("text-theme-primary-600");
	});
});
