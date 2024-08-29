import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../wallet/e2e/common";
import { goToUsernameRegistrationPage } from "../e2e/common";

const translations = buildTranslations();

const preSteps = {
	"Given Alice has navigated to the username registration form for a wallet": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWallet(t, MNEMONICS[0], "Mainsail Test Wallet", "Mainsail Devnet");
		await goToUsernameRegistrationPage(t);
	},
};
cucumber(
	"@usernameRegistration",
	{
		...preSteps,
		"When she enters valid username": async (t: TestController) => {
			await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
			await t.typeText(Selector("[data-testid=Input__username]"), "test_username");

			await t
				.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled"))
				.notOk({ timeout: 5000 });
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));

			await t.expect(Selector("h1").withText(translations.TRANSACTION.REVIEW_STEP.TITLE).exists).ok();
			await t.expect(Selector("[data-testid=TransactionDetail]").withText("test_username").exists).ok();

			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
		},
		"And sends the username registration transaction": async (t: TestController) => {
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
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api/wallets/test_username",
			},
			{
				data: {},
			},
			404,
		),
		mockRequest(
			{
				method: "POST",
				url: "https://dwallets-evm.mainsailhq.com/tx/api/transactions",
			},
			{
				data: {
					accept: ["9fe946a99190e93ddb7d5defc183db8f65502b89957f6f4d9ae05fd394cbd01f"],
					broadcast: ["9fe946a99190e93ddb7d5defc183db8f65502b89957f6f4d9ae05fd394cbd01f"],
					excess: [],
					invalid: [],
				},
			},
		),
		mockRequest(
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api/transactions/9fe946a99190e93ddb7d5defc183db8f65502b89957f6f4d9ae05fd394cbd01f",
			},
			{
				data: {},
			},
		),
	],
);

cucumber("@usernameRegistration-invalidName", {
	...preSteps,
	"When she enters an invalid username": async (t: TestController) => {
		await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
		await t.typeText(Selector("[data-testid=Input__username]"), "TEST___DELEGATE");
	},
	"Then an error is displayed on the name field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok();
	},
	"And the continue button is disabled": async (t: TestController) => {
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();
	},
});

cucumber(
	"@usernameRegistration-occupied",
	{
		...preSteps,
		"When she enters an occupied username": async (t: TestController) => {
			await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
			await t.typeText(Selector("[data-testid=Input__username]"), "occupied_username");
		},
		"Then an error is displayed on the name field": async (t: TestController) => {
			await t.expect(Selector('[data-testid="Input__error"]').exists).ok();
		},
		"And the continue button is disabled": async (t: TestController) => {
			await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();
		},
	},
	[
		mockRequest(
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api/wallets/occupied_username",
			},
			{
				data: {},
			},
			200,
		),
	],
);
