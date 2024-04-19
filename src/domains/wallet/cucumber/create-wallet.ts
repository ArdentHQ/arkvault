/* eslint-disable unicorn/no-null */
import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { BASEURL, cucumber, mockMuSigRequest, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";

const translations = buildTranslations();
let mnemonicWords: string[] = [];

const mocks = [
	mockRequest(
		(request: any) => !!new RegExp(BASEURL + "wallets/([-0-9a-zA-Z]{1,34})").test(request.url),
		"coins/ark/devnet/wallets/not-found",
		404,
	),
	mockRequest(
		(request: any) =>
			!!new RegExp(BASEURL + "transactions\\?page=1&limit=15&address=([-0-9a-zA-Z]{1,34})").test(request.url),
		{
			data: [],
			meta: {
				count: 0,
				first: null,
				last: null,
				next: null,
				pageCount: 0,
				previous: null,
				self: null,
				totalCount: 0,
				totalCountIsEstimate: true,
			},
		},
	),
	mockMuSigRequest("https://ark-test-musig.arkvault.io", "list", { result: [] }),
];

const createWalletStep = {
	"When she navigates to create a wallet": async (t: TestController) => {
		await t.click(Selector("button").withExactText(translations.COMMON.CREATE));
		await t
			.expect(Selector("div").withText(translations.WALLETS.PAGE_CREATE_WALLET.NETWORK_STEP.SUBTITLE).exists)
			.ok();
	},
};
const confirmMnemonicStep = {
	"And confirms the generated mnemonic": async (t: TestController) => {
		const mnemonicsCount = await Selector("[data-testid=MnemonicList__item]").count;

		if (mnemonicWords.length > 0) {
			mnemonicWords = [];
		}

		for (let index = 0; index <= mnemonicsCount - 1; index++) {
			const textContent = await Selector("[data-testid=MnemonicList__item]").nth(index).textContent;

			mnemonicWords.push(textContent.replace(/\d+/, "").trim());
		}
		await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));

		// Confirm your password
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();

		Selector("label").withText(translations.WALLETS.MNEMONIC_VERIFICATION.WORD_NUMBER);

		const labels = await Selector(`[data-testid=MnemonicVerificationInput] label`);

		for (let index = 0; index < 3; index++) {
			const selectWordPhrase = await labels.nth(index).textContent;
			const wordNumber = selectWordPhrase.match(/\d+/)?.[0];

			await t.typeText(
				Selector("[data-testid=MnemonicVerificationInput__input]").nth(index),
				mnemonicWords[Number(wordNumber) - 1],
				{ replace: true },
			);
		}

		await t.click(Selector("[data-testid=CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer]]"));

		await t.hover(Selector("button").withExactText(translations.COMMON.CONTINUE));
		await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));
	},
};
const selectNetworkStep = {
	"And selects a network": async (t: TestController) => {
		await t.click(Selector('[data-testid="NetworkOption-ARK-ark.devnet"]'));

		await t
			.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled"))
			.notOk("Cryptoasset selected", { timeout: 5000 });
		await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));
	},
};
const walletPageStep = {
	"Then the new wallet is created": async (t: TestController) => {
		await t.expect(Selector("h1").withExactText(translations.COMMON.COMPLETED).exists).ok();

		// Save and finish
		await t.click(Selector("button").withExactText(translations.COMMON.GO_TO_WALLET));
		await t.expect(Selector("[data-testid=WalletHeader]").exists).ok();
	},
};

cucumber(
	"@createWallet",
	{
		"Given Alice is signed into a profile": async (t: TestController) => {
			await visitWelcomeScreen(t);
			await goToProfile(t);
		},
		...createWalletStep,
		...selectNetworkStep,
		"And sees the generated mnemonic": async (t: TestController) => {
			await t.expect(Selector("h1").withExactText(translations.COMMON.YOUR_PASSPHRASE).exists).ok();
		},
		...confirmMnemonicStep,
		...walletPageStep,
	},
	mocks,
);
cucumber(
	"@createWallet-withEncryption",
	{
		"Given Alice is signed into a profile": async (t: TestController) => {
			await visitWelcomeScreen(t);
			await goToProfile(t);
		},
		...createWalletStep,
		...selectNetworkStep,
		"And sees the generated mnemonic": async (t: TestController) => {
			await t.expect(Selector("h1").withExactText(translations.COMMON.YOUR_PASSPHRASE).exists).ok();
		},
		"And chooses to encrypt the created wallet": async (t: TestController) => {
			await t.click(Selector('[data-testid="CreateWallet__encryption-toggle"]').parent());
		},
		...confirmMnemonicStep,
		"And enters the encryption passwords": async (t: TestController) => {
			await t.typeText(Selector("[data-testid=PasswordValidation__encryptionPassword]"), "S3cUrePa$sword", {
				paste: true,
			});
			await t.typeText(
				Selector("[data-testid=PasswordValidation__confirmEncryptionPassword]"),
				"S3cUrePa$sword",
				{ paste: true },
			);

			await t.hover(Selector("button").withExactText(translations.COMMON.CONTINUE));
			await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));
		},
		...walletPageStep,
	},
	mocks,
);
