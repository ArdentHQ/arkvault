import { renderHook, waitFor } from "@testing-library/react";
import { env, act, getMainsailProfileId } from "@/utils/testing-library";
import { useWalletSelection } from "./use-wallet-selection";
import { Contracts } from "@/app/lib/profiles";
import { EnvironmentProvider } from "@/app//contexts";

describe("useWalletSelection", () => {
	let profile: Contracts.IProfile;

	const wrapper = ({ children }: { children?: React.ReactNode }) => (
		<EnvironmentProvider env={env}>{children}</EnvironmentProvider>
	);

	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
	});

	it("should set active mode to multiple", async () => {
		const { result } = renderHook(() => useWalletSelection(profile), {
			wrapper,
		});

		await waitFor(() => {
			expect(result.current.activeMode).toBe("single");
		});

		act(() => {
			result.current.setActiveMode("multiple");
		});

		await waitFor(() => {
			expect(result.current.activeMode).toBe("multiple");
		});
	});

	it("should change selected address", async () => {
		const { result } = renderHook(() => useWalletSelection(profile), {
			wrapper,
		});

		const addresses = [profile.wallets().first().address()];

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual(addresses);
		});

		act(() => {
			result.current.setSelectedAddresses([profile.wallets().last().address()]);
		});

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual([profile.wallets().last().address()]);
		});
	});

	it("should toggle selection", async () => {
		const { result } = renderHook(() => useWalletSelection(profile), {
			wrapper,
		});

		const addresses = [profile.wallets().first().address()];

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual(addresses);
		});

		act(() => {
			result.current.toggleSelection(profile.wallets().first());
		});

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual([]);
		});
	});

	it("should toggle selection on unselected wallet", async () => {
		const { result } = renderHook(() => useWalletSelection(profile), {
			wrapper,
		});

		const addresses = [profile.wallets().first().address()];

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual(addresses);
		});

		act(() => {
			result.current.toggleSelection(profile.wallets().last());
		});

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual([profile.wallets().last().address()]);
		});
	});

	it("should handle delete", async () => {
		const { result } = renderHook(() => useWalletSelection(profile), {
			wrapper,
		});

		const addresses = [profile.wallets().first().address()];

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual(addresses);
		});

		act(() => {
			result.current.handleDelete(profile.wallets().last());
		});

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual([profile.wallets().last().address()]);
		});
	});

	it("should toggle selection when all are deselected", async () => {
		const { result } = renderHook(() => useWalletSelection(profile), {
			wrapper,
		});

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual([profile.wallets().first().address()]);
		});

		act(() => {
			result.current.setSelectedAddresses([]);
		});

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual([]);
		});

		act(() => {
			result.current.toggleSelection(profile.wallets().first());
		});

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual([profile.wallets().first().address()]);
		});
	});

	it("should toggle selection when all are deselected in multiple mode", async () => {
		profile.settings().set(Contracts.ProfileSetting.WalletSelectionMode, "multiple");

		const { result } = renderHook(() => useWalletSelection(profile), {
			wrapper,
		});

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual([profile.wallets().first().address()]);
		});

		act(() => {
			result.current.setSelectedAddresses([]);
		});

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual([]);
		});

		const firstAddress = profile.wallets().first().address();

		act(() => {
			result.current.toggleSelection(profile.wallets().first());
		});

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual([firstAddress]);
		});
	});

	it("should select wallet after deselect all", async () => {
		const { result } = renderHook(() => useWalletSelection(profile), {
			wrapper,
		});

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual([profile.wallets().first().address()]);
		});

		const firstWallet = profile.wallets().first();
		const firstAddress = firstWallet.address();

		act(() => {
			result.current.selectAfterDeselectAll(firstWallet);
		});

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual([firstAddress]);
		});
	});

	it("should call selectAfterDeselectAll using toggleSelection when all deselected", async () => {
		const { result } = renderHook(() => useWalletSelection(profile), {
			wrapper,
		});

		const firstWallet = profile.wallets().first();
		const firstAddress = firstWallet.address();

		const includesSpy = vi.spyOn(Array.prototype, "includes").mockReturnValue(true);

		act(() => {
			result.current.setSelectedAddresses([]);
		});

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual([]);
		});

		act(() => {
			result.current.toggleSelection(firstWallet);
		});

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual([firstAddress]);
		});

		includesSpy.mockRestore();
	});

	it("should select first wallet when deleting last selected wallet", async () => {
		const { result } = renderHook(() => useWalletSelection(profile), {
			wrapper,
		});

		const firstAddress = profile.wallets().first().address();

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual([firstAddress]);
		});

		const firstWallet = profile.wallets().first();

		act(() => {
			result.current.handleDelete(firstWallet);
		});

		await waitFor(() => {
			expect(result.current.selectedAddresses).toEqual([]);
		});
	});
});
