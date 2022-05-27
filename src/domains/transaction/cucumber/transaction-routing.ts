import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { goToWallet, importWalletByAddress } from "../../wallet/e2e/common";
import { goToDelegateResignationPage, goToTransferPage, goToTransferPageThroughNavbar } from "../e2e/common";

const translations = buildTranslations();

const preSteps = {
	"Given Alice is on a wallet details page": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await goToWallet(t);
	},
};
const transferPageStep = {
	"Then she is on the transfer page": async (t: TestController) => {
		await t
			.expect(
				Selector("h1").withText(
					translations.TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.TITLE.replace("{{ticker}}", "DARK"),
				).exists,
			)
			.ok({ timeout: 60_000 });
	},
};
const selectCryptoStep = {
	"Then she is on the select crypto asset page": async (t: TestController) => {
		await t
			.expect(Selector("h1").withText(translations.TRANSACTION.PAGE_TRANSACTION_SEND.NETWORK_STEP.TITLE).exists)
			.ok();
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
	...selectCryptoStep,
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
	...selectCryptoStep,
});
cucumber(
	"@transactionRouting-delegateResignation",
	{
		"Given Alice is on a wallet details page for a delegate wallet": async (t: TestController) => {
			await visitWelcomeScreen(t);
			await goToProfile(t);
			await importWalletByAddress(t, "DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS");
		},
		"When she navigates to the delegate resignation page": async (t: TestController) => {
			await goToDelegateResignationPage(t);
		},
		"Then she is on the delegate resignation page": async (t: TestController) => {
			await t
				.expect(
					Selector("div").withText(translations.TRANSACTION.PAGE_DELEGATE_RESIGNATION.FORM_STEP.TITLE).exists,
				)
				.ok();
		},
	},
	[
		mockRequest("https://ark-test.payvo.com/api/wallets/DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS", {
			data: {
				address: "DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS",
				attributes: {
					delegate: {
						username: "testwallet",
					},
				},
				balance: "10000000000",
				isDelegate: true,
				isResigned: false,
				nonce: "1",
				publicKey: "02e012f0a7cac12a74bdc17d844cbc9f637177b470019c32a53cef94c7a56e2ea9",
			},
		}),
	],
);
