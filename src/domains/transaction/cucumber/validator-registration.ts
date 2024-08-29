import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../wallet/e2e/common";
import { goToValidatorRegistrationPage } from "../e2e/common";

const translations = buildTranslations();

const preSteps = {
	"Given Alice has navigated to the validator registration form for a wallet": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWallet(t, MNEMONICS[0], "Mainsail Test Wallet", "Mainsail Devnet");
		await goToValidatorRegistrationPage(t);
	},
};

cucumber(
	"@validatorRegistration",
	{
		...preSteps,
		"When she enters a validator public key": async (t: TestController) => {
			const publicKey =
				"84c48b1f7388d582a042718c35d9f57dcb9c4314be8b44807a14f329a3bb3853796882756d32e8e11e034f1e7e072cc2";

			await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
			await t.typeText(Selector("[data-testid=Input__validator_public_key]"), publicKey);

			await t
				.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled"))
				.notOk({ timeout: 5000 });

			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));

			await t
				.expect(
					Selector("[data-testid=TransactionDetail]").withText(
						"84c48b1f7388d582a042718c35…756d32e8e11e034f1e7e072cc2",
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
				.expect(Selector("h1").withText(translations.TRANSACTION.SUCCESS.TITLE).exists)
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
					accept: ["9c5614d2f4e060f52c1dc8effd837bf13db0ce5ae4232cb24217300a74cdbceb"],
					broadcast: ["9c5614d2f4e060f52c1dc8effd837bf13db0ce5ae4232cb24217300a74cdbceb"],
					excess: [],
					invalid: [],
				},
			},
		),
		mockRequest(
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api/wallets/?attributes.validatorPublicKey=84c48b1f7388d582a042718c35d9f57dcb9c4314be8b44807a14f329a3bb3853796882756d32e8e11e034f1e7e072cc2",
			},
			{
				meta: {
					count: 0,
				},
			},
		),
		mockRequest(
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=20&senderId=0xDC0A21aF27FeB1b7e0f2e519288445c0510Cb23C",
			},
			{
				data: {},
			},
		),
		mockRequest(
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api/transactions/9c5614d2f4e060f52c1dc8effd837bf13db0ce5ae4232cb24217300a74cdbceb",
			},
			{
				data: {},
			},
		),
	],
);

cucumber("@validatorRegistration-invalidPublicKey", {
	...preSteps,
	"When she enters an invalid public key": async (t: TestController) => {
		await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
		await t.typeText(Selector("[data-testid=Input__validator_public_key]"), "invalid-pub-key");
	},
	"Then an error is displayed on the name field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok();
	},
	"And the continue button is disabled": async (t: TestController) => {
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();
	},
});
