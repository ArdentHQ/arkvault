import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, getLocation, scrollToTop, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { goToWallet, modal } from "../e2e/common";

const translations = buildTranslations();

const preSteps = {
	"Given Alice is on the wallet details page": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await goToWallet(t);
	},
	"When she attempts to delete the wallet": async (t: TestController) => {
		await scrollToTop();
		await t.click(Selector('[data-testid="WalletHeader__more-button"]'));
		await t.click(Selector('[data-testid="dropdown__options"] li').withText(translations.COMMON.DELETE));
	},
};
cucumber("@deleteWallet", {
	...preSteps,
	"And confirms the deletion": async (t: TestController) => {
		await t.expect(modal.exists).ok();
		await t.expect(Selector("[data-testid=DeleteResource__submit-button]").exists).ok();
		await t.click(Selector('[data-testid="DeleteResource__submit-button"]'));
		await t.expect(modal.exists).notOk();
	},
	"Then the wallet is deleted from her profile": async (t: TestController) => {
		await t.expect(getLocation()).contains("/dashboard");
	},
});
cucumber("@deleteWallet-openAndCancel", {
	...preSteps,
	"But selects cancel on the modal": async (t: TestController) => {
		await t.expect(modal.exists).ok();
		await t.expect(Selector("[data-testid=DeleteResource__cancel-button]").exists).ok();
		await t.click(Selector('[data-testid="DeleteResource__cancel-button"]'));
	},
	"Then the modal is no longer displayed": async (t: TestController) => {
		await t.expect(modal.exists).notOk();
	},
});
cucumber("@deleteWallet-openAndClose", {
	...preSteps,
	"But selects close on the modal": async (t: TestController) => {
		await t.expect(modal.exists).ok();
		await t.expect(Selector('[data-testid="Modal__close-button"]').exists).ok();
		await t.click(Selector('[data-testid="Modal__close-button"]'));
	},
	"Then the modal is no longer displayed": async (t: TestController) => {
		await t.expect(modal.exists).notOk();
	},
});
