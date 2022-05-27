import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, mockMuSigRequest, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWalletByAddress } from "../../wallet/e2e/common";

const translations = buildTranslations();

const preSteps = {
	"Given Alice is on the Vote page for multisig wallet": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWalletByAddress(t, "DJXg9Vqg2tofRNrMAvMzhZTkegu8QyyNQq");
		await t.click(Selector('[data-testid="UserMenu"]'));
		await t.expect(Selector('[data-testid="dropdown__option--1"]').withText(translations.COMMON.VOTES).exists).ok();
		await t.click(Selector('[data-testid="dropdown__option--1"]').withText(translations.COMMON.VOTES));
		await t.expect(Selector("h1").withText(translations.VOTE.VOTES_PAGE.TITLE).exists).ok();
	},
};
cucumber(
	"@voteTransactionMultisig",
	{
		...preSteps,
		"When she attempts to vote for a delegate with multisig wallet": async (t: TestController) => {
			await t.click(Selector('[data-testid="AddressRow__select-2"]').withText(translations.COMMON.VOTE));
			await t.expect(Selector("h2").withText(translations.VOTE.DELEGATE_TABLE.TITLE).exists).ok();
			await t.click(Selector('[data-testid="DelegateRow__toggle-0"]').withText(translations.COMMON.SELECT));
			await t.expect(Selector("[data-testid=DelegateTable__footer]").exists).ok();
			await t.click(
				Selector('[data-testid="DelegateTable__continue-button"]').withText(translations.COMMON.CONTINUE),
			);
			await t.expect(Selector("h1").withText(translations.TRANSACTION.PAGE_VOTE.FORM_STEP.TITLE).exists).ok();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
		},
		"Then the transaction for multisig wallet is successfully created": async (t: TestController) => {
			await t.expect(Selector("h1").withText("Transaction Created").exists).ok();
		},
	},
	[
		mockRequest(
			{
				method: "POST",
				url: "https://ark-test.payvo.com/api/transactions",
			},
			{
				data: {
					accept: ["transaction-id"],
					broadcast: ["transaction-id"],
					excess: [],
					invalid: [],
				},
			},
		),
		mockRequest(
			{
				method: "POST",
				url: "https://ark-test.payvo.com/api/wallets/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
			},
			{
				data: {
					address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
					attributes: {
						htlc: {
							lockedBalance: "0",
							locks: {},
						},
					},
					balance: "3375089801",
					isDelegate: false,
					isResigned: false,
					lockedBalance: "0",
					multiSignature: {},
					nonce: "245",
					publicKey: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc",
				},
			},
		),
		mockMuSigRequest("https://ark-test-musig.payvo.com", "store", {
			result: {
				id: "transaction-id",
			},
		}),
	],
);
