/* eslint-disable @typescript-eslint/require-await */
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { TransactionExporter } from "./transaction-exporter.factory";
import { env, getDefaultProfileId, syncDelegates, waitFor } from "@/utils/testing-library";
import nock from "nock";

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
					data: [data[0], data[1]],
					meta,
				};
			});
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it("should sync all transactions recursively", async () => {
		const exporter = TransactionExporter({ profile, wallet: profile.wallets().first(), limit: 13 });
		//@ts-ignore
		await exporter.transactions().sync({ dateRange: { from: new Date().getTime(), to: new Date().getTime() } });
		expect(exporter.transactions().items()).toHaveLength(17);
	});

	it("should sync transactions", async () => {
		const exporter = TransactionExporter({ profile, wallet: profile.wallets().first() });
		//@ts-ignore
		await exporter.transactions().sync({ dateRange: { from: new Date().getTime(), to: new Date().getTime() } });
		expect(exporter.transactions().items()).toHaveLength(15);
	});

	it("should abort sync", async () => {
		const exporter = TransactionExporter({ profile, wallet: profile.wallets().first() });
		exporter.transactions().abortSync();
		await exporter
			.transactions()
			//@ts-ignore
			.sync({ dateRange: { from: new Date().getTime(), to: new Date().getTime() }, cursor: 2 });

		expect(exporter.transactions().items()).toHaveLength(0);
	});

	it("should sync transactions and export to csv", async () => {
		const exporter = TransactionExporter({ profile, wallet: profile.wallets().first() });
		//@ts-ignore
		await exporter.transactions().sync({ dateRange: { from: new Date().getTime(), to: new Date().getTime() } });
		expect(exporter.transactions().items()).toHaveLength(15);
		expect(exporter.transactions().toCsv({}).length).toBeGreaterThan(0);
	});
});
