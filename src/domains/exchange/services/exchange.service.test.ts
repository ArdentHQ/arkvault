import nock from "nock";

import { exchangeHost, ExchangeService } from "./exchange.service";
import { httpClient } from "@/app/services";

let subject: ExchangeService;

const provider = "changenow";

describe("ExchangeService", () => {
	beforeAll(() => nock.disableNetConnect());

	beforeEach(() => {
		subject = new ExchangeService(provider, httpClient);
	});

	afterEach(() => nock.cleanAll());

	describe("#currency", () => {
		it("should retrieve an available currencies by its ticker", async () => {
			nock(exchangeHost)
				.get(`/${provider}/currencies/ark`)
				.reply(200, require("tests/fixtures/exchange/changenow/currency-ark.json"));

			const result = await subject.currency("ark");

			expect(result).toStrictEqual({
				addressExplorerMask: "https://live.arkscan.io/wallets/{}",
				coin: "ark",
				externalIdName: null,
				hasExternalId: false,
				name: "Ark",
				transactionExplorerMask: "https://live.arkscan.io/transaction/{}",
				warnings: { from: "", to: "" },
			});
			expect(result.coin).toBe("ark");
		});
	});

	describe("#currencies", () => {
		it("should retrieve all available currencies", async () => {
			nock(exchangeHost)
				.get(`/${provider}/currencies`)
				.reply(200, require("tests/fixtures/exchange/changenow/currencies.json"));

			const result = await subject.currencies();

			expect(result).toHaveLength(3);
		});
	});

	describe("#validateAddress", () => {
		it("should validate the given address", async () => {
			nock(exchangeHost)
				.get(`/${provider}/currencies/btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`)
				.reply(200, require("tests/fixtures/exchange/changenow/validate-address.json"));

			const result = await subject.validateAddress("btc", "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa");

			expect(result).toBe(true);
		});
	});

	describe("#minimalExchangeAmount", () => {
		it("should retrieve a pairs minimal exchange amount", async () => {
			nock(exchangeHost)
				.get(`/${provider}/tickers/btc/ark`)
				.reply(200, require("tests/fixtures/exchange/changenow/minimum.json"));

			const result = await subject.minimalExchangeAmount("btc", "ark");

			expect(result).toBe(0.000_262_5);
		});
	});

	describe("#estimateExchangeAmount", () => {
		it("should retrieve a pairs minimal exchange amount", async () => {
			nock(exchangeHost)
				.get(`/${provider}/tickers/btc/ark/1`)
				.reply(200, require("tests/fixtures/exchange/changenow/estimate.json"));

			const result = await subject.estimateExchangeAmount("btc", "ark", 1);

			expect(result).toStrictEqual({
				estimatedAmount: 37_042.358_838_4,
				estimatedTime: "10-60",
				warning: null,
			});
		});
	});

	describe("#createOrder", () => {
		it("should create an exchange order", async () => {
			nock(exchangeHost)
				.post(`/${provider}/orders`)
				.reply(200, require("tests/fixtures/exchange/changenow/order.json"));

			const result = await subject.createOrder({
				address: "payinAddress",
				amount: 1,
				from: "btc",
				to: "ark",
			});

			expect(result).toStrictEqual({
				amountFrom: 1,
				amountTo: 37_047.178_331_2,
				externalId: "",
				from: "btc",
				id: "182b657b2c259b",
				payinAddress: "payinAddress",
				payoutAddress: "payoutAddress",
				to: "ark",
			});
			expect(result.payinAddress).toBe("payinAddress");
		});
	});

	describe("#orderStatus", () => {
		it("should retrieve the status of an exchange order", async () => {
			nock(exchangeHost)
				.get(`/${provider}/orders/id`)
				.reply(200, require("tests/fixtures/exchange/changenow/status.json"));

			const result = await subject.orderStatus("id");

			expect(result).toStrictEqual({
				amountFrom: null,
				amountTo: null,
				from: "btc",
				id: "id",
				payinAddress: "payinAddress",
				payinHash: null,
				payoutAddress: "payoutAddress",
				payoutHash: null,
				providerId: "changenow",
				status: 1,
				to: "ark",
			});
			expect(result.id).toBe("id");
		});
	});
});
