import React from "react";

import userEvent from "@testing-library/user-event";
import { FormButtons } from "./FormButtons";
import { renderResponsive, screen } from "@/utils/testing-library";

describe("FormButtons", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { asFragment } = renderResponsive(<FormButtons>button</FormButtons>, breakpoint);

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should adjust offset if input is focused in %s", async (breakpoint) => {
		const { asFragment } = renderResponsive(
			<div>
				<input data-testid="input" />
				<FormButtons>buttons</FormButtons>
			</div>,
			breakpoint,
		);

		await userEvent.type(screen.getByTestId("input"), "text");

		expect(screen.getByTestId("input")).toHaveValue("text");
		expect(asFragment()).toMatchSnapshot();
	});
});
