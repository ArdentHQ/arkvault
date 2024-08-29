import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../wallet/e2e/common";
import { goToValidatorResignationPage } from "../e2e/common";

const translations = buildTranslations();
const sendButton = Selector("button").withText(translations.COMMON.SEND);

const preSteps = {
	"Given Alice has navigated to the validator resignation form for a wallet": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWallet(t, MNEMONICS[0], "Mainsail Test Wallet", "Mainsail Devnet");
		await goToValidatorResignationPage(t);
	},
};

cucumber(
	"@validatorResignation",
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
		mockRequest(
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api/transactions/f92c362054c2f559f990da1c48082ca96304b1e2162ca65078db4412ee3a7dc2",
			},
			{
				data: {},
			},
		),
		mockRequest("https://dwallets-evm.mainsailhq.com/api/wallets/DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr", {
			data: {
				address: "DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
				publicKey: "03d7001f0cfff639c0e458356581c919d5885868f14f72ba3be74c8f105cce34ac",
				balance: "37390000000",
				nonce: "6",
				attributes: {
					nonce: "6",
					balance: "37390000000",
					publicKey: "03d7001f0cfff639c0e458356581c919d5885868f14f72ba3be74c8f105cce34ac",
					validatorPublicKey:
						"af3e0e72eb49432d10143ac9f22184c147c64a9a1dd41cc83fbdb42c427341f0c094cd40ab61b16b630ee0e191403938",
					validatorVoteBalance: "0",
				},
				updated_at: "1006355",
			},
		}),
	],
);

cucumber(
	"@validatorResignation-invalidMnemonic",
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
				publicKey: "03d7001f0cfff639c0e458356581c919d5885868f14f72ba3be74c8f105cce34ac",
				balance: "37390000000",
				nonce: "6",
				attributes: {
					nonce: "6",
					balance: "37390000000",
					publicKey: "03d7001f0cfff639c0e458356581c919d5885868f14f72ba3be74c8f105cce34ac",
					validatorPublicKey:
						"af3e0e72eb49432d10143ac9f22184c147c64a9a1dd41cc83fbdb42c427341f0c094cd40ab61b16b630ee0e191403938",
					validatorVoteBalance: "0",
				},
				updated_at: "1006355",
			},
		}),
	],
);
