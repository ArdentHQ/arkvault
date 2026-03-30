import React from "react";
import { getDefaultWalletMnemonic, render, screen } from "@/utils/testing-library";
import { MnemonicRules, validateMnemonic } from "./MnemonicRules";
import { expect } from "vitest";
import { BIP39 } from "@ardenthq/arkvault-crypto";
import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";

describe("MnemonicRules", () => {
	it("should render invalid state for all rules when mnemonic is empty", () => {
		render(<MnemonicRules mnemonic="" />);

		expect(screen.queryByTestId("")).not.toBeInTheDocument();
	});

	it.each([
		["fail when word count is not 12 or 24", "apple", "HAS_VALID_WORD_COUNT-0"],
		["pass when word count is 12 or 24", getDefaultWalletMnemonic(), "HAS_VALID_WORD_COUNT-1"],
		["fail when contains uppercase letters", "Apple Hello", "LOWERCASE-0"],
		["fail when spacing is not correct", "apple  hello", "HAS_VALID_SPACING-0"],
		["fail when there is a trailing space", "apple hello ", "NO_TRAILING_SPACE-0"],
	])("should %s", (_description, mnemonic, testId) => {
		render(<MnemonicRules mnemonic={mnemonic} />);

		expect(screen.getByTestId(`MnemonicRule-${testId}`)).toBeInTheDocument();
	});
});

describe("validateMnemonic", () => {
	it("should throw when error message contains `Unknown letter`", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const bip39ValidateOrThrowMock = vi.spyOn(BIP39, "validateOrThrow").mockImplementation(() => {
			throw new Error('Error: Unknown letter: "lubble". Allowed: x, y, z');
		});

		expect(() => {
			validateMnemonic(getDefaultWalletMnemonic(), t);
		}).toThrowError("Unexpected word: lubble");

		bip39ValidateOrThrowMock.mockRestore();
	});

	it("should suppress irrelevant errors", () => {
		const bip39ValidateOrThrowMock = vi.spyOn(BIP39, "validateOrThrow").mockImplementation(() => {
			throw new Error("Invalid words");
		});

		expect(() => {
			validateMnemonic(getDefaultWalletMnemonic(), vi.fn());
		}).not.toThrowError();

		bip39ValidateOrThrowMock.mockRestore();
	});
});
