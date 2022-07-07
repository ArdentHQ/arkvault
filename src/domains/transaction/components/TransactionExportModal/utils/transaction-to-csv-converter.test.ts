/* eslint-disable @typescript-eslint/require-await */
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { convertToCsv } from "./transaction-to-csv-converter";
import { env, getDefaultProfileId, syncDelegates } from "@/utils/testing-library";
import nock from "nock";

const defaultSettings = {
	delimiter: ",",
	includeCryptoAmount: true,
	includeDate: true,
	includeFiatAmount: true,
	includeHeaderRow: true,
	includeSenderRecipient: true,
	includeTransactionId: true,
	transactionType: "all",
};

describe("CsvFormatter", () => {
	let profile: Contracts.IProfile;
	let transactions: DTO.ExtendedConfirmedTransactionData[];

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
			.query(true)
			.reply(200, () => {
				const { meta, data } = require("tests/fixtures/coins/ark/devnet/transactions.json");
				return {
					data,
					meta,
				};
			});

		transactions = (await profile.wallets().first().transactionIndex().all()).items();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it("should convert to csv including header row", async () => {
		const csv = convertToCsv(transactions, defaultSettings, "USD", "HH");
		expect(csv).toMatchSnapshot();
	});

	it("should convert to csv excluding header row", async () => {
		const csv = convertToCsv(transactions, { ...defaultSettings, includeHeaderRow: false }, "USD", "HH");
		expect(csv).toMatchSnapshot();
	});

	it("should convert to csv excluding transation id", async () => {
		const csv = convertToCsv(transactions, { ...defaultSettings, includeTransactionId: false }, "USD", "HH");
		expect(csv).toMatchSnapshot();
	});

	it("should convert to csv excluding date", async () => {
		const csv = convertToCsv(transactions, { ...defaultSettings, includeDate: false }, "USD", "HH");
		expect(csv).toMatchSnapshot();
	});

	it("should convert to csv excluding sender and recipient", async () => {
		const csv = convertToCsv(transactions, { ...defaultSettings, includeSenderRecipient: false }, "USD", "HH");
		expect(csv).toMatchSnapshot();
	});

	it("should convert to csv excluding crypto amount", async () => {
		const csv = convertToCsv(transactions, { ...defaultSettings, includeCryptoAmount: false }, "USD", "HH");
		expect(csv).toMatchSnapshot();
	});

	it("should convert to csv excluding fiat amount", async () => {
		const csv = convertToCsv(transactions, { ...defaultSettings, includeFiatAmount: false }, "USD", "HH");
		expect(csv).toMatchSnapshot();
	});

	it("should convert to csv using semicolon delimiter", async () => {
		const csv = convertToCsv(transactions, { ...defaultSettings, delimiter: ";" }, "USD", "HH");
		expect(csv).toMatchSnapshot();
	});
});
