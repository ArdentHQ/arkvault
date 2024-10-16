import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";

const translations = buildTranslations();

export const goToTransferPage = async (t: any) => {
	await t.click(Selector("[data-testid=WalletHeader__send-button]"));
	await t
		.expect(
			Selector("h1").withText(
				translations.TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.TITLE.replace("{{ticker}}", "DARK"),
			).exists,
		)
		.ok({ timeout: 60_000 });
};

export const goToTransferPageThroughNavbar = async (t: any) => {
	await t.click(Selector("[data-testid=NavigationBar__buttons--send]"));
	await t.expect(Selector("[data-testid=SendTransfer__form-step]").exists).ok();
	await t
		.expect(Selector("div").withText(translations.TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.DESCRIPTION).exists)
		.ok();
};

export const goToRegistrationPage = async (t: any) => {
	await t.click(Selector('[data-testid="UserMenu"]'));
	await t.expect(Selector("li").withText(translations.COMMON.REGISTRATIONS).exists).ok({ timeout: 60_000 });
	await t.click(Selector("li").withText(translations.COMMON.REGISTRATIONS));
	await t.click(Selector("button").withText(translations.COMMON.REGISTER));
	await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
};

export const goToDelegateRegistrationPage = async (t: any) => {
	await t.click(Selector('[data-testid="WalletHeader__more-button"]'));
	await t.click(
		Selector('[data-testid="dropdown__options"] li').withText(
			translations.WALLETS.PAGE_WALLET_DETAILS.OPTIONS.REGISTER_DELEGATE,
		),
	);

	await t
		.expect(Selector("div").withText(translations.TRANSACTION.PAGE_DELEGATE_REGISTRATION.FORM_STEP.TITLE).exists)
		.ok();
};

export const goToDelegateResignationPage = async (t: any) => {
	await t.click(Selector('[data-testid="WalletHeader__more-button"]'));
	await t.click(
		Selector('[data-testid="dropdown__options"] li').withText(
			translations.WALLETS.PAGE_WALLET_DETAILS.OPTIONS.RESIGN_DELEGATE,
		),
	);

	await t
		.expect(Selector("div").withText(translations.TRANSACTION.PAGE_DELEGATE_RESIGNATION.FORM_STEP.TITLE).exists)
		.ok();
};
