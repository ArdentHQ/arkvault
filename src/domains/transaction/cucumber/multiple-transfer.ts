import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../wallet/e2e/common";
import { goToTransferPage } from "../e2e/common";

const translations = buildTranslations();
const sendButton = Selector("button").withText(translations.COMMON.SEND);
const recipientInput = Selector("[data-testid=SelectDropdown__input]").nth(0);
const amountInput = Selector("[data-testid=AddRecipient__amount]");

const preSteps = {
	"Given Alice is signed into a profile with an imported wallet": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWallet(t, MNEMONICS[0]);
	},
	"And has navigated to the transfer page": async (t: TestController) => {
		await goToTransferPage(t);
	},
};

cucumber(
	"@multipayTransaction",
	{
		...preSteps,
		"When she attempts to send a multipay transaction with a valid mnemonic": async (t: TestController) => {
			await t.click(Selector("span").withText(translations.TRANSACTION.MULTIPLE));
			await t.typeText(amountInput, "10", { replace: true });
			await t.typeText(
				Selector("[data-testid=SelectDropdown__input]").nth(0),
				"0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
				{
					paste: true,
				},
			);
			await t.pressKey("tab");
			await t.pressKey("enter");
			await t.click(Selector("button").withText(translations.TRANSACTION.ADD_RECIPIENT));
			await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).notOk();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.expect(Selector("h1").withText(translations.TRANSACTION.REVIEW_STEP.TITLE).exists).ok();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.typeText(Selector("[data-testid=AuthenticationStep__mnemonic]"), MNEMONICS[0], { replace: true });
			await t.click(Selector("[data-testid=StepNavigation__send-button"));
		},
		"Then the transaction is sent successfully": async (t: TestController) => {
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
				url: "https://dwallets-evm.mainsailhq.com/api/transactions/76a164b1c07d5ecde843c12c78576cc34f92dcd44ed2efa0834c1f956c44ea8d",
			},
			{
				data: {
					blockHash: "05b124023ddd656c8a95664eb61846cc0f4e204341a0d86db325771077e7f002",
					confirmations: 1,
					data: "",
					from: "0x659A76be283644AEc2003aa8ba26485047fd1BFB",
					gas: "21000",
					gasPrice: "100000000000",
					hash: "76a164b1c07d5ecde843c12c78576cc34f92dcd44ed2efa0834c1f956c44ea8d",
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
cucumber("@multipayTransaction-invalidMnemonic", {
	...preSteps,
	"When she attempts to send a multipay transaction with an invalid mnemonic": async (t: TestController) => {
		await t.click(Selector("span").withText(translations.TRANSACTION.MULTIPLE));
		await t.typeText(amountInput, "10", { replace: true });
		await t.typeText(recipientInput, "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6", {
			paste: true,
		});
		await t.pressKey("tab");
		await t.pressKey("enter");
		await t.click(Selector("button").withText(translations.TRANSACTION.ADD_RECIPIENT));
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).notOk();
		await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
		await t.expect(Selector("h1").withText(translations.TRANSACTION.REVIEW_STEP.TITLE).exists).ok();
		await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
		await t.typeText(Selector("[data-testid=AuthenticationStep__mnemonic]"), "wrong mnemonic", {
			replace: true,
		});
		await t.click(Selector("[data-testid=StepNavigation__send-button"));
	},
	"Then an error is displayed on the mnemonic field": async (t: TestController) => {
		await t.expect(Selector("[data-testid=AuthenticationStep__mnemonic]").hasAttribute("aria-invalid")).ok();
	},
	"And the send button is disabled": async (t: TestController) => {
		await t.expect(sendButton.hasAttribute("disabled")).ok();
	},
});
cucumber("@multipayTransaction-notClearValues", {
	...preSteps,
	"When she enters multipay details in the transaction form": async (t: TestController) => {
		await t.click(Selector("span").withText(translations.TRANSACTION.MULTIPLE));
		await t.typeText(amountInput, "10", { replace: true });
		await t.typeText(recipientInput, "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6", {
			paste: true,
		});
		await t.click(Selector("button").withText(translations.TRANSACTION.ADD_RECIPIENT));
		await t.typeText(recipientInput, "0xA46720D11Bc8408411Cbd45057EeDA6d32D2Af54", {
			paste: true,
			replace: true,
		});
		await t.typeText(amountInput, "10", { replace: true });

		await t.click(Selector("button").withText(translations.TRANSACTION.ADD_RECIPIENT));
	},
	"And navigates to page 2": async (t: TestController) => {
		await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
		await t.expect(Selector("h1").withText(translations.TRANSACTION.REVIEW_STEP.TITLE).exists).ok();
	},
	"And navigates back to page 1": async (t: TestController) => {
		await t.click(Selector("button").withText(translations.COMMON.BACK));
	},
	"Then all added transaction details should remain": async (t: TestController) => {
		await t.expect(Selector("span").withText(translations.TRANSACTION.MULTIPLE).exists).ok();
		await t.expect(Selector("[data-testid=AddRecipientItem]").count).eql(2);
	},
});
cucumber("@multipayTransaction-singleField", {
	...preSteps,
	"When she enters details into the single transaction form": async (t: TestController) => {
		await t.typeText(amountInput, "10", { replace: true });
		await t.typeText(recipientInput, "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6", {
			paste: true,
		});

		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).notOk();
	},
	"And selects the multiple toggle": async (t: TestController) => {
		await t.click(Selector("span").withText(translations.TRANSACTION.MULTIPLE));
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();
	},
	"Then the add recipient button needs be selected to advance to the next page": async (t: TestController) => {
		await t.click(Selector("button").withText(translations.TRANSACTION.ADD_RECIPIENT));
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).notOk();
	},
});
