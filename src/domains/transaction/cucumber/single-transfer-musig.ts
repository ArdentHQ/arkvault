import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, mockMuSigRequest, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWalletByAddress } from "../../wallet/e2e/common";
import { goToTransferPage } from "../e2e/common";

const translations = buildTranslations();

const preSteps = {
	"Given Alice is on the transaction form for a multisig wallet": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWalletByAddress(t, "DJXg9Vqg2tofRNrMAvMzhZTkegu8QyyNQq");
		await goToTransferPage(t);
	},
};
cucumber(
	"@singleTransfer-multisig",
	{
		...preSteps,
		"When she completes the single transfer process with a multisig wallet": async (t: TestController) => {
			await t.click(Selector("[data-testid=SelectRecipient__select-recipient]"));
			await t.expect(Selector("[data-testid=Modal__inner]").exists).ok();
			await t.click(Selector("[data-testid=RecipientListItem__select-button-0]"));
			await t.click(Selector("[data-testid=AddRecipient__send-all]"));
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.expect(Selector("h1").withText(translations.TRANSACTION.REVIEW_STEP.TITLE).exists).ok();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
		},
		"Then the transaction is successfully created": async (t: TestController) => {
			await t.expect(Selector("h1").withText("Transaction Created").exists).ok();
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
		mockMuSigRequest("https://ark-test-musig.arkvault.io", "store", {
			result: {
				id: "transaction-id",
			},
		}),
	],
);
