import React from "react";

import userEvent from "@testing-library/user-event";
import { MnemonicVerification } from "./MnemonicVerification";
import * as randomWordPositionsMock from "./utils/randomWordPositions";
import { render, screen, fireEvent } from "@/utils/testing-library";
const mnemonic = "ark btc usd bnb eth ltc";
const handleComplete = vi.fn();

describe("MnemonicVerification", () => {
	it("should render", () => {
		render(<MnemonicVerification mnemonic={mnemonic} handleComplete={handleComplete} />);

		expect(screen.getAllByTestId("MnemonicVerificationInput")).toHaveLength(3);
	});

	it("should render with special delimiter", () => {
		const mnemonic = "てまきずし くわしい うけもつ ないす にっけい おつり";

		render(<MnemonicVerification mnemonic={mnemonic} handleComplete={handleComplete} />);

		expect(screen.getAllByTestId("MnemonicVerificationInput")).toHaveLength(3);
	});

	it("should verify mnemonic", () => {
		const wordPositions = [1, 2, 3];

		vi.spyOn(randomWordPositionsMock, "randomWordPositions").mockReturnValue(wordPositions);

		render(<MnemonicVerification mnemonic={mnemonic} handleComplete={handleComplete} />);

		const [firstInput, secondInput, thirdInput] = screen.getAllByTestId("MnemonicVerificationInput__input");

		expect(screen.queryByTestId("Input__valid")).not.toBeInTheDocument();

		userEvent.paste(firstInput, "ark");

		expect(screen.getAllByTestId("Input__valid")).toHaveLength(1);

		userEvent.paste(secondInput, "btc");

		expect(screen.getAllByTestId("Input__valid")).toHaveLength(2);

		handleComplete.mockClear();

		userEvent.paste(thirdInput, "usd");

		expect(screen.getAllByTestId("Input__valid")).toHaveLength(3);

		expect(handleComplete).toHaveBeenCalledWith(true);

		userEvent.paste(thirdInput, "btc");
		fireEvent.blur(thirdInput);

		expect(screen.getAllByTestId("Input__valid")).toHaveLength(2);
	});
});
