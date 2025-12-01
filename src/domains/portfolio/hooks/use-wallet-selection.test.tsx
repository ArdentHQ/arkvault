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
});
