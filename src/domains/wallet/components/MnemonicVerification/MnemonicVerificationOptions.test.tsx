import userEvent from "@testing-library/user-event";
import React from "react";

import { MnemonicVerificationOptions } from "./MnemonicVerificationOptions";
import { render, screen } from "@/utils/testing-library";

const options = ["a", "b", "c", "d"];
const answer = "b";
const limit = 2;

describe("MnemonicVerificationOptions", () => {
	it("should render options", () => {
		const handleChange = jest.fn();
		render(
			<MnemonicVerificationOptions
				handleChange={handleChange}
				options={options}
				answer={answer}
				limit={limit}
				position={1}
			/>,
		);
		const buttons = screen.getAllByTestId("MnemonicVerificationOptions__button");

		expect(buttons).toHaveLength(limit);
	});

	it("should call handle on click", () => {
		const handleChange = jest.fn();
		render(
			<MnemonicVerificationOptions
				handleChange={handleChange}
				options={options}
				answer={answer}
				limit={limit}
				position={1}
			/>,
		);
		userEvent.click(screen.getByText(answer));

		expect(handleChange).toHaveBeenCalledWith(answer);
	});
});
