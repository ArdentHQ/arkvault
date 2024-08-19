/* eslint-disable @typescript-eslint/require-await */
import { act as hookAct, renderHook } from "@testing-library/react";
import React from "react";

import { useProfileTransactions } from "./use-profile-transactions";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import { env, getDefaultProfileId, syncDelegates, waitFor } from "@/utils/testing-library";

const wrapper = ({ children }: any) => (
	<EnvironmentProvider env={env}>
		<ConfigurationProvider>{children}</ConfigurationProvider>
	</EnvironmentProvider>
);

describe("useProfileTransactions", () => {
	beforeEach(() => {
		process.env.REACT_APP_IS_UNIT = undefined;
	});

	// TODO: Inspect timeout issue and restore this test. It works locally but timetouts in CI
	it.skip("should hide unconfirmed transactions", async () => {
		vi.useRealTimers();
		vi.useFakeTimers();

		const profile = env.profiles().findById(getDefaultProfileId());

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();

		const sent = await profile.transactionAggregate().all({ limit: 30 });
		const items = sent.items();

		const mockIsConfirmed = vi.spyOn(items[0], "isConfirmed").mockReturnValue(false);

		const mockTransactionsAggregate = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => true,
			items: () => items,
		} as any);

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isLoadingMore).toBe(false));

		hookAct(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingMore).toBe(false));

		await waitForNextUpdate();
		await waitFor(() => expect(result.current.transactions).toHaveLength(items.length));

		mockTransactionsAggregate.mockRestore();
		mockIsConfirmed.mockRestore();
	});

	// TODO: Inspect timeout issue and restore this test. It works locally but timetouts in CI
	it.skip("should run updates periodically", async () => {
		let hook: any;

		const profile = env.profiles().findById(getDefaultProfileId());

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();

		const all = await profile.transactionAggregate().all({});
		const items = all.items();

		vi.useFakeTimers();

		let mockTransactionsAggregate = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => true,
			items: () => items,
		} as any);

		hook = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		vi.advanceTimersByTime(30_000);

		await hook.waitForNextUpdate();

		await waitFor(() => expect(hook.result.current.transactions).toHaveLength(30));

		mockTransactionsAggregate = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => false,
			items: () => items,
		} as any);

		hook = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		vi.advanceTimersByTime(30_000);

		await hook.waitForNextUpdate();

		const distinctAddresses = [...new Set(items.map((item) => item.wallet().address()))];

		expect(mockTransactionsAggregate).toHaveBeenCalledWith({
			identifiers: distinctAddresses.map((address) => ({
				type: "address",
				value: address,
			})),
			limit: 30,
		});

		await waitFor(() => expect(hook.result.current.transactions).toHaveLength(items.length));

		mockTransactionsAggregate.mockRestore();

		const mockEmptyTransactions = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		} as any);

		hook = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		vi.advanceTimersByTime(30_000);

		await hook.waitForNextUpdate();

		await waitFor(() => expect(hook.result.current.transactions).toHaveLength(0));

		mockEmptyTransactions.mockRestore();
		vi.clearAllTimers();
	});

	it("#fetchTransactions", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();

		const {
			result: { current },
		} = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), { wrapper });

		const response = await current.fetchTransactions({
			cursor: 1,
			flush: true,
			mode: "all",
			wallets: profile.wallets().values(),
		});
		await waitFor(() => expect(response.items()).toHaveLength(30));

		//@ts-ignore
		const responseEmpty = await current.fetchTransactions({});
		await waitFor(() => expect(responseEmpty.hasMorePages()).toBe(false));
		await waitFor(() => expect(responseEmpty.items()).toHaveLength(0));
	});

	it("#updateFilters", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		hookAct(() => {
			result.current.updateFilters({ activeMode: "sent" });
		});

		hookAct(() => {
			result.current.updateFilters({ activeMode: "sent" });
		});

		await waitFor(() => expect(result.current.isLoadingMore).toBe(false));

		hookAct(() => {
			result.current.updateFilters({ activeMode: "all" });
		});

		await waitFor(() => expect(result.current.isLoadingMore).toBe(false));
		await waitFor(() => expect(result.current.transactions).toHaveLength(30));

		const mockEmpty = vi.spyOn(profile.transactionAggregate(), "sent").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		} as any);

		hookAct(() => {
			result.current.updateFilters({ activeMode: "sent" });
		});

		await waitFor(() => expect(result.current.transactions).toHaveLength(0));
		await waitFor(() => expect(result.current.isLoadingMore).toBe(false));

		mockEmpty.mockRestore();
	});

	it("#fetchMore", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());

		await syncDelegates(profile);

		await env.profiles().restore(profile);
		await profile.sync();

		const { result } = renderHook(() => useProfileTransactions({ profile, wallets: profile.wallets().values() }), {
			wrapper,
		});

		await waitFor(() =>
			expect(result.current.fetchTransactions({ wallets: profile.wallets().values() })).resolves.toBeTruthy(),
		);

		await hookAct(async () => {
			await result.current.fetchMore();
		});

		await waitFor(() => expect(result.current.transactions).toHaveLength(30), { timeout: 4000 });

		const mockTransactionsAggregate = vi.spyOn(profile.transactionAggregate(), "all").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		} as any);

		await hookAct(async () => {
			await result.current.fetchMore();
		});

		await waitFor(() => expect(result.current.transactions).toHaveLength(30), { timeout: 4000 });

		mockTransactionsAggregate.mockRestore();
	});
});
