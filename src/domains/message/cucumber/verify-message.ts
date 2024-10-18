import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { goToWallet } from "../../wallet/e2e/common";

const translations = buildTranslations();

const preSteps = {
	"Given Alice is on the wallet details page": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await goToWallet(t);
	},
	"And selects to verify message": async (t: TestController) => {
		await t.click(Selector('[data-testid="WalletHeader__more-button"]'));
		await t.click(
			Selector('[data-testid="dropdown__options"] li').withText(
				translations.WALLETS.PAGE_WALLET_DETAILS.OPTIONS.VERIFY_MESSAGE,
			),
		);
	},
};

cucumber("@verifyMessage", {
	...preSteps,
	"When she enters valid details to verify a message": async (t: TestController) => {
		const mockSuccessMessage = {
			message: "Hello World",
			signatory: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc",
			signature:
				"7915d8c22ec9dab41bd93d9e003970b2f6aaa5d9a5e837d4d17847308f6e880f31e2c1ad141d9b080d9a151baa31dcd36dd05faa51e5db95586d630b66485e1e",
		};
		await t.click(Selector("input[type=checkbox]").parent());
		await t.typeText(Selector("[data-testid=VerifyMessage__json-jsonString]"), JSON.stringify(mockSuccessMessage));
	},
	"And submits the form": async (t: TestController) => {
		await t.click(Selector("[data-testid=VerifyMessage__verify-button]"));
	},
	"Then the message is successfully verified": async (t: TestController) => {
		await t
			.expect(
				Selector("h1").withText(translations.MESSAGE.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.VERIFIED.TITLE).exists,
			)
			.ok();
	},
});

cucumber("@verifyMessage-failVerification", {
	...preSteps,
	"When she enters invalid details to verify a message": async (t: TestController) => {
		const mockFailingMessage = {
			message: "Wrong message",
			signatory: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc",
			signature:
				"7915d8c22ec9dab41bd93d9e003970b2f6aaa5d9a5e837d4d17847308f6e880f31e2c1ad141d9b080d9a151baa31dcd36dd05faa51e5db95586d630b66485e1e",
		};
		await t.click(Selector("input[type=checkbox]").parent());
		await t.typeText(Selector("[data-testid=VerifyMessage__json-jsonString]"), JSON.stringify(mockFailingMessage));
	},
	"And submits the form": async (t: TestController) => {
		await t.click(Selector("[data-testid=VerifyMessage__verify-button]"));
	},
	"Then the message verification fails": async (t: TestController) => {
		await t
			.expect(
				Selector("h1").withText(translations.MESSAGE.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.NOT_VERIFIED.TITLE)
					.exists,
			)
			.ok();
	},
});

cucumber("@verifyMessage-openAndGoBack", {
	...preSteps,
	"But selects to go back from the verify message page": async (t: TestController) => {
		await t.expect(Selector('[data-testid="VerifyMessage__back-button"]').exists).ok();
		await t.click(Selector('[data-testid="VerifyMessage__back-button"]'));
	},
	"Then the wallet details page is displayed": async (t: TestController) => {
		await t.expect(Selector("[data-testid=WalletHeader]").exists).ok();
	},
});
