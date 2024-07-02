/* eslint-disable @typescript-eslint/require-await */
import { Contracts, DTO } from "@ardenthq/sdk-profiles";

import { env, getDefaultProfileId, syncDelegates } from "@/utils/testing-library";

import { CsvFormatter } from "./transaction-csv-formatter.factory";

const dateTime = "23.07.2020 08";

describe("CsvFormatter", () => {
	let profile: Contracts.IProfile;
	let transaction: DTO.ExtendedConfirmedTransactionData;
	let fields: any;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();
	});

	beforeEach(async () => {
		const transactions = await profile.wallets().first().transactionIndex().all();
		transaction = transactions.first();
		fields = CsvFormatter(transaction, "HH");
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	it("should format transaction fields for transfer type", () => {
		expect(fields.amount()).toBe(400_000);
		expect(fields.convertedAmount()).toBe(0);
		expect(fields.convertedFee()).toBe(0);
		expect(fields.convertedTotal()).toBe(0);
		expect(fields.datetime()).toBe(dateTime);
		expect(fields.fee()).toBe(0);
		expect(fields.rate()).toBe(0);
		expect(fields.recipient()).toBe("D5pVkhZbSb4UNXvfmF6j7zdau8yGxfKwSv");
		expect(fields.sender()).toBe("D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax");
		expect(fields.timestamp()).toBe(1_595_491_400);
		expect(fields.total()).toBe(400_000);
	});

	it("should set amount to for transfer type if sender is recipient", () => {
		vi.spyOn(transaction, "recipient").mockReturnValue(transaction.sender());

		const fields = CsvFormatter(transaction, "HH");

		expect(fields.amount()).toBe(0);
		expect(fields.recipient()).toBe("D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax");
		expect(fields.sender()).toBe("D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax");
	});

	it("should format transaction fields for multipayment type", () => {
		vi.spyOn(transaction, "isMultiPayment").mockReturnValue(true);
		vi.spyOn(transaction, "recipients").mockReturnValue([
			{
				address: transaction.wallet().address(),
				amount: 1,
			},
			{
				address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax",
				amount: 10,
			},
			{
				address: "D5pVkhZbSb4UNXvfmF6j7zdau8yGxfKwSv",
				amount: 10,
			},
		]);
		vi.spyOn(transaction, "sender").mockReturnValue(profile.wallets().first().address());
		vi.spyOn(transaction, "isSent").mockReturnValue(true);

		const fields = CsvFormatter(transaction, "HH");

		expect(fields.amount()).toBe(-399_999);
		expect(fields.convertedAmount()).toBe(-0);
		expect(fields.convertedFee()).toBe(-0);
		expect(fields.convertedTotal()).toBe(-0);
		expect(fields.datetime()).toBe(dateTime);
		expect(fields.fee()).toBe(-0.1);
		expect(fields.rate()).toBe(0);
		expect(fields.recipient()).toBe("Multiple (3)");
		expect(fields.sender()).toBe(profile.wallets().first().address());
		expect(fields.timestamp()).toBe(1_595_491_400);
		expect(fields.total()).toBe(-399_999.1);
	});

	it("should format multipayment transaction fields for recipient wallet", () => {
		vi.spyOn(transaction, "isMultiPayment").mockReturnValue(true);
		vi.spyOn(transaction, "recipients").mockReturnValue([
			{
				address: transaction.wallet().address(),
				amount: 1,
			},
			{
				address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax",
				amount: 10,
			},
			{
				address: "D5pVkhZbSb4UNXvfmF6j7zdau8yGxfKwSv",
				amount: 10,
			},
		]);

		const fields = CsvFormatter(transaction, "HH");

		expect(fields.amount()).toBe(1);
		expect(fields.convertedAmount()).toBe(0);
		expect(fields.convertedFee()).toBe(0);
		expect(fields.convertedTotal()).toBe(0);
		expect(fields.datetime()).toBe(dateTime);
		expect(fields.fee()).toBe(0);
		expect(fields.rate()).toBe(0);
		expect(fields.recipient()).toBe("Multiple (3)");
		expect(fields.sender()).toBe("D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax");
		expect(fields.timestamp()).toBe(1_595_491_400);
		expect(fields.total()).toBe(1);
	});

	it("should format transaction fields for vote type", () => {
		vi.spyOn(transaction, "isTransfer").mockReturnValue(false);
		vi.spyOn(transaction, "isVote").mockReturnValue(true);

		expect(fields.amount()).toBe(400_000);
		expect(fields.convertedAmount()).toBe(0);
		expect(fields.convertedFee()).toBe(0);
		expect(fields.convertedTotal()).toBe(0);
		expect(fields.datetime()).toBe(dateTime);
		expect(fields.fee()).toBe(0);
		expect(fields.rate()).toBe(0);
		expect(fields.recipient()).toBe("Vote Transaction");
		expect(fields.sender()).toBe("D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax");
		expect(fields.timestamp()).toBe(1_595_491_400);
		expect(fields.total()).toBe(400_000);
	});

	it("should format transaction fields for unvote type", () => {
		vi.spyOn(transaction, "isTransfer").mockReturnValue(false);
		vi.spyOn(transaction, "isVote").mockReturnValue(false);
		vi.spyOn(transaction, "isUnvote").mockReturnValue(true);

		expect(fields.amount()).toBe(400_000);
		expect(fields.convertedAmount()).toBe(0);
		expect(fields.convertedFee()).toBe(0);
		expect(fields.convertedTotal()).toBe(0);
		expect(fields.datetime()).toBe(dateTime);
		expect(fields.fee()).toBe(0);
		expect(fields.rate()).toBe(0);
		expect(fields.recipient()).toBe("Vote Transaction");
		expect(fields.sender()).toBe("D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax");
		expect(fields.timestamp()).toBe(1_595_491_400);
		expect(fields.total()).toBe(400_000);
	});

	it("should format transaction other types", () => {
		vi.spyOn(transaction, "isTransfer").mockReturnValue(false);
		vi.spyOn(transaction, "isVote").mockReturnValue(false);

		expect(fields.amount()).toBe(400_000);
		expect(fields.convertedAmount()).toBe(0);
		expect(fields.convertedFee()).toBe(0);
		expect(fields.convertedTotal()).toBe(0);
		expect(fields.datetime()).toBe(dateTime);
		expect(fields.fee()).toBe(0);
		expect(fields.rate()).toBe(0);
		expect(fields.recipient()).toBe("Other");
		expect(fields.sender()).toBe("D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax");
		expect(fields.timestamp()).toBe(1_595_491_400);
		expect(fields.total()).toBe(400_000);
	});

	it("should use zero rate if tranraction total is zero", () => {
		vi.spyOn(transaction, "total").mockReturnValue(0);

		expect(CsvFormatter(transaction, "HH").rate()).toBe(0);
	});
});
