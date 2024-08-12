/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/require-await */
import { Contracts, Wallet } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";

import { ImportWallet } from "./ImportWallet";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;
const fixtureProfileId = getDefaultProfileId();

const randomAddress = "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib";
const randomPublicKey = "034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192";
const randomPublicKeyInvalid = "a34151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192";

const route = `/profiles/${fixtureProfileId}/wallets/import`;

const enableEncryptionToggle = () => userEvent.click(screen.getByTestId("ImportWallet__encryption-toggle"));
const continueButton = () => screen.getByTestId("ImportWallet__continue-button");
const backButton = () => screen.getByTestId("ImportWallet__back-button");
const addressInput = () => screen.findByTestId("ImportWallet__address-input");
const finishButton = () => screen.getByTestId("ImportWallet__finish-button");
const successStep = () => screen.getByTestId("ImportWallet__success-step");
const methodStep = () => screen.getByTestId("ImportWallet__method-step");
const publicKeyInput = () => screen.getByTestId("ImportWallet__publicKey-input");

const secretInputID = "ImportWallet__secret-input";
const password = "S3cUrePa$sword";
const testNetwork = "ark.devnet";

describe("ImportWallet Methods", () => {
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

	it("should import by address", async () => {
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

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.ADDRESS));

		await expect(addressInput()).resolves.toBeVisible();

		await userEvent.clear(await addressInput());
		await userEvent.type(await addressInput(), randomAddress);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		userEvent.click(finishButton());

		await waitFor(() => {
			expect(profile.wallets().findByAddressWithNetwork(randomAddress, testNetwork)).toBeInstanceOf(Wallet);
		});
	});

	it("should import by public key", async () => {
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

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.PUBLIC_KEY)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.PUBLIC_KEY));

		await expect(screen.findByTestId("ImportWallet__publicKey-input")).resolves.toBeVisible();

		await userEvent.clear(publicKeyInput());
		await userEvent.type(publicKeyInput(), randomPublicKey);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		userEvent.click(finishButton());

		await waitFor(() => {
			expect(profile.wallets().findByAddressWithNetwork(randomAddress, testNetwork)).toBeInstanceOf(Wallet);
		});
	});

	it("should validate public key doesnt exist", async () => {
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

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.PUBLIC_KEY)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.PUBLIC_KEY));

		await expect(screen.findByTestId("ImportWallet__publicKey-input")).resolves.toBeVisible();

		const findAdressSpy = vi.spyOn(profile.wallets(), "findByAddressWithNetwork").mockReturnValue({} as any);

		await userEvent.clear(publicKeyInput());
		await userEvent.type(publicKeyInput(), randomPublicKey);

		await waitFor(() => expect(continueButton()).toBeDisabled());

		findAdressSpy.mockRestore();
	});

	it("should not allow importing from an invalid public key", async () => {
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

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.PUBLIC_KEY)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.PUBLIC_KEY));

		await expect(screen.findByTestId("ImportWallet__publicKey-input")).resolves.toBeVisible();

		await userEvent.clear(publicKeyInput());
		await userEvent.type(publicKeyInput(), randomPublicKeyInvalid);

		await waitFor(() => expect(continueButton()).toBeDisabled());
	});

	it("should import by secret", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		const countBefore = profile.wallets().count();

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.SECRET));

		await expect(screen.findByTestId(secretInputID)).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId(secretInputID), "secret.111");
		await userEvent.type(screen.getByTestId(secretInputID), "secret.111");

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		userEvent.click(finishButton());

		await waitFor(() => expect(profile.wallets().count()).toBe(countBefore + 1));
	});

	it("should import by secret with encryption", async () => {
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

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.SECRET));

		await expect(screen.findByTestId(secretInputID)).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId(secretInputID));
		await userEvent.type(screen.getByTestId(secretInputID), "secret.222");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		enableEncryptionToggle();

		await waitFor(() => {
			expect(screen.getByTestId("ImportWallet__encryption-toggle")).toBeEnabled();
		});

		userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});
		userEvent.clear(screen.getByTestId("PasswordValidation__encryptionPassword"));
		userEvent.type(screen.getByTestId("PasswordValidation__encryptionPassword"), password);

		await waitFor(() => {
			expect(screen.getByTestId("PasswordValidation__encryptionPassword")).toHaveValue(password);
		});

		userEvent.clear(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"));
		userEvent.type(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"), password);

		await waitFor(() => {
			expect(screen.getByTestId("PasswordValidation__confirmEncryptionPassword")).toHaveValue(password);
		});

		await waitFor(() => {
			expect(continueButton()).toBeEnabled();
		});
		userEvent.click(continueButton());

		await waitFor(
			() => {
				expect(successStep()).toBeInTheDocument();
			},
			{ timeout: 15_000 },
		);
	});

	it("should import by secret with second signature and use password to encrypt both", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		await userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		await userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.SECRET));

		expect(methodStep()).toBeInTheDocument();

		const passphraseInput = screen.getByTestId(secretInputID);

		expect(passphraseInput).toBeInTheDocument();

		await userEvent.clear(passphraseInput);
		await userEvent.type(passphraseInput, "abc");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		enableEncryptionToggle();

		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});

		await userEvent.clear(screen.getByTestId("EncryptPassword__second-secret"));
		await userEvent.type(screen.getByTestId("EncryptPassword__second-secret"), "abc");

		await userEvent.clear(screen.getByTestId("PasswordValidation__encryptionPassword"));
		await userEvent.type(screen.getByTestId("PasswordValidation__encryptionPassword"), password);

		await expect(screen.findByTestId("EncryptPassword__second-secret")).resolves.toHaveValue("abc");
		await expect(screen.findByTestId("PasswordValidation__encryptionPassword")).resolves.toHaveValue(password);

		await userEvent.clear(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"));
		await userEvent.type(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"), password);
		await expect(screen.findByTestId("PasswordValidation__confirmEncryptionPassword")).resolves.toHaveValue(
			password,
		);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});
	});

	it("forgets the imported wallet if back from encrypted password step", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		await userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		await userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.SECRET));

		expect(methodStep()).toBeInTheDocument();

		const passphraseInput = screen.getByTestId(secretInputID);

		expect(passphraseInput).toBeInTheDocument();

		await userEvent.clear(passphraseInput);
		await userEvent.type(passphraseInput, "abcd");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		enableEncryptionToggle();

		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});

		const profileForgetWalletSpy = vi.spyOn(profile.wallets(), "forget").mockImplementation(() => {});

		await userEvent.click(backButton());

		expect(profileForgetWalletSpy).toHaveBeenCalledWith(expect.any(String));

		profileForgetWalletSpy.mockRestore();
	});
});
