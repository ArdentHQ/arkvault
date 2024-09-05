import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../wallet/e2e/common";
import { goToValidatorRegistrationPage } from "../e2e/common";

const Fixtures = {
	Wallet: {
		data: {
			address: "0xDC0A21aF27FeB1b7e0f2e519288445c0510Cb23C",
			publicKey: "03d7001f0cfff639c0e458356581c919d5885868f14f72ba3be74c8f105cce34ac",
			balance: "7000000000000",
			nonce: "0",
			attributes: {
				nonce: "0",
				balance: "7000000000000",
			},
			updated_at: "61419",
		},
	},
	Transactions: {
		data: [
			{
				amount: "100000000",
				asset: null,
				blockId: "38c5c3df32b2d51a695d1c9d0e7d2a5c0fededc56cf26150c8a16b8354a46bf3",
				confirmations: 7469,
				fee: "10000000",
				id: "fd3c202deb2b5678eb838671909b3e0b8d52adc4cb71d52edcef955e210f8fa7",
				nonce: "1",
				recipient: "0x2a260a110bc7b03f19C40a0BD04FF2C5DCB57594",
				senderPublicKey: "03d7001f0cfff639c0e458356581c919d5885868f14f72ba3be74c8f105cce34ac",
				signature:
					"8dcc3cf1e724580a196349738434e184dbe398a780fc55957d8dcf7b89cec5e2b41441108a30f856b8adceca45d14a7a30c60bc78e5db3efececa3d1e9803d35",
				signatures: null,
				timestamp: 1_725_379_989_471,
				type: 0,
				typeGroup: 1,
				vendorField: null,
				version: 1,
			},
		],
	},
};

const translations = buildTranslations();

const preSteps = {
	"Given Alice has navigated to the validator registration form for a wallet": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWallet(t, MNEMONICS[0], "Mainsail Test Wallet", "Mainsail Devnet");
		await goToValidatorRegistrationPage(t);
	},
};

cucumber(
	"@validatorRegistration",
	{
		...preSteps,
		"When she enters a validator public key": async (t: TestController) => {
			const publicKey =
				"84c48b1f7388d582a042718c35d9f57dcb9c4314be8b44807a14f329a3bb3853796882756d32e8e11e034f1e7e072cc2";

			await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
			await t.typeText(Selector("[data-testid=Input__validator_public_key]"), publicKey);

			await t
				.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled"))
				.notOk({ timeout: 5000 });

			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));

			await t
				.expect(
					Selector("[data-testid=TransactionDetail]").withText(
						"84c48b1f7388d582a042718c35…756d32e8e11e034f1e7e072cc2",
					).exists,
				)
				.ok();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
		},
		"And sends the validator registration transaction": async (t: TestController) => {
			await t.expect(Selector("h1").withText(translations.TRANSACTION.AUTHENTICATION_STEP.TITLE).exists).ok();
			await t.typeText(Selector("[data-testid=AuthenticationStep__mnemonic]"), MNEMONICS[0]);
			await t.expect(Selector("[data-testid=AuthenticationStep__mnemonic]").hasAttribute("aria-invalid")).notOk();
			const sendButton = Selector("button").withText(translations.COMMON.SEND);
			await t.expect(sendButton.hasAttribute("disabled")).notOk();
			await t.click(sendButton);
		},
		"Then the transaction is sent successfully": async (t: TestController) => {
			await t
				.expect(Selector("h1").withText(translations.TRANSACTION.SUCCESS.TITLE).exists)
				.ok({ timeout: 5000 });
		},
	},
	[
		mockRequest(
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api/wallets/0xDC0A21aF27FeB1b7e0f2e519288445c0510Cb23C",
			},
			Fixtures.Wallet,
		),
		mockRequest(
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api/wallets/?attributes.validatorPublicKey=84c48b1f7388d582a042718c35d9f57dcb9c4314be8b44807a14f329a3bb3853796882756d32e8e11e034f1e7e072cc2",
			},
			{
				meta: {
					count: 0,
				},
			},
		),
		mockRequest(
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api/transactions?limit=30&address=0xDC0A21aF27FeB1b7e0f2e519288445c0510Cb23C",
			},
			Fixtures.Transactions,
		),
		mockRequest(
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=20&senderId=0xDC0A21aF27FeB1b7e0f2e519288445c0510Cb23C",
			},
			{
				data: {},
			},
		),
		mockRequest(
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api/transactions/9c5614d2f4e060f52c1dc8effd837bf13db0ce5ae4232cb24217300a74cdbceb",
			},
			{
				data: {},
			},
		),
		mockRequest(
			{
				method: "POST",
				url: "https://dwallets-evm.mainsailhq.com/tx/api/transactions",
			},
			{
				data: {
					accept: [0],
					broadcast: [0],
					excess: [],
					invalid: [],
				},
			},
		),
		mockRequest(
			{
				method: "GET",
				url: /^https:\/\/dwallets-evm\.mainsailhq\.com\/api\/transactions\/[\dA-Fa-f]+$/,
			},
			{
				data: {
					amount: "0",
					asset: {
						username: "test_username",
					},
					blockId: "0ea51e28e20036d5cfee451ba9cb924ea5a386c0742f2fb056d2c5cf7b1f2a8c",
					confirmations: 47,
					fee: "2500000000",
					id: "02fe57916813eadb089e5a7bdb7f4bc5bcc8c773b2b663d525ef853f12cf4e7e",
					nonce: "2",
					recipient: null,
					senderPublicKey: "03d7001f0cfff639c0e458356581c919d5885868f14f72ba3be74c8f105cce34ac",
					signature:
						"0135b73aa2f7d88486d9ac71b20047d75816ae339a8c5f3df78776010191a946238cf143b36fb4eaba76714f2fb0455f8b0734c93d87e1dd26d9442f4e394dfb",
					signatures: null,
					timestamp: 1_725_443_456_513,
					type: 8,
					typeGroup: 1,
					vendorField: null,
					version: 1,
				},
			},
		),
	],
);

cucumber("@validatorRegistration-invalidPublicKey", {
	...preSteps,
	"When she enters an invalid public key": async (t: TestController) => {
		await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
		await t.typeText(Selector("[data-testid=Input__validator_public_key]"), "invalid-pub-key");
	},
	"Then an error is displayed on the name field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok();
	},
	"And the continue button is disabled": async (t: TestController) => {
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();
	},

}, [
	mockRequest(
		{
			method: "GET",
			url: "https://dwallets-evm.mainsailhq.com/api/wallets/0xDC0A21aF27FeB1b7e0f2e519288445c0510Cb23C",
		},
		Fixtures.Wallet,
	),
	mockRequest(
		{
			method: "GET",
			url: "https://dwallets-evm.mainsailhq.com/api/wallets/?attributes.validatorPublicKey=84c48b1f7388d582a042718c35d9f57dcb9c4314be8b44807a14f329a3bb3853796882756d32e8e11e034f1e7e072cc2",
		},
		{
			meta: {
				count: 0,
			},
		},
	),
	mockRequest(
		{
			method: "GET",
			url: "https://dwallets-evm.mainsailhq.com/api/transactions?limit=30&address=0xDC0A21aF27FeB1b7e0f2e519288445c0510Cb23C",
		},
		Fixtures.Transactions,
	),
	mockRequest(
		{
			method: "GET",
			url: "https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=20&senderId=0xDC0A21aF27FeB1b7e0f2e519288445c0510Cb23C",
		},
		{
			data: {},
		},
	),
]);
