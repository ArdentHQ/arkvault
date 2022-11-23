import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { goToProfile } from "../../profile/e2e/common";

const translations = buildTranslations();

export const goToContacts = async (t: TestController) => {
	await goToProfile(t);

	await t.click(Selector("a").withText(translations.COMMON.CONTACTS));

	await t.expect(Selector("h1").withText(translations.CONTACTS.CONTACTS_PAGE.TITLE).exists).ok();
};
