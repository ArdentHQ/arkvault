import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";

const translations = buildTranslations();

export const openSendTransferSidePanel = async (t: any) => {
	await t.click(Selector("[data-testid=WalletHeader__send-button]"));
	await t
		.expect(Selector("h2").withText(translations.TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.TITLE).exists)
		.ok({ timeout: 60_000 });
};

export const openSendValidatorRegistrationSidePanel = async (t: any) => {
	await t.click(Selector('[data-testid="WalletHeaderMobile__more-button"]'));
	await t.click(
		Selector('[data-testid="dropdown__options"] li').withText(
			translations.WALLETS.PAGE_WALLET_DETAILS.OPTIONS.REGISTER_VALIDATOR,
		),
	);

	await t
		.expect(Selector("div").withText(translations.TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.TITLE).exists)
		.ok();
};

export const openSendValidatorResignationSidePanel = async (t: any) => {
	await t.click(Selector('[data-testid="WalletHeaderMobile__more-button"]'));
	await t.click(
		Selector('[data-testid="dropdown__options"] li').withText(
			translations.WALLETS.PAGE_WALLET_DETAILS.OPTIONS.RESIGN_VALIDATOR,
		),
	);

	await t
		.expect(Selector("div").withText(translations.TRANSACTION.PAGE_VALIDATOR_RESIGNATION.FORM_STEP.TITLE).exists)
		.ok();
};
