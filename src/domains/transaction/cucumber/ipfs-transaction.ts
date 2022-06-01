import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, MNEMONICS, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../wallet/e2e/common";

const translations = buildTranslations();

const preSteps = {
	"Given Alice is on the ipfs transaction form": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWallet(t, MNEMONICS[0]);
		await t.click(Selector('[data-testid="WalletHeader__more-button"]'));
		await t.click(
			Selector('[data-testid="WalletHeader__more-button"] li').withText(
				translations.WALLETS.PAGE_WALLET_DETAILS.OPTIONS.STORE_HASH,
			),
		);
		await t.expect(Selector("h1").withText(translations.TRANSACTION.PAGE_IPFS.FIRST_STEP.TITLE).exists).ok();
	},
};
cucumber(
	"@ipfsTransaction",
	{
		...preSteps,
		"When she enters a valid ipfs hash": async (t: TestController) => {
			await t.typeText(Selector("[data-testid=Input__hash]"), "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco");
		},
		"And sends the ipfs transaction": async (t: TestController) => {
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.expect(Selector("h1").withText(translations.TRANSACTION.PAGE_IPFS.SECOND_STEP.TITLE).exists).ok();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.typeText(Selector("[data-testid=AuthenticationStep__mnemonic]"), MNEMONICS[0], { replace: true });
			await t.click(Selector("[data-testid=StepNavigation__send-button]"));
		},
		"Then the transaction is sent successfully": async (t: TestController) => {
			await t
				.expect(Selector("h1").withText(translations.TRANSACTION.SUCCESS.TITLE).exists)
				.ok({ timeout: 60_000 });
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
	],
);
cucumber("@ipfsTransaction-invalidHash", {
	...preSteps,
	"When she enters an invalid ipfs hash": async (t: TestController) => {
		await t.typeText(Selector("[data-testid=Input__hash]"), "invalidhash");
	},
	"Then an error is displayed on the ipfs hash field": async (t: TestController) => {
		await t.expect(Selector('[data-testid="Input__error"]').exists).ok();
	},
	"And the continue button is disabled": async (t: TestController) => {
		await t.expect(Selector('[data-testid="StepNavigation__continue-button"]').hasAttribute("disabled")).ok();
	},
});
