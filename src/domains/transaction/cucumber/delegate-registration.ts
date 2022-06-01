import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../wallet/e2e/common";
import { goToDelegateRegistrationPage } from "../e2e/common";

const translations = buildTranslations();

const preSteps = {
	"Given Alice has navigated to the delegate registration form for a wallet": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWallet(t, MNEMONICS[0]);
		await goToDelegateRegistrationPage(t);
	},
};
cucumber(
	"@delegateRegistration",
	{
		...preSteps,
		"When she enters valid delegate name": async (t: TestController) => {
			await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
			await t.typeText(Selector("[data-testid=Input__username]"), "test_delegate");
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.expect(Selector("[data-testid=TransactionDetail]").withText("test_delegate").exists).ok();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
		},
		"And sends the delegate registration transaction": async (t: TestController) => {
			await t.expect(Selector("h1").withText(translations.TRANSACTION.AUTHENTICATION_STEP.TITLE).exists).ok();
			await t.typeText(Selector("[data-testid=AuthenticationStep__mnemonic]"), MNEMONICS[0]);
			await t.expect(Selector("[data-testid=AuthenticationStep__mnemonic]").hasAttribute("aria-invalid")).notOk();
			const sendButton = Selector("button").withText(translations.COMMON.SEND);
			await t.expect(sendButton.hasAttribute("disabled")).notOk();
			await t.click(sendButton);
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
				url: "https://ark-test.payvo.com/api/transactions",
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
cucumber("@delegateRegistration-invalidName", {
	...preSteps,
	"When she enters an invalid delegate name": async (t: TestController) => {
		await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
		await t.typeText(Selector("[data-testid=Input__username]"), "TEST DELEGATE");
	},
	"Then an error is displayed on the name field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok();
	},
	"And the continue button is disabled": async (t: TestController) => {
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();
	},
});
cucumber("@delegateRegistration-nameLength", {
	...preSteps,
	"When she enters a delegate name that exceeds the character limit": async (t: TestController) => {
		await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
		await t.typeText(Selector("[data-testid=Input__username]"), "123456789012345678901");
	},
	"Then an error is displayed on the name field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok();
	},
	"And the continue button is disabled": async (t: TestController) => {
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();
	},
});
