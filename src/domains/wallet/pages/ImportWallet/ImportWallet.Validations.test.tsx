/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { ImportWallet } from "./ImportWallet";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { toasts } from "@/app/services";
import { translations as walletTranslations } from "@/domains/wallet/i18n";
import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	screen,
	waitFor,
	within,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;
const fixtureProfileId = getDefaultProfileId();

const randomAddress = "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib";

const route = `/profiles/${fixtureProfileId}/wallets/import`;

const enableEncryptionToggle = () => userEvent.click(screen.getByTestId("ImportWallet__encryption-toggle"));
const continueButton = () => screen.getByTestId("ImportWallet__continue-button");
const mnemonicInput = () => screen.getByTestId("ImportWallet__mnemonic-input");
const addressInput = () => screen.findByTestId("ImportWallet__address-input");
const successStep = () => screen.getByTestId("ImportWallet__success-step");
const methodStep = () => screen.getByTestId("ImportWallet__method-step");

const secretInputID = "ImportWallet__secret-input";
const errorText = "data-errortext";
const testNetwork = "ark.devnet";

describe("ImportWallet Validations", () => {
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

	it("should prompt for mnemonic if user enters bip39 compliant secret", async () => {
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

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.SECRET));

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByTestId(secretInputID)).resolves.toBeVisible();
		const passphraseInput = screen.getByTestId(secretInputID);

		expect(passphraseInput).toBeInTheDocument();

		await userEvent.clear(passphraseInput);
		await userEvent.type(passphraseInput, MNEMONICS[0]);

		await waitFor(() => expect(continueButton()).not.toBeEnabled());
	});

	// @TODO: Fix this test
	/* it("should show an error message for invalid second secret", async () => {
		const walletId = profile
			.wallets()
			.findByAddressWithNetwork("DNTwQTSp999ezQ425utBsWetcmzDuCn2pN", testNetwork)
			?.id();
		if (walletId) {
			profile.wallets().forget(walletId);
		}

		const wallet = await profile.walletFactory().fromSecret({
			coin: "ARK",
			network: "ark.devnet",
			secret: "abc",
		});

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

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.SECRET));

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByTestId(secretInputID)).resolves.toBeVisible();

		const passphraseInput = screen.getByTestId(secretInputID);

		expect(passphraseInput).toBeInTheDocument();

		await userEvent.clear(passphraseInput);
		await userEvent.type(passphraseInput, "abc");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		enableEncryptionToggle();

		userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});

		const fromSecretMock = vi.spyOn(wallet.coin().address(), "fromSecret").mockImplementationOnce(() => {
			throw new Error("test");
		});

		await userEvent.clear(screen.getByTestId("EncryptPassword__second-secret"));
		await userEvent.type(screen.getByTestId("EncryptPassword__second-secret"), "invalid second secret");

		await waitFor(() => {
			expect(screen.getAllByTestId("Input__error")[0]).toHaveAttribute(
				errorText,
				walletTranslations.PAGE_IMPORT_WALLET.VALIDATION.INVALID_SECRET,
			);
		});

		fromSecretMock.mockRestore();
	}); */

	it("should show an error message for duplicate address when importing by mnemonic", async () => {
		const generated = await profile.walletFactory().generate({
			coin: "ARK",
			network: testNetwork,
		});

		profile.wallets().push(generated.wallet);

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

		const randomNewAddress = "D6pPxYLwwCptuhVRvLQQYXEQiQMB5x6iY3";

		const wallet = await emptyProfile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[1],
			network: testNetwork,
		});

		wallet.settings().set(Contracts.WalletSetting.Alias, "My wallet");

		profile.wallets().push(wallet);

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
		await userEvent.type(await addressInput(), randomNewAddress);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		const alias = "My Wallet";

		userEvent.click(screen.getByTestId("ImportWallet__edit-alias"));

		await expect(screen.findByTestId("UpdateWalletName__input")).resolves.toBeVisible();

		// Test cancel button
		userEvent.click(screen.getByTestId("UpdateWalletName__cancel"));
		await waitFor(() => {
			expect(screen.queryByTestId("UpdateWalletName__input")).toBeNull();
		});

		// Try to edit name again
		userEvent.click(screen.getByTestId("ImportWallet__edit-alias"));
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

	it("should show warning sync error toast in network step and retry sync", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<>
					<ToastContainer closeOnClick={false} newestOnTop />
					<ImportWallet />
				</>
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		const coin = profile.coins().get("ARK", testNetwork);
		const coinMock = vi.spyOn(coin, "__construct").mockImplementationOnce(() => {
			throw new Error("test");
		});

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await expect(screen.findByTestId("SyncErrorMessage__retry")).resolves.toBeVisible();

		const toastDismissMock = vi.spyOn(toasts, "dismiss").mockResolvedValue(undefined);
		userEvent.click(within(screen.getByTestId("SyncErrorMessage__retry")).getByRole("link"));

		await expect(screen.findByTestId("SyncErrorMessage__retry")).resolves.toBeVisible();

		coinMock.mockRestore();
		toastDismissMock.mockRestore();
	});
});
