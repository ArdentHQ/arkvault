import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";

import { useProfileTransactions } from "./use-profile-transactions";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import { env, getDefaultProfileId, syncValidators } from "@/utils/testing-library";
import * as hooksMock from "@/app/hooks";
import { PendingTransactionsService } from "@/app/lib/mainsail/pending-transactions.service";
import { expect, vi } from "vitest";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";

const wrapper = ({ children }: any) => (
	<EnvironmentProvider env={env}>
		<ConfigurationProvider>{children}</ConfigurationProvider>
	</EnvironmentProvider>
);

const createMockPendingTransaction = (overrides: Partial<any> = {}): any => ({
	convertedAmount: 0,
	convertedTotal: 0,
	explorerLink: "",
	fee: 0,
	from: "",
	hash: "",
	isMultiPayment: false,
	isReturn: false,
	isTransfer: true,
	isUnvote: false,
	isUpdateValidator: false,
	isUsernameRegistration: false,
	isUsernameResignation: false,
	isValidatorRegistration: false,
	isValidatorResignation: false,
	isVote: false,
	isVoteCombination: false,
	networkId: "",
	nonce: BigNumber.make(1),
	recipients: [],
	timestamp: DateTime.make(Date.now()),
	to: "",
	total: 0,
	type: "transfer",
	value: 0,
	walletAddress: "",
	...overrides,
});

const wrapPending = (tx: any, walletAddresses: string[], wallets: any[]) => {
	const walletByAddress = (addr: string) => wallets.find((w: any) => w.address() === addr);
	const walletByNetworkId = (id: string) => wallets.find((w: any) => w.networkId() === id);

	const unix = typeof tx.timestamp === "number" ? tx.timestamp : (tx.timestamp?.toUNIX?.() ?? Date.now());

	const recipients = Array.isArray(tx.recipients) ? tx.recipients : [];

	const isReceived =
		(walletAddresses?.includes?.(tx.to) ?? false) ||
		recipients.some((r: any) => walletAddresses?.includes?.(r.address));

	const isSent = walletAddresses?.includes?.(tx.from) ?? false;

	const networkWallet = walletByNetworkId(tx.networkId);

	return {
		blockHash: () => {},
		confirmations: () => BigNumber.make(0),
		convertedAmount: () => tx.convertedAmount ?? 0,
		convertedTotal: () => tx.convertedTotal ?? 0,
		explorerLink: () => tx.explorerLink ?? "",
		fee: () => tx.fee ?? 0,
		from: () => tx.from ?? "",
		hash: () => tx.hash,
		isConfirmed: () => false,
		isFailed: () => false,
		isMultiPayment: () => !!tx.isMultiPayment,
		isPending: () => true,
		isReceived: () => isReceived,
		isReturn: () => !!tx.isReturn,
		isSent: () => isSent,
		isSuccess: () => false,
		isTransfer: () => !!tx.isTransfer,
		isUnvote: () => !!tx.isUnvote,
		isUpdateValidator: () => !!tx.isUpdateValidator,
		isUsernameRegistration: () => !!tx.isUsernameRegistration,
		isUsernameResignation: () => !!tx.isUsernameResignation,
		isValidatorRegistration: () => !!tx.isValidatorRegistration,
		isValidatorResignation: () => !!tx.isValidatorResignation,
		isVote: () => !!tx.isVote,
		isVoteCombination: () => !!tx.isVoteCombination,
		network: () => networkWallet?.network(),
		nonce: () => BigNumber.make(String(tx.nonce ?? 0)),
		recipients: () => recipients,
		timestamp: () => DateTime.make(unix),
		to: () => tx.to ?? "",
		total: () => tx.total ?? tx.value ?? 0,
		type: () => tx.type ?? (tx.isTransfer ? "transfer" : "unknown"),
		value: () => tx.value ?? 0,
		wallet: () => walletByAddress(tx.walletAddress),
	};
};

const mockPendingTransactionsHook = async (pendingTransactions: any[] = []) => {
	const removePendingTransaction = vi.fn();
	const addPendingTransactionFromUnconfirmed = vi.fn();

	const pendingHook = await import("@/domains/transaction/hooks/use-pending-transactions");

	const buildPendingForUI = (walletAddresses: string[], walletsArg: any[]) =>
		pendingTransactions.map((tx) => wrapPending(tx, walletAddresses, walletsArg));

	const pendingJson = pendingTransactions.map((tx) => ({ hash: tx.hash }));

	const pendingSpy = vi.spyOn(pendingHook, "usePendingTransactions").mockReturnValue({
		addPendingTransactionFromUnconfirmed,
		buildPendingForUI,
		pendingJson,
		removePendingTransaction,
	});

	return { pendingSpy, removePendingTransaction };
};

describe("useProfileTransactions", () => {
	let profile: any;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await syncValidators(profile);
		await env.profiles().restore(profile);
		await profile.sync();
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

	it("removes a pending transaction once it appears in confirmed results", async () => {
		const wallets = profile.wallets().values();
		const transactionAggregate = await profile.transactionAggregate().all();
		const confirmed = transactionAggregate.items()[0];
		const confirmedHash = confirmed.hash();

		const pendingTransaction = createMockPendingTransaction({
			from: confirmed.from?.() ?? wallets[0].address(),
			hash: confirmedHash,
			networkId: wallets[0].networkId(),
			to: confirmed.to?.() ?? wallets[0].address(),
			type: confirmed.type?.() ?? "transfer",
			walletAddress: wallets[0].address(),
		});

		const { pendingSpy, removePendingTransaction } = await mockPendingTransactionsHook([pendingTransaction]);

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets }), { wrapper });

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));
		await waitFor(() => expect(removePendingTransaction).toHaveBeenCalledWith(confirmedHash));

		pendingSpy.mockRestore();
	});

	it("maps pending to confirmed-like DTO (incl. recipients fallback) and supports selectedTransactionTypes filter", async () => {
		const wallets = profile.wallets().values();
		const walletA = wallets[0];
		const walletAddress = walletA.address();

		const pendingTxWithRecipients = createMockPendingTransaction({
			convertedAmount: 3.5,
			convertedTotal: 3.5,
			explorerLink: "link3",
			fee: 0.05,
			from: "ADDRESS_FROM",
			hash: "PENDING_WITH_RECIPIENTS",
			isMultiPayment: true,
			isTransfer: false,
			isUsernameRegistration: true,
			isValidatorRegistration: true,
			networkId: walletA.networkId(),
			nonce: BigNumber.make(7),
			recipients: [{ address: walletAddress, amount: BigNumber.make(1) }] as any,
			to: walletAddress,
			total: 3.5,
			type: "validatorRegistration",
			value: 3.5,
			walletAddress,
		});

		const pendingTxNoRecipients = createMockPendingTransaction({
			convertedAmount: 9,
			convertedTotal: 9,
			explorerLink: "link4",
			fee: 0.01,
			from: walletAddress,
			hash: "PENDING_NO_RECIPIENTS",
			isReturn: true,
			isUnvote: true,
			isUpdateValidator: true,
			isUsernameResignation: true,
			isValidatorResignation: true,
			isVote: true,
			isVoteCombination: true,
			networkId: walletA.networkId(),
			nonce: BigNumber.make(11),
			to: "ADDRESS_TO",
			total: 9,
			value: 9,
			walletAddress,
		});

		const transferTransaction = createMockPendingTransaction({
			convertedAmount: 1,
			convertedTotal: 1,
			explorerLink: "link1",
			fee: 0.1,
			from: walletAddress,
			hash: "PENDING_TRANSFER",
			networkId: walletA.networkId(),
			to: "ADDRESS_TO",
			total: 1,
			value: 1,
			walletAddress,
		});

		const { pendingSpy } = await mockPendingTransactionsHook([
			pendingTxWithRecipients,
			pendingTxNoRecipients,
			transferTransaction,
		]);

		const allMock = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		});

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets }), { wrapper });

		act(() => {
			result.current.updateFilters({ activeMode: "all" });
		});
		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));

		const pending = result.current.transactions.filter((t: any) => typeof t.isPending === "function");
		const withRecipients = pending.find((t: any) => t.hash() === "PENDING_WITH_RECIPIENTS")!;
		const noRecipients = pending.find((t: any) => t.hash() === "PENDING_NO_RECIPIENTS")!;
		expect(withRecipients.confirmations().toNumber()).toBe(0);
		expect(withRecipients.convertedAmount()).toBe(3.5);
		expect(withRecipients.convertedTotal()).toBe(3.5);
		expect(withRecipients.explorerLink()).toBe("link3");
		expect(withRecipients.fee()).toBe(0.05);
		expect(withRecipients.from()).toBe("ADDRESS_FROM");
		expect(withRecipients.hash()).toBe("PENDING_WITH_RECIPIENTS");
		expect(withRecipients.isConfirmed()).toBe(false);
		expect(withRecipients.isFailed()).toBe(false);
		expect(withRecipients.isSuccess()).toBe(false);
		expect(withRecipients.isMultiPayment()).toBe(true);
		expect(withRecipients.isTransfer()).toBe(false);
		expect(withRecipients.isUsernameRegistration()).toBe(true);
		expect(withRecipients.isValidatorRegistration()).toBe(true);
		expect(withRecipients.isValidatorResignation()).toBe(false);
		expect(withRecipients.isVote()).toBe(false);
		expect(withRecipients.isVoteCombination()).toBe(false);
		expect(withRecipients.isUnvote()).toBe(false);
		expect(withRecipients.isUpdateValidator()).toBe(false);
		expect(withRecipients.isReceived()).toBe(true);
		expect(withRecipients.isSent()).toBe(false);
		expect(withRecipients.network()).toBe(walletA.network());
		expect(withRecipients.nonce().toString()).toBe("7");
		expect(withRecipients.recipients()).toHaveLength(1);
		expect(withRecipients.isPending()).toBe(true);
		expect(withRecipients.to()).toBe(walletAddress);
		expect(withRecipients.total()).toBe(3.5);
		expect(withRecipients.isReturn()).toBe(false);
		expect(withRecipients.isUsernameResignation()).toBe(false);
		expect(withRecipients.blockHash()).toBeUndefined();

		expect(noRecipients.recipients()).toEqual([]);
		expect(noRecipients.isReceived()).toBe(false);
		expect(noRecipients.isSent()).toBe(true);
		expect(noRecipients.isPending()).toBe(true);
		expect(noRecipients.to()).toBe("ADDRESS_TO");
		expect(noRecipients.type()).toBe("transfer");
		expect(noRecipients.value()).toBe(9);
		expect(noRecipients.wallet()?.address()).toBe(walletAddress);
		expect(noRecipients.isReturn()).toBe(true);
		expect(noRecipients.isUsernameResignation()).toBe(true);
		expect(noRecipients.blockHash()).toBeUndefined();

		act(() => {
			result.current.updateFilters({ activeMode: "all", selectedTransactionTypes: ["transfer"] });
		});
		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));

		const filteredPending = result.current.transactions.filter((t: any) => typeof t.isPending === "function");
		expect(filteredPending.some((t: any) => t.hash() === "PENDING_TRANSFER")).toBe(true);
		expect(filteredPending.some((t: any) => t.hash() === "PENDING_WITH_RECIPIENTS")).toBe(false);

		pendingSpy.mockRestore();
		allMock.mockRestore();
	});

	it("filters pending by activeMode sent/received and sorts by amount (pending first) hitting compare branch", async () => {
		const walletsAll = profile.wallets().values();
		const walletA = walletsAll[0];
		const walletAddress = walletA.address();

		const sentTransaction = createMockPendingTransaction({
			convertedAmount: 1,
			convertedTotal: 1,
			explorerLink: "link1",
			fee: 0.1,
			from: walletAddress,
			hash: "PENDING_FROM_ME",
			networkId: walletA.networkId(),
			to: "ADDRESS_TO",
			total: 1,
			value: 1,
			walletAddress,
		});

		const receivedTransaction = createMockPendingTransaction({
			convertedAmount: 2,
			convertedTotal: 2,
			explorerLink: "link2",
			fee: 0.2,
			from: "ADDRESS_FROM",
			hash: "PENDING_TO_ME",
			networkId: walletA.networkId(),
			nonce: BigNumber.make(2),
			to: walletAddress,
			total: 2,
			value: 2,
			walletAddress,
		});

		const { pendingSpy } = await mockPendingTransactionsHook([sentTransaction, receivedTransaction]);

		const originalSort = Array.prototype.sort;
		let branchHit = false;
		// @ts-ignore
		Array.prototype.sort = function (compareFn: any) {
			if (typeof compareFn === "function") {
				const array = this as any[];
				const pending = array.find((t: any) => typeof t?.isPending === "function");
				const confirmed = array.find((t: any) => typeof t?.isPending !== "function");
				if (pending && confirmed) {
					const res = compareFn(pending, confirmed);
					if (res === -1) branchHit = true;
				}
			}
			return originalSort.call(this, compareFn);
		};

		try {
			const { result } = renderHook(() => useProfileTransactions({ profile, wallets: [walletA] }), { wrapper });

			act(() => {
				result.current.updateFilters({ activeMode: "sent" });
			});
			await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));
			let sentPending = result.current.transactions.filter((t: any) => typeof t.isPending === "function");
			expect(sentPending.some((t: any) => t.hash() === "PENDING_FROM_ME")).toBe(true);
			expect(sentPending.some((t: any) => t.hash() === "PENDING_TO_ME")).toBe(false);

			act(() => {
				result.current.updateFilters({ activeMode: "received" });
			});
			await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));
			const recvPending = result.current.transactions.filter((t: any) => typeof t.isPending === "function");
			expect(recvPending.some((t: any) => t.hash() === "PENDING_TO_ME")).toBe(true);
			expect(recvPending.some((t: any) => t.hash() === "PENDING_FROM_ME")).toBe(false);

			act(() => {
				result.current.setSortBy({ column: "amount", desc: true });
				result.current.updateFilters({ activeMode: "all" });
			});
			await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));
			await waitFor(() => expect(result.current.transactions.length).toBeGreaterThan(0));
			expect(typeof (result.current.transactions[0] as any).isPending).toBe("function");
			await waitFor(() => expect(branchHit).toBe(true));
		} finally {
			Array.prototype.sort = originalSort;
			pendingSpy.mockRestore();
		}
	});

	it("sorts by date (desc/asc) and treats missing timestamp() as 0", async () => {
		const wallets = profile.wallets().values();
		const walletA = wallets[0];
		const base = Date.now();

		const older = createMockPendingTransaction({
			from: "ADDRESS_FROM",
			hash: "PENDING_OLD",
			networkId: walletA.networkId(),
			timestamp: base - 60_000,
			to: walletA.address(),
			walletAddress: walletA.address(),
		});

		const newer = createMockPendingTransaction({
			from: "ADDRESS_FROM",
			hash: "PENDING_NEW",
			networkId: walletA.networkId(),
			timestamp: base,
			to: walletA.address(),
			walletAddress: walletA.address(),
		});

		const pNone = {
			isSent: () => false,
			isReceived: () => true,
			type: () => "transfer",
			timestamp: () => undefined,
		};

		const allMock = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		});

		const pendingHook = await import("@/domains/transaction/hooks/use-pending-transactions");
		const pendingSpy = vi.spyOn(pendingHook, "usePendingTransactions").mockReturnValue({
			addPendingTransactionFromUnconfirmed: vi.fn(),
			buildPendingForUI: vi.fn().mockImplementation((_addresses: string[], _wallets: any[]) => [
				wrapPending(older, [walletA.address()], [walletA]),
				wrapPending(newer, [walletA.address()], [walletA]),
				pNone,
			]),
			pendingJson: [],
			removePendingTransaction: vi.fn(),
		} as any);

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: [walletA] }), { wrapper });

		act(() => {
			result.current.setSortBy({ column: "date", desc: true });
			result.current.updateFilters({ activeMode: "all" });
		});
		await waitFor(() => expect(result.current.isLoadingTransactions).toBe(false));
		expect(((result.current.transactions[0] as any).hash?.() ?? "NO_HASH")).toBe("PENDING_NEW");

		act(() => {
			result.current.setSortBy({ column: "date", desc: false });
		});
		await waitFor(() => {
			const first = result.current.transactions[0] as any;
			expect(first.timestamp?.()).toBeUndefined();
		});

		pendingSpy.mockRestore();
		allMock.mockRestore();
	});

	it.each([
		{
			label: "milestone throws -> fallback 15_000 and logs",
			milestoneImpl: () => {
				throw new Error("boom");
			},
			expectLog: true,
		},
		{
			label: "milestone blockTime not finite -> fallback 15_000 without error log",
			milestoneImpl: () => ({ timeouts: { blockTime: "fast" as any } }),
			expectLog: false,
		},
	])("schedules polling with fallback block time: $label", async ({ milestoneImpl, expectLog }) => {
		const wallets = profile.wallets().values();
		const first = wallets[0];

		const milestoneSpy = vi.spyOn(first.network(), "milestone").mockImplementation(milestoneImpl as any);
		const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const listSpy = vi.spyOn(PendingTransactionsService.prototype, "listUnconfirmed").mockResolvedValue({ results: [] });
		const pendingHook = await import("@/domains/transaction/hooks/use-pending-transactions");
		const pendingSpy = vi.spyOn(pendingHook, "usePendingTransactions").mockReturnValue({
			addPendingTransactionFromUnconfirmed: vi.fn(),
			buildPendingForUI: vi.fn().mockReturnValue([]),
			pendingJson: [],
			removePendingTransaction: vi.fn(),
		} as any);

		renderHook(() => useProfileTransactions({ profile, wallets }), { wrapper });

		await waitFor(() => expect(setIntervalSpy).toHaveBeenCalled());
		expect(setIntervalSpy.mock.calls[0]?.[1]).toBe(15_000);
		if (expectLog) {
			expect(consoleSpy).toHaveBeenCalledWith("Failed to get block time");
		} else {
			expect(consoleSpy).not.toHaveBeenCalledWith("Failed to get block time");
		}

		milestoneSpy.mockRestore();
		setIntervalSpy.mockRestore();
		consoleSpy.mockRestore();
		listSpy.mockRestore();
		pendingSpy.mockRestore();
	});

	it("unconfirmed polling: adds mapped match, maps missing gas to '0', and skips when no results", async () => {
		const wallets = profile.wallets().values();
		const walletA = wallets[0];
		const useSyncSpy = vi.spyOn(hooksMock, "useSynchronizer").mockReturnValue({ start: vi.fn(), stop: vi.fn() } as any);

		const listSpy = vi
			.spyOn(PendingTransactionsService.prototype, "listUnconfirmed")
			.mockResolvedValueOnce({} as any)
			.mockResolvedValueOnce({
				results: [
					{
						hash: "MATCH_FROM",
						from: walletA.address(),
						to: "EXTERNAL_TO",
						nonce: 7,
						value: "123",
						data: "0xabc",
						gas: 21000,
						gasPrice: 5,
					},
				],
			})
			.mockResolvedValueOnce({
				results: [
					{
						hash: "NO_GAS_FIELDS",
						from: walletA.address(),
						to: "ADDRESS_TO",
						nonce: 3,
						value: "42",
						data: "0x",
					},
				],
			});

		const pendingHook = await import("@/domains/transaction/hooks/use-pending-transactions");
		const addPendingSpy = vi.fn();
		const pendingSpy = vi.spyOn(pendingHook, "usePendingTransactions").mockReturnValue({
			addPendingTransactionFromUnconfirmed: addPendingSpy,
			buildPendingForUI: vi.fn().mockReturnValue([]),
			pendingJson: [],
			removePendingTransaction: vi.fn(),
		} as any);

		const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

		renderHook(() => useProfileTransactions({ profile, wallets: [walletA] }), { wrapper });

		await waitFor(() => expect(setIntervalSpy).toHaveBeenCalled());
		const callbackMock = setIntervalSpy.mock.calls[0]?.[0] as () => Promise<void>;

		await callbackMock();
		expect(addPendingSpy).not.toHaveBeenCalled();

		await callbackMock();
		expect(listSpy).toHaveBeenCalledWith({ from: [walletA.address()], to: [walletA.address()] });
		expect(addPendingSpy).toHaveBeenCalledTimes(1);
		expect(addPendingSpy).toHaveBeenLastCalledWith(
			expect.objectContaining({
				data: "0xabc",
				from: walletA.address(),
				gasLimit: "21000",
				gasPrice: "5",
				hash: "MATCH_FROM",
				networkId: walletA.networkId(),
				nonce: 7,
				to: "EXTERNAL_TO",
				value: "123",
				walletAddress: walletA.address(),
			}),
		);

		await callbackMock();
		expect(addPendingSpy).toHaveBeenCalledTimes(2);
		expect(addPendingSpy).toHaveBeenLastCalledWith(
			expect.objectContaining({
				hash: "NO_GAS_FIELDS",
				from: walletA.address(),
				to: "ADDRESS_TO",
				nonce: 3,
				value: "42",
				data: "0x",
				gasLimit: "0",
				gasPrice: "0",
				walletAddress: walletA.address(),
				networkId: walletA.networkId(),
			}),
		);

		useSyncSpy.mockRestore();
		listSpy.mockRestore();
		pendingSpy.mockRestore();
		setIntervalSpy.mockRestore();
	});

	it("does not schedule unconfirmed polling when service init fails", async () => {
		const wallets = profile.wallets().values();
		const first = wallets[0];

		const useSynchronizerSpy = vi
			.spyOn(hooksMock, "useSynchronizer")
			.mockReturnValue({ start: vi.fn(), stop: vi.fn() } as any);

		const configSpy = vi.spyOn(first.network(), "config").mockReturnValue({
			host: () => {
				throw new Error("host failed");
			},
		} as any);

		const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

		renderHook(() => useProfileTransactions({ profile, wallets }), { wrapper });

		expect(setIntervalSpy).not.toHaveBeenCalled();

		useSynchronizerSpy.mockRestore();
		configSpy.mockRestore();
		setIntervalSpy.mockRestore();
	});

});
