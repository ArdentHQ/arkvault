import userEvent from "@testing-library/user-event";
import React from "react";

import { FormLabel } from "./FormLabel";
import { FormFieldProvider } from "./useFormField";
import { render, screen } from "@/utils/testing-library";

describe("FormLabel", () => {
	it("should render from children", () => {
		const label = "Test Label";
		render(<FormLabel>{label}</FormLabel>);

		expect(screen.getByText(label)).toBeInTheDocument();
	});

	it("should render from prop", () => {
		const label = "Test Label";
		render(<FormLabel label={label} />);

		expect(screen.getByText(label)).toBeInTheDocument();
	});

	it("should render with name from context", () => {
		const label = "Test Label";
		const context = {
			errorMessage: "Error message from context",
			isInvalid: true,
			name: "test",
		};
		const tree = (
			<FormFieldProvider value={context}>
				<FormLabel label={label} />
			</FormFieldProvider>
		);
		const { asFragment } = render(tree);

		expect(screen.getByTestId("FormLabel")).toHaveAttribute("for", context.name);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render & hover if optional", async () => {
		const { asFragment, baseElement } = render(<FormLabel label="Test" optional />);

		await userEvent.hover(screen.getByTestId("FormLabel__optional"));

		expect(baseElement).toHaveTextContent("This field is optional");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with classnames", () => {
		const { container } = render(<FormLabel label="Test" className="text-red-500" />);

		expect(container.firstChild).toHaveClass("text-red-500");
	})
});
