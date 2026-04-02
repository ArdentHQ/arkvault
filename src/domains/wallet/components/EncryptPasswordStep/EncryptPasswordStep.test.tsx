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

	it("should display second signature input", async () => {
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
});
