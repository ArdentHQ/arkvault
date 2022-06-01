import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../e2e/common";

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
		await t.click(Selector("[data-testid=SignMessage__submit-button]"));
	},
	"Then the message is successfully signed": async (t: TestController) => {
		await t.expect(Selector("h1").withText(translations.WALLETS.MODAL_SIGN_MESSAGE.SIGNED_STEP.TITLE).exists).ok();
		await t.click(Selector("[data-testid=Modal__close-button]"));
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
		await t.expect(Selector("[data-testid=SignMessage__submit-button]").hasAttribute("disabled")).ok();
	},
});
cucumber("@signMessage-openAndCancel", {
	...preSteps,
	"But selects cancel on the sign message modal": async (t: TestController) => {
		await t.expect(Selector("[data-testid=Modal__inner]").exists).ok();
		await t.expect(Selector("[data-testid=SignMessage__cancel-button]").exists).ok();
		await t.click(Selector("[data-testid=SignMessage__cancel-button]"));
	},
	"Then the modal is no longer displayed": async (t: TestController) => {
		await t.expect(Selector("[data-testid=Modal__inner]").exists).notOk();
	},
});
cucumber("@signMessage-openAndClose", {
	...preSteps,
	"But selects close on the sign message modal": async (t: TestController) => {
		await t.expect(Selector("[data-testid=Modal__inner]").exists).ok();
		await t.expect(Selector('[data-testid="Modal__close-button"]').exists).ok();
		await t.click(Selector('[data-testid="Modal__close-button"]'));
	},
	"Then the modal is no longer displayed": async (t: TestController) => {
		await t.expect(Selector("[data-testid=Modal__inner]").exists).notOk();
	},
});
