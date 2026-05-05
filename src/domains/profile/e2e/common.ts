import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";

const translations = buildTranslations();

export const goToProfile = async (t: any) => {
	await t.expect(Selector("span").withText("Foo Bar").exists).ok({ timeout: 60_000 });
	await t.click(Selector("span").withText("Foo Bar").parent("[data-testid=ProfileRow__Link]"));
	await t.expect(Selector("div").withText(translations.COMMON.VIEWING).exists).ok();
};
