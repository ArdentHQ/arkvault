import React from "react";

import { MnemonicList } from "./MnemonicList";
import { render, screen } from "@/utils/testing-library";

describe("MnemonicList", () => {
	it("should render", () => {
		const mnemonic = "stomach practice violin later term trend suit switch inch theory hundred system";
		const words = mnemonic.split(" ");

		const { asFragment } = render(<MnemonicList mnemonic={mnemonic} />);

		const items = screen.getAllByTestId("MnemonicList__item");

		expect(items).toHaveLength(words.length);

		for (const [index, item] of items.entries()) {
			expect(item).toHaveTextContent(words[index]);
		}

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with special delimiter", () => {
		const mnemonic =
			"あさい　せつでん　さいかい　にんち　たんけん　ぬまえび　こうじ　こっか　はあく　げきか　ふめつ　ちらし";
		const words = mnemonic.split("\u3000");

		const { asFragment } = render(<MnemonicList mnemonic={mnemonic} />);

		const items = screen.getAllByTestId("MnemonicList__item");

		expect(items).toHaveLength(words.length);

		for (const [index, item] of items.entries()) {
			expect(item).toHaveTextContent(words[index]);
		}

		expect(asFragment()).toMatchSnapshot();
	});
});
