import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../wallet/e2e/common";
import { goToValidatorResignationPage } from "../e2e/common";

const translations = buildTranslations();
const sendButton = Selector("button").withText(translations.COMMON.SEND);

const validatorFormStep = {
	"Given Alice has navigated to the validator resignation form for a wallet": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWallet(t, MNEMONICS[0]);
		await goToValidatorResignationPage(t);
	},
};

cucumber(
	"@validatorResignation",
	{
		...validatorFormStep,
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
			"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&to=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6&address=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6,0xA46720D11Bc8408411Cbd45057EeDA6d32D2Af54,0x659A76be283644AEc2003aa8ba26485047fd1BFB",
			{},
		),
		mockRequest(
			{
				method: "POST",
				url: "https://dwallets-evm.mainsailhq.com/tx/api/transactions",
			},
			{
				data: {
					accept: [0],
					broadcast: [0],
					excess: [],
					invalid: [],
				},
			},
		),
		mockRequest("https://dwallets-evm.mainsailhq.com/api/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB", {
			data: {
				address: "0x659A76be283644AEc2003aa8ba26485047fd1BFB",
				publicKey: "027b320c5429334ecf846122492d12b898a756bf1347aa61f7bf1dcd706315a9fb",
				balance: "860689411509380000000000",
				nonce: "0",
				attributes: {
					vote: "0xe5a97E663158dEaF3b65bBF88897b8359Dc19F81",
					isLegacy: true,
					username: "genesis_31",
					validatorFee: "0",
					validatorRank: 1,
					validatorApproval: 0.0081,
					validatorResigned: false,
					validatorLastBlock: {
						hash: "f564b7592a73cc5789343c8cd66a880228b5f47a2941bd4b77cb7bf40c5720a5",
						number: 21713937,
						timestamp: 1752583636382,
					},
					validatorPublicKey:
						"91ff20e1aee92c4e6febc1f7e1e55355d182812536055afb6a1bab300387580707bc0536e9d994e84fe58be8513e2550",
					validatorForgedFees: "2205000000000000",
					validatorForgedTotal: "2205000000000000",
					validatorVoteBalance: "1367063918905780000000000",
					validatorVotersCount: 22,
					validatorProducedBlocks: 1031,
				},
				updated_at: "21713937",
			},
		}),
		mockRequest(
			"https://dwallets-evm.mainsailhq.com/api/transactions/4dd6a4fc8b9fa0a1d46da59802098522bca849038311711b0f07d8dbf4ffc600",
			{
				data: {
					blockHash: "05b124023ddd656c8a95664eb61846cc0f4e204341a0d86db325771077e7f002",
					confirmations: 1,
					data: "0x602a9eee0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003094187d07633373e2621d03d18d5e07df2aa0f15a611de28b05381d212f1a7cce2fef8c3629bdb1b9678ce309e264330b00000000000000000000000000000000",
					gas: "300000",
					gasPrice: "5000000000",
					from: "0x659A76be283644AEc2003aa8ba26485047fd1BFB",
					hash: "4dd6a4fc8b9fa0a1d46da59802098522bca849038311711b0f07d8dbf4ffc600",
					nonce: "3",
					senderPublicKey: "0311b11b0dea8851d49af7c673d7032e37ee12307f9bbd379b64bbdac6ca302e84",
					signature:
						"cd1b35240b0c1303392e4dc3e1fc83b9da7b74e5c96b99d1ae207c7c9d5480d868ecf4235298c6438f9c0ea9a8274082ebf051d86ff353ae1fb4fffe86cad91101",
					to: "0x535B3D7A252fa034Ed71F0C53ec0C6F784cB64E1",
					value: "0",
					timestamp: "1752502567204",
					receipt: {
						gasRefunded: 0,
						gasUsed: 21000,
						status: 1,
					},
				},
			},
		),
		mockRequest(
			"https://dwallets-evm.mainsailhq.com/api/blocks/05b124023ddd656c8a95664eb61846cc0f4e204341a0d86db325771077e7f002",
			{},
		),
	],
);
cucumber(
	"@validatorResignation-invalidMnemonic",
	{
		...validatorFormStep,
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
			"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&to=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6&address=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6,0xA46720D11Bc8408411Cbd45057EeDA6d32D2Af54,0x659A76be283644AEc2003aa8ba26485047fd1BFB",
			{},
		),
		mockRequest("https://dwallets-evm.mainsailhq.com/api/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB", {
			data: {
				address: "0x659A76be283644AEc2003aa8ba26485047fd1BFB",
				publicKey: "027b320c5429334ecf846122492d12b898a756bf1347aa61f7bf1dcd706315a9fb",
				balance: "860689411509380000000000",
				nonce: "0",
				attributes: {
					vote: "0xe5a97E663158dEaF3b65bBF88897b8359Dc19F81",
					isLegacy: true,
					username: "genesis_31",
					validatorFee: "0",
					validatorRank: 1,
					validatorApproval: 0.0081,
					validatorResigned: false,
					validatorLastBlock: {
						hash: "f564b7592a73cc5789343c8cd66a880228b5f47a2941bd4b77cb7bf40c5720a5",
						number: 21713937,
						timestamp: 1752583636382,
					},
					validatorPublicKey:
						"91ff20e1aee92c4e6febc1f7e1e55355d182812536055afb6a1bab300387580707bc0536e9d994e84fe58be8513e2550",
					validatorForgedFees: "2205000000000000",
					validatorForgedTotal: "2205000000000000",
					validatorVoteBalance: "1367063918905780000000000",
					validatorVotersCount: 22,
					validatorProducedBlocks: 1031,
				},
				updated_at: "21713937",
			},
		}),
	],
);
