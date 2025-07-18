/* eslint-disable unicorn/no-null */
import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { BASEURL, cucumber, mockedAddresses, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";

const translations = buildTranslations();
let mnemonicWords: string[] = [];

const mocks = [
	mockRequest(
		(request: any) => {
			if (!new RegExp(BASEURL + "wallets/([-0-9a-zA-Z]{1,40})").test(request.url)) {
				return false;
			}

			const regex = /\/wallets\/(?<address>0x[a-fA-F0-9]{6,})(?=\/?$)/;

			const match = request.url.match(regex);

			const address = match?.groups?.address;

			return !mockedAddresses.includes(address);
		},
		"coins/mainsail/devnet/wallets/not-found",
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
];

const createWalletStep = {
	"When she navigates to create a wallet": async (t: TestController) => {
		await t.click(Selector("button").withExactText(translations.COMMON.CREATE));
	},
};

const confirmMnemonicStep = {
	"And confirms the generated mnemonic": async (t: TestController) => {
		await inputMnemonicConfirmation(t);

		await t.hover(Selector("button").withExactText(translations.COMMON.CONTINUE));
		await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));
	},
};

const inputMnemonicConfirmation = async (t: TestController) => {
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

	await t.click(Selector("[data-testid=CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer]"));
};

const walletPageStep = {
	"Then the new wallet is created": async (t: TestController) => {
		await t.expect(Selector("h2").withExactText(translations.COMMON.COMPLETED).exists).ok();

		// Save and finish
		await t.click(Selector("button").withExactText(translations.COMMON.CLOSE));
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
		"And sees the generated mnemonic": async (t: TestController) => {
			await t
				.expect(Selector("h2").withText(translations.WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.TITLE).exists)
				.ok();
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
		"And sees the generated mnemonic": async (t: TestController) => {
			await t.expect(Selector("h2").withExactText(translations.COMMON.YOUR_PASSPHRASE).exists).ok();
		},
		"And confirms the generated mnemonic with encryption on": async (t: TestController) => {
			await inputMnemonicConfirmation(t);

			await t.click(Selector('[data-testid="WalletEncryptionBanner__encryption"] div'));
			await t.click(Selector('[data-testid="WalletEncryptionBanner__checkbox"]'));

			await t.hover(Selector("button").withExactText(translations.COMMON.CONTINUE));
			await t.click(Selector("button").withExactText(translations.COMMON.CONTINUE));
		},
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
