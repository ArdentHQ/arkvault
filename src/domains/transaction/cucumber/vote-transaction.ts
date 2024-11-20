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
		"When she attempts to vote for a delegate": async (t: TestController) => {
			await t.click(Selector('[data-testid="AddressRow__select-2"]').withText(translations.COMMON.VOTE));
			await t.expect(Selector("h1").withText(translations.VOTE.VALIDATOR_TABLE.TITLE).exists).ok();
			await t.click(Selector('[data-testid="DelegateRow__toggle-0"]').withText(translations.COMMON.SELECT));
			await t.expect(Selector("[data-testid=DelegateTable__footer]").exists).ok();
			await t.click(
				Selector('[data-testid="DelegateTable__continue-button"]').withText(translations.COMMON.CONTINUE),
			);
			await t.expect(Selector("h1").withText(translations.TRANSACTION.PAGE_VOTE.FORM_STEP.TITLE).exists).ok();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
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
				url: "https://ark-test.arkvault.io/api/transactions",
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
				url: "https://ark-test.arkvault.io/api/wallets/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
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
		mockRequest(
			{
				method: "GET",
				url: "https://ark-test.arkvault.io/api/transactions/fddbb51bdc077b2c8fad8d86032f3af03f1462dd84493c871450c643377e984a",
			},
			{
				data: {},
			},
		),
	],
);
cucumber(
	"@voteTransaction-invalidMnemonic",
	{
		...preSteps,
		"When she attempts to vote for a delegate with an invalid mnemonic": async (t: TestController) => {
			await t.click(Selector('[data-testid="AddressRow__select-2"]').withText(translations.COMMON.VOTE));
			await t.expect(Selector("h1").withText(translations.VOTE.VALIDATOR_TABLE.TITLE).exists).ok();
			await t.click(Selector('[data-testid="DelegateRow__toggle-0"]').withText(translations.COMMON.SELECT));
			await t.expect(Selector("[data-testid=DelegateTable__footer]").exists).ok();
			await t.click(
				Selector('[data-testid="DelegateTable__continue-button"]').withText(translations.COMMON.CONTINUE),
			);
			await t.expect(Selector("h1").withText(translations.TRANSACTION.PAGE_VOTE.FORM_STEP.TITLE).exists).ok();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
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
	},
	[
		mockRequest(
			{
				method: "POST",
				url: "https://ark-test.arkvault.io/api/transactions",
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
				url: "https://ark-test.arkvault.io/api/wallets/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
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
	],
);
