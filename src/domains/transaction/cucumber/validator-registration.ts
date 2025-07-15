import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../wallet/e2e/common";
import { goToValidatorRegistrationPage } from "../e2e/common";

const translations = buildTranslations();

const preSteps = {
	"Given Alice has navigated to the validator registration form for a wallet": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWallet(t, MNEMONICS[0]);
		await goToValidatorRegistrationPage(t);
	},
};
cucumber(
	"@validatorRegistration",
	{
		...preSteps,
		"When she enters valid public key": async (t: TestController) => {
			await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
			await t.typeText(
				Selector("[data-testid=Input__validator_public_key]"),
				"b387dc09d41dc443a0bb972f5bcce2b06620e2f1711a0596e96275c5ab38d4c85ccbe2d5f92d6f02dee4853acf1a14d9",
				{ replace: true },
			);
			await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).notOk();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t
				.expect(
					Selector("[data-testid=DetailWrapper]").withText(
						"b387dc09d41dc443a0bb972f5bcce2b06620e2f1711a0596e96275c5ab38d4c85ccbe2d5f92d6f02dee4853acf1a14d9",
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
				.expect(Selector("h1").withText(translations.TRANSACTION.SUCCESS.CONFIRMED).exists)
				.ok({ timeout: 5000 });
		},
	},
	[
		mockRequest(
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api?attributes.validatorPublicKey=b387dc09d41dc443a0bb972f5bcce2b06620e2f1711a0596e96275c5ab38d4c85ccbe2d5f92d6f02dee4853acf1a14d9",
			},
			{},
			404,
		),
		mockRequest(
			"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=10&to=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6&address=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6,0xA46720D11Bc8408411Cbd45057EeDA6d32D2Af54,0x659A76be283644AEc2003aa8ba26485047fd1BFB",
			{},
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
			"https://dwallets-evm.mainsailhq.com/api/transactions/adb9bdd390ef3176be04b2ea841d7cd48dc72a8fdf4f145a8eece22f3c58df14",
			{
				data: {
					blockHash: "05b124023ddd656c8a95664eb61846cc0f4e204341a0d86db325771077e7f002",
					confirmations: 1,
					data: "",
					from: "0x659A76be283644AEc2003aa8ba26485047fd1BFB",
					gas: "21000",
					gasPrice: "100000000000",
					hash: "adb9bdd390ef3176be04b2ea841d7cd48dc72a8fdf4f145a8eece22f3c58df14",
					nonce: "3",
					senderPublicKey: "0311b11b0dea8851d49af7c673d7032e37ee12307f9bbd379b64bbdac6ca302e84",
					signature:
						"cd1b35240b0c1303392e4dc3e1fc83b9da7b74e5c96b99d1ae207c7c9d5480d868ecf4235298c6438f9c0ea9a8274082ebf051d86ff353ae1fb4fffe86cad91101",
					to: "0x47ea9bAa16edd859C1792933556c4659A647749C",
					value: "2000000000000000000",
					timestamp: "1752502567204",
					receipt: {
						gasRefunded: 0,
						gasUsed: 21000,
						status: 1,
					},
				},
			},
		),
		mockRequest(
			"https://dwallets-evm.mainsailhq.com/api/blocks/05b124023ddd656c8a95664eb61846cc0f4e204341a0d86db325771077e7f002",
			{},
		),
	],
);

cucumber("@validatorRegistration-invalidName", {
	...preSteps,
	"When she enters an invalid public key": async (t: TestController) => {
		await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
		await t.typeText(Selector("[data-testid=Input__validator_public_key]"), "TEST KEY");
	},
	"Then an error is displayed on the name field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok();
	},
	"And the continue button is disabled": async (t: TestController) => {
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();
	},
});

cucumber(
	"@validatorRegistration-usedPublicKey",
	{
		...preSteps,
		"When she enters a public key that already used": async (t: TestController) => {
			await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
			await t.typeText(
				Selector("[data-testid=Input__validator_public_key]"),
				"d387dc09d41dc443a0bb972f5bcce2b06620e2f1711a0596e96275c5ab38d4c85ccbe2d5f92d6f02dee4853acf1a14d9",
				{ replace: true },
			);
		},
		"Then an error is displayed on the name field": async (t: TestController) => {
			await t.expect(Selector('[data-testid="Input__error"]').exists).ok();
		},
		"And the continue button is disabled": async (t: TestController) => {
			await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).ok();
		},
	},
	[
		mockRequest(
			{
				method: "GET",
				url: "https://dwallets-evm.mainsailhq.com/api?attributes.validatorPublicKey=d387dc09d41dc443a0bb972f5bcce2b06620e2f1711a0596e96275c5ab38d4c85ccbe2d5f92d6f02dee4853acf1a14d9",
			},
			{},
			200,
		),
	],
);
