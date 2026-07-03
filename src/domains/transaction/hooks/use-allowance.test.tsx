import { renderHook, waitFor } from "@testing-library/react";

import { BigNumber } from "@/app/lib/helpers";
import { Contracts } from "@/app/lib/profiles";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import { useAllowance } from "./use-allowance";

describe("useAllowance", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should fetch allowance", async () => {
		const allowanceMock = vi.fn().mockResolvedValue(BigNumber.make("250000000000000000000"));
		vi.spyOn(wallet, "client").mockReturnValue({ allowance: allowanceMock } as any);

		const { result } = renderHook(() =>
			useAllowance({
				tokenAddress: "0xdeb478251073157e400c3d8d2ed92a85c958f9fa",
				totalAmount: "1",
				wallet,
			}),
		);

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(allowanceMock).toHaveBeenCalledWith(wallet.address(), "0xdeb478251073157e400c3d8d2ed92a85c958f9fa");
		expect(result.current.allowance.isEqualTo(250)).toBe(true);
	});

	it("should not fetch the allowance when disabled", async () => {
		const allowanceMock = vi.fn().mockResolvedValue(BigNumber.make("250000000000000000000"));
		const clientMock = vi.spyOn(wallet, "client").mockReturnValue({ allowance: allowanceMock } as any);

		const { result } = renderHook(() =>
			useAllowance({
				enabled: false,
				tokenAddress: "0xdeb478251073157e400c3d8d2ed92a85c958f9fa",
				totalAmount: "1",
				wallet,
			}),
		);

		expect(clientMock).not.toHaveBeenCalled();
		expect(result.current.allowance.isEqualTo(BigNumber.ZERO)).toBe(true);
	});

	it("should log and ignore errors when fetching the allowance fails", async () => {
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(vi.fn());
		const error = new Error("Failed to fetch allowance");
		vi.spyOn(wallet, "client").mockReturnValue({ allowance: vi.fn().mockRejectedValue(error) } as any);

		const { result } = renderHook(() =>
			useAllowance({
				tokenAddress: "0xdeb478251073157e400c3d8d2ed92a85c958f9fa",
				totalAmount: "1",
				wallet,
			}),
		);

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(consoleErrorSpy).toHaveBeenCalledWith(error);
		expect(result.current.allowance.isEqualTo(BigNumber.ZERO)).toBe(true);
	});

	it("should refetch when the total amount changes", async () => {
		const allowanceMock = vi.fn().mockResolvedValue(BigNumber.make("250000000000000000000"));
		vi.spyOn(wallet, "client").mockReturnValue({ allowance: allowanceMock } as any);

		const { result, rerender } = renderHook(
			({ totalAmount }) =>
				useAllowance({
					tokenAddress: "0xdeb478251073157e400c3d8d2ed92a85c958f9fa",
					totalAmount,
					wallet,
				}),
			{ initialProps: { totalAmount: "1" } },
		);

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(allowanceMock).toHaveBeenCalledTimes(1);

		rerender({ totalAmount: "2" });

		await waitFor(() => expect(allowanceMock).toHaveBeenCalledTimes(2));
	});
});
