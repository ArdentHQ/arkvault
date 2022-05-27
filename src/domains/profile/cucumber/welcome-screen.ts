import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToSettings } from "../../setting/e2e/common";

const translations = buildTranslations();

cucumber("@welcomeScreen", {
	"Given Alice goes to the welcome page": async (t: TestController) => {
		await visitWelcomeScreen(t);
	},
	"Then the welcome screen is displayed": async (t: TestController) => {
		await t.expect(Selector("span").withText(translations.COMMON.PAYVO_WALLET).exists).ok();
	},
});
cucumber("@welcomeScreen-returnWhenIdle", {
	"Given Alice is on the Settings page": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToSettings(t);
	},
	"And has set the auto logout to 1 minute": async (t: TestController) => {
		await t.click(Selector("[data-testid=Input__suggestion]").withText("15 minutes"));
		await t.click('[data-testid="SelectDropdown__option--0"]');
		await t.click(Selector("button").withText(translations.COMMON.SAVE));
	},
	"Then after 1 minute of being idle she is returned to the welcome page": async (t: TestController) => {
		await t
			.expect(Selector("[data-testid=Input__suggestion]").withText("1 minute").exists)
			.notOk({ timeout: 100_000 });
	},
});
