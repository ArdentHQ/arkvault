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
		},
		"Then the transaction is created successfully": async (t: TestController) => {
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

		mockRequest(
			{
				method: "GET",
				url: "https://ark-test.arkvault.io/api/wallets/DRKHfdPvVqhKVj7VNWusrJW3unBhQtvjDK",
			},
			{
				data: {
					address: "DRKHfdPvVqhKVj7VNWusrJW3unBhQtvjDK",
					publicKey: "0366edb698bf3abce4da6304f84775ed696ef30f4fe5a2359449f3d974a5b52744",
					balance: "19632023",
					nonce: "48",
					attributes: {
						delegate: {
							username: "ragnar",
							voteBalance: "0",
							forgedFees: "0",
							forgedRewards: "0",
							producedBlocks: 0,
							rank: 388,
						},
						vote: "03d7a20b3d39b7526a5057a9b486f0200bc57543e69e5fa61d9ce0bdd7784162c3",
					},
				},
			},
		),
		mockRequest(
			{
				method: "GET",
				url: "https://ark-test.arkvault.io/api/wallets/DMtTMLtKEtxpPreRdPk5bGCmGUza52wUqp",
			},
			{
				data: {
					address: "DMtTMLtKEtxpPreRdPk5bGCmGUza52wUqp",
					publicKey: "03930920dcb10b8e8a2aa271866ac9dcac2a16e007380eb52e2c3ab71679533305",
					balance: "1000000000",
					nonce: "1",
					attributes: {},
				},
			},
		),
		mockMuSigRequest("https://ark-test-musig.arkvault.io", "store", {
			result: {
				id: "transaction-id",
			},
		}),
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions/d828d245f7bce9a98e289a8f11d8ea4155714e92f9a8b306eb701c18b0ca9ce3",
			{
				error: "Not Found",
				message: "Wallet not found",
				statusCode: 404,
			},
		),
	],
);
