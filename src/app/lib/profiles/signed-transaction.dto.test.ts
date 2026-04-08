import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExtendedSignedTransactionData } from "./signed-transaction.dto";
import { SignedTransactionData } from "@/app/lib/mainsail/signed-transaction.dto";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { Contracts } from ".";
import { IReadWriteWallet } from "./wallet.contract";

describe("ExtendedSignedTransactionData", () => {
	let mockData: SignedTransactionData;
	let mockWallet: Contracts.IReadWriteWallet;
	let subject: ExtendedSignedTransactionData;

	beforeEach(() => {
		mockData = {
			approveDetails: vi.fn().mockReturnValue({ address: "0xabc", amount: "100" }),
			data: vi.fn().mockReturnValue({}),
			fee: vi.fn().mockReturnValue(BigNumber.make(1)),
			from: vi.fn().mockReturnValue("0x1"),
			gasLimit: vi.fn().mockReturnValue(21000),
			get: vi.fn().mockImplementation((key: string) => {
				const map: Record<string, any> = { hash: "tx-hash" };
				return map[key];
			}),
			hash: vi.fn().mockReturnValue("tx-hash"),
			isApprove: vi.fn().mockReturnValue(false),
			isBatchTransfer: vi.fn().mockReturnValue(false),
			isContractDeployment: vi.fn().mockReturnValue(false),
			isContractTransaction: vi.fn().mockReturnValue(false),
			isMultiPayment: vi.fn().mockReturnValue(false),
			isRevoke: vi.fn().mockReturnValue(false),
			isTokenTransfer: vi.fn().mockReturnValue(false),
			isTransfer: vi.fn().mockReturnValue(true),
			isUnvote: vi.fn().mockReturnValue(false),
			isUpdateValidator: vi.fn().mockReturnValue(false),
			isUsernameRegistration: vi.fn().mockReturnValue(false),
			isUsernameResignation: vi.fn().mockReturnValue(false),
			isValidatorRegistration: vi.fn().mockReturnValue(false),
			isValidatorResignation: vi.fn().mockReturnValue(false),
			isVote: vi.fn().mockReturnValue(false),
			memo: vi.fn().mockReturnValue("test memo"),
			nonce: vi.fn().mockReturnValue(BigNumber.make(1)),
			payments: vi.fn().mockReturnValue([]),
			recipients: vi.fn().mockReturnValue([]),
			timestamp: vi.fn().mockReturnValue(DateTime.make("2021-01-01")),
			to: vi.fn().mockReturnValue("0x2"),
			toBroadcast: vi.fn().mockReturnValue("serialized-data"),
			toObject: vi.fn().mockReturnValue({}),
			toString: vi.fn().mockReturnValue("string-representation"),
			token: vi.fn().mockReturnValue(undefined),
			tokens: vi.fn().mockReturnValue(undefined),
			type: vi.fn().mockReturnValue("transfer"),
			unvotes: vi.fn().mockReturnValue([]),
			username: vi.fn().mockReturnValue("testuser"),
			validatorPublicKey: vi.fn().mockReturnValue("pubkey123"),
			value: vi.fn().mockReturnValue(BigNumber.make(10)),
			votes: vi.fn().mockReturnValue(["0xvoteaddr"]),
		} as any;

		mockWallet = {
			address: vi.fn().mockReturnValue("0x1"),
			currency: vi.fn().mockReturnValue("ARK"),
			exchangeCurrency: vi.fn().mockReturnValue("USD"),
			exchangeRates: vi.fn().mockReturnValue({
				exchange: vi.fn().mockImplementation((from, to, timestamp, value) => {
					if (timestamp) {
						return value * 2;
					}
					return 0;
				}),
			}),
			link: vi.fn().mockReturnValue({
				transaction: (id: string) => `https://explorer.com/tx/${id}`,
			}),
			publicKey: vi.fn().mockReturnValue("0x002"),
		} as unknown as IReadWriteWallet;

		subject = new ExtendedSignedTransactionData(mockData, mockWallet);
	});

	it("#data", () => {
		expect(subject.data()).toBe(mockData);
	});

	it("#hash", () => {
		expect(subject.hash()).toBe("tx-hash");
		expect(mockData.hash).toHaveBeenCalled();
	});

	it("type", () => {
		expect(subject.type()).toBe("transfer");
		expect(mockData.type).toHaveBeenCalled();
	});

	it("from", () => {
		expect(subject.from()).toBe("0x1");
		expect(mockData.from).toHaveBeenCalled();
	});

	it("should delegate to to data", () => {
		expect(subject.to()).toBe("0x2");
		expect(mockData.to).toHaveBeenCalled();
	});

	it("#value", () => {
		const value = subject.value();
		expect(value).toBeInstanceOf(BigNumber);
		expect(mockData.value).toHaveBeenCalled();
	});

	it("#fee", () => {
		const fee = subject.fee();
		expect(fee).toBeInstanceOf(BigNumber);
		expect(mockData.fee).toHaveBeenCalled();
	});

	it("#nonce", () => {
		const nonce = subject.nonce();
		expect(nonce).toBeInstanceOf(BigNumber);
		expect(mockData.nonce).toHaveBeenCalled();
	});

	it("#token", () => {
		expect(subject.token()).toBeUndefined();
		expect(mockData.token).toHaveBeenCalled();
	});

	it("#tokens", () => {
		expect(subject.tokens()).toBeUndefined();
		expect(mockData.tokens).toHaveBeenCalled();
	});

	it("#timestamp", () => {
		const timestamp = subject.timestamp();
		expect(timestamp).toBeDefined();
		expect(mockData.timestamp).toHaveBeenCalled();
	});

	describe("#isReturn", () => {
		it("should return true for received transactions", () => {
			mockData.isTransfer = vi.fn().mockReturnValue(true);
			mockData.from = vi.fn().mockReturnValue("0x1");
			mockData.to = vi.fn().mockReturnValue("0x1");
			mockWallet.address = vi.fn().mockReturnValue("0x1");
			mockWallet.publicKey = vi.fn().mockReturnValue("0x002");

			const result = subject.isReturn();
			expect(result).toBe(true);
		});

		it("should return false for a transfer that is not sent", () => {
			mockData.isTransfer = vi.fn().mockReturnValue(true);
			mockWallet.address = vi.fn().mockReturnValue("0x0");
			mockWallet.publicKey = vi.fn().mockReturnValue("0x0");

			const result = subject.isReturn();
			expect(result).toBe(false);
		});

		it("should return true for a multi-payment where all recipients are the sender", () => {
			mockData.isTransfer = vi.fn().mockReturnValue(false);
			mockData.isMultiPayment = vi.fn().mockReturnValue(true);
			mockData.recipients = vi.fn().mockReturnValue([
				{ address: "0x1", amount: BigNumber.make(5) },
				{ address: "0x1", amount: BigNumber.make(5) },
			]);
			mockWallet.address = vi.fn().mockReturnValue("0x1");

			const result = subject.isReturn();
			expect(result).toBe(true);
		});

		it("should return false for a multi-payment with different recipients", () => {
			mockData.isTransfer = vi.fn().mockReturnValue(false);
			mockData.isMultiPayment = vi.fn().mockReturnValue(true);
			mockData.recipients = vi.fn().mockReturnValue([
				{ address: "0x1", amount: BigNumber.make(5) },
				{ address: "0x0", amount: BigNumber.make(5) },
			]);
			mockWallet.address = vi.fn().mockReturnValue("0x1");

			const result = subject.isReturn();
			expect(result).toBe(false);
		});

		it("should return false for other transaction types", () => {
			mockData.isTransfer = vi.fn().mockReturnValue(false);
			mockData.isMultiPayment = vi.fn().mockReturnValue(false);

			const result = subject.isReturn();
			expect(result).toBe(false);
		});
	});

	describe("#iisSent", () => {
		it("should return true when from matches wallet address", () => {
			mockData.from = vi.fn().mockReturnValue("0x1");
			mockWallet.address = vi.fn().mockReturnValue("0x1");
			mockWallet.publicKey = vi.fn().mockReturnValue("0x0");

			expect(subject.isSent()).toBe(true);
		});

		it("should return true when from matches wallet public key", () => {
			mockData.from = vi.fn().mockReturnValue("0x002");
			mockWallet.address = vi.fn().mockReturnValue("0xotheraddr");
			mockWallet.publicKey = vi.fn().mockReturnValue("0x002");

			expect(subject.isSent()).toBe(true);
		});

		it("should return false when from does not match wallet", () => {
			mockData.from = vi.fn().mockReturnValue("0x0");
			mockWallet.address = vi.fn().mockReturnValue("0x1");
			mockWallet.publicKey = vi.fn().mockReturnValue("0x002");

			expect(subject.isSent()).toBe(false);
		});
	});

	describe("#isReceived", () => {
		it("should return true when to matches wallet address", () => {
			mockData.to = vi.fn().mockReturnValue("0x2");
			mockWallet.address = vi.fn().mockReturnValue("0x2");
			mockWallet.publicKey = vi.fn().mockReturnValue("0x0");

			expect(subject.isReceived()).toBe(true);
		});

		it("should return true when to matches wallet public key", () => {
			mockData.to = vi.fn().mockReturnValue("0x002");
			mockWallet.address = vi.fn().mockReturnValue("0xotheraddr");
			mockWallet.publicKey = vi.fn().mockReturnValue("0x002");

			expect(subject.isReceived()).toBe(true);
		});

		it("should return false when to does not match", () => {
			mockData.to = vi.fn().mockReturnValue("0x0");
			mockWallet.address = vi.fn().mockReturnValue("0x2");
			mockWallet.publicKey = vi.fn().mockReturnValue("0x002");

			expect(subject.isReceived()).toBe(false);
		});
	});

	it.each([
		["isTransfer", "isTransfer"],
		["isValidatorRegistration", "isValidatorRegistration"],
		["isUpdateValidator", "isUpdateValidator"],
		["isUsernameRegistration", "isUsernameRegistration"],
		["isUsernameResignation", "isUsernameResignation"],
		["isVote", "isVote"],
		["isUnvote", "isUnvote"],
		["isMultiPayment", "isMultiPayment"],
		["isValidatorResignation", "isValidatorResignation"],
		["isTokenTransfer", "isTokenTransfer"],
		["isApprove", "isApprove"],
		["isRevoke", "isRevoke"],
		["isBatchTransfer", "isBatchTransfer"],
		["isContractDeployment", "isContractDeployment"],
		["isContractTransaction", "isContractTransaction"],
	])("should delegate %s to data", (method, dataMethod) => {
		mockData[dataMethod] = vi.fn().mockReturnValue(true);
		expect((subject as any)[method]()).toBe(true);
	});

	it("should return false for isMultiSignatureRegistration", () => {
		expect(subject.isMultiSignatureRegistration()).toBe(false);
	});

	describe("#total", () => {
		it("should return value minus fee for return transactions", () => {
			mockData.isTransfer = vi.fn().mockReturnValue(true);
			mockData.from = vi.fn().mockReturnValue("0x1");
			mockData.to = vi.fn().mockReturnValue("0x1");
			mockWallet.address = vi.fn().mockReturnValue("0x1");
			mockWallet.publicKey = vi.fn().mockReturnValue("0x00");

			const total = subject.total();
			expect(total.toString()).toBe("9");
		});

		it("should return value plus fee for sent transactions", () => {
			mockData.isTransfer = vi.fn().mockReturnValue(false);
			mockData.isMultiPayment = vi.fn().mockReturnValue(false);
			mockWallet.address = vi.fn().mockReturnValue("0x1");
			mockWallet.publicKey = vi.fn().mockReturnValue("0x00");

			const total = subject.total();
			expect(total.toString()).toBe("11");
		});

		it("should calculate total for received multi-payment", () => {
			mockData.isTransfer = vi.fn().mockReturnValue(false);
			mockData.isMultiPayment = vi.fn().mockReturnValue(true);
			mockData.recipients = vi.fn().mockReturnValue([
				{ address: "0x2", amount: BigNumber.make(3) },
				{ address: "0x0", amount: BigNumber.make(7) },
			]);
			mockWallet.address = vi.fn().mockReturnValue("0x2");

			const total = subject.total();
			expect(total.toString()).toBe("3");
		});

		it("should return plain value for received non-return non-multipayment", () => {
			mockData.isTransfer = vi.fn().mockReturnValue(false);
			mockData.isMultiPayment = vi.fn().mockReturnValue(false);
			mockWallet.address = vi.fn().mockReturnValue("0x2");
			mockWallet.publicKey = vi.fn().mockReturnValue("0x00");

			const total = subject.total();
			expect(total.toString()).toBe("10");
		});
	});

	describe("#convertedAmount", () => {
		it("should return converted amount when timestamp exists", () => {
			const result = subject.convertedAmount();
			expect(result).toBe(20);
		});

		it("should return 0 when timestamp is undefined", () => {
			mockData.timestamp = vi.fn().mockReturnValue(undefined);
			expect(subject.convertedAmount()).toBe(0);
		});
	});

	describe("#convertedFee", () => {
		it("should return converted fee when timestamp exists", () => {
			const result = subject.convertedFee();
			expect(result).toBe(2);
		});

		it("should return 0 when timestamp is undefined", () => {
			mockData.timestamp = vi.fn().mockReturnValue(undefined);
			expect(subject.convertedFee()).toBe(0);
		});
	});

	describe("#convertedTotal", () => {
		it("should return converted total when timestamp exists", () => {
			mockData.isTransfer = vi.fn().mockReturnValue(false);
			mockData.isMultiPayment = vi.fn().mockReturnValue(false);
			const result = subject.convertedTotal();
			expect(result).toBe(22);
		});

		it("should return 0 when timestamp is undefined", () => {
			mockData.timestamp = vi.fn().mockReturnValue(undefined);
			expect(subject.convertedTotal()).toBe(0);
		});
	});

	it("#get", () => {
		expect(subject.get("hash")).toBe("tx-hash");
		expect(mockData.get).toHaveBeenCalledWith("hash");
	});

	it("#toString", () => {
		expect(subject.toString()).toBe("string-representation");
		expect(mockData.toString).toHaveBeenCalled();
	});

	it("toBroadcast", () => {
		expect(subject.toBroadcast()).toBe("serialized-data");
		expect(mockData.toBroadcast).toHaveBeenCalled();
	});

	it("#toObject", () => {
		subject.toObject();
		expect(mockData.toObject).toHaveBeenCalled();
	});

	it("#wallet", () => {
		expect(subject.wallet()).toBe(mockWallet);
	});

	it("#votes", () => {
		expect(subject.votes()).toEqual(["0xvoteaddr"]);
		expect(mockData.votes).toHaveBeenCalled();
	});

	it("#unvotes", () => {
		expect(subject.unvotes()).toEqual([]);
		expect(mockData.unvotes).toHaveBeenCalled();
	});

	it("#username", () => {
		expect(subject.username()).toBe("testuser");
		expect(mockData.username).toHaveBeenCalled();
	});

	it("#validatorPublicKey", () => {
		expect(subject.validatorPublicKey()).toBe("pubkey123");
		expect(mockData.validatorPublicKey).toHaveBeenCalled();
	});

	it("#approveDetails", () => {
		subject.approveDetails();
		expect(mockData.approveDetails).toHaveBeenCalled();
	});

	it("#payments", () => {
		mockData.payments = vi.fn().mockReturnValue([
			{ amount: BigNumber.make(5), recipientId: "0xaddr1" },
			{ amount: BigNumber.make(10), recipientId: "0xaddr2" },
		]);

		const payments = subject.payments();
		expect(payments).toHaveLength(2);
		expect(payments[0]).toEqual({ amount: 5, recipientId: "0xaddr1" });
		expect(payments[1]).toEqual({ amount: 10, recipientId: "0xaddr2" });
	});

	it("#recipients", () => {
		mockData.recipients = vi.fn().mockReturnValue([
			{ address: "0xaddr1", amount: BigNumber.make(5) },
			{ address: "0xaddr2", amount: BigNumber.make(10) },
		]);

		const recipients = subject.recipients();
		expect(recipients).toHaveLength(2);
		expect(recipients[0]).toEqual({ address: "0xaddr1", amount: BigNumber.make(5) });
		expect(recipients[1]).toEqual({ address: "0xaddr2", amount: BigNumber.make(10) });
	});

	it("#explorerLink", () => {
		expect(subject.explorerLink()).toBe("https://explorer.com/tx/tx-hash");
	});

	it("#explorerLinkForBlock", () => {
		expect(subject.explorerLinkForBlock()).toBeUndefined();
	});

	it("#memo", () => {
		expect(subject.memo()).toBe("test memo");
		expect(mockData.memo).toHaveBeenCalled();
	});

	it("#blockHash", () => {
		expect(subject.blockHash()).toBeUndefined();
	});

	it("#confirmations", () => {
		expect(subject.confirmations().toString()).toBe("0");
	});

	it("#isConfirmed", () => {
		expect(subject.isConfirmed()).toBe(false);
	});

	it("#isSuccess", () => {
		expect(subject.isSuccess()).toBe(false);
	});

	it("#gasUsed", () => {
		expect(subject.gasUsed()).toBeNull();
	});

	it("#gasLimit", () => {
		expect(subject.gasLimit()).toBe(21000);
		expect(mockData.gasLimit).toHaveBeenCalled();
	});
});
