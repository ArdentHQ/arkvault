import { Contracts } from "@/app/lib/profiles";
import { renderHook, act } from "@testing-library/react";
import { vi, expect, beforeEach, afterEach } from "vitest";
import * as useActiveProfileModule from "@/app/hooks/env";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { useSelectsTransactionSender } from "./use-selects-transaction-sender";
import * as ReactRouter from "react-router";

describe("useSelectsTransactionSender", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let selectedWallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		vi.spyOn(ReactRouter, "useSearchParams").mockReturnValue([new URLSearchParams(), vi.fn()]);
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().first();
		selectedWallet = profile.wallets().last();

		vi.spyOn(profile.wallets(), "selected").mockReturnValue([selectedWallet]);
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		ransaction / hooks / use - selects - transaction - sender.test.ts;
	});

	beforeEach(() => {
		vi.spyOn(useActiveProfileModule, "useActiveProfile").mockReturnValue(profile);
	});

	it("should return the selected wallet when active is true", () => {
		const { result } = renderHook(() => useSelectsTransactionSender({ active: true }));

		expect(result.current.activeWallet).toBe(selectedWallet);
	});

	it("should return the first wallet when no wallet is selected and active is true", () => {
		vi.spyOn(profile.wallets(), "selected").mockReturnValue(null as any);

		const { result } = renderHook(() => useSelectsTransactionSender({ active: true }));

		expect(result.current.activeWallet).toBe(wallet);
	});

	it("should return undefined when active is false", () => {
		const { result } = renderHook(() => useSelectsTransactionSender({ active: false }));

		expect(result.current.activeWallet).toBeUndefined();
	});

	it("should update activeWallet when active changes from false to true", () => {
		const { result, rerender } = renderHook(({ active }) => useSelectsTransactionSender({ active }), {
			initialProps: { active: false },
		});

		expect(result.current.activeWallet).toBeUndefined();

		rerender({ active: true });

		expect(result.current.activeWallet).toBe(selectedWallet);
	});

	it("should update activeWallet when active changes from true to false", () => {
		const { result, rerender } = renderHook(({ active }) => useSelectsTransactionSender({ active }), {
			initialProps: { active: true },
		});

		expect(result.current.activeWallet).toBe(selectedWallet);

		rerender({ active: false });

		expect(result.current.activeWallet).toBeUndefined();
	});

	it("should call onWalletChange when activeWallet changes", () => {
		const onWalletChange = vi.fn();

		const { rerender } = renderHook(({ active }) => useSelectsTransactionSender({ active, onWalletChange }), {
			initialProps: { active: false },
		});

		expect(onWalletChange).toHaveBeenCalledWith(undefined);

		rerender({ active: true });

		expect(onWalletChange).toHaveBeenCalledWith(selectedWallet);
	});

	it("should call onWalletChange with undefined when active becomes false", () => {
		const onWalletChange = vi.fn();

		const { rerender } = renderHook(({ active }) => useSelectsTransactionSender({ active, onWalletChange }), {
			initialProps: { active: true },
		});

		expect(onWalletChange).toHaveBeenCalledWith(selectedWallet);

		rerender({ active: false });

		expect(onWalletChange).toHaveBeenCalledWith(undefined);
	});

	it("should allow manual wallet change", () => {
		const onWalletChange = vi.fn();

		const { result } = renderHook(() => useSelectsTransactionSender({ active: true, onWalletChange }));

		expect(result.current.activeWallet).toBe(selectedWallet);

		act(() => {
			result.current.setActiveWallet(wallet);
		});

		expect(result.current.activeWallet).toBe(wallet);
		expect(onWalletChange).toHaveBeenCalledWith(wallet);
	});

	it("should not call onWalletChange if callback is not provided", () => {
		const { result, rerender } = renderHook(({ active }) => useSelectsTransactionSender({ active }), {
			initialProps: { active: false },
		});

		expect(result.current.activeWallet).toBeUndefined();

		rerender({ active: true });

		expect(result.current.activeWallet).toBe(selectedWallet);
	});

	it("should update activeWallet when selected wallets change", () => {
		const newSelectedWallet = profile.wallets().first();
		vi.spyOn(profile.wallets(), "selected").mockReturnValue([newSelectedWallet]);

		const { result } = renderHook(() => useSelectsTransactionSender({ active: true }));

		expect(result.current.activeWallet).toBe(newSelectedWallet);
	});

	it("should clear search params when active becomes false and method param exists", () => {
		const searchParams = new URLSearchParams("method=transfer&other=value");
		const setSearchParams = vi.fn();
		vi.spyOn(ReactRouter, "useSearchParams").mockReturnValue([searchParams, setSearchParams]);

		const { rerender } = renderHook(({ active }) => useSelectsTransactionSender({ active }), {
			initialProps: { active: true },
		});

		expect(setSearchParams).not.toHaveBeenCalled();

		rerender({ active: false });

		expect(setSearchParams).toHaveBeenCalledWith(new URLSearchParams());
	});

	it("should not clear search params when active becomes false but method param does not exist", () => {
		const searchParams = new URLSearchParams("other=value");
		const setSearchParams = vi.fn();
		vi.spyOn(ReactRouter, "useSearchParams").mockReturnValue([searchParams, setSearchParams]);

		const { rerender } = renderHook(({ active }) => useSelectsTransactionSender({ active }), {
			initialProps: { active: true },
		});

		expect(setSearchParams).not.toHaveBeenCalled();

		rerender({ active: false });

		expect(setSearchParams).not.toHaveBeenCalled();
	});

	it("should not clear search params when active becomes false and resetSearchParamsOnDeactivate is false", () => {
		const searchParams = new URLSearchParams("method=transfer");
		const setSearchParams = vi.fn();
		vi.spyOn(ReactRouter, "useSearchParams").mockReturnValue([searchParams, setSearchParams]);

		const { rerender } = renderHook(({ active }) => useSelectsTransactionSender({ active }), {
			initialProps: { active: false },
		});

		// First activate to set resetSearchParamsOnDeactivate to true
		rerender({ active: true });

		// Mock search params again for the deactivation
		vi.spyOn(ReactRouter, "useSearchParams").mockReturnValue([searchParams, setSearchParams]);

		// Then deactivate
		rerender({ active: false });

		expect(setSearchParams).toHaveBeenCalledWith(new URLSearchParams());
	});
});
