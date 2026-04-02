import userEvent from "@testing-library/user-event";
import React from "react";

import { EncryptPasswordStep } from "./EncryptPasswordStep";
import { env, getMainsailProfileId, renderWithForm, screen, waitFor } from "@/utils/testing-library";
import { beforeAll, expect } from "vitest";
import { Contracts } from "@/app/lib/profiles";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

describe("EncryptPasswordStep", () => {
	const passwordValue = "123";
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

		const passwordInput = screen.getByTestId("PasswordValidation__encryptionPassword");
		const confirmPassword = screen.getByTestId("PasswordValidation__confirmEncryptionPassword");

		await userEvent.clear(passwordInput);
		await userEvent.type(passwordInput, passwordValue, { delay: 100 });

		await waitFor(() => expect(passwordInput).toHaveValue(passwordValue));

		await userEvent.clear(confirmPassword);
		await userEvent.type(confirmPassword, passwordValue, { delay: 100 });

		await waitFor(() => expect(confirmPassword).toHaveValue(passwordValue));

		expect(asFragment()).toMatchSnapshot();
	}, 10_000);

	it("should display second signature input", async () => {
		vi.spyOn(wallet, "isSecondSignature").mockReturnValue(true);

		const {unmount} = renderWithForm(<EncryptPasswordStep importedWallet={wallet} />);

		expect(screen.getByTestId("EncryptPassword__second-mnemonic")).toBeInTheDocument();

		unmount();
	});
});
