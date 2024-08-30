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

// cucumber(
// 	"@usernameResignation",
// 	{
// 		...preSteps,
// 		"When she completes the process with a valid mnemonic": async (t: TestController) => {
// 			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
// 			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
// 			await t.typeText(Selector("[data-testid=AuthenticationStep__mnemonic]"), MNEMONICS[0], { replace: true });
// 			await t.expect(Selector("[data-testid=AuthenticationStep__mnemonic]").hasAttribute("aria-invalid")).notOk();
// 			await t.expect(sendButton.hasAttribute("disabled")).notOk();
// 			await t.click(sendButton);
// 		},
// 		"Then the transaction is sent successfully": async (t: TestController) => {
// 			await t.expect(Selector("[data-testid=TransactionSuccessful]").exists).ok({ timeout: 5000 });
// 		},
// 	},
// 	[
// 		mockRequest(
// 			{
// 				method: "POST",
// 				url: "https://dwallets-evm.mainsailhq.com/tx/api/transactions",
// 			},
// 			{
// 				data: {
// 					accept: ["transaction-id"],
// 					broadcast: ["transaction-id"],
// 					excess: [],
// 					invalid: [],
// 				},
// 			},
// 		),
// 		mockRequest("https://dwallets-evm.mainsailhq.com/api/wallets/DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr", {
// 			data: {
// 				address: "DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
// 				attributes: {
// 					username: "testwallet",
// 				},
// 				balance: "10000000000",
// 				isDelegate: true,
// 				isResigned: false,
// 				nonce: "1",
// 				publicKey: "03d3fdad9c5b25bf8880e6b519eb3611a5c0b31adebc8455f0e096175b28321aff",
// 			},
// 		}),
// 		mockRequest(
// 			{
// 				method: "GET",
// 				url: "https://dwallets-evm.mainsailhq.com/api/transactions/9fad315c27412ce529575fb50f11383a482d0258c22772d653736fd1a880d346",
// 			},
// 			{
// 				data: {
// 					address: "DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
// 					publicKey: "03d7001f0cfff639c0e458356581c919d5885868f14f72ba3be74c8f105cce34ac",
// 					balance: "45000000000",
// 					nonce: "2",
// 					attributes: {
// 						nonce: "2",
// 						balance: "10000000000",
// 						publicKey: "03d7001f0cfff639c0e458356581c919d5885868f14f72ba3be74c8f105cce34ac",
// 					},
// 					updated_at: "987836",
// 				},
// 			},
// 		),
// 	],
// );
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
		mockRequest("https://dwallets-evm.mainsailhq.com/api/wallets/0xfEAf2f24ba1205e9255d015DFaD8463c70D9A466", {
			data: {
				address: "0xfEAf2f24ba1205e9255d015DFaD8463c70D9A466",
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
		mockRequest("https://dwallets-evm.mainsailhq.com/api/wallets/0xDC0A21aF27FeB1b7e0f2e519288445c0510Cb23C", {
			data: {
				address: "0xDC0A21aF27FeB1b7e0f2e519288445c0510Cb23C",
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
				url: "https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=20&senderId=0xDC0A21aF27FeB1b7e0f2e519288445c0510Cb23C",
			},
			{
				"meta": {
					"totalCountIsEstimate": true,
					"count": 11,
					"first": "/transactions?page=1&limit=20&senderId=0xfEAf2f24ba1205e9255d015DFaD8463c70D9A466&orderBy=timestamp%3Adesc&orderBy=sequence%3Adesc&transform=true",
					"last": "/transactions?page=1&limit=20&senderId=0xfEAf2f24ba1205e9255d015DFaD8463c70D9A466&orderBy=timestamp%3Adesc&orderBy=sequence%3Adesc&transform=true",
					"next": null,
					"pageCount": 1,
					"previous": null,
					"self": "/transactions?page=1&limit=20&senderId=0xfEAf2f24ba1205e9255d015DFaD8463c70D9A466&orderBy=timestamp%3Adesc&orderBy=sequence%3Adesc&transform=true",
					"totalCount": 11
				},
				"data": [
					{
						"amount": "50000000000",
						"asset": null,
						"blockId": "fac05ca1abb0a651484b9664de434b2b5e2a25677c8744b091ab369b56623813",
						"confirmations": 15_745,
						"fee": "10000000",
						"id": "587580ac3a6a16f716159b27565f2fcca6564e7ba0a6d9a7cfdbf11be3aae2e9",
						"nonce": "11",
						"recipient": "0x57Dc55AED392F634d6bea6E6A89718de7f5fA7e0",
						"senderPublicKey": "03f25455408f9a7e6c6a056b121e68fbda98f3511d22e9ef27b0ebaf1ef9e4eabc",
						"signature": "8df8c644c575452e296e3829e9168127ad332f3b01491607fe644cc4838384fd4faabb9bae1256b8a577f386cec46f3cdd39c160132237ece069e66dd71eab59",
						"signatures": null,
						"timestamp": 1_724_887_512_575,
						"type": 0,
						"typeGroup": 1,
						"vendorField": null,
						"version": 1
					},
				]
			}
		),
	],
);
