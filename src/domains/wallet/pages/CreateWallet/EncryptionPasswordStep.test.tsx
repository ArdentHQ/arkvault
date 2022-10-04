/* eslint-disable @typescript-eslint/require-await */
import { BIP39 } from "@ardenthq/sdk-cryptography";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { CreateWallet } from "./CreateWallet";
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
let bip39GenerateMock: any;

const passphrase = "power return attend drink piece found tragic fire liar page disease combine";
const fixtureProfileId = getDefaultProfileId();
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
	});

	afterEach(() => {
		bip39GenerateMock.mockRestore();

		resetProfileNetworksMock();
	});

	it("should fail creating a wallet with encryption password", async () => {
		const history = createHashHistory();
		const createURL = `/profiles/${fixtureProfileId}/wallets/create`;
		history.push(createURL);

		render(
			<Route path="/profiles/:profileId/wallets/create">
				<CreateWallet />
			</Route>,
			{
				history,
				route: createURL,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const continueButton = screen.getByTestId("CreateWallet__continue-button");
		const backButton = screen.getByTestId("CreateWallet__back-button");

		const historySpy = vi.spyOn(history, "push").mockImplementation();

		expect(backButton).toBeEnabled();

		userEvent.click(backButton);

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${fixtureProfileId}/dashboard`);

		userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton).toBeEnabled());

		userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton).toBeDisabled());

		userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton).toBeEnabled());

		userEvent.click(continueButton);

		await waitFor(() => expect(profile.wallets().values()).toHaveLength(0));

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		userEvent.click(backButton);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		userEvent.click(continueButton);

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		userEvent.click(continueButton);

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		userEvent.click(backButton);

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("CreateWallet__encryption-toggle"));

		userEvent.click(continueButton);

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		const walletMnemonic = passphrase.split(" ");
		for (let index = 0; index < 3; index++) {
			const wordNumber = Number.parseInt(screen.getByText(/Select the/).innerHTML.replace(/Select the/, ""));

			userEvent.click(screen.getByText(walletMnemonic[wordNumber - 1]));
			if (index < 2) {
				await waitFor(() => expect(screen.queryAllByText(/The #(\d+) word/).length === 2 - index));
			}
		}
		await waitFor(() => expect(continueButton).toBeEnabled());

		userEvent.click(continueButton);

		//@ts-ignore
		const walletSpy = vi.spyOn(profile, "walletFactory").mockImplementation(() => ({
			fromMnemonicWithBIP39: () => Promise.reject(new Error("failed")),
		}));

		await expect(screen.findByTestId("EncryptPassword")).resolves.toBeVisible();

		const passwordInput = screen.getByTestId("PasswordValidation__encryptionPassword");
		const confirmPassword = screen.getByTestId("PasswordValidation__confirmEncryptionPassword");

		userEvent.paste(passwordInput, password);

		await waitFor(() => expect(passwordInput).toHaveValue(password));

		userEvent.paste(confirmPassword, password);

		await waitFor(() => expect(confirmPassword).toHaveValue(password));

		userEvent.click(screen.getByTestId("CreateWallet__continue-encryption-button"));

		await expect(screen.findByTestId("CreateWallet__SuccessStep")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("CreateWallet__finish-button"));

		await waitFor(() => expect(walletSpy).toHaveBeenCalledWith());
		walletSpy.mockRestore();
	});

	it("should create a wallet and use encryption password", async () => {
		const history = createHashHistory();
		const createURL = `/profiles/${fixtureProfileId}/wallets/create`;
		history.push(createURL);

		render(
			<Route path="/profiles/:profileId/wallets/create">
				<CreateWallet />
			</Route>,
			{
				history,
				route: createURL,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const continueButton = screen.getByTestId("CreateWallet__continue-button");
		const backButton = screen.getByTestId("CreateWallet__back-button");

		const historySpy = vi.spyOn(history, "push").mockImplementation();

		expect(backButton).toBeEnabled();

		userEvent.click(backButton);

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${fixtureProfileId}/dashboard`);

		userEvent.click(screen.getAllByTestId("NetworkOption")[0]);

		await waitFor(() => expect(continueButton).toBeEnabled());

		userEvent.click(screen.getAllByTestId("NetworkOption")[0]);

		await waitFor(() => expect(continueButton).toBeDisabled());

		userEvent.click(screen.getAllByTestId("NetworkOption")[0]);

		await waitFor(() => expect(continueButton).toBeEnabled());

		userEvent.click(continueButton);

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		userEvent.click(backButton);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		userEvent.click(continueButton);

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		userEvent.click(continueButton);

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		userEvent.click(backButton);

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("CreateWallet__encryption-toggle"));

		userEvent.click(continueButton);

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		const walletMnemonic = passphrase.split(" ");
		for (let index = 0; index < 3; index++) {
			const wordNumber = Number.parseInt(screen.getByText(/Select the/).innerHTML.replace(/Select the/, ""));

			userEvent.click(screen.getByText(walletMnemonic[wordNumber - 1]));
			if (index < 2) {
				await waitFor(() => expect(screen.queryAllByText(/The #(\d+) word/).length === 2 - index));
			}
		}
		await waitFor(() => expect(continueButton).toBeEnabled());

		userEvent.click(continueButton);

		const sampleWallet = profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[0],
			network: "ark.devnet",
		});

		//@ts-ignore
		const walletSpy = vi.spyOn(profile, "walletFactory").mockImplementation(() => ({
			fromMnemonicWithBIP39: () => Promise.resolve(sampleWallet),
		}));

		await expect(screen.findByTestId("EncryptPassword")).resolves.toBeVisible();

		const passwordInput = screen.getByTestId("PasswordValidation__encryptionPassword");
		const confirmPassword = screen.getByTestId("PasswordValidation__confirmEncryptionPassword");

		userEvent.paste(passwordInput, password);

		await waitFor(() => expect(passwordInput).toHaveValue(password));

		userEvent.paste(confirmPassword, password);

		await waitFor(() => expect(confirmPassword).toHaveValue(password));

		expect(profile.wallets().values()).toHaveLength(0);

		userEvent.click(screen.getByTestId("CreateWallet__continue-encryption-button"));

		await expect(screen.findByTestId("CreateWallet__SuccessStep")).resolves.toBeVisible();

		expect(profile.wallets().values()).toHaveLength(1);
		expect(walletSpy).toHaveBeenCalledWith();

		userEvent.click(screen.getByTestId("CreateWallet__finish-button"));

		const walletId = profile.wallets().first().id();

		await waitFor(() =>
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${fixtureProfileId}/wallets/${walletId}`),
		);

		historySpy.mockRestore();
	});
});
