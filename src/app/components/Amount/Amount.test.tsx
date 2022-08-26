import React from "react";

import { Amount } from "./Amount";
import { render, screen } from "@/utils/testing-library";

describe("Amount", () => {
	it("should format crypto or fiat depending on the ticker", () => {
		const { rerender } = render(<Amount value={123.456} ticker="EUR" />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^€123.46$/);

		rerender(<Amount value={123.456} ticker="ARK" />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^123.456 ARK$/);
	});

	it("should format crypto", () => {
		const { rerender } = render(<Amount value={1} ticker="ARK" />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^1 ARK$/);

		rerender(<Amount value={1234.56} ticker=" " />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^1,234.56$/);

		rerender(<Amount value={123_456} ticker="BTC" />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^123,456 BTC$/);

		rerender(<Amount value={0} ticker="DARK" />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^0 DARK$/);

		rerender(<Amount value={10} ticker="ARK" showSign />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^\+ 10 ARK$/);

		rerender(<Amount value={10} ticker="ARK" showSign isNegative />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^- 10 ARK$/);

		rerender(<Amount value={10} ticker="ARK" showTicker={false} />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^10$/);
	});

	it("should format fiat", () => {
		const { rerender } = render(<Amount value={123.456} ticker="USD" />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^\$123.46$/);

		rerender(<Amount value={1} ticker="USD" />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^\$1.00$/);

		rerender(<Amount value={1} ticker="USD" showSign />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^\+ \$1.00$/);

		rerender(<Amount value={1} ticker="USD" showSign isNegative />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^- \$1.00$/);
	});
});
