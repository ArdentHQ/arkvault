import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";

import { useProfileTransactions } from "./use-profile-transactions";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import * as hooksMock from "@/app/hooks";
import { expect, vi } from "vitest";
import { RawTransactionData } from "@/app/lib/mainsail/signed-transaction.dto.contract";
import { IProfile } from "@/app/lib/profiles/profile.contract";
import unconfirmedFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/unconfirmed.json";

const wrapper = ({ children }: any) => (
	<EnvironmentProvider env={env}>
		<ConfigurationProvider>{children}</ConfigurationProvider>
	</EnvironmentProvider>
);

const signedTransactionData = {
	identifier: "d91057d3b535e43e890c794e2142803a54cd070edd3006e74ffd17dd18165f22",
	signedData: {
		data: "36a94134000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000077364667364663300000000000000000000000000000000000000000000000000",
		from: "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
		gasLimit: "21592",
		gasPrice: "5000000000",
		hash: "d91057d3b535e43e890c794e2142803a54cd070edd3006e74ffd17dd18165f22",
		nonce: "187",
		r: "c88273028bf96f212eee0d20dc0a72aff1d3670ac2f49a8bc648a15a4366631c",
		s: "7073c8d6d2530fdfeafd4ac4a72f0976f33284253e3b97de70b6779b70d7a2f3",
		senderPublicKey: "022a40ea35d53eedf0341ffa17574fca844d69665ce35f224e9a6b1385575044fd",
		to: "0x2c1DE3b4Dbb4aDebEbB5dcECAe825bE2a9fc6eb6",
		username: "sdfsdf3",
		v: 1,
		value: "0",
	},
};

const createMockedTransactionData = (overrides: Partial<RawTransactionData> = {}): RawTransactionData => ({
	...signedTransactionData,
	signedData: {
		...signedTransactionData.signedData,
		...overrides,
	},
});

// Helper to create nested unconfirmed transactions structure
const createNestedUnconfirmedTransactions = (
	transactions: Array<{
		networkId: string;
		walletAddress: string;
		transaction: RawTransactionData;
	}>,
) => {
	const nested: any = {};

	for (const { networkId, walletAddress, transaction } of transactions) {
		if (!nested[networkId]) {
			nested[networkId] = {};
		}
		if (!nested[networkId][walletAddress]) {
			nested[networkId][walletAddress] = [];
		}
		nested[networkId][walletAddress].push(transaction);
	}

	return nested;
};

const mockUnconfirmedTransactionsHook = async (
	unconfirmedTransactions: Array<{
		networkId: string;
		walletAddress: string;
		transaction: RawTransactionData;
	}> = [],
) => {
	const removeUnconfirmedTransaction = vi.fn();
	const addUnconfirmedTransactionFromApi = vi.fn();
	const cleanupUnconfirmedForAddresses = vi.fn();
	const unconfirmedHook = await import("@/domains/transaction/hooks/use-unconfirmed-transactions");

	const nestedTransactions = createNestedUnconfirmedTransactions(unconfirmedTransactions);

	const unconfirmedSpy = vi.spyOn(unconfirmedHook, "useUnconfirmedTransactions").mockReturnValue({
		addUnconfirmedTransactionFromApi,
		addUnconfirmedTransactionFromSigned: vi.fn(),
		cleanupUnconfirmedForAddresses,
		removeUnconfirmedTransaction,
		unconfirmedTransactions: nestedTransactions,
	});

	return {
		addUnconfirmedTransactionFromApi,
		cleanupUnconfirmedForAddresses,
		removeUnconfirmedTransaction,
		unconfirmedSpy,
	};
};

describe("useProfileTransactions", () => {
	let profile: IProfile;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it("should return an empty state for no wallets", async () => {
		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: [] }), { wrapper });

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));

		expect(result.current.transactions).toHaveLength(0);
	});

	it("should fetch all transactions", async () => {
		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));
		await waitFor(() => expect(result.current.transactions).toHaveLength(10));
	});

	it("should fetch transactions when wallet are not synced", async () => {
		const wallets = profile.wallets().values();
		const hasSyncedWithNetworkSpy = vi.spyOn(wallets[0], "hasSyncedWithNetwork").mockReturnValue(false);
		const identifySpy = vi.spyOn(wallets[0].synchroniser(), "identity").mockImplementation(vi.fn());

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets }), {
			wrapper,
		});

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));
		await waitFor(() => expect(result.current.transactions).toHaveLength(10));

		await waitFor(() => expect(identifySpy).toHaveBeenCalled());

		identifySpy.mockRestore();
		hasSyncedWithNetworkSpy.mockRestore();
	});

	it("should fetch more transactions", async () => {
		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));
		await waitFor(() => expect(result.current.transactions).toHaveLength(10));

		await act(async () => {
			await result.current.fetchMore();
		});

		await waitFor(() => expect(result.current.transactions).toHaveLength(20));
	});

	it("should update filters and fetch new data", async () => {
		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.transactions).toHaveLength(10));

		const sentMock = vi.spyOn(profile.transactionAggregate(), "sent").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		});

		act(() => {
			result.current.updateFilters({ activeMode: "sent" });
		});

		await waitFor(() => expect(result.current.transactions).toHaveLength(0));

		sentMock.mockRestore();
	});

	it("should ignore when a new request is made", async () => {
		vi.useRealTimers();

		const transactions = await profile.transactionAggregate().all();
		const items = transactions.items();

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		const allMock = vi.spyOn(profile.transactionAggregate(), "all").mockImplementation(
			() =>
				new Promise((resolve) => {
					setTimeout(() => {
						resolve({
							hasMorePages: () => true,
							items: () => [items[0]],
						});
					}, 100);
				}),
		);

		const sentMock = vi.spyOn(profile.transactionAggregate(), "sent").mockImplementation(
			() =>
				new Promise((resolve) => {
					setTimeout(() => {
						resolve({
							hasMorePages: () => true,
							items: () => items,
						});
					}, 500);
				}),
		);

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		act(() => {
			result.current.updateFilters({ activeMode: "sent" });
		});

		await waitFor(() => expect(result.current.transactions).toHaveLength(10), { timeout: 1000 });

		allMock.mockRestore();
		sentMock.mockRestore();
	});

	it("should update filters and fetch new data with received mode", async () => {
		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.transactions).toHaveLength(10));

		const receivedMock = vi.spyOn(profile.transactionAggregate(), "received").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		});

		act(() => {
			result.current.updateFilters({ activeMode: "received" });
		});

		await waitFor(() => expect(result.current.transactions).toHaveLength(0));

		receivedMock.mockRestore();
	});

	it("should hide unconfirmed transactions", async () => {
		const transactions = await profile.transactionAggregate().all();
		const items = transactions.items();

		vi.spyOn(items[0], "isConfirmed").mockReturnValue(false);
		vi.spyOn(items[0], "isSent").mockReturnValue(true);

		const allMock = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue(transactions);

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.transactions).toHaveLength(items.length - 1));

		allMock.mockRestore();
	});

	it.skip("should run updates periodically", async () => {
		// This test is skipped because it consistently times out in CI environments.
		vi.useFakeTimers();
		const allMock = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		});

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(allMock).toHaveBeenCalledTimes(1));

		await act(async () => {
			await vi.advanceTimersByTimeAsync(31_000);
		});

		await waitFor(() => expect(allMock).toHaveBeenCalledTimes(2), { timeout: 5000 });

		allMock.mockRestore();
	});

	it("should handle filter changes and sorting", async () => {
		const transactionAggregateSpy = vi.spyOn(profile.transactionAggregate(), "all");

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		act(() => {
			result.current.updateFilters({ activeMode: "all", selectedTransactionTypes: ["transfer"] });
		});

		await waitFor(() =>
			expect(transactionAggregateSpy).toHaveBeenCalledWith(expect.objectContaining({ types: ["transfer"] })),
		);

		act(() => {
			result.current.setSortBy({ column: "Fiat Value", desc: false });
		});

		await waitFor(() =>
			expect(transactionAggregateSpy).toHaveBeenCalledWith(expect.objectContaining({ orderBy: "amount:asc" })),
		);

		transactionAggregateSpy.mockRestore();
	});

	it("checks for new confirmed transactions", async () => {
		const useSynchronizerSpy = vi.spyOn(hooksMock, "useSynchronizer").mockImplementation((jobs) => {
			const start = async () => {
				await jobs[0].callback();
			};

			return {
				start: start,
				stop: vi.fn(),
			};
		});

		const transactions = await profile.transactionAggregate().all();
		const items = transactions.items();

		const allMock = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => true,
			items: () => [items[0]],
		});

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isLoadingMore).toBe(false));
		await waitFor(() => expect(result.current.transactions).toHaveLength(1));

		useSynchronizerSpy.mockRestore();
		allMock.mockRestore();
	});

	it("checks for new transactions and handles empty result", async () => {
		const useSynchronizerSpy = vi.spyOn(hooksMock, "useSynchronizer").mockImplementation((jobs) => {
			const start = async () => {
				await jobs[0].callback();
			};

			return {
				start: start,
				stop: vi.fn(),
			};
		});

		const allMock = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		});

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isLoadingMore).toBe(false));
		await waitFor(() => expect(result.current.transactions).toHaveLength(0));

		useSynchronizerSpy.mockRestore();
		allMock.mockRestore();
	});

	it("should handle ascending sort order", async () => {
		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		act(() => {
			result.current.setSortBy({ column: "amount", desc: false });
		});

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.sortBy).toEqual({ column: "amount", desc: false }));
	});

	it("should remove an unconfirmed transaction once it appears in confirmed results", async () => {
		const wallet = profile.wallets().first();
		const transactionAggregate = await profile.transactionAggregate().all({});
		const confirmed = transactionAggregate.items()[0];
		const confirmedHash = confirmed.hash();

		const unconfirmedTransaction = createMockedTransactionData({
			from: confirmed.from() ?? wallet.address(),
			hash: confirmedHash,
			to: confirmed.to() ?? wallet.address(),
		});

		const useSynchronizerSpy = vi.spyOn(hooksMock, "useSynchronizer").mockImplementation((jobs) => {
			const start = async () => {
				await jobs[2].callback();
			};

			return {
				start: start,
				stop: vi.fn(),
			};
		});

		const { unconfirmedSpy, removeUnconfirmedTransaction } = await mockUnconfirmedTransactionsHook([
			{
				networkId: wallet.networkId(),
				transaction: unconfirmedTransaction,
				walletAddress: wallet.address(),
			},
		]);

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: [wallet] }), { wrapper });

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));

		await waitFor(() => expect(removeUnconfirmedTransaction).toHaveBeenCalledWith(confirmedHash));

		unconfirmedSpy.mockRestore();
		useSynchronizerSpy.mockRestore();
	});

	it("should filter unconfirmed by selectedTransactionTypes", async () => {
		const wallets = profile.wallets().values();
		const firstWallet = wallets[0];
		const walletAddress = firstWallet.address();

		const transferTransaction = createMockedTransactionData({
			data: "",
			from: walletAddress,
			hash: "PENDING_TRANSFER",
			to: "ADDRESS_TO",
		});

		const voteTransaction = createMockedTransactionData({
			from: "ADDRESS_FROM",
			hash: "PENDING_VOTE",
			to: walletAddress,
		});

		const { unconfirmedSpy } = await mockUnconfirmedTransactionsHook([
			{
				networkId: firstWallet.networkId(),
				transaction: transferTransaction,
				walletAddress: firstWallet.address(),
			},
			{
				networkId: firstWallet.networkId(),
				transaction: voteTransaction,
				walletAddress: firstWallet.address(),
			},
		]);

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets }), { wrapper });

		act(() => {
			result.current.updateFilters({ activeMode: "all", selectedTransactionTypes: ["transfer"] });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));

		const unconfirmed = result.current.transactions;
		expect(unconfirmed.some((tx) => tx.hash() === "PENDING_TRANSFER")).toBe(true);
		expect(unconfirmed.some((tx) => tx.hash() === "PENDING_VOTE")).toBe(false);

		unconfirmedSpy.mockRestore();
	});

	it("should filter unconfirmed by activeMode sent/received using from/to", async () => {
		const allWallets = profile.wallets().values();
		const firstWallet = allWallets[0];
		const walletAddress = firstWallet.address();

		const sentTransaction = createMockedTransactionData({
			from: walletAddress,
			hash: "PENDING_FROM_ME",
			to: "ADDRESS_TO",
		});

		const receivedTransaction = createMockedTransactionData({
			from: "ADDRESS_FROM",
			hash: "PENDING_TO_ME",
			to: walletAddress,
		});

		const { unconfirmedSpy } = await mockUnconfirmedTransactionsHook([
			{
				networkId: firstWallet.networkId(),
				transaction: sentTransaction,
				walletAddress,
			},
			{
				networkId: firstWallet.networkId(),
				transaction: receivedTransaction,
				walletAddress,
			},
		]);

		const { result: sentTransactions } = renderHook(
			() => useProfileTransactions({ profile, wallets: [firstWallet] }),
			{
				wrapper,
			},
		);

		act(() => {
			sentTransactions.current.updateFilters({ activeMode: "sent" });
		});

		await waitFor(() => expect(sentTransactions.current.isLoadingTransactions).toBe(false));

		const sentUnconfirmed = sentTransactions.current.transactions;
		expect(sentUnconfirmed.some((t) => t.hash() === "PENDING_FROM_ME")).toBe(true);
		expect(sentUnconfirmed.some((t) => t.hash() === "PENDING_TO_ME")).toBe(false);

		const { result: receivedTransactions } = renderHook(
			() => useProfileTransactions({ profile, wallets: [firstWallet] }),
			{
				wrapper,
			},
		);

		act(() => {
			receivedTransactions.current.updateFilters({ activeMode: "received" });
		});

		await waitFor(() => expect(receivedTransactions.current.isLoadingTransactions).toBe(false));

		const receivedUnconfirmed = receivedTransactions.current.transactions;
		expect(receivedUnconfirmed.some((t) => t.hash() === "PENDING_TO_ME")).toBe(true);
		expect(receivedUnconfirmed.some((t) => t.hash() === "PENDING_FROM_ME")).toBe(false);

		unconfirmedSpy.mockRestore();
	});

	it("should sort unconfirmed transactions to the top when sorting by amount desc", async () => {
		const allWallets = profile.wallets().values();
		const firstWallet = allWallets[0];
		const walletAddress = firstWallet.address();

		const unconfirmedTransaction = createMockedTransactionData({
			convertedAmount: 1,
			convertedTotal: 1,
			data: "",
			fee: 0.1,
			from: "ADDR_EXTERNAL",
			hash: "PENDING_SORT_TEST",
			to: walletAddress,
			total: 1,
			value: 1,
		});

		const { unconfirmedSpy } = await mockUnconfirmedTransactionsHook([
			{
				networkId: firstWallet.networkId(),
				transaction: unconfirmedTransaction,
				walletAddress,
			},
		]);

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: [firstWallet] }), { wrapper });

		act(() => {
			result.current.setSortBy({ column: "amount", desc: true });
		});

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));

		const first = result.current.transactions[0];
		expect(first.hash()).toBe("PENDING_SORT_TEST");

		unconfirmedSpy.mockRestore();
	});

	it("should sort by amount desc", async () => {
		const wallets = profile.wallets().values();
		const firstWallet = wallets[0];
		const walletAddress = firstWallet.address();

		const transactionData1 = createMockedTransactionData({
			data: "",
			from: "ADDR_EXTERNAL",
			hash: "TEST_AMOUNT_SORT_1",
			to: walletAddress,
			value: 100,
		});

		const transactionData2 = createMockedTransactionData({
			data: "",
			from: "ADDR_EXTERNAL",
			hash: "TEST_AMOUNT_SORT_2",
			to: walletAddress,
			value: 50,
		});

		const { unconfirmedSpy } = await mockUnconfirmedTransactionsHook([
			{
				networkId: firstWallet.networkId(),
				transaction: transactionData1,
				walletAddress,
			},
			{
				networkId: firstWallet.networkId(),
				transaction: transactionData2,
				walletAddress,
			},
		]);

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets }), { wrapper });

		act(() => {
			result.current.setSortBy({ column: "amount", desc: true });
		});

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));
		await waitFor(() => expect(result.current.transactions.length).toBeGreaterThan(0));
		expect(result.current.transactions[0].hash()).toBe("TEST_AMOUNT_SORT_1");

		unconfirmedSpy.mockRestore();
	});

	it("should sort by date desc and asc using timestamps", async () => {
		const wallets = profile.wallets().values();
		const firstWallet = wallets[0];
		const now = Date.now();

		const older = createMockedTransactionData({
			from: "ADDRESS_FROM",
			hash: "PENDING_OLD",
			timestamp: now - 60_000,
			to: firstWallet.address(),
		});

		const newer = createMockedTransactionData({
			from: "ADDRESS_FROM",
			hash: "PENDING_NEW",
			timestamp: now,
			to: firstWallet.address(),
		});

		const { unconfirmedSpy } = await mockUnconfirmedTransactionsHook([
			{
				networkId: firstWallet.networkId(),
				transaction: older,
				walletAddress: firstWallet.address(),
			},
			{
				networkId: firstWallet.networkId(),
				transaction: newer,
				walletAddress: firstWallet.address(),
			},
		]);

		const confirmedTransactionsMock = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		});

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: [firstWallet] }), { wrapper });

		act(() => {
			result.current.setSortBy({ column: "date", desc: true });
		});

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));

		expect(result.current.transactions[0].hash()).toBe("PENDING_NEW");

		act(() => {
			result.current.setSortBy({ column: "date", desc: false });
		});

		await waitFor(() => expect(result.current.transactions[0].hash()).toBe("PENDING_OLD"));

		unconfirmedSpy.mockRestore();
		confirmedTransactionsMock.mockRestore();
	});

	it("should execute the non-date sort path with two unconfirmed items", async () => {
		const wallets = profile.wallets().values();
		const firstWallet = wallets[0];

		const transactionData1 = createMockedTransactionData({
			from: "ADDRESS_FROM",
			hash: "TEST_TX_1",
			timestamp: Date.now() - 1_000,
			to: firstWallet.address(),
		});

		const transactionData2 = createMockedTransactionData({
			from: "ADDRESS_FROM",
			hash: "TEST_TX_2",
			timestamp: Date.now(),
			to: firstWallet.address(),
		});

		const { unconfirmedSpy } = await mockUnconfirmedTransactionsHook([
			{
				networkId: firstWallet.networkId(),
				transaction: transactionData1,
				walletAddress: firstWallet.address(),
			},
			{
				networkId: firstWallet.networkId(),
				transaction: transactionData2,
				walletAddress: firstWallet.address(),
			},
		]);

		const confirmedTransactionsMock = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		});

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: [firstWallet] }), { wrapper });

		act(() => {
			result.current.setSortBy({ column: "amount", desc: true });
		});

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));
		expect(result.current.transactions).toHaveLength(2);

		expect(result.current.transactions[0].hash()).toBe("TEST_TX_1");

		unconfirmedSpy.mockRestore();
		confirmedTransactionsMock.mockRestore();
	});

	it("should filter out unconfirmed transactions with non-matching wallet address or network ID", async () => {
		const wallets = profile.wallets().values();
		const firstWallet = wallets[0];

		const matchingUnconfirmedTx = createMockedTransactionData({
			from: "ADDRESS_FROM",
			hash: "MATCHING_PENDING_TX",
			to: firstWallet.address(),
		});

		const nonMatchingAddressTx = createMockedTransactionData({
			from: "ADDRESS_FROM",
			hash: "NON_MATCHING_ADDRESS_TX",
			to: "NON_MATCHING_ADDRESS",
		});

		const nonMatchingNetworkTx = createMockedTransactionData({
			from: "ADDRESS_FROM",
			hash: "NON_MATCHING_NETWORK_TX",
			to: firstWallet.address(),
		});

		const { unconfirmedSpy } = await mockUnconfirmedTransactionsHook([
			{
				// This should be included (matching wallet address and network)
				networkId: firstWallet.networkId(),
				transaction: matchingUnconfirmedTx,
				walletAddress: firstWallet.address(),
			},
			{
				// This should be filtered out (non-matching wallet address)
				networkId: firstWallet.networkId(),
				transaction: nonMatchingAddressTx,
				walletAddress: "NON_MATCHING_WALLET_ADDRESS",
			},
			{
				// This should be filtered out (non-matching network ID)
				networkId: "non-matching-network",
				transaction: nonMatchingNetworkTx,
				walletAddress: firstWallet.address(),
			},
		]);

		const confirmedTransactionsMock = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		});

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: [firstWallet] }), { wrapper });

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));

		// Should only include the matching unconfirmed transaction
		const resultHashes = result.current.transactions.map((tx) => tx.hash());
		expect(resultHashes).toContain("MATCHING_PENDING_TX");
		expect(resultHashes).not.toContain("NON_MATCHING_ADDRESS_TX");
		expect(resultHashes).not.toContain("NON_MATCHING_NETWORK_TX");

		expect(result.current.transactions).toHaveLength(1);

		unconfirmedSpy.mockRestore();
		confirmedTransactionsMock.mockRestore();
	});

	it("should reset service when wallets array becomes empty", async () => {
		const wallet = profile.wallets().first();
		const { unconfirmedSpy } = await mockUnconfirmedTransactionsHook([]);

		const { result, rerender } = renderHook(({ wallets }) => useProfileTransactions({ profile, wallets }), {
			initialProps: { wallets: [wallet] },
			wrapper,
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));

		rerender({ wallets: [] });

		await waitFor(() => expect(result.current.transactions).toHaveLength(0));

		unconfirmedSpy.mockRestore();
	});

	it("should handle service initialization failure", async () => {
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const mockWallet = {
			address: () => "0xTestAddress",
			network: () => ({
				config: () => ({
					host: () => {
						throw new Error("Host configuration error");
					},
				}),
			}),
			networkId: () => "test-network",
			profile: () => profile,
			transactionTypes: () => ["transfer", "vote"],
		};

		const { unconfirmedSpy } = await mockUnconfirmedTransactionsHook([]);

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: [mockWallet as any] }), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(true));

		expect(consoleErrorSpy).toHaveBeenCalled();

		consoleErrorSpy.mockRestore();
		unconfirmedSpy.mockRestore();
	});

	it("should check for unconfirmed transactions after initial render", async () => {
		const wallet = profile.wallets().first();
		const networkId = wallet.networkId();
		const walletAddress = wallet.address();

		// Create mock unconfirmed transaction data
		const unconfirmedTx = {
			...unconfirmedFixture[0],
			from: () => walletAddress,
			hash: () => "NEW_UNCONFIRMED_TX",
			raw: () => createMockedTransactionData({ hash: "NEW_UNCONFIRMED_TX" }),
			to: () => "0xA46720D11Bc8408411Cbd45057EeDA6d32D2Af54",
		};

		// Mock the transactionAggregate.unconfirmed method to return the mock transaction
		const unconfirmedMock = vi.spyOn(profile.transactionAggregate(), "unconfirmed").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [unconfirmedTx as any],
		});

		const { addUnconfirmedTransactionFromApi } = await mockUnconfirmedTransactionsHook([]);

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: [wallet] }), { wrapper });

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));

		// Wait for the fetchUnconfirmedTransactions to be called
		await waitFor(() => expect(unconfirmedMock).toHaveBeenCalled());
		await waitFor(() =>
			expect(addUnconfirmedTransactionFromApi).toHaveBeenCalledWith(
				networkId,
				walletAddress,
				expect.objectContaining({
					signedData: expect.objectContaining({
						hash: "NEW_UNCONFIRMED_TX",
					}),
				}),
			),
		);

		unconfirmedMock.mockRestore();
	});

	it("should short-circuit fetchTransactions when there are no wallets", async () => {
		const allSpy = vi.spyOn(profile.transactionAggregate(), "all");

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: [] }), { wrapper });

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));
		expect(result.current.transactions).toHaveLength(0);

		expect(allSpy).not.toHaveBeenCalled();

		allSpy.mockRestore();
	});

	it("should return default block time when milestone throws an error", async () => {
		const mockNetwork = {
			milestone: () => {
				throw new Error("Milestone error");
			},
		};

		const activeNetworkSpy = vi.spyOn(profile, "activeNetwork").mockReturnValue(mockNetwork as any);
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: [] }), { wrapper });

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));

		expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to get block time:", expect.any(Error));

		activeNetworkSpy.mockRestore();
		consoleErrorSpy.mockRestore();
	});

	it("should skip unconfirmed transactions with no matching wallet", async () => {
		const wallet = profile.wallets().first();

		// Create unconfirmed transaction that doesn't match any wallet addresses
		const nonMatchingUnconfirmedTx = {
			...unconfirmedFixture[0],
			from: () => "0xNonMatchingFromAddress",
			hash: () => "NON_MATCHING_TX",
			raw: () => createMockedTransactionData({ hash: "NON_MATCHING_TX" }),
			to: () => "0xNonMatchingToAddress",
		};

		// Create matching unconfirmed transaction
		const matchingUnconfirmedTx = {
			...unconfirmedFixture[0],
			from: () => wallet.address(),
			hash: () => "MATCHING_TX",
			raw: () => createMockedTransactionData({ hash: "MATCHING_TX" }),
			to: () => "0xA46720D11Bc8408411Cbd45057EeDA6d32D2Af54",
		};

		// Mock the transactionAggregate.unconfirmed method to return both transactions
		const unconfirmedMock = vi.spyOn(profile.transactionAggregate(), "unconfirmed").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [nonMatchingUnconfirmedTx as any, matchingUnconfirmedTx as any],
		});

		const { addUnconfirmedTransactionFromApi } = await mockUnconfirmedTransactionsHook([]);

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: [wallet] }), { wrapper });

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));

		await waitFor(() => expect(unconfirmedMock).toHaveBeenCalled());

		// Should only add the matching transaction, not the non-matching one
		await waitFor(() => expect(addUnconfirmedTransactionFromApi).toHaveBeenCalledTimes(1));
		expect(addUnconfirmedTransactionFromApi).toHaveBeenCalledWith(
			wallet.networkId(),
			wallet.address(),
			expect.objectContaining({
				signedData: expect.objectContaining({
					hash: "MATCHING_TX",
				}),
			}),
		);

		unconfirmedMock.mockRestore();
	});

	it("should not remove unconfirmed transactions that do not match confirmed transactions", async () => {
		const wallet = profile.wallets().first();
		const transactionAggregate = await profile.transactionAggregate().all({});
		const confirmed = transactionAggregate.items()[0];

		const unconfirmedTransaction = createMockedTransactionData({
			from: wallet.address(),
			hash: "unconfirmed-hash",
			to: confirmed.to() ?? wallet.address(),
		});

		const useSynchronizerSpy = vi.spyOn(hooksMock, "useSynchronizer").mockImplementation((jobs) => {
			const start = async () => {
				await jobs[2].callback();
			};

			return {
				start: start,
				stop: vi.fn(),
			};
		});

		const { unconfirmedSpy, removeUnconfirmedTransaction } = await mockUnconfirmedTransactionsHook([
			{
				networkId: wallet.networkId(),
				transaction: unconfirmedTransaction,
				walletAddress: wallet.address(),
			},
		]);

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: [wallet] }), { wrapper });

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));

		expect(removeUnconfirmedTransaction).not.toHaveBeenCalledWith("unconfirmed-hash");

		unconfirmedSpy.mockRestore();
		useSynchronizerSpy.mockRestore();
	});
});
