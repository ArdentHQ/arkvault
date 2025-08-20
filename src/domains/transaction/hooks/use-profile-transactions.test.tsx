import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";

import { useProfileTransactions } from "./use-profile-transactions";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import * as hooksMock from "@/app/hooks";
import { expect, vi } from "vitest";
import { RawTransactionData } from "@/app/lib/mainsail/signed-transaction.dto.contract";
import { PendingTransactionData } from "./use-pending-transactions";
import { IProfile } from "@/app/lib/profiles/profile.contract";

const wrapper = ({ children }: any) => (
	<EnvironmentProvider env={env}>
		<ConfigurationProvider>{children}</ConfigurationProvider>
	</EnvironmentProvider>
);

const signedTransactionData = {
	identifier: "d91057d3b535e43e890c794e2142803a54cd070edd3006e74ffd17dd18165f22",
	serialized: "",
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

const mockPendingTransactionsHook = async (pendingTransactions: PendingTransactionData[] = []) => {
	const removePendingTransaction = vi.fn();
	const pendingHook = await import("@/domains/transaction/hooks/use-pending-transactions");

	const pendingSpy = vi.spyOn(pendingHook, "usePendingTransactions").mockReturnValue({
		addPendingTransaction: vi.fn(),
		pendingTransactions,
		removePendingTransaction,
	});

	return { pendingSpy, removePendingTransaction };
};

describe("useProfileTransactions", () => {
	let profile: IProfile;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	afterEach(() => {
		vi.useRealTimers();
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
		// The issue seems to be related to the interaction between `setInterval` in the hook
		// and `vi.useFakeTimers()` in the test, which prevents the test from completing.
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

	it("checks for new transactions", async () => {
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

	it("should remove a pending transaction once it appears in confirmed results", async () => {
		const wallet = profile.wallets().first();
		const transactionAggregate = await profile.transactionAggregate().all({});
		const confirmed = transactionAggregate.items()[0];
		const confirmedHash = confirmed.hash();

		const pendingTransaction = createMockedTransactionData({
			from: confirmed.from() ?? wallet.address(),
			hash: confirmedHash,
			to: confirmed.to() ?? wallet.address(),
		});

		const { pendingSpy, removePendingTransaction } = await mockPendingTransactionsHook([
			{
				networkId: wallet.networkId(),
				transaction: pendingTransaction,
				walletAddress: wallet.address(),
			},
		]);

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: [wallet] }), { wrapper });

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));
		await waitFor(() => expect(removePendingTransaction).toHaveBeenCalledWith(confirmedHash));

		pendingSpy.mockRestore();
	});

	it("should filter pending by selectedTransactionTypes", async () => {
		const wallets = profile.wallets().values();
		const firstWallet = wallets[0];
		const walletAddress = firstWallet.address();

		const transferTransaction = createMockedTransactionData({
			data: "",
			from: walletAddress,
			hash: "PENDING_TRANSFER",
			networkId: firstWallet.networkId(),
			to: "ADDRESS_TO",
		});

		const voteTransaction = createMockedTransactionData({
			from: "ADDRESS_FROM",
			hash: "PENDING_VOTE",
			networkId: firstWallet.networkId(),
			to: walletAddress,
		});

		const { pendingSpy } = await mockPendingTransactionsHook([
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

		const pending = result.current.transactions;
		expect(pending.some((tx) => tx.hash() === "PENDING_TRANSFER")).toBe(true);
		expect(pending.some((tx) => tx.hash() === "PENDING_VOTE")).toBe(false);

		pendingSpy.mockRestore();
	});

	it("should filter pending by activeMode sent/received using from/to", async () => {
		const allWallets = profile.wallets().values();
		const firstWallet = allWallets[0];
		const walletAddress = firstWallet.address();

		const sentTransaction = createMockedTransactionData({
			from: walletAddress,
			hash: "PENDING_FROM_ME",
			to: "ADDRESS_TO",
			walletAddress,
		});

		const receivedTransaction = createMockedTransactionData({
			from: "ADDRESS_FROM",
			hash: "PENDING_TO_ME",
			to: walletAddress,
		});

		const pendingTransaction = {
			networkId: firstWallet.networkId(),
			walletAddress,
		};

		const { pendingSpy } = await mockPendingTransactionsHook([
			{ ...pendingTransaction, transaction: sentTransaction },
			{ ...pendingTransaction, transaction: receivedTransaction },
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

		const sentPending = sentTransactions.current.transactions;
		expect(sentPending.some((t) => t.hash() === "PENDING_FROM_ME")).toBe(true);
		expect(sentPending.some((t) => t.hash() === "PENDING_TO_ME")).toBe(false);

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

		const receivedPending = receivedTransactions.current.transactions;
		expect(receivedPending.some((t) => t.hash() === "PENDING_TO_ME")).toBe(true);
		expect(receivedPending.some((t) => t.hash() === "PENDING_FROM_ME")).toBe(false);

		pendingSpy.mockRestore();
	});

	it("should sort pending transactions to the top when sorting by amount desc", async () => {
		const allWallets = profile.wallets().values();
		const firstWallet = allWallets[0];
		const walletAddress = firstWallet.address();

		const pendingTransaction = createMockedTransactionData({
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

		const { pendingSpy } = await mockPendingTransactionsHook([
			{
				networkId: firstWallet.networkId(),
				transaction: pendingTransaction,
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

		pendingSpy.mockRestore();
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

		const pendingTransaction = {
			networkId: firstWallet.networkId(),
			walletAddress,
		};

		const { pendingSpy } = await mockPendingTransactionsHook([
			{ ...pendingTransaction, transaction: transactionData1 },
			{ ...pendingTransaction, transaction: transactionData2 },
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

		pendingSpy.mockRestore();
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

		const pendingTransaction = {
			networkId: firstWallet.networkId(),
			walletAddress: firstWallet.address(),
		};

		const { pendingSpy } = await mockPendingTransactionsHook([
			{ ...pendingTransaction, transaction: older },
			{ ...pendingTransaction, transaction: newer },
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

		pendingSpy.mockRestore();
		confirmedTransactionsMock.mockRestore();
	});

	it("should execute the non-date sort path with two pending items", async () => {
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

		const pendingTransaction = {
			networkId: firstWallet.networkId(),
			walletAddress: firstWallet.address(),
		};

		const { pendingSpy } = await mockPendingTransactionsHook([
			{ ...pendingTransaction, transaction: transactionData1 },
			{ ...pendingTransaction, transaction: transactionData2 },
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

		pendingSpy.mockRestore();
		confirmedTransactionsMock.mockRestore();
	});

	it("should sort confirmed transactions after pending transactions when sorting desc (non-date)", async () => {
		const wallets = profile.wallets().values();
		const firstWallet = wallets[0];

		const confirmedTransactions = await profile.transactionAggregate().all({});
		const confirmedTransaction = confirmedTransactions.items()[0];

		const pendingTransactionData = createMockedTransactionData({
			from: "ADDRESS_FROM",
			hash: "PENDING_TX_AFTER_CONFIRMED",
			timestamp: Date.now(),
			to: firstWallet.address(),
		});

		const { pendingSpy } = await mockPendingTransactionsHook([
			{
				networkId: firstWallet.networkId(),
				transaction: pendingTransactionData,
				walletAddress: firstWallet.address(),
			},
		]);

		// Mock to return one confirmed transaction
		const confirmedTransactionsMock = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [confirmedTransaction],
		});

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: [firstWallet] }), { wrapper });

		act(() => {
			result.current.setSortBy({ column: "amount", desc: true });
		});

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));
		expect(result.current.transactions.length).toBeGreaterThan(1);

		// Pending transaction should be sorted before confirmed transaction when desc=true
		expect(result.current.transactions[0].hash()).toBe("PENDING_TX_AFTER_CONFIRMED");

		pendingSpy.mockRestore();
		confirmedTransactionsMock.mockRestore();
	});
});
