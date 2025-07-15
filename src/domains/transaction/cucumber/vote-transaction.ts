import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../wallet/e2e/common";

const translations = buildTranslations();
const sendButton = Selector("button").withText(translations.COMMON.SEND);

const preSteps = {
	"Given Alice is on the Vote page": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWallet(t, MNEMONICS[0]);
		await t.click(Selector("a").withText(translations.COMMON.VOTES));
		await t.expect(Selector("h1").withText(translations.VOTE.VOTES_PAGE.TITLE).exists).ok();
	},
};
cucumber(
	"@voteTransaction",
	{
		...preSteps,
		"When she attempts to vote for a validator": async (t: TestController) => {
			await t.click(Selector('[data-testid="AddressRow__select-2"]').withText(translations.COMMON.VOTE));
			await t.expect(Selector("h1").withText(translations.VOTE.VALIDATOR_TABLE.TITLE).exists).ok();
			await t.click(Selector('[data-testid="ValidatorRow__toggle-0"]').withText(translations.COMMON.SELECT));
			await t.expect(Selector("[data-testid=ValidatorTable__footer]").exists).ok();
			await t.click(
				Selector('[data-testid="ValidatorTable__continue-button"]').withText(translations.COMMON.CONTINUE),
			);
			await t.expect(Selector("h1").withText(translations.TRANSACTION.REVIEW_STEP.TITLE).exists).ok();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.typeText(Selector("[data-testid=AuthenticationStep__mnemonic]"), MNEMONICS[0], { replace: true });
			await t.click(Selector("[data-testid=StepNavigation__send-button]"));
		},
		"Then the transaction is successfully sent": async (t: TestController) => {
			await t
				.expect(Selector("h1").withText(translations.TRANSACTION.SUCCESS.CONFIRMED).exists)
				.ok({ timeout: 60_000 });
		},
	},
	[
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
			"https://dwallets-evm.mainsailhq.com/api/transactions/1986812653be5ad1cb0c7aae0bbe29cadcde3ee37196c88ff51cfe665d108767",
			{
				data: {
					blockHash: "05b124023ddd656c8a95664eb61846cc0f4e204341a0d86db325771077e7f002",
					confirmations: 1,
					data: "0x602a9eee0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003094187d07633373e2621d03d18d5e07df2aa0f15a611de28b05381d212f1a7cce2fef8c3629bdb1b9678ce309e264330b00000000000000000000000000000000",
					gas: "300000",
					gasPrice: "5000000000",
					from: "0x659A76be283644AEc2003aa8ba26485047fd1BFB",
					hash: "1986812653be5ad1cb0c7aae0bbe29cadcde3ee37196c88ff51cfe665d108767",
					nonce: "3",
					senderPublicKey: "0311b11b0dea8851d49af7c673d7032e37ee12307f9bbd379b64bbdac6ca302e84",
					signature:
						"cd1b35240b0c1303392e4dc3e1fc83b9da7b74e5c96b99d1ae207c7c9d5480d868ecf4235298c6438f9c0ea9a8274082ebf051d86ff353ae1fb4fffe86cad91101",
					to: "0x535B3D7A252fa034Ed71F0C53ec0C6F784cB64E1",
					value: "0",
					timestamp: "1752502567204",
					receipt: {
						gasRefunded: 0,
						gasUsed: 21000,
						status: 1,
					},
				},
			},
		),
	],
);

cucumber("@voteTransaction-invalidMnemonic", {
	...preSteps,
	"When she attempts to vote for a validator with an invalid mnemonic": async (t: TestController) => {
		await t.click(Selector('[data-testid="AddressRow__select-2"]').withText(translations.COMMON.VOTE));
		await t.expect(Selector("h1").withText(translations.VOTE.VALIDATOR_TABLE.TITLE).exists).ok();
		await t.click(Selector('[data-testid="ValidatorRow__toggle-0"]').withText(translations.COMMON.SELECT));
		await t.expect(Selector("[data-testid=ValidatorTable__footer]").exists).ok();
		await t.click(
			Selector('[data-testid="ValidatorTable__continue-button"]').withText(translations.COMMON.CONTINUE),
		);
		await t.expect(Selector("h1").withText(translations.TRANSACTION.REVIEW_STEP.TITLE).exists).ok();
		await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
		await t.typeText(Selector("[data-testid=AuthenticationStep__mnemonic]"), "wrong mnemonic", {
			replace: true,
		});
	},
	"Then an error is displayed on the mnemonic field": async (t: TestController) => {
		await t.click(Selector("[data-testid=StepNavigation__send-button]"));
		await t.expect(Selector("[data-testid=AuthenticationStep__mnemonic]").hasAttribute("aria-invalid")).ok();
	},
	"And the send button is disabled.": async (t: TestController) => {
		await t.expect(sendButton.hasAttribute("disabled")).ok();
	},
});
