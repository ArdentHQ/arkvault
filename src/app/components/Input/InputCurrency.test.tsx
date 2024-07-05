import userEvent from "@testing-library/user-event";
import React, { useState } from "react";

import { InputCurrency } from "./InputCurrency";
import { render, screen, waitFor } from "@/utils/testing-library";

describe("InputCurrency", () => {
	it("should render", () => {
		const { asFragment } = render(<InputCurrency />);

		expect(screen.getByTestId("InputCurrency")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit formatted value", async () => {
		const onChange = vi.fn();
		render(<InputCurrency onChange={onChange} />);
		const input = screen.getByTestId("InputCurrency");

		await userEvent.clear(input);
		await userEvent.type(input, "123");

		expect(onChange).toHaveBeenCalledWith("123");
	});

	it("should not allow letters", async () => {
		const onChange = vi.fn();
		render(<InputCurrency onChange={onChange} />);
		const input = screen.getByTestId("InputCurrency");

		await userEvent.clear(input);
		await userEvent.type(input, "abc123");

		expect(onChange).toHaveBeenCalledWith("123");
	});

	it("should format with a default value", () => {
		render(<InputCurrency value=".01" />);
		const input = screen.getByTestId("InputCurrency");

		expect(input).toHaveValue("0.01");
	});

	it("should fallback on convert value", async () => {
		const { rerender } = render(<InputCurrency value=".01" />);
		const input = screen.getByTestId("InputCurrency");

		expect(input).toHaveValue("0.01");

		rerender(<InputCurrency value={undefined} />);

		await waitFor(() => expect(input).not.toHaveValue());
	});

	it("should work with a controlled value", async () => {
		const Component = () => {
			const [value, setValue] = useState("0.04");
			return <InputCurrency value={value} onChange={setValue} />;
		};

		render(<Component />);

		const input: HTMLInputElement = screen.getByTestId("InputCurrency");

		expect(input).toHaveValue("0.04");

		input.select();
		await userEvent.clear(input);
		await userEvent.type(input, "1.23");

		await waitFor(() => expect(input).toHaveValue("1.23"));
	});
});
