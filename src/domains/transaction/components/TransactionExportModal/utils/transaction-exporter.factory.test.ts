/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import nock from "nock";
import { TransactionExporter } from "./transaction-exporter.factory";
import { env, getDefaultProfileId, syncDelegates } from "@/utils/testing-library";

describe("CsvFormatter", () => {
	let profile: Contracts.IProfile;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();
	});

	beforeEach(async () => {
		nock.disableNetConnect();

		nock("https://ark-test.arkvault.io")
			.get("/api/transactions")
			.once()
			.query(true)
			.reply(200, () => {
				const { meta, data } = require("tests/fixtures/coins/ark/devnet/transactions.json");
				return {
					data,
					meta,
				};
			})
			.get("/api/transactions")
			.query(true)
			.reply(200, () => {
				const { meta, data } = require("tests/fixtures/coins/ark/devnet/transactions.json");
				return {
					data: [
						data[0],
						data[1],
						{
							id: "34b557950ed485985aad81ccefaa374b7c81150c52f8ef4621cbbb907b2c829c",
							blockId: "65e1f34a8e0edba9c04eec5d35b140245b4d14e063446a65477b28fc719faab5",
							version: 2,
							type: 6,
							typeGroup: 1,
							amount: "0",
							fee: "10000000",
							sender: profile.wallets().first().address(),
							senderPublicKey: profile.wallets().first().publicKey(),
							recipient: profile.wallets().first().address(),
							signature: "bf517b27ec1b74bcf63af7abea93ec1947f810e7c42f2737133e8cae1ab8517f3d9a59ffcfd31525c3b0b46de144b49070584d83c92c9f7de6cf3ae9d0fc273e",
							asset: {
								payments: [
									{
										amount: "1000000000000",
										recipientId: "DReUcXWdCz2QLKzHM9NdZQE7fAwAyPwAmd"
									},
									{
										amount: "1000000000000",
										recipientId: profile.wallets().first().address(),
									},
								]
							},
							confirmations: 1325777,
							timestamp: {
								epoch: 96231320,
								unix: 1586332520,
								human: "2020-04-08T07:55:20.000Z"
							},
							nonce: "266",
						},
						{
							id: "d819c5199e323a62a4349948ff075edde91e509028329f66ec76b8518ad1e493",
							blockId: "61d188ac6e127c7a9fd2f71be6cc96d839b1b3a36ac50ede7ccced92fa6588aa",
							version: 2,
							type: 3,
							typeGroup: 1,
							amount: "0",
							fee: "20716584",
							sender: profile.wallets().first().address(),
							senderPublicKey: profile.wallets().first().publicKey(),
							recipient: profile.wallets().first().address(),
							signature: "81a67df443a8903afb1a703befd7a0bdc4e85290d2cbbeeb5b999869f1d8b4e7fa66391abaf1c23088dde5e5b4da121afd2dd964c09e5d9dbf7a53fd7a6330b4",
							asset: {
								votes: ["+034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192"]
							},
							confirmations: 1,
							timestamp: {
								epoch: 109814312,
								unix: 1599915512,
								human: "2020-09-12T12:58:32.000Z"
							},
							nonce: "158",
						},
					],
					meta,
				};
			});
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it("should sync all transactions recursively", async () => {
		const exporter = TransactionExporter({ limit: 13, profile, wallet: profile.wallets().first() });
		//@ts-ignore
		await exporter.transactions().sync({ dateRange: { from: Date.now(), to: Date.now() } });

		expect(exporter.transactions().items()).toHaveLength(19);
	});

	it("should sync transactions", async () => {
		const exporter = TransactionExporter({ profile, wallet: profile.wallets().first() });
		//@ts-ignore
		await exporter.transactions().sync({ dateRange: { from: Date.now(), to: Date.now() } });

		expect(exporter.transactions().items()).toHaveLength(15);
	});

	it("should sync received transactions", async () => {
		const exporter = TransactionExporter({ profile, wallet: profile.wallets().first() });
		//@ts-ignore
		await exporter.transactions().sync({ dateRange: { from: Date.now(), to: Date.now() }, type: "received" });

		expect(exporter.transactions().items()).toHaveLength(3);
	});

	it("should sync sent transactions", async () => {
		const exporter = TransactionExporter({ profile, wallet: profile.wallets().first() });
		//@ts-ignore
		await exporter.transactions().sync({ dateRange: { from: Date.now(), to: Date.now() }, type: "sent" });

		expect(exporter.transactions().items()).toHaveLength(15);
	});

	it("should abort sync", async () => {
		const exporter = TransactionExporter({ profile, wallet: profile.wallets().first() });
		exporter.transactions().abortSync();
		await exporter
			.transactions()
			//@ts-ignore
			.sync({ cursor: 2, dateRange: { from: Date.now(), to: Date.now() } });

		expect(exporter.transactions().items()).toHaveLength(0);
	});

	it("should sync transactions and export to csv", async () => {
		const exporter = TransactionExporter({ profile, wallet: profile.wallets().first() });
		//@ts-ignore
		await exporter.transactions().sync({ dateRange: { from: Date.now(), to: Date.now() } });

		expect(exporter.transactions().items()).toHaveLength(15);
		expect(exporter.transactions().toCsv({}).length).toBeGreaterThan(0);
	});
});
