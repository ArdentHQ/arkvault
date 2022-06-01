import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { goToProfile } from "../../profile/e2e/common";

const translations = buildTranslations();

export const goToSettings = async (t: TestController) => {
	await goToProfile(t);

	await t.click(Selector('[data-testid="UserMenu"]'));
	await t.expect(Selector('[data-testid="dropdown__options"] li').withText(translations.COMMON.SETTINGS).exists).ok();
	await t.click(Selector('[data-testid="dropdown__options"] li').withText(translations.COMMON.SETTINGS));
	await t.expect(Selector("h1").withText(translations.SETTINGS.GENERAL.TITLE).exists).ok();
};

export const saveSettings = async (t: TestController) => {
	await t.click(Selector("button").withText(translations.COMMON.SAVE));
	await t
		.expect(Selector("[data-testid=ToastMessage__content]").withText(translations.SETTINGS.GENERAL.SUCCESS).exists)
		.ok();
	await t.click(Selector("[data-testid=ToastMessage__close-button]"));
	await t
		.expect(Selector("[data-testid=ToastMessage__content]").withText(translations.SETTINGS.GENERAL.SUCCESS).exists)
		.notOk();
};
