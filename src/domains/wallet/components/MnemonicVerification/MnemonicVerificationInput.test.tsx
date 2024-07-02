import React from "react";

import userEvent from "@testing-library/user-event";
import { MnemonicVerificationInput } from "./MnemonicVerificationInput";
import { render, screen, fireEvent } from "@/utils/testing-library";

describe("MnemonicVerificationInput", () => {
	it.each(["", "incorrect"])("should invalidate", (word) => {
		render(<MnemonicVerificationInput answer="correct" position={1} isValid={false} handleChange={vi.fn()} />);

		const input = screen.getByTestId("MnemonicVerificationInput__input");

		userEvent.paste(input, word);

		fireEvent.blur(input);

		expect(screen.getByTestId("Input__error")).toBeInTheDocument();
	});

	it("should validate", () => {
		render(<MnemonicVerificationInput answer="correct" position={1} isValid={true} handleChange={vi.fn()} />);

		const input = screen.getByTestId("MnemonicVerificationInput__input");

		userEvent.paste(input, "correct");

		fireEvent.blur(input);

		expect(screen.queryByTestId("Input__error")).not.toBeInTheDocument();
	});
});
