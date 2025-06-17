/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/require-await */
import { Contracts, Wallet } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import {
	env,
	render,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";
import * as usePortfolio from "@/domains/portfolio/hooks/use-portfolio";
import { ImportAddressesSidePanel } from "./ImportAddressSidePanel";

let profile: Contracts.IProfile;
const fixtureProfileId = getMainsailProfileId();

const randomAddress = "0x125b484e51Ad990b5b3140931f3BD8eAee85Db23";
const randomPublicKey = "02727d83862b9d429b91a0d06920d860c252893a25ec337fb30da87b119985c182";
const randomPublicKeyInvalid = "a34151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192";

const route = `/profiles/${fixtureProfileId}/dashboard`;

const enableEncryptionToggle = async () =>
	await userEvent.click(screen.getByTestId("WalletEncryptionBanner__encryption-toggle"));
const toggleEncryptionCheckbox = async () =>
	await userEvent.click(screen.getByTestId("WalletEncryptionBanner__checkbox"));
const continueButton = () => screen.getByTestId("ImportWallet__continue-button");
const backButton = () => screen.getByTestId("ImportWallet__back-button");
const addressInput = () => screen.findByTestId("ImportWallet__address-input");
const finishButton = () => screen.getByTestId("ImportWallet__finish-button");
const successStep = () => screen.getByTestId("ImportWallet__success-step");
const methodStep = () => screen.getByTestId("ImportWallet__method-step");
const detailStep = () => screen.getByTestId("ImportWallet__detail-step");
const publicKeyInput = () => screen.getByTestId("ImportWallet__publicKey-input");

const secretInputID = "ImportWallet__secret-input";
const password = "S3cUrePa$sword";
const testNetwork = "mainsail.devnet";

describe("ImportAddress Methods", () => {
	let resetProfileNetworksMock: () => void;

	beforeEach(async () => {
		vi.spyOn(usePortfolio, "usePortfolio").mockReturnValue({
			selectedAddresses: [],
			setSelectedAddresses: () => {},
		});

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
		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: route,
		});

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.ADDRESS));

		expect(detailStep()).toBeInTheDocument();

		await expect(addressInput()).resolves.toBeVisible();

		await userEvent.clear(await addressInput());
		await userEvent.type(await addressInput(), randomAddress);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		await userEvent.click(finishButton());

		await waitFor(() => {
			expect(profile.wallets().findByAddressWithNetwork(randomAddress, testNetwork)).toBeInstanceOf(Wallet);
		});
	});

	it("should import by public key", async () => {
		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: route,
		});

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.PUBLIC_KEY)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.PUBLIC_KEY));

		expect(detailStep()).toBeInTheDocument();

		await expect(screen.findByTestId("ImportWallet__publicKey-input")).resolves.toBeVisible();

		await userEvent.clear(publicKeyInput());
		await userEvent.type(publicKeyInput(), randomPublicKey);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		await userEvent.click(finishButton());

		await waitFor(() => {
			expect(profile.wallets().findByAddressWithNetwork(randomAddress, testNetwork)).toBeInstanceOf(Wallet);
		});
	});

	it("should not allow importing from an invalid public key", async () => {
		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: route,
		});

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.PUBLIC_KEY)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.PUBLIC_KEY));

		expect(detailStep()).toBeInTheDocument();

		await expect(screen.findByTestId("ImportWallet__publicKey-input")).resolves.toBeVisible();

		await userEvent.clear(publicKeyInput());
		await userEvent.type(publicKeyInput(), randomPublicKeyInvalid);

		await waitFor(() => expect(continueButton()).toBeDisabled());
	});

	it("should import by secret", async () => {
		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: route,
		});

		const countBefore = profile.wallets().count();

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.SECRET));

		expect(detailStep()).toBeInTheDocument();

		await expect(screen.findByTestId(secretInputID)).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId(secretInputID));
		await userEvent.type(screen.getByTestId(secretInputID), "secret.111");

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		await userEvent.click(finishButton());

		await waitFor(() => expect(profile.wallets().count()).toBe(countBefore + 1));
	});

	it("should import by secret with encryption", async () => {
		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: route,
		});

		const user = userEvent.setup();

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.SECRET));

		expect(detailStep()).toBeInTheDocument();

		await expect(screen.findByTestId(secretInputID)).resolves.toBeVisible();

		await user.clear(screen.getByTestId(secretInputID));
		await user.paste("secret.222");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await enableEncryptionToggle();
		await toggleEncryptionCheckbox();

		await waitFor(() => {
			expect(screen.getByTestId("WalletEncryptionBanner__encryption-toggle")).toBeEnabled();
		});

		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});
		await userEvent.clear(screen.getByTestId("PasswordValidation__encryptionPassword"));
		await userEvent.paste(password);

		await waitFor(() => {
			expect(screen.getByTestId("PasswordValidation__encryptionPassword")).toHaveValue(password);
		});

		await userEvent.clear(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"));
		await userEvent.paste(password);

		await waitFor(() => {
			expect(screen.getByTestId("PasswordValidation__confirmEncryptionPassword")).toHaveValue(password);
		});

		await waitFor(() => {
			expect(continueButton()).toBeEnabled();
		});
		await userEvent.click(continueButton());

		await waitFor(
			() => {
				expect(successStep()).toBeInTheDocument();
			},
			{ timeout: 15_000 },
		);
	});

	// @TODO enable it when we have 2nd signature implemented
	// it("should import by secret with second signature and use password to encrypt both", async () => {
	// 	render(
	// 			<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />,
	// 		{
	// 			route: route,
	// 		},
	// 	);
	//
	// 	await waitFor(() => expect(() => methodStep()).not.toThrow());
	//
	// 	expect(methodStep()).toBeInTheDocument();
	//
	// 	await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();
	//
	// 	await userEvent.click(screen.getByText(commonTranslations.SECRET));
	//
	// 	expect(detailStep()).toBeInTheDocument();
	//
	// 	const passphraseInput = screen.getByTestId(secretInputID);
	//
	// 	expect(passphraseInput).toBeInTheDocument();
	//
	// 	await userEvent.clear(passphraseInput);
	// 	await userEvent.type(passphraseInput, "abc");
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
	// 	await userEvent.clear(screen.getByTestId("EncryptPassword__second-secret"));
	// 	await userEvent.type(screen.getByTestId("EncryptPassword__second-secret"), "abc");
	//
	// 	await userEvent.clear(screen.getByTestId("PasswordValidation__encryptionPassword"));
	// 	await userEvent.type(screen.getByTestId("PasswordValidation__encryptionPassword"), password);
	//
	// 	await expect(screen.findByTestId("EncryptPassword__second-secret")).resolves.toHaveValue("abc");
	// 	await expect(screen.findByTestId("PasswordValidation__encryptionPassword")).resolves.toHaveValue(password);
	//
	// 	await userEvent.clear(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"));
	// 	await userEvent.type(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"), password);
	// 	await expect(screen.findByTestId("PasswordValidation__confirmEncryptionPassword")).resolves.toHaveValue(
	// 		password,
	// 	);
	//
	// 	await waitFor(() => expect(continueButton()).toBeEnabled());
	// 	await userEvent.click(continueButton());
	//
	// 	await waitFor(() => {
	// 		expect(successStep()).toBeInTheDocument();
	// 	});
	// });

	it("forgets the imported wallet if back from encrypted password step", async () => {
		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: route,
		});

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.SECRET));

		expect(detailStep()).toBeInTheDocument();

		const passphraseInput = screen.getByTestId(secretInputID);

		expect(passphraseInput).toBeInTheDocument();

		await userEvent.clear(passphraseInput);
		await userEvent.type(passphraseInput, "abcd");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await enableEncryptionToggle();
		await toggleEncryptionCheckbox();
		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});

		const profileForgetWalletSpy = vi.spyOn(profile.wallets(), "forget").mockImplementation(() => {});

		await userEvent.click(backButton());

		expect(profileForgetWalletSpy).toHaveBeenCalledWith(expect.any(String));

		profileForgetWalletSpy.mockRestore();
	});

	it("should validate public key doesnt exist", async () => {
		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: route,
		});

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.PUBLIC_KEY)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.PUBLIC_KEY));

		expect(detailStep()).toBeInTheDocument();

		await expect(screen.findByTestId("ImportWallet__publicKey-input")).resolves.toBeVisible();

		const findAdressSpy = vi.spyOn(profile.wallets(), "findByPublicKey").mockReturnValue({} as any);

		await userEvent.clear(publicKeyInput());
		await userEvent.type(publicKeyInput(), randomPublicKey);

		await waitFor(() => expect(continueButton()).toBeDisabled());

		findAdressSpy.mockRestore();
	});
});
