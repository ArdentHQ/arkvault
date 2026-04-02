import userEvent from "@testing-library/user-event";
import React from "react";

import { EncryptPasswordStep } from "./EncryptPasswordStep";
import { env, getMainsailProfileId, renderWithForm, screen, waitFor } from "@/utils/testing-library";
import { beforeAll, expect } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { AddressService } from "@/app/lib/mainsail/address.service";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

describe("EncryptPasswordStep", () => {
	const passwordValue = "123";

	const fillPasswordFields = async () => {
		const passwordInput = screen.getByTestId("PasswordValidation__encryptionPassword");
		const confirmPassword = screen.getByTestId("PasswordValidation__confirmEncryptionPassword");

		await userEvent.clear(passwordInput);
		await userEvent.paste(passwordValue);

		await waitFor(() => expect(passwordInput).toHaveValue(passwordValue));

		await userEvent.clear(confirmPassword);
		await userEvent.paste(passwordValue);

		await waitFor(() => expect(confirmPassword).toHaveValue(passwordValue));
	}

	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().first();

		await env.profiles().restore(profile);
	})

	it("should render", async () => {
		const { asFragment } = renderWithForm(<EncryptPasswordStep />);

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});
		expect(asFragment).toMatchSnapshot();
	});

	it("should change password", async () => {
		const { asFragment } = renderWithForm(<EncryptPasswordStep />);

		const passwordInput = screen.getByTestId("PasswordValidation__encryptionPassword");

		const user = userEvent.setup();
		await user.clear(passwordInput);
		await user.paste(passwordValue);

		await waitFor(() => expect(passwordInput).toHaveValue(passwordValue));

		expect(asFragment).toMatchSnapshot();
	});

	it("should trigger password confirmation validation when password is entered", async () => {
		const { asFragment } = renderWithForm(<EncryptPasswordStep />, {
			defaultValues: { confirmEncryptionPassword: "123" },
		});

		await fillPasswordFields();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should valdiate second mnemonic", async () => {
		vi.spyOn(wallet, "isSecondSignature").mockReturnValue(true);

		const fromMnemonicMock = vi
			.spyOn(AddressService.prototype, "fromMnemonic")
			.mockReturnValue({ address: wallet.address(), type: "bip39" });

		const { unmount, asFragment } = renderWithForm(<EncryptPasswordStep importedWallet={wallet} />);

		const secondMnemonicInput = screen.getByTestId("EncryptPassword__second-mnemonic");
		expect(secondMnemonicInput).toBeInTheDocument();

		await userEvent.clear(secondMnemonicInput);
		await userEvent.paste("valid mnemonic");

		await fillPasswordFields();

		expect(asFragment()).toMatchSnapshot();

		unmount();
		fromMnemonicMock.mockRestore();
	});

	it("should display error when second mnemonic is invalid", async () => {
		vi.spyOn(wallet, "isSecondSignature").mockReturnValue(true);

		const fromMnemonicMock = vi
			.spyOn(AddressService.prototype, "fromMnemonic")
			.mockImplementation(() => {
				throw new Error("invalid mnemonic")
			});

		const { unmount, } = renderWithForm(<EncryptPasswordStep importedWallet={wallet} />);

		const secondMnemonicInput = screen.getByTestId("EncryptPassword__second-mnemonic");
		expect(secondMnemonicInput).toBeInTheDocument();

		await userEvent.clear(secondMnemonicInput);
		await userEvent.paste("invalid mnemonic");

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeVisible();
		});

		unmount();
		fromMnemonicMock.mockRestore();
	});

	it("should validate second secret", async () => {
		vi.spyOn(wallet, "isSecondSignature").mockReturnValue(true);
		vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithSecret").mockReturnValue(true);

		const fromSecretMock = vi
			.spyOn(AddressService.prototype, "fromSecret")
			.mockReturnValue({ address: wallet.address(), type: "bip39" });

		const { unmount, asFragment } = renderWithForm(<EncryptPasswordStep importedWallet={wallet} />);

		const secondSecretInput = screen.getByTestId("EncryptPassword__second-secret");
		expect(secondSecretInput).toBeInTheDocument();

		await userEvent.clear(secondSecretInput);
		await userEvent.paste("valid secret");

		await fillPasswordFields();

		expect(asFragment()).toMatchSnapshot();

		unmount();
		fromSecretMock.mockRestore();
	});

	it("should display error when second secret is invalid", async () => {
		vi.spyOn(wallet, "isSecondSignature").mockReturnValue(true);
		vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithSecret").mockReturnValue(true);

		const fromSecretMock = vi
			.spyOn(AddressService.prototype, "fromSecret")
			.mockImplementation(() => {
				throw new Error("invalid secret")
			});

		const { unmount } = renderWithForm(<EncryptPasswordStep importedWallet={wallet} />);

		const secondSecretInput = screen.getByTestId("EncryptPassword__second-secret");
		expect(secondSecretInput).toBeInTheDocument();

		await userEvent.clear(secondSecretInput);
		await userEvent.paste("invalid secret");

		unmount();
		fromSecretMock.mockRestore();
	});
});
