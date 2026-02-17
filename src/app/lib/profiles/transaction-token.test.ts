import { describe, it, expect, beforeEach } from "vitest";
import { TokenDTO } from "./token.dto";
import { TransactionToken } from "@/app/lib/profiles/transaction-token";

describe("TransactionToken", () => {
	let transactionToken: TransactionToken;
	const fixtureData = {
		from: "0xabc",
		index: 0,
		metadata: {
			tokenAddress: "0xdec",
			tokenDecimals: 18,
			tokenName: "DARK 20",
			tokenSymbol: "DARK20",
		},
		to: "0xdef",
		value: "234234",
	}

	beforeEach(() => {
		transactionToken = new TransactionToken(fixtureData);
	});

	it("#from", () => {
		expect(transactionToken.from()).toBe(fixtureData.from);
	});

	it("#to", () => {
		expect(transactionToken.to()).toBe(fixtureData.to);
	});

	it("#index", () => {
		expect(transactionToken.index()).toBe(fixtureData.index);
	});

	it("#value", () => {
		expect(transactionToken.value().toString()).toBe(fixtureData.value);
	});

	it("#token", () => {
		expect(transactionToken.token()).toBeInstanceOf(TokenDTO);
		expect(transactionToken.token().address()).toBe(fixtureData.metadata.tokenAddress);
		expect(transactionToken.token().decimals()).toBe(fixtureData.metadata.tokenDecimals);
		expect(transactionToken.token().name()).toBe(fixtureData.metadata.tokenName);
		expect(transactionToken.token().symbol()).toBe(fixtureData.metadata.tokenSymbol);
	});
});
