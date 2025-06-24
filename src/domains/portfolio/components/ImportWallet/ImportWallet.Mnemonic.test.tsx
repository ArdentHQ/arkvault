/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/require-await */
import { Contracts, Wallet } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import {
	env,
	MNEMONICS,
	render,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
	MAINSAIL_MNEMONICS,
	getMainsailProfileId,
} from "@/utils/testing-library";
import { ImportAddressesSidePanel } from "./ImportAddressSidePanel";

let profile: Contracts.IProfile;
const fixtureProfileId = getMainsailProfileId();

const identityAddress = "0x125b484e51Ad990b5b3140931f3BD8eAee85Db23";
const mnemonic = MAINSAIL_MNEMONICS[1];
const randomAddress = "0x659A76be283644AEc2003aa8ba26485047fd1BFB";

const route = `/profiles/${fixtureProfileId}/dashboard`;

const enableEncryptionToggle = () => userEvent.click(screen.getByTestId("WalletEncryptionBanner__encryption-toggle"));
const toggleEncryptionCheckbox = () => userEvent.click(screen.getByTestId("WalletEncryptionBanner__checkbox"));
const continueButton = () => screen.getByTestId("ImportWallet__continue-button");
const mnemonicInput = () => screen.getByTestId("ImportWallet__mnemonic-input");
const addressInput = () => screen.findByTestId("ImportWallet__address-input");
const finishButton = () => screen.getByTestId("ImportWallet__finish-button");
const successStep = () => screen.getByTestId("ImportWallet__success-step");
const methodStep = () => screen.getByTestId("ImportWallet__method-step");
const detailStep = () => screen.getByTestId("ImportWallet__detail-step");

const password = "S3cUrePa$sword";
const testNetwork = "mainsail.devnet";

describe("ImportAddress", () => {
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

	it("should import by mnemonic", async () => {
		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: route,
		});

		const user = userEvent.setup();

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.MNEMONIC)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.MNEMONIC));

		expect(detailStep()).toBeInTheDocument();

		expect(mnemonicInput()).toBeInTheDocument();

		await user.clear(mnemonicInput());
		await user.paste(mnemonic);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.keyboard("{Enter}");

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("ImportWallet__edit-alias"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await user.clear(screen.getByTestId("UpdateWalletName__input"));
		await user.paste("test alias");

		await waitFor(() => expect(screen.getByTestId("UpdateWalletName__submit")).toBeEnabled());

		userEvent.keyboard("{enter}");
		userEvent.click(screen.getByTestId("UpdateWalletName__submit"));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		userEvent.click(finishButton());

		await waitFor(() => {
			expect(profile.wallets().findByAddressWithNetwork(identityAddress, testNetwork)).toBeInstanceOf(Wallet);
		});
	});

	it("should import by mnemonic and use encryption password", async () => {
		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: route,
		});

		const user = userEvent.setup();

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.MNEMONIC)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.MNEMONIC));

		expect(detailStep()).toBeInTheDocument();

		expect(mnemonicInput()).toBeInTheDocument();

		await user.clear(mnemonicInput());
		await user.paste(MAINSAIL_MNEMONICS[0]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await enableEncryptionToggle();
		await toggleEncryptionCheckbox();
		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});

		await user.clear(screen.getByTestId("PasswordValidation__encryptionPassword"));
		await user.paste(password);
		await expect(screen.findByTestId("PasswordValidation__encryptionPassword")).resolves.toHaveValue(password);

		await user.clear(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"));
		await user.paste(password);

		await expect(screen.findByTestId("PasswordValidation__confirmEncryptionPassword")).resolves.toHaveValue(
			password,
		);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});
	});

	it("should disable the encryption option when selecting a methods without encryption", async () => {
		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: route,
		});

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.MNEMONIC)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.MNEMONIC));

		expect(detailStep()).toBeInTheDocument();

		expect(mnemonicInput()).toBeInTheDocument();

		await userEvent.clear(mnemonicInput());
		await userEvent.type(mnemonicInput(), MNEMONICS[0]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		expect(screen.getByTestId("WalletEncryptionBanner__encryption-toggle")).not.toBeChecked();

		await enableEncryptionToggle();
		await toggleEncryptionCheckbox();

		await waitFor(() => expect(screen.getByTestId("WalletEncryptionBanner__encryption-toggle")).toBeChecked());

		await userEvent.click(screen.getByText(commonTranslations.BACK));

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.ADDRESS));

		await expect(addressInput()).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("WalletEncryptionBanner__encryption-toggle")).not.toBeChecked());
	});

	// @TODO enable it when we have 2nd signature implemented
	// it("should import by mnemonic with second signature and use password to encrypt both", async () => {
	// 	render(
	// 			<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />,
	// 		{
	// 			route: route,
	// 		},
	// 	);
	//
	// 	expect(methodStep()).toBeInTheDocument();
	//
	// 	await expect(screen.findByText(commonTranslations.MNEMONIC)).resolves.toBeVisible();
	//
	// 	await userEvent.click(screen.getByText(commonTranslations.MNEMONIC));
	//
	// 	expect(detailStep()).toBeInTheDocument();
	//
	// 	expect(mnemonicInput()).toBeInTheDocument();
	//
	// 	await userEvent.clear(mnemonicInput());
	// 	await userEvent.type(mnemonicInput(), MAINSAIL_MNEMONICS[0]);
	//
	// 	await waitFor(() => expect(continueButton()).toBeEnabled());
	//
	// 	await enableEncryptionToggle();
	// 	await toggleEncryptionCheckbox();
	//
	// 	await userEvent.click(continueButton());
	//
	// 	await waitFor(() => {
	// 		expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
	// 	});
	//
	// 	await userEvent.clear(screen.getByTestId("EncryptPassword__second-mnemonic"));
	// 	await userEvent.type(screen.getByTestId("EncryptPassword__second-mnemonic"), MNEMONICS[5]);
	//
	// 	await userEvent.clear(screen.getByTestId("PasswordValidation__encryptionPassword"));
	// 	await userEvent.type(screen.getByTestId("PasswordValidation__encryptionPassword"), password);
	// 	await userEvent.clear(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"));
	// 	await userEvent.type(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"), password);
	//
	// 	await waitFor(() => expect(continueButton()).toBeEnabled());
	// 	await userEvent.click(continueButton());
	//
	// 	await waitFor(() => {
	// 		expect(successStep()).toBeInTheDocument();
	// 	});
	// });
	//
	// it("should show an error message for invalid second mnemonic", async () => {
	// 	const walletId = profile
	// 		.wallets()
	// 		.findByAddressWithNetwork("0x659A76be283644AEc2003aa8ba26485047fd1BFB", testNetwork)
	// 		?.id();
	// 	if (walletId) {
	// 		profile.wallets().forget(walletId);
	// 	}
	//
	// 	render(
	// 			<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />,
	// 		{
	// 			route: route,
	// 			withProviders: true,
	// 		},
	// 	);
	//
	// 	expect(methodStep()).toBeInTheDocument();
	//
	// 	await expect(screen.findByText(commonTranslations.MNEMONIC)).resolves.toBeVisible();
	//
	// 	await userEvent.click(screen.getByText(commonTranslations.MNEMONIC));
	//
	// 	expect(detailStep()).toBeInTheDocument();
	//
	// 	await userEvent.clear(mnemonicInput());
	// 	await userEvent.type(mnemonicInput(), MAINSAIL_MNEMONICS[0]);
	//
	// 	await waitFor(() => expect(continueButton()).toBeEnabled());
	//
	// 	await enableEncryptionToggle();
	// 	await toggleEncryptionCheckbox();
	//
	// 	await userEvent.click(continueButton());
	//
	// 	await waitFor(() => {
	// 		expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
	// 	});
	//
	// 	await userEvent.clear(screen.getByTestId("EncryptPassword__second-mnemonic"));
	// 	await userEvent.type(
	// 		screen.getByTestId("EncryptPassword__second-mnemonic"),
	// 		"invalid second mnemonic fjdkfjdkjfkdjf",
	// 	);
	//
	// 	await waitFor(() => {
	// 		expect(screen.getAllByTestId("Input__error")[0]).toHaveAttribute(
	// 			errorText,
	// 			walletTranslations.PAGE_IMPORT_WALLET.VALIDATION.INVALID_MNEMONIC,
	// 		);
	// 	});
	// });
});
