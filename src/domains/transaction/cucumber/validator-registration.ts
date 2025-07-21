import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../portfolio/e2e/common";
import { goToValidatorRegistrationPage } from "../e2e/common";

const translations = buildTranslations();

const preSteps = {
	"Given Alice has navigated to the validator registration form for a wallet": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWallet(t, MNEMONICS[0]);
		await goToValidatorRegistrationPage(t);
	},
};
cucumber(
	"@validatorRegistration",
	{
		...preSteps,
		"When she enters valid public key": async (t: TestController) => {
			await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
			await t.typeText(
				Selector("[data-testid=Input__validator_public_key]"),
				"b387dc09d41dc443a0bb972f5bcce2b06620e2f1711a0596e96275c5ab38d4c85ccbe2d5f92d6f02dee4853acf1a14d9",
				{ replace: true },
			);
			await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).notOk();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t
				.expect(
					Selector("[data-testid=DetailWrapper]").withText(
						"b387dc09d41dc443a0bb972f5bcce2b06620e2f1711a0596e96275c5ab38d4c85ccbe2d5f92d6f02dee4853acf1a14d9",
					).exists,
				)
				.ok();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
		},
		"And sends the validator registration transaction": async (t: TestController) => {
			await t.expect(Selector("h1").withText(translations.TRANSACTION.AUTHENTICATION_STEP.TITLE).exists).ok();
			await t.typeText(Selector("[data-testid=AuthenticationStep__mnemonic]"), MNEMONICS[0]);
			await t.expect(Selector("[data-testid=AuthenticationStep__mnemonic]").hasAttribute("aria-invalid")).notOk();
			const sendButton = Selector("button").withText(translations.COMMON.SEND);
			await t.expect(sendButton.hasAttribute("disabled")).notOk();
			await t.click(sendButton);
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
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api?attributes.validatorPublicKey=b387dc09d41dc443a0bb972f5bcce2b06620e2f1711a0596e96275c5ab38d4c85ccbe2d5f92d6f02dee4853acf1a14d9",
			},
			{},
			404,
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
	],
);

cucumber("@validatorRegistration-invalidName", {
	...preSteps,
	"When she enters an invalid public key": async (t: TestController) => {
		await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
		await t.typeText(Selector("[data-testid=Input__validator_public_key]"), "TEST KEY");
	},
	"Then an error is displayed on the name field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok();
	},
	"And the continue button is disabled": async (t: TestController) => {
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();
	},
});

cucumber(
	"@validatorRegistration-usedPublicKey",
	{
		...preSteps,
		"When she enters a public key that already used": async (t: TestController) => {
			await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
			await t.typeText(
				Selector("[data-testid=Input__validator_public_key]"),
				"d387dc09d41dc443a0bb972f5bcce2b06620e2f1711a0596e96275c5ab38d4c85ccbe2d5f92d6f02dee4853acf1a14d9",
				{ replace: true },
			);
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
				url: "https://dwallets-evm.mainsailhq.com/api?attributes.validatorPublicKey=d387dc09d41dc443a0bb972f5bcce2b06620e2f1711a0596e96275c5ab38d4c85ccbe2d5f92d6f02dee4853acf1a14d9",
			},
			{},
			200,
		),
	],
);
