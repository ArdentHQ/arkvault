import { Contracts } from "@ardenthq/sdk-profiles";

import { renderHook } from "@testing-library/react";
import { useWalletTransactionCounts } from "./use-wallet-transaction-counts";
import { env, getMainsailProfileId, waitFor } from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

import transactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";

process.env.RESTORE_MAINSAIL_PROFILE = "true";

describe("Wallet transaction counts", () => {
	let wallet: Contracts.IReadWriteWallet;
	let profile: Contracts.IProfile;

	beforeEach(async () => {
		const { data, meta } = transactionsFixture;

		server.use(
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/transactions",
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
				"https://dwallets-evm.mainsailhq.com/api/transactions",
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
				"https://dwallets-evm.mainsailhq.com/api/transactions",
				{
					data: data.slice(1, 3),
					meta,
				},
				{
					query: {
						address: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
						limit: 10,
						page: 2,
					},
				},
			),
		);

		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().first();

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should fetch sent & received counts", async () => {
		const { result } = renderHook(() => useWalletTransactionCounts(wallet));

		expect(result.current.sent).toEqual(0);
		expect(result.current.received).toEqual(0);

		await waitFor(() => {
			expect(result.current.sent).toEqual(1);
		});

		await waitFor(() => {
			expect(result.current.received).toEqual(1);
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
