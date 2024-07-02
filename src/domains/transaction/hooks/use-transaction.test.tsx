import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";

import { useTransaction } from "./use-transaction";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";

describe("useTransaction", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(() => {
		server.use(
			requestMock("https://ark-test.arkvault.io/api/transactions", {
				data: [
					{
						...transactionsFixture.data[0],
						confirmations: 0,
					},
					transactionsFixture.data[1],
				],
				meta: transactionsFixture.meta,
			}),
		);

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
		const walletSpy = vi
			.spyOn(wallet.transactionIndex(), "sent")
			.mockRejectedValue(new Error("transaction rejected."));

		const { result } = renderHook(() => useTransaction());

		const transactions = await result.current.fetchWalletUnconfirmedTransactions(wallet);

		expect(Array.isArray(transactions)).toBe(true);
		expect(transactions).toHaveLength(0);

		walletSpy.mockRestore();
	});
});
