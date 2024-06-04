import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { MNEMONICS } from "../../../utils/e2e-utils";

const translations = buildTranslations();

export const goToWallet = async (t: any, wallet = "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD") => {
	await t.click(Selector("[data-testid=Accordion__toggle]"));
	await t.click(Selector("[data-testid=Address__address]").withText(wallet));
	await t.expect(Selector("[data-testid=WalletHeader]").exists).ok();
};

export const importWallet = async (t: any, passphrase = MNEMONICS[0], alias = "Test Wallet") => {
	await t.click(Selector("a").withText(translations.COMMON.PORTFOLIO));
	await t.click(Selector("button").withExactText(translations.COMMON.IMPORT));
	await t.expect(Selector("div").withText(translations.WALLETS.PAGE_IMPORT_WALLET.NETWORK_STEP.SUBTITLE).exists).ok();
	await t.click(Selector('[data-testid="SelectNetwork"]'));
	await t.click(Selector(".select-list-option__label").withText("ARK Devnet"));

	await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));
	await t.typeText(Selector("[data-testid=ImportWallet__mnemonic-input]"), passphrase, { paste: true });
	await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));

	await t.click(Selector("[data-testid=ImportWallet__edit-alias]"));

	const walletNameInput = Selector("input[name=name]");

	await t.click(walletNameInput).pressKey("ctrl+a delete").typeText(walletNameInput, alias);

	await t.click(Selector("[data-testid=UpdateWalletName__submit]"));
	await t.click(Selector("button").withExactText(translations.COMMON.GO_TO_WALLET));

	await t.expect(Selector("[data-testid=WalletHeader]").exists).ok();
};

export const importWalletByAddress = async (t: any, address: string, alias = "Test Wallet", isMainnet = false) => {
	await t.click(Selector("a").withText(translations.COMMON.PORTFOLIO));
	await t.click(Selector("button").withExactText(translations.COMMON.IMPORT));
	await t.expect(Selector("div").withText(translations.WALLETS.PAGE_IMPORT_WALLET.NETWORK_STEP.SUBTITLE).exists).ok();

	if (isMainnet) {
		await t.click(Selector(`[data-testid="NetworkOption-ARK-ark.mainnet"]`));
	} else {
		await t.click(Selector(`[data-testid="NetworkOption-ARK-ark.devnet"]`));
	}

	await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));

	await t.click('[data-testid="SelectDropdown__input"]');
	await t.click(Selector(".select-list-option__label").withText(translations.COMMON.ADDRESS));

	await t.typeText(Selector("[data-testid=ImportWallet__address-input]"), address, { paste: true });
	await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));

	await t.click(Selector("[data-testid=ImportWallet__edit-alias]"));

	const walletNameInput = Selector("input[name=name]");

	await t.click(walletNameInput).pressKey("ctrl+a delete").typeText(walletNameInput, alias);

	await t.click(Selector("[data-testid=UpdateWalletName__submit]"));
	await t.click(Selector("button").withExactText(translations.COMMON.GO_TO_WALLET));

	await t.expect(Selector("[data-testid=WalletHeader]").exists).ok();
};

export const modal = Selector("[data-testid=Modal__inner]");
