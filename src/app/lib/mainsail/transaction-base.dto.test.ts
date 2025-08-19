import { describe, it, expect, beforeEach, vi } from "vitest";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { UnitConverter } from "@arkecosystem/typescript-crypto";
import { TransactionBaseData, type TransactionBaseDTO } from "./transaction-base.dto";
import * as TransactionTypeServiceMock from "./transaction-type.service";

class TestTransactionData extends TransactionBaseData<TransactionBaseDTO & { gas?: number; ts?: number }> {
	private _recipients: { address: string; amount: number | BigNumber }[] = [];
	setRecipients(r: { address: string; amount: number | BigNumber }[]) {
		this._recipients = r;
	}
	public recipients() {
		return this._recipients;
	}

	protected computeFee(): BigNumber {
		const gasPriceArk = BigNumber.make(UnitConverter.formatUnits(String(this.data.gasPrice), "ark"));
		const gas = this.data.gas ?? 1;
		return gasPriceArk.times(gas);
	}

	public isSuccess(): boolean {
		return true;
	}
	public isConfirmed(): boolean {
		return true;
	}
	public confirmations(): BigNumber {
		return BigNumber.ONE;
	}

	public timestamp(): DateTime | undefined {
		if (this.data.ts == null) {
			return undefined;
		}
		return DateTime.fromUnix(this.data.ts);
	}
	protected serializeTimestamp(): string | undefined {
		return this.timestamp()?.toISOString();
	}
}

describe("TransactionBaseData", () => {
	let tx: TestTransactionData;
	let commonData: TransactionBaseDTO & { gas?: number; ts?: number };

	beforeEach(() => {
		tx = new TestTransactionData();
		commonData = {
			data: "0x1234567890abcdef" as any,
			from: "sender_address",
			gas: 21000,
			gasPrice: 10000000,
			hash: "test_hash",
			nonce: 1,
			to: "recipient_address",
			ts: 1593561600,
			value: 100000000,
		};
	});

	it("configures and exposes raw data", () => {
		expect(tx.configure(commonData)).toBeInstanceOf(TestTransactionData);
		expect(tx.raw()).toEqual(commonData);
	});

	it("stores decimals via number or string", () => {
		expect(tx.withDecimals(8)).toBeInstanceOf(TestTransactionData);
		expect(tx.withDecimals("8")).toBeInstanceOf(TestTransactionData);
	});

	it("hash/nonce/from/to", () => {
		tx.configure(commonData);
		expect(tx.hash()).toBe("test_hash");
		expect(tx.nonce()).toBe(1);
		expect(tx.from()).toBe("sender_address");
		expect(tx.to()).toBe("recipient_address");
	});

	it("nonce parses string", () => {
		tx.configure({ ...commonData, nonce: "42" });
		expect(tx.nonce()).toBe(42);
	});

	it("meta set/get + isSent/isReceived", () => {
		tx.configure(commonData);
		tx.setMeta("address", "sender_address");
		expect(tx.getMeta("address")).toBe("sender_address");
		expect(tx.isSent()).toBe(true);
		expect(tx.isReceived()).toBe(false);

		tx.setMeta("address", "recipient_address");
		expect(tx.isReceived()).toBe(true);
		expect(tx.isSent()).toBe(false);
	});

	it("isReturn true when transfer AND sent+received", () => {
		tx.configure(commonData);
		tx.isTransfer = () => true;
		tx.isSent = () => true;
		tx.isReceived = () => true;
		expect(tx.isReturn()).toBe(true);
	});

	it("isReturn true when multipayment includes sender as recipient", () => {
		tx.configure(commonData);
		tx.isMultiPayment = () => true;
		tx.setRecipients([{ address: "sender_address", amount: new BigNumber(1) }]);
		expect(tx.isReturn()).toBe(true);
	});

	it("type() short-circuits by priority", () => {
		tx.configure(commonData);

		tx.isVoteCombination = () => true;
		expect(tx.type()).toBe("voteCombination");

		tx.isVoteCombination = () => false;
		tx.isMultiPayment = () => true;
		expect(tx.type()).toBe("multiPayment");

		tx.isMultiPayment = () => false;
		tx.isTransfer = () => true;
		expect(tx.type()).toBe("transfer");

		tx.isMultiPayment = () => false;
		tx.isTransfer = () => false;
		tx.isVote = () => true;
		expect(tx.type()).toBe("vote");

		tx.isMultiPayment = () => false;
		tx.isTransfer = () => false;
		tx.isVote = () => false;
		tx.isUpdateValidator = () => true;
		expect(tx.type()).toBe("updateValidator");

		tx.isMultiPayment = () => false;
		tx.isTransfer = () => false;
		tx.isValidatorResignation = () => true;
		expect(tx.type()).toBe("validatorResignation");

		tx.isMultiPayment = () => false;
		tx.isTransfer = () => false;
		tx.isValidatorRegistration = () => true;
		expect(tx.type()).toBe("validatorRegistration");

		tx.isMultiPayment = () => false;
		tx.isTransfer = () => false;
		tx.isUnvote = () => true;
		expect(tx.type()).toBe("unvote");

		tx.isMultiPayment = () => false;
		tx.isTransfer = () => false;
		tx.isUsernameRegistration = () => true;
		expect(tx.type()).toBe("usernameRegistration");

		tx.isMultiPayment = () => false;
		tx.isTransfer = () => false;
		tx.isUsernameRegistration = () => false;
		tx.isUsernameResignation = () => true;
		expect(tx.type()).toBe("usernameResignation");

		tx.isMultiPayment = () => false;
		tx.isSecondSignature = () => true;
		expect(tx.type()).toBe("secondSignature");
	});

	it("type() falls back to TransactionTypeService.getIdentifierName", () => {
		const spy = vi
			.spyOn(TransactionTypeServiceMock.TransactionTypeService, "getIdentifierName")
			.mockReturnValue("customIdentifier");

		tx.configure(commonData);
		tx.isVoteCombination = () => false;
		tx.isMultiPayment = () => false;
		tx.isSecondSignature = () => false;
		tx.isTransfer = () => false;
		tx.isUsernameRegistration = () => false;
		tx.isUsernameResignation = () => false;
		tx.isUnvote = () => false;
		tx.isValidatorRegistration = () => false;
		tx.isValidatorResignation = () => false;
		tx.isVote = () => false;
		tx.isUpdateValidator = () => false;

		expect(tx.type()).toBe("customIdentifier");
		spy.mockRestore();
	});

	it("type() finally falls back to methodHash()", () => {
		const spy = vi
			.spyOn(TransactionTypeServiceMock.TransactionTypeService, "getIdentifierName")
			.mockReturnValue(null);

		tx.configure({ ...commonData, data: "0xabcdef0123456789" as any });
		tx.isVoteCombination = () => false;
		tx.isMultiPayment = () => false;
		tx.isSecondSignature = () => false;
		tx.isTransfer = () => false;
		tx.isUsernameRegistration = () => false;
		tx.isUsernameResignation = () => false;
		tx.isUnvote = () => false;
		tx.isValidatorRegistration = () => false;
		tx.isValidatorResignation = () => false;
		tx.isVote = () => false;
		tx.isUpdateValidator = () => false;

		expect(tx.type()).toBe("0xabcdef01");
		spy.mockRestore();
	});

	it("username() decodes from data", () => {
		const realEncoded =
			"0x36a941340000000000000000000000000000000000000000000000000000000000000020" +
			"0000000000000000000000000000000000000000000000000000000000000008" +
			"7465737475736572000000000000000000000000000000000000000000000000";
		tx.configure({ ...commonData, data: realEncoded as any });
		expect(tx.username()).toBe("testuser");
	});

	it("validatorPublicKey() decodes and strips 0x", () => {
		const realEncoded =
			"0x602a9eee0000000000000000000000000000000000000000000000000000000000000020" +
			"0000000000000000000000000000000000000000000000000000000000000020" +
			"abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
		tx.configure({ ...commonData, data: realEncoded as any });
		expect(tx.validatorPublicKey()).toBe("abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890");
	});

	it("votes() decodes address", () => {
		const realEncoded = "0x6dd7d8ea000000000000000000000000abcdef1234567890abcdef1234567890abcdef12";
		tx.configure({ ...commonData, data: realEncoded as any });
		expect(tx.votes()).toEqual(["0xabCDEF1234567890ABcDEF1234567890aBCDeF12"]);
	});

	it("unvotes() default empty", () => {
		tx.configure(commonData);
		expect(tx.unvotes()).toEqual([]);
	});

	it("payments() decodes multipayment when isMultiPayment = true", () => {
		const encoded =
			"0x084ce708" +
			"0000000000000000000000000000000000000000000000000000000000000040" +
			"0000000000000000000000000000000000000000000000000000000000000080" +
			"0000000000000000000000000000000000000000000000000000000000000001" +
			"0000000000000000000000001234567890123456789012345678901234567890" +
			"0000000000000000000000000000000000000000000000000000000000000001" +
			"0000000000000000000000000000000000000000000000000de0b6b3a7640000";
		tx.configure({ ...commonData, data: encoded as any });
		tx.isMultiPayment = () => true;

		const items = tx.payments();
		expect(items).toHaveLength(1);
		expect(items[0]).toEqual({
			amount: expect.any(BigNumber),
			recipientId: "0x1234567890123456789012345678901234567890",
		});
	});

	it("value(): transfer uses UnitConverter.formatUnits(value,'ark')", () => {
		tx.configure({ ...commonData, value: 100000000 });
		tx.isMultiPayment = () => false;
		const value = tx.value();
		expect(value).toBeInstanceOf(BigNumber);
	});

	it("value(): multipayment sums payments", () => {
		tx.configure(commonData);
		tx.isMultiPayment = () => true;
		tx.payments = () => [{ amount: new BigNumber(100) }, { amount: new BigNumber(200) }] as any;
		expect(tx.value()).toEqual(new BigNumber(300));
	});

	it("fee() uses computeFee()", () => {
		tx.configure(commonData);
		const fee = tx.fee();
		expect(fee).toBeInstanceOf(BigNumber);
	});

	it("methodHash()", () => {
		tx.configure({ ...commonData, data: "0xabcdef0123456789" as any });
		expect(tx.methodHash()).toBe("0xabcdef01");
		tx.configure({ ...commonData, data: "0x00002" as any });
		expect(tx.methodHash()).toBe("0x00002");
	});

	it("toObject()", () => {
		tx.configure(commonData);
		const obj = tx.toObject();
		expect(obj.fee).toBeInstanceOf(BigNumber);
		expect(obj.value).toBeInstanceOf(BigNumber);
		expect(obj.timestamp).toBeInstanceOf(DateTime);
		expect(obj.hash).toBe("test_hash");
		expect(obj.from).toBe("sender_address");
		expect(obj.to).toBe("recipient_address");
		expect(obj.type).toBeDefined();
	});

	it("toJSON()", () => {
		tx.configure(commonData);
		const json = tx.toJSON();
		expect(typeof json.fee).toBe("string");
		expect(typeof json.value).toBe("string");
		expect(json.timestamp).toBe("2020-07-01T00:00:00.000Z");
	});

	it("toHuman()", () => {
		tx.configure(commonData);
		const human = tx.toHuman();
		expect(typeof human.fee).toBe("number");
		expect(typeof human.value).toBe("number");
		expect(human.timestamp).toBe("2020-07-01T00:00:00.000Z");
	});

	it("default flags", () => {
		tx.configure(commonData);
		expect(tx.isSecondSignature()).toBe(false);
	});

	it("payments() returns [] when isMultiPayment = false", () => {
		tx.configure(commonData);
		tx.isMultiPayment = () => false;
		expect(tx.payments()).toEqual([]);
	});

	it("isReturn() returns false when neither transfer nor multipayment", () => {
		tx.configure(commonData);
		tx.isTransfer = () => false;
		tx.isMultiPayment = () => false;
		tx.setRecipients([]);
		expect(tx.isReturn()).toBe(false);
	});
});
