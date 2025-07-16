import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { goToWallet, importWalletByAddress } from "../../wallet/e2e/common";
import { goToValidatorResignationPage, goToTransferPage, goToTransferPageThroughNavbar } from "../e2e/common";

const translations = buildTranslations();

const preSteps = {
	"Given Alice is on a wallet details page": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
	},
};
const transferPageStep = {
	"Then she is on the transfer page": async (t: TestController) => {
		await t
			.expect(
				Selector("h1").withText(
					translations.TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.TITLE.replace("{{ticker}}", "ARK"),
				).exists,
			)
			.ok({ timeout: 60_000 });
	},
};

cucumber("@transactionRouting-transferPage", {
	...preSteps,
	"When she navigates to the transfer page via the send button": async (t: TestController) => {
		await goToTransferPage(t);
	},
	...transferPageStep,
});
cucumber("@transactionRouting-transferPageNavbar", {
	...preSteps,
	"When she navigates to the transfer page via the navbar": async (t: TestController) => {
		await goToTransferPageThroughNavbar(t);
	},
});
cucumber("@transactionRouting-reloadTransfer", {
	...preSteps,
	"When she navigates to the transfer page via the send button": async (t: TestController) => {
		await goToTransferPage(t);
	},
	...transferPageStep,
	"When she navigates to the transfer page via the navbar": async (t: TestController) => {
		await goToTransferPageThroughNavbar(t);
	},
});
cucumber(
	"@transactionRouting-validatorResignation",
	{
		"Given Alice is on a wallet details page for a validator wallet": async (t: TestController) => {
			await visitWelcomeScreen(t);
			await goToProfile(t);
			await importWalletByAddress(t, "0xb0E6c955a0Df13220C36Ea9c95bE471249247E57");
		},
		"When she navigates to the validator resignation page": async (t: TestController) => {
			await goToValidatorResignationPage(t);
		},
		"Then she is on the validator resignation page": async (t: TestController) => {
			await t
				.expect(
					Selector("div").withText(translations.TRANSACTION.PAGE_VALIDATOR_RESIGNATION.FORM_STEP.TITLE)
						.exists,
				)
				.ok();
		},
	},
	[
		mockRequest("https://dwallets-evm.mainsailhq.com/api/wallets/0xb0E6c955a0Df13220C36Ea9c95bE471249247E57", {
			data: {
				address: "0xb0E6c955a0Df13220C36Ea9c95bE471249247E57",
				publicKey: "0311b11b0dea8851d49af7c673d7032e37ee12307f9bbd379b64bbdac6ca302e84",
				balance: "9999919892164047230000",
				nonce: "1",
				attributes: {
					vote: "0xe5a97E663158dEaF3b65bBF88897b8359Dc19F81",
					isLegacy: true,
					username: "genesis_31",
					validatorFee: "0",
					validatorRank: 1,
					validatorApproval: 0.0081,
					validatorResigned: false,
					validatorLastBlock: {
						hash: "497b6996b2a29e0ba2336d8a713a4fc50618715a1d339d82ca45a01d4fe7acc1",
						number: 21706617,
						timestamp: 1752520916100,
					},
					validatorPublicKey:
						"91ff20e1aee92c4e6febc1f7e1e55355d182812536055afb6a1bab300387580707bc0536e9d994e84fe58be8513e2550",
					validatorVoteBalance: "1367063916700780000000000",
					validatorVotersCount: 22,
					validatorProducedBlocks: 882,
				},
				updated_at: "248548",
			},
		}),
		mockRequest(
			"https://dwallets-evm.mainsailhq.com/api/transactions?page=1&limit=30&orderBy=timestamp:desc&address=0xb0E6c955a0Df13220C36Ea9c95bE471249247E57",
			{},
		),
	],
);
