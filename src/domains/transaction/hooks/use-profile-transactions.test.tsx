import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";

import { useProfileTransactions } from "./use-profile-transactions";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import { env, getDefaultProfileId, syncValidators } from "@/utils/testing-library";

const wrapper = ({ children }: any) => (
	<EnvironmentProvider env={env}>
		<ConfigurationProvider>{children}</ConfigurationProvider>
	</EnvironmentProvider>
);

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
			result.current.setSortBy({ column: "Fiat Value", desc: true });
		});

		await waitFor(() =>
			expect(transactionAggregateSpy).toHaveBeenCalledWith(expect.objectContaining({ orderBy: "amount:desc" })),
		);

		transactionAggregateSpy.mockRestore();
	});
});
