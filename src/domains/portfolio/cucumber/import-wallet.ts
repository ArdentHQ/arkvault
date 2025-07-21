import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";

const translations = buildTranslations();

const preSteps = {
	"Given Alice is on the import wallet page": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await t.click(Selector("button").withExactText(translations.COMMON.IMPORT));

		await t.click(Selector("div").withExactText(translations.COMMON.MNEMONIC));

		await t
			.expect(
				Selector("h2").withExactText(translations.WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.MNEMONIC_TITLE).exists,
			)
			.ok();
	},
};
const encryptionPasswordsStep = {
	"And enters the encryption passwords": async (t: TestController) => {
		await t.typeText(Selector("[data-testid=PasswordValidation__encryptionPassword]"), "S3cUrePa$sword", {
			paste: true,
		});
		await t.typeText(Selector("[data-testid=PasswordValidation__confirmEncryptionPassword]"), "S3cUrePa$sword", {
			paste: true,
		});

		await t.hover(Selector("button").withExactText(translations.COMMON.CONTINUE));
		await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));
	},
};

const enterMnemonic = async (t: TestController) => {
	const passphraseInput = Selector("[data-testid=ImportWallet__mnemonic-input]");
	await t.typeText(passphraseInput, MNEMONICS[0], {
		paste: true,
	});
	await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));
};

const completeImportWallet = async (t: TestController) => {
	await t.click(Selector("[data-testid=ImportWallet__edit-alias]"));
	const walletNameInput = Selector("input[name=name]");
	await t.click(walletNameInput).pressKey("ctrl+a delete").typeText(walletNameInput, "Wallet Alias", {
		paste: true,
	});
	await t.click(Selector("[data-testid=UpdateWalletName__submit]"));
};

cucumber("@importWallet-mnemonic", {
	...preSteps,
	"When she enters a valid mnemonic to import": enterMnemonic,
	"And completes the import wallet steps for mnemonic": completeImportWallet,
	"Then the wallet is imported to her profile": async (t: TestController) => {
		await t.click(Selector("button").withExactText(translations.COMMON.CLOSE));
	},
});

cucumber("@importWallet-mnemonic-withEncryption", {
	...preSteps,
	"When she chooses to encrypt the imported wallet": async (t: TestController) => {
		await t.click(Selector('[data-testid="WalletEncryptionBanner__encryption"] div'));
		await t.click(Selector('[data-testid="WalletEncryptionBanner__checkbox"]'));
	},
	"And enters a valid mnemonic to import": enterMnemonic,
	...encryptionPasswordsStep,
	"And completes the import wallet steps for mnemonic": completeImportWallet,
	"Then the wallet is imported to her profile": async (t: TestController) => {
		await t.click(Selector("button").withExactText(translations.COMMON.CLOSE));
	},
});
//
// cucumber(
// 	"@importWallet-secret-withSecondSignatureAndEncryption",
// 	{
// 		...preSteps,
// 		"When she changes the import type to secret": async (t: TestController) => {
// 			await t.click('[data-testid="SelectDropdown__input"]');
// 			await t.click(Selector(".select-list-option__label").withText(translations.COMMON.SECRET));
// 		},
// 		"And chooses to encrypt the imported wallet": async (t: TestController) => {
// 			await t.click(Selector('[data-testid="ImportWallet__encryption-toggle"]').parent());
// 		},
// 		"And enters a valid secret to import": async (t: TestController) => {
// 			const secretInput = Selector("[data-testid=ImportWallet__secret-input]");
// 			await t.typeText(secretInput, "abc", {
// 				paste: true,
// 			});
// 			await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));
// 		},
// 		"And enters the second secret": async (t: TestController) => {
// 			const secondSecretInput = Selector("[data-testid=EncryptPassword__second-secret]");
// 			await t.typeText(secondSecretInput, "abc", { paste: true });
// 		},
// 		...encryptionPasswordsStep,
// 		"And completes the import wallet steps for secret": completeImportWallet,
// 		"Then the wallet is imported to her profile": async (t: TestController) => {
// 			await t.click(Selector("button").withExactText(translations.COMMON.CLOSE));
// 		},
// 	},
// 	[
// 		mockMuSigRequest("https://ark-test-musig.arkvault.io", "list", { result: [] }),
// 		mockRequest(
// 			"https://ark-test.arkvault.io/api/transactions?limit=30&address=DNTwQTSp999ezQ425utBsWetcmzDuCn2pN",
// 			[],
// 		),
// 	],
// );

cucumber("@importWallet-address", {
	...preSteps,
	"When she changes the import type to address": async (t: TestController) => {
		await t.click(Selector("button").withExactText(translations.COMMON.BACK));
		await t.click(Selector("div").withExactText(translations.COMMON.ADDRESS));
		await t.expect(Selector("h2").withExactText(translations.COMMON.ADDRESS).exists).ok();
	},
	"And enters a valid address to import": async (t: TestController) => {
		const addressInput = Selector("[data-testid=ImportWallet__address-input]");
		await t.typeText(addressInput, "0x659A76be283644AEc2003aa8ba26485047fd1BFB", {
			paste: true,
		});
		await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));
	},
	"And completes the import wallet steps for address": completeImportWallet,
	"Then the wallet is imported to her profile": async (t: TestController) => {
		await t.click(Selector("button").withExactText(translations.COMMON.CLOSE));
	},
});

cucumber("@importWallet-invalidAddress", {
	...preSteps,
	"When she changes the import type to address": async (t: TestController) => {
		await t.click(Selector("button").withExactText(translations.COMMON.BACK));
		await t.click(Selector("div").withExactText(translations.COMMON.ADDRESS));
		await t.expect(Selector("h2").withExactText(translations.COMMON.ADDRESS).exists).ok();
	},
	"And enters an invalid address to import": async (t: TestController) => {
		const addressInput = Selector("[data-testid=ImportWallet__address-input]");
		await t.typeText(addressInput, "123", {
			paste: true,
		});
	},
	"Then an error is displayed on the address field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok({ timeout: 5000 });
	},
	"And the continue button is disabled": async (t: TestController) => {
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();
	},
});

cucumber("@importWallet-invalidMnemonic", {
	...preSteps,
	"When she enters an invalid mnemonic to import": async (t: TestController) => {
		const passphraseInput = Selector("[data-testid=ImportWallet__mnemonic-input]");
		await t.typeText(passphraseInput, "123", {
			paste: true,
		});
	},
	"Then an error is displayed on the mnemonic field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok({ timeout: 5000 });
	},
	"And the continue button is disabled": async (t: TestController) => {
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();
	},
});

cucumber("@importWallet-duplicateAddress", {
	...preSteps,
	"And has imported a wallet": async (t: TestController) => {
		const passphraseInput = Selector("[data-testid=ImportWallet__mnemonic-input]");
		await t.typeText(passphraseInput, MNEMONICS[0], {
			paste: true,
		});
		await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));

		await completeImportWallet(t);

		await t.click(Selector("button").withExactText(translations.COMMON.CLOSE));
	},
	"When she attempts to import the same wallet again": async (t: TestController) => {
		await t.click(Selector("button").withExactText(translations.COMMON.IMPORT));

		await t.click(Selector("div").withExactText(translations.COMMON.MNEMONIC));

		await t
			.expect(
				Selector("h2").withExactText(translations.WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.MNEMONIC_TITLE).exists,
			)
			.ok();

		const passphraseInput = Selector("[data-testid=ImportWallet__mnemonic-input]");
		await t.typeText(passphraseInput, MNEMONICS[0], {
			paste: true,
		});
	},
	"Then an error is displayed on the mnemonic field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok({ timeout: 5000 });
	},
	"And the continue button is disabled": async (t: TestController) => {
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();
	},
});
