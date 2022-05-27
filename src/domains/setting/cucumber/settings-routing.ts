import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";

const translations = buildTranslations();

cucumber("@settingsRouting", {
	"Given Alice is signed into a profile": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
	},
	"When she selects settings via navbar menu": async (t: TestController) => {
		await t.click(Selector('[data-testid="UserMenu"]'));
		await t
			.expect(Selector('[data-testid="dropdown__options"] li').withText(translations.COMMON.SETTINGS).exists)
			.ok();
		await t.click(Selector('[data-testid="dropdown__options"] li').withText(translations.COMMON.SETTINGS));
	},
	"Then she is navigated to the Settings page": async (t: TestController) => {
		await t.expect(Selector("h1").withText(translations.SETTINGS.GENERAL.TITLE).exists).ok();
	},
});
