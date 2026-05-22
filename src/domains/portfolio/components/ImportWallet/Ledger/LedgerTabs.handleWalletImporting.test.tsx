import { renderHook, act } from "@testing-library/react";
import React from "react";

import { useHandleWalletImporting } from "./LedgerTabs.blocks";
import * as useWalletImport from "@/domains/wallet/hooks/use-wallet-import";

vi.mock("@/domains/wallet/hooks/use-wallet-import", () => ({
	useWalletImport: vi.fn(),
}));

describe("useHandleWalletImporting", () => {
	const mockListenDevice = vi.fn();
	const mockImportWallets = vi.fn().mockResolvedValue([]);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return handleWalletImporting function", () => {
		vi.mocked(useWalletImport.useWalletImport).mockReturnValue({
			importWallet: vi.fn(),
			importWallets: mockImportWallets,
		});

		const { result } = renderHook(() =>
			useHandleWalletImporting({
				listenDevice: mockListenDevice,
				profile: {} as any,
			}),
		);

		expect(result.current.handleWalletImporting).toBeDefined();
	});

	it("should call listenDevice and importWallets for each wallet", async () => {
		const mockListenDevice2 = vi.fn().mockResolvedValue({ id: "device-123" });

		vi.mocked(useWalletImport.useWalletImport).mockReturnValue({
			importWallet: vi.fn(),
			importWallets: mockImportWallets,
		});

		const { result } = renderHook(() =>
			useHandleWalletImporting({
				listenDevice: mockListenDevice2,
				profile: {} as any,
			}),
		);

		const wallets = [
			{ path: "m/44'/1'/0'/0/0", address: "addr1" },
			{ path: "m/44'/1'/0'/0/1", address: "addr2" },
		];

		await act(async () => {
			await result.current.handleWalletImporting({ wallets });
		});

		expect(mockListenDevice2).toHaveBeenCalledTimes(1);
		expect(mockImportWallets).toHaveBeenCalledTimes(2);
		expect(mockImportWallets).toHaveBeenNthCalledWith(1, {
			disableAddressSelection: false,
			ledgerOptions: { deviceId: "device-123", path: "m/44'/1'/0'/0/0" },
			type: "LEDGER",
			value: "addr1",
		});
		expect(mockImportWallets).toHaveBeenNthCalledWith(2, {
			disableAddressSelection: true,
			ledgerOptions: { deviceId: "device-123", path: "m/44'/1'/0'/0/1" },
			type: "LEDGER",
			value: "addr2",
		});
	});

	it("should throw when device has no id", async () => {
		const mockListenDevice3 = vi.fn().mockResolvedValue({ id: undefined });

		vi.mocked(useWalletImport.useWalletImport).mockReturnValue({
			importWallet: vi.fn(),
			importWallets: mockImportWallets,
		});

		const { result } = renderHook(() =>
			useHandleWalletImporting({
				listenDevice: mockListenDevice3,
				profile: {} as any,
			}),
		);

		const wallets = [{ path: "m/44'/1'/0'/0/0", address: "addr1" }];

		await expect(
			act(async () => {
				await result.current.handleWalletImporting({ wallets });
			}),
		).rejects.toThrow();

		expect(mockImportWallets).not.toHaveBeenCalled();
	});
});
