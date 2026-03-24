import React from "react";

import { InputFeeAdvancedAddon } from "./InputFeeAdvancedAddon";
import { render, screen } from "@/utils/testing-library";
import { describe, expect, it, vi } from "vitest";

describe("InputFeeAdvancedAddon", () => {
	it("should render with default type button when type prop is not provided", () => {
		render(
			<InputFeeAdvancedAddon
				convertedValue={0}
				disabled={false}
				exchangeTicker=""
				isDownDisabled={false}
				onClickDown={vi.fn()}
				onClickUp={vi.fn()}
				showConvertedValue={false}
			/>,
		);

		const buttons = screen.getAllByRole("button");
		expect(buttons).toHaveLength(2);

		expect(buttons[0]).toHaveAttribute("type", "button");
		expect(buttons[1]).toHaveAttribute("type", "button");
	});

	it("should show converted value when showConvertedValue is true", () => {
		render(
			<InputFeeAdvancedAddon
				convertedValue={10.5}
				disabled={false}
				exchangeTicker="EUR"
				isDownDisabled={false}
				onClickDown={vi.fn()}
				onClickUp={vi.fn()}
				showConvertedValue={true}
			/>,
		);

		expect(screen.getByText(/10/)).toBeInTheDocument();
	});

	it("should not show converted value when showConvertedValue is false", () => {
		render(
			<InputFeeAdvancedAddon
				convertedValue={10.5}
				disabled={false}
				exchangeTicker="EUR"
				isDownDisabled={false}
				onClickDown={vi.fn()}
				onClickUp={vi.fn()}
				showConvertedValue={false}
			/>,
		);

		expect(screen.getByTestId("InputFeeAdvanced__up")).toBeInTheDocument();
	});
});
