import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../wallet/e2e/common";

const translations = buildTranslations();
const mnemonic = MNEMONICS[0];

const preSteps = {
	"Given Alice is on the wallet details page for imported wallet": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWallet(t, mnemonic);
	},
	"When she selects to sign message": async (t: TestController) => {
		await t.click(Selector('[data-testid="WalletHeader__more-button"]'));
		await t.click(
			Selector('[data-testid="WalletHeader__more-button"] li').withText(
				translations.WALLETS.PAGE_WALLET_DETAILS.OPTIONS.SIGN_MESSAGE,
			),
		);
	},
};

cucumber("@signMessage", {
	...preSteps,
	"And submits the form with a valid mnemonic": async (t: TestController) => {
		await t.typeText(Selector("input[name=message]"), "Hello World");
		await t.typeText(Selector("input[name=mnemonic]"), mnemonic, { paste: true });
		await t.click(Selector("[data-testid=SignMessage__continue-button]"));
	},
	"Then the message is successfully signed": async (t: TestController) => {
		await t.expect(Selector("h1").withText(translations.MESSAGE.PAGE_SIGN_MESSAGE.SUCCESS_STEP.TITLE).exists).ok();
	},
});

cucumber("@signMessage-invalidMnemonic", {
	...preSteps,
	"And completes the form with an invalid mnemonic": async (t: TestController) => {
		await t.typeText(Selector("input[name=message]"), "Hello World");
		await t.typeText(Selector("input[name=mnemonic]"), "invalid mnemonic", { paste: true });
	},
	"Then an error is displayed in the mnemonic field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok();
	},
	"And the sign button is disabled": async (t: TestController) => {
		await t.expect(Selector("[data-testid=SignMessage__continue-button]").hasAttribute("disabled")).ok();
	},
});

cucumber("@signMessage-openAndGoBack", {
	...preSteps,
	"But selects to go back from the sign message page": async (t: TestController) => {
		await t.expect(Selector('[data-testid="SignMessage__back-button"]').exists).ok();
		await t.click(Selector('[data-testid="SignMessage__back-button"]'));
	},
	"Then the wallet details page is displayed": async (t: TestController) => {
		await t.expect(Selector("[data-testid=WalletHeader]").exists).ok();
	},
});
