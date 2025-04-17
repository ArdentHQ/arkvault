import { describe } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer, importByMnemonic } from "../test/mocking";
import { Profile } from "./profile";
import { TransactionAggregate } from "./transaction.aggregate";
import { ExtendedConfirmedTransactionDataCollection } from "./transaction.collection";
import { IReadWriteWallet } from "./wallet.contract";

describe("TransactionAggregate", ({ each, loader, afterEach, beforeAll, beforeEach, nock, assert, stub, spy, it }) => {
	const datasets = ["all", "sent", "received"];

	let wallet: IReadWriteWallet;

	beforeAll(async (context) => {
		bootContainer();

		nock.fake()
			.get("/api/node/configuration/crypto")
			.reply(200, loader.json("test/fixtures/client/cryptoConfiguration.json"))
			.get("/api/node/configuration")
			.reply(200, loader.json("test/fixtures/client/configuration.json"))
			.get("/api/peers")
			.reply(200, loader.json("test/fixtures/client/peers.json"))
			.get("/api/node/syncing")
			.reply(200, loader.json("test/fixtures/client/syncing.json"))
			.get("/api/wallets", {})
			.query({ limit: 1, nonce: 0 })
			.reply(200, {})
			.get("/api/wallets/D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW")
			.reply(200, loader.json("test/fixtures/client/wallet.json"))
			.persist();

		const profile = new Profile({ avatar: "avatar", data: "", id: "uuid", name: "name" });

		wallet = await importByMnemonic(profile, identity.mnemonic, "ARK", "ark.devnet");

		context.subject = new TransactionAggregate(profile);
	});

	afterEach((context) => {
		for (const dataset of datasets) {
			context.subject.flush(dataset);
		}
	});

	each(
		"should have more transactions (%s)",
		async ({ context, dataset }) => {
			nock.fake()
				.get("/api/transactions")
				.query(true)
				.reply(200, loader.json("test/fixtures/client/transactions.json"));

			const result = await context.subject[dataset]();

			assert.instance(result, ExtendedConfirmedTransactionDataCollection);
			assert.length(result.items(), 100);
			assert.is(result.items()[0].amount(), 7.999_999_99);
		},
		datasets,
	);

	each(
		"should not have more transactions (%s)",
		async ({ context, dataset }) => {
			nock.fake()
				.get("/api/transactions")
				.query(true)
				.reply(200, loader.json("test/fixtures/client/transactions-no-more.json"));

			const result = await context.subject[dataset]();

			assert.instance(result, ExtendedConfirmedTransactionDataCollection);
			assert.length(result.items(), 100);
			assert.false(context.subject.hasMore(dataset));
		},
		datasets,
	);

	each(
		"should skip error responses for processing (%s)",
		async ({ context, dataset }) => {
			nock.fake().get("/api/transactions").query(true).reply(404);

			const result = await context.subject[dataset]();

			assert.instance(result, ExtendedConfirmedTransactionDataCollection);
			assert.length(result.items(), 0);
			assert.false(context.subject.hasMore(dataset));
		},
		datasets,
	);

	each(
		"should skip empty responses for processing (%s)",
		async ({ context, dataset }) => {
			nock.fake()
				.get("/api/transactions")
				.query(true)
				.reply(200, loader.json("test/fixtures/client/transactions-empty.json"));

			const result = await context.subject[dataset]();

			assert.instance(result, ExtendedConfirmedTransactionDataCollection);
			assert.length(result.items(), 0);
			assert.false(context.subject.hasMore(dataset));
		},
		datasets,
	);

	/*
	each("should fetch transactions twice and then stop because no more are available (%s)", async ({ context, dataset }) => {
		nock.fake()
			.get("/api/transactions")
			.query(true)
			.reply(200, loader.json("test/fixtures/client/transactions.json"))
			.get("/api/transactions")
			.query(true)
			.reply(200, loader.json("test/fixtures/client/transactions-no-more.json"));

		// We receive a response that does contain a "next" cursor
		const firstRequest = await context.subject[dataset]();

		assert.instance(firstRequest, ExtendedConfirmedTransactionDataCollection);
		assert.length(firstRequest.items(), 100);
		assert.true(context.subject.hasMore(dataset));

		// We receive a response that does not contain a "next" cursor
		const secondRequest = await context.subject[dataset]();

		assert.instance(secondRequest, ExtendedConfirmedTransactionDataCollection);
		assert.length(secondRequest.items(), 100);
		assert.false(context.subject.hasMore(dataset));

		// We do not send any requests because no more data is available
		const thirdRequest = await context.subject[dataset]();

		assert.instance(thirdRequest, ExtendedConfirmedTransactionDataCollection);
		assert.length(thirdRequest.items(), 0);
		assert.false(context.subject.hasMore(dataset));
	}, datasets);

	each("should determine if it has more transactions to be requested (%s)", async ({ context, dataset }) => {
		nock.fake()
			.get("/api/transactions")
			.query(true)
			.reply(200, loader.json("test/fixtures/client/transactions.json"));

		assert.false(context.subject.hasMore(dataset));

		await context.subject[dataset]();

		assert.true(context.subject.hasMore(dataset));
	}, datasets);

	each("should flush the history (%s)", async ({ context, dataset }) => {
		nock.fake()
			.get("/api/transactions")
			.query(true)
			.reply(200, loader.json("test/fixtures/client/transactions.json"));

		assert.false(context.subject.hasMore(dataset));

		await context.subject[dataset]();

		assert.true(context.subject.hasMore(dataset));

		context.subject.flush(dataset);
	}, datasets);

	each("should flush all the history (%s)", async ({ context, dataset }) => {
		nock.fake()
			.get("/api/transactions")
			.query(true)
			.reply(200, loader.json("test/fixtures/client/transactions.json"));

		assert.false(context.subject.hasMore("transactions"));

		await context.subject.all();

		assert.true(context.subject.hasMore("all"));

		context.subject.flush();
	}, datasets);

	each("should handle undefined  promiseAllSettledByKey responses in aggregate (%s)", async ({ context, dataset }) => {
		nock.fake()
			.get("/api/transactions")
			.query(true)
			.reply(200, loader.json("test/fixtures/client/transactions.json"));

		stub(promiseHelpers, "promiseAllSettledByKey").callsFake(() => Promise.resolve());

		const results = await context.subject.all();
		assert.instance(results, ExtendedConfirmedTransactionDataCollection);
	}, datasets);
	*/

	each(
		"should aggregate and filter transactions based on provided identifiers of type `address` (%s)",
		async ({ context, dataset }) => {
			nock.fake()
				.get("/api/transactions")
				.query(true)
				.reply(200, loader.json("test/fixtures/client/transactions.json"));

			const indexSpy = spy(wallet.transactionIndex(), dataset);

			await context.subject[dataset]({
				identifiers: [{ type: "address", value: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW" }],
			});

			assert.true(indexSpy.calledOnce);

			indexSpy.restore();
		},
		datasets,
	);

	each(
		"should aggregate and filter transactions based on provided identifiers of type `address` and network id (%s)",
		async ({ context, dataset }) => {
			nock.fake()
				.get("/api/transactions")
				.query(true)
				.reply(200, loader.json("test/fixtures/client/transactions.json"));

			const indexSpy = spy(wallet.transactionIndex(), dataset);

			await context.subject[dataset]({
				identifiers: [
					{ networkId: "ark.devnet", type: "address", value: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW" },
				],
			});

			assert.true(indexSpy.calledOnce);

			indexSpy.restore();
		},
		datasets,
	);

	each(
		"should not aggregate and filter transactions of wallet if network id does not match (%s)",
		async ({ context, dataset }) => {
			nock.fake()
				.get("/api/transactions")
				.query(true)
				.reply(200, loader.json("test/fixtures/client/transactions.json"));

			const indexSpy = spy(wallet.transactionIndex(), dataset);

			await context.subject[dataset]({
				identifiers: [
					{ networkId: "ark.mainnet", type: "address", value: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW" },
				],
			});

			assert.true(indexSpy.notCalled);

			indexSpy.restore();
		},
		datasets,
	);

	/*
	each("should aggregate and filter transactions based on provided identifiers of type `extendedPublicKey` (%s)", async ({ context, dataset }) => {
		nock.fake()
			.get("/api/transactions")
			.query(true)
			.reply(200, loader.json("test/fixtures/client/transactions.json"));

		const result = await context.subject.all({
			identifiers: [
				{
					type: "extendedPublicKey",
					value: "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd",
				},
			],
		});

		assert.instance(result, ExtendedConfirmedTransactionDataCollection);
		assert.length(result.items(), 100);

		context.subject.flush();
	}, datasets);
	*/

	each(
		"should aggregate and filter transactions based on provided senderId (%s)",
		async ({ context, dataset }) => {
			nock.fake()
				.get("/api/transactions")
				.query(true)
				.reply(200, loader.json("test/fixtures/client/transactions.json"));

			const indexSpy = spy(wallet.transactionIndex(), dataset);

			await context.subject[dataset]({
				senderId: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
			});

			assert.true(indexSpy.calledOnce);

			indexSpy.restore();
		},
		datasets,
	);

	each(
		"should not aggregate transactions if senderId does not match any wallet (%s)",
		async ({ context, dataset }) => {
			nock.fake()
				.get("/api/transactions")
				.query(true)
				.reply(200, loader.json("test/fixtures/client/transactions.json"));

			const indexSpy = spy(wallet.transactionIndex(), dataset);

			await context.subject[dataset]({
				senderId: "nonexistentAddress",
			});

			assert.true(indexSpy.notCalled);

			indexSpy.restore();
		},
		datasets,
	);

	each(
		"should aggregate and filter transactions based on provided recipientId (%s)",
		async ({ context, dataset }) => {
			nock.fake()
				.get("/api/transactions")
				.query(true)
				.reply(200, loader.json("test/fixtures/client/transactions.json"));

			const indexSpy = spy(wallet.transactionIndex(), dataset);

			await context.subject[dataset]({
				recipientId: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
			});

			assert.true(indexSpy.calledOnce);

			indexSpy.restore();
		},
		datasets,
	);

	each(
		"should not aggregate transactions if recipientId does not match any wallet (%s)",
		async ({ context, dataset }) => {
			nock.fake()
				.get("/api/transactions")
				.query(true)
				.reply(200, loader.json("test/fixtures/client/transactions.json"));

			const indexSpy = spy(wallet.transactionIndex(), dataset);

			await context.subject[dataset]({
				recipientId: "nonexistentAddress",
			});

			assert.true(indexSpy.notCalled);

			indexSpy.restore();
		},
		datasets,
	);

	each(
		"should prioritize identifiers over senderId and recipientId (%s)",
		async ({ context, dataset }) => {
			nock.fake()
				.get("/api/transactions")
				.query(true)
				.reply(200, loader.json("test/fixtures/client/transactions.json"));

			const indexSpy = spy(wallet.transactionIndex(), dataset);

			await context.subject[dataset]({
				identifiers: [{ type: "address", value: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW" }],
				recipientId: "anotherAddress",
				senderId: "anotherAddress",
			});

			assert.true(indexSpy.calledOnce);

			indexSpy.restore();
		},
		datasets,
	);
});
