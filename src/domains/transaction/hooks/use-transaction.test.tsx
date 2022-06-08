import { Contracts } from "@payvo/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import nock from "nock";

import { useTransaction } from "./use-transaction";
import { env, getDefaultProfileId } from "@/utils/testing-library";

describe("useTransaction", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		nock.disableNetConnect();
		nock("https://ark-test.arkvault.io")
			.get("/api/transactions")
			.query(true)
			.reply(200, () => {
				const { meta, data } = require("tests/fixtures/coins/ark/devnet/transactions.json");
				data[0].confirmations = 0;
				return {
					data: data.slice(0, 2),
					meta,
				};
			});
	});

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	it("should fetch wallet unconfirmed transactions", async () => {
		const { result } = renderHook(() => useTransaction());

		const transactions = await result.current.fetchWalletUnconfirmedTransactions(wallet);

		expect(Array.isArray(transactions)).toBe(true);
		expect(transactions).toHaveLength(1);
	});

	it("should return an empty list if lookup fails", async () => {
		const walletSpy = jest
			.spyOn(wallet.transactionIndex(), "sent")
			.mockRejectedValue(new Error("transaction rejected."));

		const { result } = renderHook(() => useTransaction());

		const transactions = await result.current.fetchWalletUnconfirmedTransactions(wallet);

		expect(Array.isArray(transactions)).toBe(true);
		expect(transactions).toHaveLength(0);

		walletSpy.mockRestore();
	});
});
