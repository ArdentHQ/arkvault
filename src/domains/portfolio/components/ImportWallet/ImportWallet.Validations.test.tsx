import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { translations as walletTranslations } from "@/domains/wallet/i18n";
import {
	env,
	MNEMONICS,
	render,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
	MAINSAIL_MNEMONICS,
} from "@/utils/testing-library";
import { ImportAddressesSidePanel } from "./ImportAddressSidePanel";

let profile: Contracts.IProfile;
const fixtureProfileId = getMainsailProfileId();

const randomAddress = "0x393f3F74F0cd9e790B5192789F31E0A38159ae03";

const route = `/profiles/${fixtureProfileId}/dashboard`;

const continueButton = () => screen.getByTestId("ImportWallet__continue-button");
const mnemonicInput = () => screen.getByTestId("ImportWallet__mnemonic-input");
const addressInput = () => screen.findByTestId("ImportWallet__address-input");
const successStep = () => screen.getByTestId("ImportWallet__success-step");
const methodStep = () => screen.getByTestId("ImportWallet__method-step");
const detailStep = () => screen.getByTestId("ImportWallet__detail-step");
// const enableEncryptionToggle = async () =>
// 	await userEvent.click(screen.getByTestId("WalletEncryptionBanner__encryption-toggle"));
// const toggleEncryptionCheckbox = async () =>
// 	await userEvent.click(screen.getByTestId("WalletEncryptionBanner__checkbox"));

const secretInputID = "ImportWallet__secret-input";
const errorText = "data-errortext";
const testNetwork = "mainsail.devnet";

describe("ImportAddress Validations", () => {
	let resetProfileNetworksMock: () => void;

	beforeEach(async () => {
		profile = env.profiles().findById(fixtureProfileId);

		await env.profiles().restore(profile);

		const walletId = profile.wallets().findByAddressWithNetwork(randomAddress, testNetwork)?.id();

		if (walletId) {
			profile.wallets().forget(walletId);
		}

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should error if address cannot be created", async () => {
		const validationMock = vi.spyOn(profile.walletFactory(), "fromSecret").mockImplementation(() => {
			throw new Error("error");
		});

		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: route,
		});

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.SECRET));

		expect(detailStep()).toBeInTheDocument();

		await expect(screen.findByTestId(secretInputID)).resolves.toBeVisible();
		const secretInput = screen.getByTestId(secretInputID);

		expect(secretInput).toBeInTheDocument();

		await userEvent.type(secretInput, "wrong-secret");

		await waitFor(() => expect(continueButton()).not.toBeEnabled());
		validationMock.mockRestore();
	});

	it("should prompt for mnemonic if user enters bip39 compliant secret", async () => {
		const validationMock = vi.spyOn(profile.walletFactory(), "fromSecret").mockImplementation(() => {
			throw new Error("error");
		});

		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: route,
		});

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.SECRET));

		expect(detailStep()).toBeInTheDocument();

		await expect(screen.findByTestId(secretInputID)).resolves.toBeVisible();
		const passphraseInput = screen.getByTestId(secretInputID);

		expect(passphraseInput).toBeInTheDocument();

		await userEvent.clear(passphraseInput);
		await userEvent.type(passphraseInput, MNEMONICS[0]);

		await waitFor(() => expect(continueButton()).not.toBeEnabled());
		validationMock.mockRestore();
	});

	// @TODO enable when we have 2nd signature enabled
	// it("should show an error message for invalid second secret", async () => {
	// 	const walletId = profile
	// 		.wallets()
	// 		.findByAddressWithNetwork("0xfb36D3cc82953351A7f9a0Fd09c17D271ecBEB03", testNetwork)
	// 		?.id();
	//
	// 	if (walletId) {
	// 		profile.wallets().forget(walletId);
	// 	}
	//
	// 	const wallet = await profile.walletFactory().fromSecret({
	// 		coin: "Mainsail",
	// 		network: "mainsail.devnet",
	// 		secret: "abc",
	// 	});
	//
	// 	render(
	// 			<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />,
	// 		{
	// 			route: route,
	// 		},
	// 	);
	//
	// 	expect(methodStep()).toBeInTheDocument();
	//
	// 	await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();
	//
	// 	await userEvent.click(screen.getByText(commonTranslations.SECRET));
	//
	// 	expect(detailStep()).toBeInTheDocument();
	//
	// 	await expect(screen.findByTestId(secretInputID)).resolves.toBeVisible();
	//
	// 	const passphraseInput = screen.getByTestId(secretInputID);
	//
	// 	expect(passphraseInput).toBeInTheDocument();
	//
	// 	await userEvent.clear(passphraseInput);
	// 	await userEvent.type(passphraseInput, "abc");
	//
	// 	await waitFor(() => {
	// 		expect(passphraseInput).toHaveValue("abc");
	// 	});
	//
	// 	await waitFor(() => expect(continueButton()).toBeEnabled());
	//
	// 	await enableEncryptionToggle();
	// 	await toggleEncryptionCheckbox();
	// 	await userEvent.click(continueButton());
	//
	// 	await waitFor(() => {
	// 		expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
	// 	});
	//
	// 	const fromSecretMock = vi.spyOn(wallet.coin().address(), "fromSecret").mockImplementationOnce(() => {
	// 		throw new Error("test");
	// 	});
	//
	// 	await userEvent.clear(screen.getByTestId("EncryptPassword__second-secret"));
	// 	await userEvent.type(screen.getByTestId("EncryptPassword__second-secret"), "invalid second secret");
	//
	// 	expect(screen.getByTestId("EncryptPassword__second-secret")).toHaveValue("invalid second secret");
	// 	expect(screen.getByTestId("PasswordValidation__encryptionPassword")).toHaveAttribute("aria-invalid");
	//
	// 	fromSecretMock.mockRestore();
	// });

	it("should show an error message for duplicate address when importing by mnemonic", async () => {
		const generated = await profile.walletFactory().generate({
			coin: "Mainsail",
			network: testNetwork,
		});

		profile.wallets().push(generated.wallet);

		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: route,
		});

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.MNEMONIC)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.MNEMONIC));

		expect(detailStep()).toBeInTheDocument();

		expect(mnemonicInput()).toBeInTheDocument();

		await userEvent.clear(mnemonicInput());
		await userEvent.type(mnemonicInput(), generated.mnemonic);

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				errorText,
				commonTranslations.INPUT_ADDRESS.VALIDATION.ADDRESS_ALREADY_EXISTS.replace(
					"{{address}}",
					generated.wallet.address(),
				),
			);
		});

		expect(continueButton()).toBeDisabled();
	});

	it("should show an error message for duplicate address when importing by address", async () => {
		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: route,
		});

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.ADDRESS));

		expect(detailStep()).toBeInTheDocument();

		await expect(addressInput()).resolves.toBeVisible();

		await userEvent.clear(await addressInput());
		await userEvent.type(await addressInput(), profile.wallets().first().address());

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				errorText,
				commonTranslations.INPUT_ADDRESS.VALIDATION.ADDRESS_ALREADY_EXISTS.replace(
					"{{address}}",
					profile.wallets().first().address(),
				),
			);
		});

		expect(continueButton()).toBeDisabled();
	});

	it("should show an error message for invalid address", async () => {
		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: route,
		});

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.ADDRESS));

		expect(detailStep()).toBeInTheDocument();

		await expect(addressInput()).resolves.toBeVisible();

		await userEvent.clear(await addressInput());
		await userEvent.type(await addressInput(), "123");

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				errorText,
				commonTranslations.INPUT_ADDRESS.VALIDATION.NOT_VALID,
			);
		});

		expect(continueButton()).toBeDisabled();
	});

	it("should show an error message for duplicate name", async () => {
		const emptyProfile = await env.profiles().create("duplicate wallet name profile");

		await env.profiles().restore(emptyProfile);
		await emptyProfile.sync();

		const randomNewAddress = "0x393f3F74F0cd9e790B5192789F31E0A38159ae03";

		const wallet = await emptyProfile.walletFactory().fromMnemonicWithBIP39({
			coin: "Mainsail",
			mnemonic: MAINSAIL_MNEMONICS[1],
			network: testNetwork,
		});

		wallet.settings().set(Contracts.WalletSetting.Alias, "My wallet");

		profile.wallets().push(wallet);

		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: route,
		});

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.ADDRESS));

		expect(detailStep()).toBeInTheDocument();

		await expect(addressInput()).resolves.toBeVisible();

		await userEvent.clear(await addressInput());
		await userEvent.type(await addressInput(), randomNewAddress);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		const alias = "My Wallet";

		await userEvent.click(screen.getByTestId("ImportWallet__edit-alias"));

		await expect(screen.findByTestId("UpdateWalletName__input")).resolves.toBeVisible();

		// Test cancel button
		await userEvent.click(screen.getByTestId("UpdateWalletName__cancel"));
		await waitFor(() => {
			expect(screen.queryByTestId("UpdateWalletName__input")).toBeNull();
		});

		// Try to edit name again
		await userEvent.click(screen.getByTestId("ImportWallet__edit-alias"));
		await expect(screen.findByTestId("UpdateWalletName__input")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("UpdateWalletName__input"));
		await userEvent.type(screen.getByTestId("UpdateWalletName__input"), alias);

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				errorText,
				walletTranslations.VALIDATION.ALIAS_ASSIGNED.replace("{{alias}}", alias),
			);
		});

		expect(screen.getByTestId("UpdateWalletName__submit")).toBeDisabled();
	});
});
