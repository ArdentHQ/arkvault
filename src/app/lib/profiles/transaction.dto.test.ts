import { describe, expect, it, vi, beforeEach } from "vitest";
import { ExtendedConfirmedTransactionData } from "./transaction.dto";
import { IReadWriteWallet } from "./contracts";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { ConfirmedTransactionData } from "@/app/lib/mainsail/confirmed-transaction.dto";

let walletMock: IReadWriteWallet;
let dataMock: ConfirmedTransactionData;

beforeEach(() => {
	walletMock = {
		address: () => "wallet-address",
		currency: () => "ARK",
		exchangeCurrency: () => "USD",
		exchangeRates: () => ({
			exchange: vi.fn().mockImplementation((from, to, timestamp, value) => {
				if (timestamp) {
					return value * 2;
				}
				return 0;
			}),
		}),
		link: () => ({
			block: (id: string) => `https://explorer.com/block/${id}`,
			transaction: (id: string) => `https://explorer.com/tx/${id}`,
		}),
	} as any;

	dataMock = {
		...TransactionFixture,
		blockHash: () => "block-hash",
		fee: () => BigNumber.make(1),
		hash: () => "tx-hash",
		isMultiPayment: () => false,
		isReturn: () => false,
		isSent: () => true,
		payments: () => [],
		recipients: () => [],
		timestamp: () => DateTime.make("2021-01-01"),
		value: () => BigNumber.make(10),
	} as any;
});

describe("ExtendedConfirmedTransactionData", () => {
	it("should return the wallet", () => {
		const subject = new ExtendedConfirmedTransactionData(walletMock, dataMock);
		expect(subject.wallet()).toEqual(walletMock);
	});

	it("should get explorer link", () => {
		const subject = new ExtendedConfirmedTransactionData(walletMock, dataMock);
		expect(subject.explorerLink()).toBe("https://explorer.com/tx/tx-hash");
	});

	it("should get explorer block link", () => {
		const subject = new ExtendedConfirmedTransactionData(walletMock, dataMock);
		expect(subject.explorerLinkForBlock()).toBe("https://explorer.com/block/block-hash");
	});

	it("should return undefined for block link if no block hash", () => {
		vi.spyOn(dataMock, "blockHash").mockReturnValue(undefined);
		const subject = new ExtendedConfirmedTransactionData(walletMock, dataMock);
		expect(subject.explorerLinkForBlock()).toBeUndefined();
	});

	it("should calculate total for a sent transaction", () => {
		const subject = new ExtendedConfirmedTransactionData(walletMock, dataMock);
		expect(subject.total()).toBe(11); // value + fee
	});

	it("should calculate total for a return transaction", () => {
		vi.spyOn(dataMock, "isReturn").mockReturnValue(true);
		vi.spyOn(dataMock, "isSent").mockReturnValue(false);
		const subject = new ExtendedConfirmedTransactionData(walletMock, dataMock);
		expect(subject.total()).toBe(9); // value - fee
	});

	it("should calculate total for a multipayment transaction", () => {
		vi.spyOn(dataMock, "isReturn").mockReturnValue(false);
		vi.spyOn(dataMock, "isSent").mockReturnValue(false);
		vi.spyOn(dataMock, "isMultiPayment").mockReturnValue(true);
		vi.spyOn(dataMock, "recipients").mockReturnValue([
			{ address: "wallet-address", amount: BigNumber.make(3) },
			{ address: "another-address", amount: BigNumber.make(7) },
		] as any);

		const subject = new ExtendedConfirmedTransactionData(walletMock, dataMock);
		expect(subject.total()).toBe(3);
	});

	it("should calculate total for other transaction types", () => {
		vi.spyOn(dataMock, "isReturn").mockReturnValue(false);
		vi.spyOn(dataMock, "isSent").mockReturnValue(false);
		const subject = new ExtendedConfirmedTransactionData(walletMock, dataMock);
		expect(subject.total()).toBe(10); // value
	});

	it("should get converted total", () => {
		const subject = new ExtendedConfirmedTransactionData(walletMock, dataMock);
		expect(subject.convertedTotal()).toBe(22); // total (11) * 2
	});

	it("should get converted amount", () => {
		const subject = new ExtendedConfirmedTransactionData(walletMock, dataMock);
		expect(subject.convertedAmount()).toBe(20); // value (10) * 2
	});

	it("should get converted fee", () => {
		const subject = new ExtendedConfirmedTransactionData(walletMock, dataMock);
		expect(subject.convertedFee()).toBe(2); // fee (1) * 2
	});

	it("should handle conversion if timestamp is missing", () => {
		vi.spyOn(dataMock, "timestamp").mockReturnValue(undefined);
		const subject = new ExtendedConfirmedTransactionData(walletMock, dataMock);
		expect(subject.convertedTotal()).toBe(0);
		expect(subject.convertedAmount()).toBe(0);
		expect(subject.convertedFee()).toBe(0);
	});

	it("should return recipients with human-readable amounts", () => {
		const recipients = [{ address: "some-address", amount: BigNumber.make(5) }];
		vi.spyOn(dataMock, "recipients").mockReturnValue(recipients as any);
		const subject = new ExtendedConfirmedTransactionData(walletMock, dataMock);
		expect(subject.recipients()).toEqual([{ address: "some-address", amount: 5 }]);
	});

	it("should return payments with human-readable amounts", () => {
		const payments = [{ amount: BigNumber.make(5), recipientId: "some-address" }];
		vi.spyOn(dataMock, "payments").mockReturnValue(payments as any);
		const subject = new ExtendedConfirmedTransactionData(walletMock, dataMock);
		expect(subject.payments()).toEqual([{ amount: 5, recipientId: "some-address" }]);
	});

	it("should delegate hash", () => {
		const subject = new ExtendedConfirmedTransactionData(walletMock, dataMock);
		expect(subject.hash()).toBe("tx-hash");
	});
});
