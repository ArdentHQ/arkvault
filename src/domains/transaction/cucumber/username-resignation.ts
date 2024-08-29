import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../wallet/e2e/common";
import { goToUsernameResignationPage } from "../e2e/common";

const translations = buildTranslations();
const sendButton = Selector("button").withText(translations.COMMON.SEND);

const preSteps = {
	"Given Alice has navigated to the username resignation form for a wallet": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWallet(t, MNEMONICS[0], "Mainsail Test Wallet", "Mainsail Devnet");
		await goToUsernameResignationPage(t);
	},
};

cucumber(
	"@usernameResignation",
	{
		...preSteps,
		"When she completes the process with a valid mnemonic": async (t: TestController) => {
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.typeText(Selector("[data-testid=AuthenticationStep__mnemonic]"), MNEMONICS[0], { replace: true });
			await t.expect(Selector("[data-testid=AuthenticationStep__mnemonic]").hasAttribute("aria-invalid")).notOk();
			await t.expect(sendButton.hasAttribute("disabled")).notOk();
			await t.click(sendButton);
		},
		"Then the transaction is sent successfully": async (t: TestController) => {
			await t.expect(Selector("[data-testid=TransactionSuccessful]").exists).ok({ timeout: 5000 });
		},
	},
	[
		mockRequest(
			{
				method: "POST",
				url: "https://dwallets-evm.mainsailhq.com/tx/api/transactions",
			},
			{
				data: {
					accept: ["transaction-id"],
					broadcast: ["transaction-id"],
					excess: [],
					invalid: [],
				},
			},
		),
		mockRequest("https://dwallets-evm.mainsailhq.com/api/wallets/DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr", {
			data: {
				address: "DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
				attributes: {
					username: "testwallet",
				},
				balance: "10000000000",
				isDelegate: true,
				isResigned: false,
				nonce: "1",
				publicKey: "03d3fdad9c5b25bf8880e6b519eb3611a5c0b31adebc8455f0e096175b28321aff",
			},
		}),
		mockRequest(
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api/transactions/9fad315c27412ce529575fb50f11383a482d0258c22772d653736fd1a880d346",
			},
			{
				data: {
					address: "DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
					publicKey: "03d7001f0cfff639c0e458356581c919d5885868f14f72ba3be74c8f105cce34ac",
					balance: "45000000000",
					nonce: "2",
					attributes: {
						nonce: "2",
						balance: "10000000000",
						publicKey: "03d7001f0cfff639c0e458356581c919d5885868f14f72ba3be74c8f105cce34ac",
					},
					updated_at: "987836",
				},
			},
		),
	],
);
cucumber(
	"@usernameResignation-invalidMnemonic",
	{
		...preSteps,
		"When she attempts to complete the process with an invalid mnemonic": async (t: TestController) => {
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.typeText(Selector("[data-testid=AuthenticationStep__mnemonic]"), "wrong mnemonic", {
				replace: true,
			});
			await t.expect(Selector("[data-testid=AuthenticationStep__mnemonic]").hasAttribute("aria-invalid")).ok();
		},
		"Then an error is displayed on the mnemonic field": async (t: TestController) => {
			await t.expect(Selector('[data-testid="Input__error"]').exists).ok();
		},
		"And the send button is disabled": async (t: TestController) => {
			await t.expect(sendButton.hasAttribute("disabled")).ok();
		},
	},
	[
		mockRequest(
			{
				method: "POST",
				url: "https://dwallets-evm.mainsailhq.com/tx/api/transactions",
			},
			{
				data: {
					accept: ["transaction-id"],
					broadcast: ["transaction-id"],
					excess: [],
					invalid: [],
				},
			},
		),
		mockRequest("https://dwallets-evm.mainsailhq.com/api/wallets/DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr", {
			data: {
				address: "DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
				attributes: {
					username: "testwallet",
				},
				balance: "10000000000",
				isDelegate: true,
				isResigned: false,
				nonce: "1",
				publicKey: "03d3fdad9c5b25bf8880e6b519eb3611a5c0b31adebc8455f0e096175b28321aff",
			},
		}),
	],
);
