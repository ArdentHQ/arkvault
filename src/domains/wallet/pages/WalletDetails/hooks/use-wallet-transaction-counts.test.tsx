import { Contracts } from "@ardenthq/sdk-profiles";

import { renderHook } from "@testing-library/react";
import { useWalletTransactionCounts } from "./use-wallet-transaction-counts";
import { env, getDefaultProfileId, waitFor } from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";

describe("Wallet transaction counts", () => {
	let wallet: Contracts.IReadWriteWallet;
	let profile: Contracts.IProfile;

	beforeEach(async () => {
		const { data, meta } = transactionsFixture;

		server.use(
			requestMock(
				"https://ark-test.arkvault.io/api/transactions",
				{
					data: [
						{
							...data[0],
							confirmations: 0,
						},
					],
					meta,
				},
				{
					query: {
						page: null,
					},
				},
			),
			requestMock(
				"https://ark-test.arkvault.io/api/transactions",
				{
					data: [
						{
							...data[0],
							confirmations: 0,
						},
					],
					meta,
				},
				{
					query: {
						page: 1,
					},
				},
			),
			requestMock(
				"https://ark-test.arkvault.io/api/transactions",
				{
					data: data.slice(1, 3),
					meta,
				},
				{
					query: {
						address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
						limit: 10,
						page: 2,
					},
				},
			),
		);

		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should fetch sent & received counts", async () => {
		const { result } = renderHook(() => useWalletTransactionCounts(wallet));

		expect(result.current.sent).toEqual(0);
		expect(result.current.received).toEqual(0);

		await waitFor(() => {
			expect(result.current.sent).toEqual(7);
		});

		await waitFor(() => {
			expect(result.current.received).toEqual(7);
		});
	});

	it("should return zero counts if requests are not fullfilled", async () => {
		vi.spyOn(wallet.transactionIndex(), "sent").mockImplementation(() => {
			throw new Error("error");
		});

		vi.spyOn(wallet.transactionIndex(), "received").mockImplementation(() => {
			throw new Error("error");
		});

		const { result } = renderHook(() => useWalletTransactionCounts(wallet));

		expect(result.current.sent).toEqual(0);
		expect(result.current.received).toEqual(0);

		await waitFor(() => {
			expect(result.current.sent).toEqual(0);
		});

		await waitFor(() => {
			expect(result.current.received).toEqual(0);
		});
	});
});
