import userEvent from "@testing-library/user-event";
import React from "react";

import { InputCounter } from "./InputCounter";
import { FormFieldProvider } from "@/app/components/Form/useFormField";
import { render, screen } from "@/utils/testing-library";

describe("InputCounter", () => {
	it("should render", () => {
		const { asFragment } = render(<InputCounter maxLength={10} maxLengthLabel="10" />);

		expect(screen.getByTestId("InputCounter__counter")).toHaveTextContent("0/10");
		expect(screen.getByTestId("InputCounter__input")).toHaveAttribute("maxLength", "10");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with default value", () => {
		render(<InputCounter maxLength={10} maxLengthLabel="10" defaultValue="Hello" />);

		expect(screen.getByTestId("InputCounter__counter")).toHaveTextContent("5/10");
	});

	it("should update the length when changing the value", async () => {
		render(<InputCounter maxLength={10} maxLengthLabel="10" />);

		await userEvent.type(screen.getByTestId("InputCounter__input"), "Test");

		expect(screen.getByTestId("InputCounter__counter")).toHaveTextContent("4/10");
	});

	it("should render with default value and change", () => {
		render(<InputCounter maxLength={10} maxLengthLabel="10" defaultValue="Hello" value="test" />);

		expect(screen.getByTestId("InputCounter__counter")).toHaveTextContent("4/10");
	});

	it("should render with invalid state", () => {
		const { container } = render(
			<FormFieldProvider value={{ isInvalid: true, name: "vendorField" }}>
				<InputCounter maxLength={10} maxLengthLabel="10" />
			</FormFieldProvider>,
		);

		expect(container).toMatchSnapshot();
	});
});
