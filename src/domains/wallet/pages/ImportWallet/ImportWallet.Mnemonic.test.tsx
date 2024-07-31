/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/require-await */
import { Contracts, Wallet } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";

import { ImportWallet } from "./ImportWallet";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { translations as walletTranslations } from "@/domains/wallet/i18n";
import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;
const fixtureProfileId = getDefaultProfileId();

const identityAddress = "DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq2P";
const mnemonic = "buddy year cost vendor honey tonight viable nut female alarm duck symptom";
const randomAddress = "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib";

const route = `/profiles/${fixtureProfileId}/wallets/import`;

const enableEncryptionToggle = () => userEvent.click(screen.getByTestId("ImportWallet__encryption-toggle"));
const continueButton = () => screen.getByTestId("ImportWallet__continue-button");
const mnemonicInput = () => screen.getByTestId("ImportWallet__mnemonic-input");
const addressInput = () => screen.findByTestId("ImportWallet__address-input");
const finishButton = () => screen.getByTestId("ImportWallet__finish-button");
const successStep = () => screen.getByTestId("ImportWallet__success-step");
const methodStep = () => screen.getByTestId("ImportWallet__method-step");

const errorText = "data-errortext";
const password = "S3cUrePa$sword";
const testNetwork = "ark.devnet";

describe("ImportWallet", () => {
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
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.keyboard("{Enter}");

		await waitFor(() => expect(() => mnemonicInput()).not.toThrow());

		expect(mnemonicInput()).toBeInTheDocument();

		await userEvent.clear(mnemonicInput());
		await userEvent.type(mnemonicInput(), mnemonic);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.keyboard("{Enter}");

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("ImportWallet__edit-alias"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("UpdateWalletName__input"));
		await userEvent.type(screen.getByTestId("UpdateWalletName__input"), "test alias");

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
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		expect(mnemonicInput()).toBeInTheDocument();

		await userEvent.clear(mnemonicInput());
		await userEvent.type(mnemonicInput(), MNEMONICS[3]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		enableEncryptionToggle();

		userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});

		await userEvent.type(screen.getByTestId("PasswordValidation__encryptionPassword"), password);
		await expect(screen.findByTestId("PasswordValidation__encryptionPassword")).resolves.toHaveValue(password);

		await userEvent.type(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"), password);
		await expect(screen.findByTestId("PasswordValidation__confirmEncryptionPassword")).resolves.toHaveValue(
			password,
		);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});
	});

	it("should disable the encryption option when selecting a methods without encryption", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		expect(mnemonicInput()).toBeInTheDocument();

		await userEvent.clear(mnemonicInput());
		await userEvent.type(mnemonicInput(), MNEMONICS[0]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		expect(screen.getByTestId("ImportWallet__encryption-toggle")).not.toBeChecked();

		enableEncryptionToggle();

		await waitFor(() => expect(screen.getByTestId("ImportWallet__encryption-toggle")).toBeChecked());
		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.ADDRESS));

		await expect(addressInput()).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("ImportWallet__encryption-toggle")).not.toBeChecked());
	});

	it("should import by mnemonic with second signature and use password to encrypt both", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		expect(mnemonicInput()).toBeInTheDocument();

		await userEvent.clear(mnemonicInput());
		await userEvent.type(mnemonicInput(), MNEMONICS[0]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		enableEncryptionToggle();

		userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});

		await userEvent.clear(screen.getByTestId("EncryptPassword__second-mnemonic"));
		await userEvent.type(screen.getByTestId("EncryptPassword__second-mnemonic"), MNEMONICS[5]);

		await userEvent.clear(screen.getByTestId("PasswordValidation__encryptionPassword"));
		await userEvent.type(screen.getByTestId("PasswordValidation__encryptionPassword"), password);
		await userEvent.clear(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"));
		await userEvent.type(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"), password);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});
	});

	it("should show an error message for invalid second mnemonic", async () => {
		const walletId = profile
			.wallets()
			.findByAddressWithNetwork("DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr", testNetwork)
			?.id();
		if (walletId) {
			profile.wallets().forget(walletId);
		}

		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
				withProviders: true,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		await userEvent.clear(mnemonicInput());
		await userEvent.type(mnemonicInput(), MNEMONICS[0]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		enableEncryptionToggle();

		userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});

		await userEvent.clear(
			screen.getByTestId("EncryptPassword__second-mnemonic")
		);
		await userEvent.type(
			screen.getByTestId("EncryptPassword__second-mnemonic"),
			"invalid second mnemonic fjdkfjdkjfkdjf",
		);

		await waitFor(() => {
			expect(screen.getAllByTestId("Input__error")[0]).toHaveAttribute(
				errorText,
				walletTranslations.PAGE_IMPORT_WALLET.VALIDATION.INVALID_MNEMONIC,
			);
		});
	});
});
