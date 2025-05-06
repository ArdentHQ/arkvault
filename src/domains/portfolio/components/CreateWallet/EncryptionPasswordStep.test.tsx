import { BIP39 } from "@ardenthq/arkvault-crypto";
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import {
	env,
	render,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
	MAINSAIL_MNEMONICS,
	fixUInt8ArrayIssue,
} from "@/utils/testing-library";
import * as randomWordPositionsMock from "@/domains/wallet/components/MnemonicVerification/utils/randomWordPositions";
import * as usePortfolio from "@/domains/portfolio/hooks/use-portfolio";
import { CreateAddressesSidePanel } from "./CreateAddressSidePanel";
import { expect } from "vitest";

let profile: Contracts.IProfile;
let bip39GenerateMock: any;

const passphrase = "power return attend drink piece found tragic fire liar page disease combine";
const fixtureProfileId = getMainsailProfileId();
const password = "S3cUrePa$sword";
let resetProfileNetworksMock: () => void;
let uInt8ArrayFix: () => void;

describe("EncryptionPasswordStep", () => {
	beforeEach(() => {
		vi.spyOn(usePortfolio, "usePortfolio").mockReturnValue({
			selectedAddresses: [],
			setSelectedAddresses: () => {},
		});
		profile = env.profiles().findById(fixtureProfileId);

		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}

		bip39GenerateMock = vi.spyOn(BIP39, "generate").mockReturnValue(passphrase);
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		vi.spyOn(randomWordPositionsMock, "randomWordPositions").mockReturnValue([1, 2, 3]);
		uInt8ArrayFix = fixUInt8ArrayIssue();
	});

	afterEach(() => {
		bip39GenerateMock.mockRestore();

		resetProfileNetworksMock();
		uInt8ArrayFix();
	});

	it("should fail creating a wallet with encryption password", async () => {
		const history = createHashHistory();
		const createURL = `/profiles/${fixtureProfileId}`;
		history.push(createURL);

		render(
			<Route path="/profiles/:profileId">
				<CreateAddressesSidePanel open={true} onOpenChange={vi.fn()} />
			</Route>,
			{
				history,
				route: createURL,
			},
		);

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		const continueButton = screen.getByTestId("CreateWallet__continue-button");

		await userEvent.click(continueButton);

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("WalletEncryptionBanner__encryption-toggle"));
		await userEvent.click(screen.getByTestId("WalletEncryptionBanner__checkbox"));

		const [firstInput, secondInput, thirdInput] = screen.getAllByTestId("MnemonicVerificationInput__input");
		await userEvent.click(screen.getByTestId("CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer"));
		await userEvent.clear(firstInput);
		await userEvent.type(firstInput, "power");
		await userEvent.clear(secondInput);
		await userEvent.type(secondInput, "return");
		await userEvent.clear(thirdInput);
		await userEvent.type(thirdInput, "attend");

		await waitFor(() => expect(continueButton).toBeEnabled());

		await userEvent.click(continueButton);

		//@ts-ignore
		const walletSpy = vi.spyOn(profile, "walletFactory").mockImplementation(() => ({
			fromMnemonicWithBIP39: () => Promise.reject(new Error("failed")),
		}));

		await expect(screen.findByTestId("EncryptPassword")).resolves.toBeVisible();

		const passwordInput = screen.getByTestId("PasswordValidation__encryptionPassword");
		const confirmPassword = screen.getByTestId("PasswordValidation__confirmEncryptionPassword");

		await userEvent.clear(passwordInput);
		await userEvent.type(passwordInput, password);

		await waitFor(() => expect(passwordInput).toHaveValue(password));

		await userEvent.clear(confirmPassword);
		await userEvent.type(confirmPassword, password);

		await waitFor(() => expect(confirmPassword).toHaveValue(password));

		await waitFor(() => {
			expect(screen.getByTestId("CreateWallet__continue-encryption-button")).toBeEnabled();
		});

		await userEvent.click(screen.getByTestId("CreateWallet__continue-encryption-button"));

		await expect(screen.findByTestId("CreateWallet__SuccessStep")).resolves.toBeVisible();

		await waitFor(() => {
			expect(screen.getByTestId("CreateWallet__finish-button")).toBeEnabled();
		});

		await userEvent.click(screen.getByTestId("CreateWallet__finish-button"));

		await waitFor(() => expect(walletSpy).toHaveBeenCalledWith());
		walletSpy.mockRestore();
	});

	it("should create a wallet and use encryption password", async () => {
		const history = createHashHistory();
		const createURL = `/profiles/${fixtureProfileId}`;
		history.push(createURL);

		const onOpenChangeMock = vi.fn();

		render(
			<Route path="/profiles/:profileId">
				<CreateAddressesSidePanel open={true} onOpenChange={onOpenChangeMock} />
			</Route>,
			{
				history,
				route: createURL,
			},
		);

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
		await userEvent.clear(firstInput);
		await userEvent.type(firstInput, "power");
		await userEvent.clear(secondInput);
		await userEvent.type(secondInput, "return");
		await userEvent.clear(thirdInput);
		await userEvent.type(thirdInput, "attend");
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

		await userEvent.clear(passwordInput);
		await userEvent.type(passwordInput, password);

		await waitFor(() => expect(passwordInput).toHaveValue(password));

		await userEvent.clear(confirmPassword);
		await userEvent.type(confirmPassword, password);

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
	});
});
