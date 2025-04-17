import { Collections } from "@ardenthq/sdk";
import { describeWithContext } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer } from "../test/mocking";
import { ProfileSetting } from "./contracts";
import { Profile } from "./profile";
import { ExtendedConfirmedTransactionDataCollection } from "./transaction.collection";
import { ExtendedConfirmedTransactionData } from "./transaction.dto.js";
import { transformConfirmedTransactionDataCollection } from "./transaction.mapper";

describeWithContext(
	"TransactionMapper",
	{
		data: [
			[ExtendedConfirmedTransactionData, "isDelegateRegistration"],
			[ExtendedConfirmedTransactionData, "isDelegateResignation"],
			[ExtendedConfirmedTransactionData, "isHtlcClaim"],
			[ExtendedConfirmedTransactionData, "isHtlcLock"],
			[ExtendedConfirmedTransactionData, "isHtlcRefund"],
			[ExtendedConfirmedTransactionData, "isIpfs"],
			[ExtendedConfirmedTransactionData, "isMultiPayment"],
			[ExtendedConfirmedTransactionData, "isMultiSignatureRegistration"],
			[ExtendedConfirmedTransactionData, "isSecondSignature"],
			[ExtendedConfirmedTransactionData, "isTransfer"],
			[ExtendedConfirmedTransactionData, "isVote"],
			[ExtendedConfirmedTransactionData, "isUnvote"],
			[ExtendedConfirmedTransactionData, "isOther"],
		],
		dummyTransactionData: {
			isDelegateRegistration: () => false,
			isDelegateResignation: () => false,
			isHtlcClaim: () => false,
			isHtlcLock: () => false,
			isHtlcRefund: () => false,
			isIpfs: () => false,
			isMagistrate: () => false,
			isMultiPayment: () => false,
			isMultiSignatureRegistration: () => false,
			isSecondSignature: () => false,
			isTransfer: () => false,
			isUnvote: () => false,
			isVote: () => false,
			normalizeData: async () => ({}),
		},
	},
	({ assert, beforeAll, it, nock, loader }) => {
		beforeAll(async (context) => {
			bootContainer();

			nock.fake()
				.get("/api/peers")
				.reply(200, loader.json("test/fixtures/client/peers.json"))
				.get("/api/node/configuration/crypto")
				.reply(200, loader.json("test/fixtures/client/cryptoConfiguration.json"))
				.get("/api/node/syncing")
				.reply(200, loader.json("test/fixtures/client/syncing.json"))
				.persist();

			context.profile = new Profile({ avatar: "avatar", data: "", id: "profile-id", name: "name" });
			context.profile.settings().set(ProfileSetting.Name, "John Doe");

			context.wallet = await context.profile.walletFactory().fromMnemonicWithBIP39({
				coin: "ARK",
				mnemonic: identity.mnemonic,
				network: "ark.devnet",
			});
		});

		// it.each(data)(`should map %p correctly`, (className, functionName) => {
		// 	assert.instance(
		// 		transformTransactionData(wallet, {
		// 			...dummyTransactionData,
		// 			[String(functionName)]: () => true,
		// 		}),
		// 		className,
		// 	);
		// });

		it("should map collection correctly", async (context) => {
			const pagination = {
				last: "last",
				next: "after",
				prev: "before",
				self: "now",
			};

			const transactionData = new ExtendedConfirmedTransactionData(context.wallet, {
				isMagistrate: () => true,
				normalizeData: async () => ({}),
			});

			const collection = new Collections.ConfirmedTransactionDataCollection([transactionData], pagination);

			const transformedCollection = await transformConfirmedTransactionDataCollection(context.wallet, collection);
			assert.instance(transformedCollection, ExtendedConfirmedTransactionDataCollection);
			assert.is(transformedCollection.getPagination(), pagination);
		});
	},
);
