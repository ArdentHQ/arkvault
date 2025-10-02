import { BIP39 } from "@ardenthq/arkvault-crypto";
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import {
	env,
	render,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
	MAINSAIL_MNEMONICS,
} from "@/utils/testing-library";
import * as randomWordPositionsMock from "@/domains/wallet/components/MnemonicVerification/utils/randomWordPositions";
import { CreateAddressesSidePanel } from "./CreateAddressSidePanel";
import { expect } from "vitest";

let profile: Contracts.IProfile;
let bip39GenerateMock: any;

const passphrase = "power return attend drink piece found tragic fire liar page disease combine";
const fixtureProfileId = getMainsailProfileId();
const password = "S3cUrePa$sword";
let resetProfileNetworksMock: () => void;

describe("EncryptionPasswordStep", () => {
	beforeEach(() => {
		profile = env.profiles().findById(fixtureProfileId);

		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}

		bip39GenerateMock = vi.spyOn(BIP39, "generate").mockReturnValue(passphrase);
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		vi.spyOn(randomWordPositionsMock, "randomWordPositions").mockReturnValue([1, 2, 3]);
	});

	afterEach(() => {
		bip39GenerateMock.mockRestore();

		resetProfileNetworksMock();
	});

	it("should create a wallet and use encryption password", async () => {
		const createURL = `/profiles/${fixtureProfileId}`;

		const onOpenChangeMock = vi.fn();
		const user = userEvent.setup();

		render(<CreateAddressesSidePanel open={true} onOpenChange={onOpenChangeMock} />, {
			route: createURL,
		});

		const continueButton = screen.getByTestId("CreateWallet__continue-button");

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		await userEvent.click(continueButton);

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("WalletEncryptionBanner__encryption-toggle"));
		await userEvent.click(screen.getByTestId("WalletEncryptionBanner__checkbox"));

		await userEvent.click(continueButton);

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		const [firstInput, secondInput, thirdInput] = screen.getAllByTestId("MnemonicVerificationInput__input");
		await userEvent.click(screen.getByTestId("CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer"));

		await user.clear(firstInput);
		await user.paste("power");

		await user.clear(secondInput);
		await user.paste("return");

		await user.clear(thirdInput);
		await user.paste("attend");

		await waitFor(() => expect(continueButton).toBeEnabled());

		await userEvent.click(continueButton);

		const sampleWallet = profile.walletFactory().fromMnemonicWithBIP39({
			coin: "Mainsail",
			mnemonic: MAINSAIL_MNEMONICS[0],
			network: "mainsail.devnet",
		});

		//@ts-ignore
		const walletSpy = vi.spyOn(profile, "walletFactory").mockImplementation(() => ({
			fromMnemonicWithBIP39: () => Promise.resolve(sampleWallet),
		}));

		await expect(screen.findByTestId("EncryptPassword")).resolves.toBeVisible();

		const passwordInput = screen.getByTestId("PasswordValidation__encryptionPassword");
		const confirmPassword = screen.getByTestId("PasswordValidation__confirmEncryptionPassword");

		await user.clear(passwordInput);
		await user.paste(password);

		await waitFor(() => expect(passwordInput).toHaveValue(password));

		await user.clear(confirmPassword);
		await user.paste(password);

		await waitFor(() => expect(confirmPassword).toHaveValue(password));

		expect(profile.wallets().values()).toHaveLength(0);

		await waitFor(() => {
			expect(screen.getByTestId("CreateWallet__continue-encryption-button")).toBeEnabled();
		});

		await userEvent.click(screen.getByTestId("CreateWallet__continue-encryption-button"));

		await expect(screen.findByTestId("CreateWallet__SuccessStep")).resolves.toBeVisible();

		expect(profile.wallets().values()).toHaveLength(1);
		expect(walletSpy).toHaveBeenCalledWith();

		await userEvent.click(screen.getByTestId("CreateWallet__finish-button"));

		expect(onOpenChangeMock).toHaveBeenCalledWith(false);
		walletSpy.mockRestore();
	});

	it("should fail creating a wallet with encryption password", async () => {
		const createURL = `/profiles/${fixtureProfileId}`;

		render(<CreateAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: createURL,
		});
		const user = userEvent.setup();

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		const continueButton = screen.getByTestId("CreateWallet__continue-button");

		await userEvent.click(continueButton);

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("WalletEncryptionBanner__encryption-toggle"));
		await userEvent.click(screen.getByTestId("WalletEncryptionBanner__checkbox"));

		const [firstInput, secondInput, thirdInput] = screen.getAllByTestId("MnemonicVerificationInput__input");
		await userEvent.click(screen.getByTestId("CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer"));

		await user.clear(firstInput);
		await user.paste("power");

		await user.clear(secondInput);
		await user.paste("return");

		await user.clear(thirdInput);
		await user.paste("attend");

		await waitFor(() => expect(continueButton).toBeEnabled());

		await userEvent.click(continueButton);

		await expect(screen.findByTestId("EncryptPassword")).resolves.toBeVisible();

		const passwordInput = screen.getByTestId("PasswordValidation__encryptionPassword");
		const confirmPassword = screen.getByTestId("PasswordValidation__confirmEncryptionPassword");

		await userEvent.clear(passwordInput);
		await userEvent.paste(password);

		await waitFor(() => expect(passwordInput).toHaveValue(password));

		await userEvent.clear(confirmPassword);
		await userEvent.paste(password);

		await waitFor(() => expect(confirmPassword).toHaveValue(password));

		await waitFor(() => {
			expect(screen.getByTestId("CreateWallet__continue-encryption-button")).toBeEnabled();
		});

		const originalFromMnemonic = profile.walletFactory().fromMnemonicWithBIP39.bind(profile.walletFactory());
		const walletSpy = vi
			.spyOn(profile.walletFactory(), "fromMnemonicWithBIP39")
			.mockImplementation(async (parameters) => {
				const wallet = await originalFromMnemonic(parameters);
				const mockSigningKey = {
					set: vi.fn().mockRejectedValue(new Error("Encryption failed")),
				};
				vi.spyOn(wallet, "signingKey").mockReturnValue(mockSigningKey as any);
				return wallet;
			});

		await userEvent.click(screen.getByTestId("CreateWallet__continue-encryption-button"));

		await waitFor(
			() => {
				expect(screen.queryByTestId("CreateWallet__SuccessStep")).not.toBeInTheDocument();
			},
			{ timeout: 3000 },
		);

		walletSpy.mockRestore();
	});
});
