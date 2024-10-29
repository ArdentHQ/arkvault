import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { goToWallet, modal } from "../e2e/common";

const translations = buildTranslations();

const openUpdateWalletName = async (t: any) => {
	await t.click(Selector('[data-testid="WalletHeader__more-button"]'));
	await t.click(
		Selector('[data-testid="dropdown__options"] li').withText(
			translations.WALLETS.PAGE_WALLET_DETAILS.OPTIONS.WALLET_NAME,
		),
	);

	await t.expect(modal.exists).ok();
	await t.expect(Selector('[data-testid="Modal__close-button"]').exists).ok();
};

const preSteps = {
	"Given Alice is on the wallet details page": async (t: TestController) => {
		await goToProfile(t);
		await goToWallet(t);
	},
	"And selects to update wallet name": async (t: TestController) => {
		await openUpdateWalletName(t);
	},
};

const saveButtonStep = {
	"And the update name save button is disabled": async (t: TestController) => {
		await t.expect(Selector("[data-testid=UpdateWalletName__submit]").hasAttribute("disabled")).ok();
		await t.click(Selector('[data-testid="UpdateWalletName__submit"]'));
		await t.expect(modal.exists).ok();
	},
};

cucumber("@updateWalletName", {
	...preSteps,
	"When she enters a valid wallet name": async (t: TestController) => {
		const walletLabelNameInput = Selector('[data-testid="UpdateWalletName__input"]');
		await t.typeText(walletLabelNameInput, "New Name", { replace: true });
		await t.expect(Selector("[data-testid=UpdateWalletName__submit]").hasAttribute("disabled")).notOk();
	},
	"And saves the updated name": async (t: TestController) => {
		await t.click(Selector('[data-testid="UpdateWalletName__submit"]'));
	},
	"Then the wallet name is updated": async (t: TestController) => {
		const walletLabelNameInput = Selector('[data-testid="UpdateWalletName__input"]');
		await t.expect(modal.exists).notOk();
		await openUpdateWalletName(t);
		await t.expect(walletLabelNameInput.value).eql("New Name");
	},
});
cucumber("@updateWalletName-openAndCancel", {
	...preSteps,
	"When she selects cancel on the update name modal": async (t: TestController) => {
		await t.click(Selector("button").withText(translations.COMMON.CANCEL));
	},
	"Then the update name modal is no longer displayed": async (t: TestController) => {
		await t.expect(modal.exists).notOk();
	},
});
cucumber("@updateWalletName-openAndClose", {
	...preSteps,
	"When she selects close on the update name modal": async (t: TestController) => {
		await t.click(Selector('[data-testid="Modal__close-button"]'));
	},
	"Then the update name modal is no longer displayed": async (t: TestController) => {
		await t.expect(modal.exists).notOk();
	},
});
cucumber("@updateWalletName-invalidNameLength", {
	...preSteps,
	"When she enters a name that exceeds 42 characters": async (t: TestController) => {
		const name = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor";
		const walletLabelNameInput = Selector('[data-testid="UpdateWalletName__input"]');
		await t.typeText(walletLabelNameInput, name, { replace: true });
	},
	"Then an error is displayed on the name field": async (t: TestController) => {
		await t.expect(Selector("[data-testid=UpdateWalletName__input]").hasAttribute("aria-invalid")).ok();
	},
	...saveButtonStep,
});
cucumber("@updateWalletName-whiteSpaceName", {
	...preSteps,
	"When she enters a name that just contains white space": async (t: TestController) => {
		const walletLabelNameInput = Selector('[data-testid="UpdateWalletName__input"]');
		await t.typeText(walletLabelNameInput, "      ", { replace: true });
	},
	"Then an error is displayed on the name field": async (t: TestController) => {
		await t.expect(Selector("[data-testid=UpdateWalletName__input]").hasAttribute("aria-invalid")).ok();
	},
	...saveButtonStep,
});
