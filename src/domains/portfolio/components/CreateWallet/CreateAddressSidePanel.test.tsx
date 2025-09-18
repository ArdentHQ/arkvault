import { BIP39 } from "@ardenthq/arkvault-crypto";
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import * as randomWordPositionsMock from "@/domains/wallet/components/MnemonicVerification/utils/randomWordPositions";
import { translations as walletTranslations } from "@/domains/wallet/i18n";
import {
	env,
	render,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";
import { CreateAddressesSidePanel } from "./CreateAddressSidePanel";
import { expect } from "vitest";

let profile: Contracts.IProfile;
let bip39GenerateMock: any;

const fixtureProfileId = getMainsailProfileId();
const passphrase = "power return attend drink piece found tragic fire liar page disease combine";
const encryptionPassword = "S3cUrePa$sword";

const continueButton = () => screen.getByTestId("CreateWallet__continue-button");

describe("CreateAddressSidePanel", () => {
	let resetProfileNetworksMock: () => void;

	beforeAll(() => {
		process.env.MOCK_AVAILABLE_NETWORKS = "false";
		bip39GenerateMock = vi.spyOn(BIP39, "generate").mockReturnValue(passphrase);

		vi.spyOn(randomWordPositionsMock, "randomWordPositions").mockReturnValue([1, 2, 3]);
	});

	afterAll(() => {
		bip39GenerateMock.mockRestore();
	});

	beforeEach(async () => {
		profile = env.profiles().findById(fixtureProfileId);

		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}

		const networkWallet = await profile.walletFactory().fromAddress({
			address: "0x125b484e51Ad990b5b3140931f3BD8eAee85Db23",
			coin: "Mainsail",
			network: "mainsail.devnet",
		});

		vi.spyOn(profile, "availableNetworks").mockReturnValue([networkWallet.network()]);

		bip39GenerateMock = vi.spyOn(BIP39, "generate").mockReturnValue(passphrase);

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		bip39GenerateMock.mockRestore();

		resetProfileNetworksMock();
	});

	it("should render method step if profile has enabled hd wallets", async () => {
		const hdWalletMock = vi.spyOn(profile.settings(), "get").mockReturnValue(true)
		const onImportAddress = vi.fn()
		const createURL = `/profiles/${fixtureProfileId}/dashboard`;

		render(<CreateAddressesSidePanel open={true} onOpenChange={vi.fn()} onImportAddress={onImportAddress} />, {
			route: createURL,
		});

		const buttons = screen.getAllByRole("button")
		expect(buttons).toHaveLength(4)

		const regularAddressButton = buttons[1]
		await userEvent.click(regularAddressButton)

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();
		hdWalletMock.mockRestore()
	});

	it("should create a wallet", async () => {
		const createURL = `/profiles/${fixtureProfileId}/dashboard`;

		render(<CreateAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: createURL,
		});

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await waitFor(() => expect(profile.wallets().values()).toHaveLength(0));

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		const backButton = await screen.findByTestId("CreateWallet__back-button");

		await userEvent.click(backButton);

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		const [firstInput, secondInput, thirdInput] = screen.getAllByTestId("MnemonicVerificationInput__input");
		await userEvent.click(screen.getByTestId("CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer"));
		await userEvent.clear(firstInput);
		await userEvent.type(firstInput, "power");
		await userEvent.clear(secondInput);
		await userEvent.type(secondInput, "return");
		await userEvent.clear(thirdInput);
		await userEvent.type(thirdInput, "attend");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		expect(profile.wallets().values()).toHaveLength(0);

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__SuccessStep")).resolves.toBeVisible();

		expect(profile.wallets().values()).toHaveLength(1);

		await userEvent.click(screen.getByTestId("CreateWallet__edit-alias"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("UpdateWalletName__input"));
		await userEvent.type(screen.getByTestId("UpdateWalletName__input"), "test alias");

		await waitFor(() => expect(screen.getByTestId("UpdateWalletName__submit")).toBeEnabled());

		await userEvent.click(screen.getByTestId("UpdateWalletName__submit"));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		await userEvent.click(screen.getByTestId("CreateWallet__finish-button"));

		expect(profile.wallets().count()).toBe(1);
	});

	it("should create a wallet with encryption", async () => {
		const createURL = `/profiles/${fixtureProfileId}/dashboard`;

		render(<CreateAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: createURL,
		});

		const user = userEvent.setup();

		await waitFor(() => expect(profile.wallets().values()).toHaveLength(0));

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await userEvent.click(screen.getByTestId("WalletEncryptionBanner__encryption-toggle"));
		await userEvent.click(screen.getByTestId("WalletEncryptionBanner__checkbox"));

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		const backButton = await screen.findByTestId("CreateWallet__back-button");

		await userEvent.click(backButton);

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		const [firstInput, secondInput, thirdInput] = screen.getAllByTestId("MnemonicVerificationInput__input");
		await userEvent.click(screen.getByTestId("CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer"));

		await user.clear(firstInput);
		await user.paste("power");

		await user.clear(secondInput);
		await user.paste("return");

		await user.clear(thirdInput);
		await user.paste("attend");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("EncryptPassword")).resolves.toBeVisible();

		await user.clear(screen.getByTestId("PasswordValidation__encryptionPassword"));
		await user.paste(encryptionPassword);

		await user.clear(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"));
		await user.paste(encryptionPassword);

		await expect(screen.findByTestId("PasswordValidation__encryptionPassword")).resolves.toHaveValue(
			encryptionPassword,
		);
		await expect(screen.findByTestId("PasswordValidation__confirmEncryptionPassword")).resolves.toHaveValue(
			encryptionPassword,
		);

		const continueEncryptionButton = screen.getByTestId("CreateWallet__continue-encryption-button");

		await waitFor(() => expect(continueEncryptionButton).toBeEnabled());

		await userEvent.click(continueEncryptionButton);

		await expect(screen.findByTestId("CreateWallet__SuccessStep")).resolves.toBeVisible();

		expect(profile.wallets().values()).toHaveLength(1);

		await userEvent.click(screen.getByTestId("CreateWallet__finish-button"));

		expect(profile.wallets().count()).toBe(1);

		const wallet = profile.wallets().first();

		expect(wallet.alias()).toBe("Address #1");
	});

	it("should handle invalid encryption password", async () => {
		const createURL = `/profiles/${fixtureProfileId}/dashboard`;

		render(<CreateAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: createURL,
		});

		const user = userEvent.setup();

		await waitFor(() => expect(profile.wallets().values()).toHaveLength(0));

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await userEvent.click(screen.getByTestId("WalletEncryptionBanner__encryption-toggle"));
		await userEvent.click(screen.getByTestId("WalletEncryptionBanner__checkbox"));

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		const fillConfirmationInputs = async () => {
			const [firstInput, secondInput, thirdInput] = screen.getAllByTestId("MnemonicVerificationInput__input");
			await user.clear(firstInput);
			await user.paste("power");

			await user.clear(secondInput);
			await user.paste("return");

			await user.clear(thirdInput);
			await user.paste("attend");
		};

		await fillConfirmationInputs();
		await userEvent.click(screen.getByTestId("CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer"));

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("EncryptPassword")).resolves.toBeVisible();

		const fillEncryptionPassword = async (password: string, confirmation: string) => {
			await user.clear(screen.getByTestId("PasswordValidation__encryptionPassword"));
			await user.paste(password);

			await user.clear(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"));
			await user.paste(confirmation);
		};

		await fillEncryptionPassword("hello123", "wrong-confirmation");

		const continueEncryptionButton = () => screen.getByTestId("CreateWallet__continue-encryption-button");

		await waitFor(() => expect(continueEncryptionButton()).toBeDisabled());

		const backButton = await screen.findByTestId("CreateWallet__back-button");

		await userEvent.click(backButton);

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		await fillConfirmationInputs();
		await userEvent.click(screen.getByTestId("CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer"));

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("EncryptPassword")).resolves.toBeVisible();

		await fillEncryptionPassword(encryptionPassword, encryptionPassword);

		await waitFor(() => expect(continueEncryptionButton()).toBeEnabled());

		await userEvent.click(continueEncryptionButton());

		await expect(screen.findByTestId("CreateWallet__SuccessStep")).resolves.toBeVisible();

		expect(profile.wallets().values()).toHaveLength(1);
	});

	it("should not have a pending wallet if leaving on step 1", async () => {
		const createURL = `/profiles/${fixtureProfileId}/dashboard`;

		render(<CreateAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: createURL,
		});

		await userEvent.click(screen.getByTestId("SidePanel__close-button"));

		await waitFor(() => expect(profile.wallets().values()).toHaveLength(0));
	});

	it("should remove pending wallet if not submitted", async () => {
		const createURL = `/profiles/${fixtureProfileId}/dashboard`;

		render(<CreateAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: createURL,
		});

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SidePanel__close-button"));

		await waitFor(() => expect(profile.wallets().values()).toHaveLength(0));
	});

	it.skip("should show an error message if wallet generation failed", async () => {
		bip39GenerateMock.mockRestore();
		bip39GenerateMock = vi.spyOn(profile.walletFactory(), "generate").mockImplementation(() => {
			throw new Error("test");
		});

		const createURL = `/profiles/${fixtureProfileId}/dashboard`;

		render(<CreateAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: createURL,
		});

		await expect(
			screen.findByText(walletTranslations.PAGE_CREATE_WALLET.NETWORK_STEP.GENERATION_ERROR),
		).resolves.toBeVisible();

		bip39GenerateMock.mockRestore();
	});

	it("should show an error message for duplicate name", async () => {
		const wallet = await profile.walletFactory().fromAddress({
			address: "0x393f3F74F0cd9e790B5192789F31E0A38159ae03",
			coin: "Mainsail",
			network: "mainsail.devnet",
		});

		profile.wallets().push(wallet);
		wallet.settings().set(Contracts.WalletSetting.Alias, "Test");

		const createURL = `/profiles/${fixtureProfileId}/dashboard`;

		render(<CreateAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: createURL,
		});
		const user = userEvent.setup();

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		const [firstInput, secondInput, thirdInput] = screen.getAllByTestId("MnemonicVerificationInput__input");
		await userEvent.click(screen.getByTestId("CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer"));

		await user.clear(firstInput);
		await user.paste("power");

		await user.clear(secondInput);
		await user.paste("return");

		await user.clear(thirdInput);
		await user.paste("attend");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__SuccessStep")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("CreateWallet__edit-alias"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await user.clear(screen.getByTestId("UpdateWalletName__input"));
		await user.paste("Test");

		await waitFor(() => expect(screen.getByTestId("UpdateWalletName__submit")).toBeDisabled());

		await userEvent.click(screen.getByTestId("UpdateWalletName__cancel"));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());
	});
});
