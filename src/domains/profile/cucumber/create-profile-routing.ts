import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, getLocation, visitWelcomeScreen } from "../../../utils/e2e-utils";

const translations = buildTranslations();

cucumber("@createProfileRouting", {
	"Given Alice is on the welcome screen": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await t.expect(Selector('[data-testid="ProfileRow"]').count).eql(2);
	},
	"When she selects create profile": async (t: TestController) => {
		await t.expect(Selector('[data-testid="CreateProfile"]').exists).ok({ timeout: 60_000 });
		await t.click(Selector('[data-testid="CreateProfile"]'));
	},
	"Then she is on the create profile page": async (t: TestController) => {
		await t.expect(getLocation()).contains("/profiles/create");
		await t.click(Selector("h1").withExactText(translations.PROFILE.PAGE_CREATE_PROFILE.TITLE));
	},
	"When she selects back": async (t: TestController) => {
		await t.click(Selector("button").withExactText(translations.COMMON.BACK));
	},
	"Then she is back on the welcome page": async (t: TestController) => {
		await t.expect(Selector("h2").withText(translations.PROFILE.PAGE_WELCOME.WITH_PROFILES.TITLE).exists).ok();
		await t.expect(Selector("p").withText(translations.PROFILE.PAGE_WELCOME.WITH_PROFILES.DESCRIPTION).exists).ok();
	},
});
