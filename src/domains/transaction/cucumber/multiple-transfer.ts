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
				"D7JJ4ZfkJDwDCwuwzhtbCFapBUCWU3HHGP",
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
				.expect(Selector("h1").withText(translations.TRANSACTION.SUCCESS.TITLE).exists)
				.ok({ timeout: 5000 });
		},
	},
	[
		mockRequest(
			{
				method: "POST",
				url: "https://ark-test.arkvault.io/api/transactions",
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
				url: "https://ark-test.arkvault.io/api/transactions/ee4af162f9744d6c1bb2be3b87a489bca98b621b2bd712bd03fce07bd9ae3521",
			},
			{
				data: {},
			},
		),
	],
);
cucumber(
	"@multipayTransaction-invalidMnemonic",
	{
		...preSteps,
		"When she attempts to send a multipay transaction with an invalid mnemonic": async (t: TestController) => {
			await t.click(Selector("span").withText(translations.TRANSACTION.MULTIPLE));
			await t.typeText(amountInput, "10", { replace: true });
			await t.typeText(recipientInput, "D7JJ4ZfkJDwDCwuwzhtbCFapBUCWU3HHGP", {
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
	},
	[
		mockRequest(
			{
				method: "POST",
				url: "https://ark-test.arkvault.io/api/transactions",
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
	],
);
cucumber("@multipayTransaction-notClearValues", {
	...preSteps,
	"When she enters multipay details in the transaction form": async (t: TestController) => {
		await t.click(Selector("span").withText(translations.TRANSACTION.MULTIPLE));
		await t.typeText(amountInput, "10", { replace: true });
		await t.typeText(recipientInput, "DReUcXWdCz2QLKzHM9NdZQE7fAwAyPwAmd", {
			paste: true,
		});
		await t.click(Selector("button").withText(translations.TRANSACTION.ADD_RECIPIENT));
		await t.typeText(recipientInput, "D7JJ4ZfkJDwDCwuwzhtbCFapBUCWU3HHGP", {
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
		await t.typeText(recipientInput, "DReUcXWdCz2QLKzHM9NdZQE7fAwAyPwAmd", {
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
