import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";

const translations = buildTranslations();

export const goToProfile = async (t: any) => {
	await t.expect(Selector("span").withText("John Doe").exists).ok({ timeout: 60_000 });
	await t.click(Selector("span").withText("John Doe").parent("[data-testid=ProfileRow__Link]"));
	await t.expect(Selector("div").withText(translations.COMMON.WALLETS).exists).ok();

	// @TODO: why do we always make this assertion on the portfolio page?
	// const transactionsCount = Selector('[data-testid="TableRow"]').count;
	// await t.expect(transactionsCount).gte(10);
};
