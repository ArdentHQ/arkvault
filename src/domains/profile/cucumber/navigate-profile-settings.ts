import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, visitWelcomeScreen } from "../../../utils/e2e-utils";

const translations = buildTranslations();

cucumber("@navigateProfileSettings-noPassword", {
	"Given Alice is on the welcome screen": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await t.expect(Selector("span").withText(translations.COMMON.PAYVO_WALLET).exists).ok();
		await t.expect(Selector('[data-testid="Card"]').count).eql(3);
	},
	"When she selects Settings on a profile card": async (t: TestController) => {
		await t
			.expect(Selector('[data-testid="Card"] [data-testid="dropdown__toggle"]').child(0).exists)
			.ok({ timeout: 60_000 });
		await t.click(Selector('[data-testid="Card"] [data-testid="dropdown__toggle"]').child(0));
		await t.click(
			Selector('[data-testid="Card"] [data-testid="dropdown__option--0"]').withText(translations.COMMON.SETTINGS),
		);
	},
	"Then she is navigated to the settings page for that profile": async (t: TestController) => {
		await t.expect(Selector("h1").withText(translations.SETTINGS.GENERAL.TITLE).exists).ok();
	},
});
