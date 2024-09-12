import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, mockMuSigRequest, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../wallet/e2e/common";
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
			await t.typeText(Selector("[data-testid=Input__memo]"), "test memo");
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
		mockMuSigRequest("https://ark-test-musig.arkvault.io", "store", {
			result: {
				id: "transaction-id",
			},
		}),
		mockRequest(
			{
				method: "GET",
				url: "https://ark-test.arkvault.io/api/transactions/7d0c8675796a7d14dcf6b06c170342c00dd5a75ef1abb9942164589e38c41c44",
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
		await t.typeText(Selector("[data-testid=Input__memo]"), "test memo");
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
