import { describe, beforeAll, it } from "vitest"
import { env, getMainsailProfileId, render, screen, waitFor } from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";
import { TransactionEncoder } from "./transaction-encoder";

let profile: Contracts.IProfile;

describe("TransactionEncoder", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
	});

	const tokenEncodedData = {
		"data": "0xa9059cbb000000000000000000000000cd15953dd076e56dc6a5bc46da23308ff3158ee60000000000000000000000000000000000000000000000000000000000000064",
		"to": "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
	}

	it("should encode token transfer", async () => {
		const encoder = new TransactionEncoder(profile.activeNetwork())
		const address = profile.wallets().first().address()

		expect(encoder.tokenTransfer(address, { recipients: [{ address, amount: 100 }], senderAddress: address })).toEqual(tokenEncodedData)
	});

	it("should get token transfer if token info is provided", async () => {
		const encoder = new TransactionEncoder(profile.activeNetwork())
		const address = profile.wallets().first().address()

		expect(encoder.byType({ tokenContractAddress: address, senderAddress: address, recipients: [{ address, amount: 100 }] }, 'transfer')).toEqual(tokenEncodedData)
	});
});
