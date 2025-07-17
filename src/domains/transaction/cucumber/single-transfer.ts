import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../portfolio/e2e/common";
import { goToTransferPage } from "../e2e/common";

const translations = buildTranslations();
const sendButton = Selector("button").withText(translations.COMMON.SEND);

const preSteps = {
	"Given Alice is on the transaction form": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWallet(t, MNEMONICS[0]);
		await goToTransferPage(t);
	},
};
cucumber(
	"@singleTransfer",
	{
		...preSteps,
		"When she completes the single transfer process with a valid mnemonic": async (t: TestController) => {
			await t.click(Selector("[data-testid=SelectRecipient__select-recipient]"));
			await t.expect(Selector("[data-testid=Modal__inner]").exists).ok();
			await t.click(Selector("[data-testid=RecipientListItem__select-button-0]"));
			await t.click(Selector("[data-testid=AddRecipient__send-all]"));
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.expect(Selector("h1").withText(translations.TRANSACTION.REVIEW_STEP.TITLE).exists).ok();
			await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).notOk();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.expect(Selector("[data-testid=AuthenticationStep__mnemonic]").exists).ok({ timeout: 4000 });
			await t.typeText(Selector("[data-testid=AuthenticationStep__mnemonic]"), MNEMONICS[0], { replace: true });
			await t.click(Selector("[data-testid=StepNavigation__send-button"));
		},
		"Then the transaction is successfully sent": async (t: TestController) => {
			await t
				.expect(Selector("h1").withText(translations.TRANSACTION.SUCCESS.CONFIRMED).exists)
				.ok({ timeout: 5000 });
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
		mockRequest(
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api/transactions/9aaafb2ac44519defcaae64e27b0d71f383d3414ab30dcc3b64671b0632b958a",
			},
			{
				data: {
					blockHash: "05b124023ddd656c8a95664eb61846cc0f4e204341a0d86db325771077e7f002",
					confirmations: 1,
					data: "",
					from: "0x659A76be283644AEc2003aa8ba26485047fd1BFB",
					gas: "21000",
					gasPrice: "100000000000",
					hash: "9aaafb2ac44519defcaae64e27b0d71f383d3414ab30dcc3b64671b0632b958a",
					nonce: "3",
					senderPublicKey: "0311b11b0dea8851d49af7c673d7032e37ee12307f9bbd379b64bbdac6ca302e84",
					signature:
						"cd1b35240b0c1303392e4dc3e1fc83b9da7b74e5c96b99d1ae207c7c9d5480d868ecf4235298c6438f9c0ea9a8274082ebf051d86ff353ae1fb4fffe86cad91101",
					to: "0x47ea9bAa16edd859C1792933556c4659A647749C",
					value: "2000000000000000000",
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
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api/blocks/05b124023ddd656c8a95664eb61846cc0f4e204341a0d86db325771077e7f002",
			},
			{},
		),
		mockRequest(
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=20&from=0x659A76be283644AEc2003aa8ba26485047fd1BFB",
			},
			{
				data: {},
			},
		),
	],
);
cucumber("@singleTransfer-invalidMnemonic", {
	...preSteps,
	"When she completes the single transfer process with an invalid mnemonic": async (t: TestController) => {
		await t.click(Selector("[data-testid=SelectRecipient__select-recipient]"));
		await t.expect(Selector("[data-testid=Modal__inner]").exists).ok();
		await t.click(Selector("[data-testid=RecipientListItem__select-button-0]"));
		await t.click(Selector("[data-testid=AddRecipient__send-all]"));
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).notOk();
		await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
		await t.expect(Selector("h1").withText(translations.TRANSACTION.REVIEW_STEP.TITLE).exists).ok();
		await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
		await t.typeText(Selector("[data-testid=AuthenticationStep__mnemonic]"), "wrong mnemonic", { replace: true });
	},
	"Then an error is displayed on the mnemonic field": async (t: TestController) => {
		await t.click(Selector("[data-testid=StepNavigation__send-button"));
		await t.expect(Selector("[data-testid=AuthenticationStep__mnemonic]").hasAttribute("aria-invalid")).ok();
	},
	"And the send button is disabled": async (t: TestController) => {
		await t.expect(sendButton.hasAttribute("disabled")).ok();
	},
});
