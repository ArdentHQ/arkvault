/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { SignMessage } from "./SignMessage";
import { translations as messageTranslations } from "@/domains/message/i18n";
import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	screen,
	waitFor,
	triggerMessageSignOnce,
} from "@/utils/testing-library";

const history = createHashHistory();

const walletUrl = (walletId: string) => `/profiles/${getDefaultProfileId()}/wallets/${walletId}/sign-message`;

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const mnemonic = MNEMONICS[0];

const continueButton = () => screen.getByTestId("SignMessage__continue-button");
const signButton = () => screen.getByTestId("SignMessage__sign-button");
const messageInput = () => screen.getByTestId("SignMessage__message-input");

const signMessage = "Hello World";

const expectHeading = async (text: string) => {
	await waitFor(() => {
		expect(screen.findByRole("heading", { name: text })).toBeDefined();
	});
};

describe("SignMessage with encrypted mnemonic & secret", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic,
			network: "ark.devnet",
		});

		profile.wallets().push(wallet);

		profile.coins().set("ARK", "ark.devnet");

		await triggerMessageSignOnce(wallet);
	});

	beforeEach(() => {
		history.push(walletUrl(wallet.id()));
	});

	it("should sign message with encrypted mnemonic", async () => {
		const encryptedWallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[5],
			network: "ark.devnet",
			password: "password",
		});

		profile.wallets().push(encryptedWallet);

		history.push(walletUrl(encryptedWallet.id()));

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/sign-message">
				<SignMessage />
			</Route>,
			{
				history,
				route: walletUrl(encryptedWallet.id()),
			},
		);

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		expect(
			screen.getByText(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_ENCRYPTION_PASSWORD),
		).toBeInTheDocument();

		await userEvent.type(messageInput(), signMessage);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(continueButton());

		await userEvent.type(screen.getByTestId("AuthenticationStep__encryption-password"), "password");

		await waitFor(() =>
			expect(screen.getByTestId("AuthenticationStep__encryption-password")).toHaveValue("password"),
		);

		await waitFor(() => expect(signButton()).toBeEnabled());

		await userEvent.click(signButton());

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.SUCCESS_STEP.TITLE);

		profile.wallets().forget(encryptedWallet.id());
	});

	it("should sign message with encrypted secret", async () => {
		const secret = "secret";

		const encryptedWallet = await profile.walletFactory().fromSecret({
			coin: "ARK",
			network: "ark.devnet",
			secret,
		});

		encryptedWallet.signingKey().set(secret, "password");

		encryptedWallet
			.data()
			.set(Contracts.WalletData.ImportMethod, Contracts.WalletImportMethod.SECRET_WITH_ENCRYPTION);

		profile.wallets().push(encryptedWallet);

		history.push(walletUrl(encryptedWallet.id()));

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/sign-message">
				<SignMessage />
			</Route>,
			{
				history,
				route: walletUrl(encryptedWallet.id()),
			},
		);

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

		expect(
			screen.getByText(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_ENCRYPTION_PASSWORD),
		).toBeInTheDocument();

		await userEvent.type(messageInput(), signMessage);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(continueButton());

		await userEvent.type(screen.getByTestId("AuthenticationStep__encryption-password"), "password");

		await waitFor(() =>
			expect(screen.getByTestId("AuthenticationStep__encryption-password")).toHaveValue("password"),
		);

		await waitFor(() => expect(signButton()).toBeEnabled());

		await userEvent.click(signButton());

		await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.SUCCESS_STEP.TITLE);

		profile.wallets().forget(encryptedWallet.id());
	});
});
