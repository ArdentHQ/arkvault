import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../portfolio/e2e/common";
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
