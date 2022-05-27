import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, mockMuSigRequest, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWalletByAddress } from "../../wallet/e2e/common";

const translations = buildTranslations();

const preSteps = {
	"Given Alice is on the ipfs transaction form with a multisig wallet": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWalletByAddress(t, "DJXg9Vqg2tofRNrMAvMzhZTkegu8QyyNQq");
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
	"@ipfsTransaction-multisig",
	{
		...preSteps,
		"When she enters a valid ipfs hash": async (t: TestController) => {
			await t.typeText(Selector("[data-testid=Input__hash]"), "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco");
		},
		"And sends the ipfs transaction with multisig wallet": async (t: TestController) => {
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.expect(Selector("h1").withText(translations.TRANSACTION.PAGE_IPFS.SECOND_STEP.TITLE).exists).ok();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.wait(2000);
		},
		"Then the transaction is created successfully": async (t: TestController) => {
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
		mockMuSigRequest("https://ark-test-musig.payvo.com", "store", {
			result: {
				id: "transaction-id",
			},
		}),
	],
);
