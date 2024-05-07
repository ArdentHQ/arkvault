/* eslint-disable @typescript-eslint/require-await */
import userEvent from "@testing-library/user-event";
import React from "react";

import { EncryptPasswordStep } from "./EncryptPasswordStep";
import { renderWithForm, screen, waitFor, env, getDefaultProfileId } from "@/utils/testing-library";

describe("EncryptPasswordStep", () => {
	it("should render", () => {
		const { asFragment } = renderWithForm(<EncryptPasswordStep />);

		expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		expect(asFragment).toMatchSnapshot();
	});

	it("should render with second input for second signature when acts with mnemonic and validate field", async () => {
		const wallet = env.profiles().findById(getDefaultProfileId()).wallets().first();

		const hasSyncedWithNetworkSpy = vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		const walletSpy = vi.spyOn(wallet, "isSecondSignature").mockReturnValue(true);
		const actsWithMnemonicSpy = vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(true);

		renderWithForm(<EncryptPasswordStep importedWallet={wallet} />);

		const field = () => screen.getByTestId("EncryptPassword__second-mnemonic");

		expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		expect(field()).toBeInTheDocument();

		userEvent.paste(field(), "wrong mnemonic");

		await expect(screen.findByTestId("Input__error")).resolves.toBeVisible();

		expect(screen.getByTestId("Input__error")).toHaveAttribute(
			"data-errortext",
			"The given value is not BIP39 compliant",
		);

		userEvent.paste(field(), "wrong mnemonic");

		const walletFromMnemonicSpy = vi.spyOn(wallet.coin().address(), "fromMnemonic").mockResolvedValue(undefined);

		userEvent.paste(field(), "valid mnemonic");

		await waitFor(() => {
			expect(screen.queryByTestId("Input__error")).not.toBeInTheDocument();
		});

		walletFromMnemonicSpy.mockRestore();
		hasSyncedWithNetworkSpy.mockRestore();
		walletSpy.mockRestore();
		actsWithMnemonicSpy.mockRestore();
	});

	it("should render with second input for second signature when does not act with mnemonic", () => {
		const wallet = env.profiles().findById(getDefaultProfileId()).wallets().first();

		const hasSyncedWithNetworkSpy = vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);
		const walletSpy = vi.spyOn(wallet, "isSecondSignature").mockReturnValue(true);
		const actsWithMnemonicSpy = vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);

		renderWithForm(<EncryptPasswordStep importedWallet={wallet} />);

		expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		expect(screen.getByTestId("EncryptPassword__second-secret")).toBeInTheDocument();

		hasSyncedWithNetworkSpy.mockRestore();
		walletSpy.mockRestore();
		actsWithMnemonicSpy.mockRestore();
	});

	it("should change password", async () => {
		const { asFragment } = renderWithForm(<EncryptPasswordStep />);

		const passwordInput = screen.getByTestId("PasswordValidation__encryptionPassword");

		userEvent.paste(passwordInput, "password");

		await waitFor(() => expect(passwordInput).toHaveValue("password"));

		expect(asFragment).toMatchSnapshot();
	});

	it("should trigger password confirmation validation when password is entered", async () => {
		const { asFragment } = renderWithForm(<EncryptPasswordStep />, {
			defaultValues: { confirmEncryptionPassword: "password" },
		});

		const passwordInput = screen.getByTestId("PasswordValidation__encryptionPassword");
		const confirmPassword = screen.getByTestId("PasswordValidation__confirmEncryptionPassword");

		userEvent.paste(passwordInput, "password");

		await waitFor(() => expect(passwordInput).toHaveValue("password"));
		await waitFor(() => expect(confirmPassword).toHaveValue("password"));

		expect(asFragment).toMatchSnapshot();
	});
});
