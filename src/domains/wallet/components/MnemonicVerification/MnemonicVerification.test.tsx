import userEvent from "@testing-library/user-event";
import React from "react";

import { MnemonicVerification } from "./MnemonicVerification";
import { render, screen } from "@/utils/testing-library";

const mnemonic = "ark btc usd bnb eth ltc";
const mnemonicWords = mnemonic.split(" ");
const limit = 6;
const handleComplete = vi.fn();

describe("MnemonicVerification", () => {
	it("should render", () => {
		const wordPositions = [1, 2, 3];

		render(
			<MnemonicVerification
				mnemonic={mnemonic}
				optionsLimit={limit}
				wordPositions={wordPositions}
				handleComplete={handleComplete}
			/>,
		);

		expect(screen.getAllByTestId("MnemonicVerificationOptions__button")).toHaveLength(mnemonic.split(" ").length);
	});

	it("should render with special delimiter", () => {
		const mnemonic = "てまきずし　くわしい　うけもつ　ないす　にっけい　おつり";

		const wordPositions = [1, 2, 3];

		render(
			<MnemonicVerification
				mnemonic={mnemonic}
				optionsLimit={limit}
				wordPositions={wordPositions}
				handleComplete={handleComplete}
			/>,
		);

		expect(screen.getAllByTestId("MnemonicVerificationOptions__button")).toHaveLength(
			mnemonic.split("\u3000").length,
		);
	});

	it("should verify mnemonic", () => {
		const wordPositions = [1, 2, 3];

		const { asFragment } = render(
			<MnemonicVerification
				mnemonic={mnemonic}
				optionsLimit={limit}
				wordPositions={wordPositions}
				handleComplete={handleComplete}
			/>,
		);

		const firstTab = asFragment();
		const wrongButton = screen.getByText(mnemonicWords[4]);
		userEvent.click(wrongButton);

		expect(firstTab).toStrictEqual(asFragment());

		const firstButton = screen.getByText(mnemonicWords[wordPositions[0] - 1]);
		userEvent.click(firstButton);

		expect(firstTab).not.toStrictEqual(asFragment());

		const secondButton = screen.getByText(mnemonicWords[wordPositions[1] - 1]);
		userEvent.click(secondButton);

		const thirdButton = screen.getByText(mnemonicWords[wordPositions[2] - 1]);
		userEvent.click(thirdButton);

		expect(handleComplete).toHaveBeenCalledWith();
	});

	it("should ask for random words", () => {
		render(
			<>
				<MnemonicVerification mnemonic={mnemonic} optionsLimit={limit} handleComplete={handleComplete} />
				<MnemonicVerification mnemonic={mnemonic} optionsLimit={limit} handleComplete={handleComplete} />
			</>,
		);

		const options = screen
			.getAllByTestId("MnemonicVerificationProgress__Tab")
			.map((element: any) => element.innerHTML);

		const length = options.length / 2;

		const firstOptions = options;
		const secondOptions = firstOptions.splice(length);

		expect(firstOptions).toHaveLength(length);
		expect(secondOptions).toHaveLength(length);

		expect(firstOptions).not.toStrictEqual(secondOptions);
	});
});
