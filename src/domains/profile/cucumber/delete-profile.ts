import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, visitWelcomeScreen } from "../../../utils/e2e-utils";

const translations = buildTranslations();

cucumber("@deleteProfile-noPassword", {
	"Given Alice is on the welcome screen": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await t.expect(Selector("span").withText(translations.COMMON.PAYVO_WALLET).exists).ok();
		await t.expect(Selector('[data-testid="Card"]').count).eql(3);
	},
	"When she attempts to delete a profile that isn't password protected": async (t: TestController) => {
		await t.click(Selector('[data-testid="Card"] [data-testid="dropdown__toggle"]').child(0));
		await t.click(
			Selector('[data-testid="Card"] [data-testid="dropdown__option--1"]').withText(translations.COMMON.DELETE),
		);
	},
	"And confirms the deletion": async (t: TestController) => {
		await t.click(Selector('[data-testid="DeleteResource__submit-button"]'));
	},
	"Then the profile is removed": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Card"]').count).eql(2);
	},
});
