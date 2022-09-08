import React from "react";

import { FormButtons } from "./FormButtons";
import { renderResponsive, screen } from "@/utils/testing-library";
import userEvent from "@testing-library/user-event";

describe("FormButtons", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { asFragment } = renderResponsive(<FormButtons>button</FormButtons>, breakpoint);

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should adjust offset if input is focused in %s", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<div>
				<input data-testid="input" />
				<FormButtons>buttons</FormButtons>
			</div>,
			breakpoint,
		);

		userEvent.type(screen.getByTestId("input"), "text");

		expect(screen.getByTestId("input")).toHaveValue("text");
		expect(asFragment()).toMatchSnapshot();
	});
});
