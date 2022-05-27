import { Selector } from "testcafe";

import { buildTranslations as translations } from "../../../app/i18n/helpers";
import { cucumber } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";

const preSteps = {
	"Given Alice is signed into a profile": async (t: TestController) => {
		await goToProfile(t);
	},
};
cucumber("@walletRouting-walletDetails", {
	...preSteps,
	"When she selects a network": async (t: TestController) => {
		await t.click(Selector("[data-testid=Accordion__toggle]"));
	},
	"And she selects a wallet": async (t: TestController) => {
		await t.click(Selector("[data-testid=Address__address]").withText("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD"));
	},
	"Then she is navigated to the wallet details page": async (t: TestController) => {
		await t.expect(Selector("span").withText("ARK Wallet 1").exists).ok();
	},
});
cucumber("@walletRouting-createWallet", {
	...preSteps,
	"When she selects create wallet": async (t: TestController) => {
		await t.click(Selector("button").withText(translations().COMMON.CREATE));
	},
	"Then she is navigated to the create wallet page": async (t: TestController) => {
		await t
			.expect(Selector("div").withText(translations().WALLETS.PAGE_CREATE_WALLET.NETWORK_STEP.SUBTITLE).exists)
			.ok();
	},
});
cucumber("@walletRouting-importWallet", {
	...preSteps,
	"When she selects import wallet": async (t: TestController) => {
		await t.click(Selector('[data-testid="WalletControls__import-wallet"]'));
	},
	"Then she is navigated to the import wallet page": async (t: TestController) => {
		await t
			.expect(Selector("div").withText(translations().WALLETS.PAGE_IMPORT_WALLET.NETWORK_STEP.SUBTITLE).exists)
			.ok();
	},
});
