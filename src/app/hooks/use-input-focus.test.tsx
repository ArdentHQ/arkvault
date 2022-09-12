import userEvent from "@testing-library/user-event";
import React from "react";

import { useInputFocus } from "@/app/hooks/use-input-focus";
import { renderResponsive, screen } from "@/utils/testing-library";

describe("useInputFocus", () => {
	const Component = () => {
		useInputFocus();

		return (
			<div>
				<input data-testid="input" />
				<input data-testid="password" />
				<textarea data-testid="textarea" />
				<input type="button" data-testid="button" />
			</div>
		);
	};

	it.each(["xs", "sm", "md", "lg", "xl"])("should handle input focus and unfocus in %s", (breakpoint: string) => {
		renderResponsive(<Component />, breakpoint);

		userEvent.type(screen.getByTestId("input"), "text");
		userEvent.type(screen.getByTestId("textarea"), "text");
		userEvent.type(screen.getByTestId("password"), "password");
		userEvent.click(screen.getByTestId("button"));

		expect(screen.getByTestId("input")).toHaveValue("text");
		expect(screen.getByTestId("textarea")).toHaveValue("text");
		expect(screen.getByTestId("password")).toHaveValue("password");
	});
});
