import { renderHook } from "@testing-library/react";
import { useHandleWalletImporting } from "./LedgerTabs.blocks";

describe("useHandleWalletImporting", () => {
	it("should return handleWalletImporting function", () => {
		const { result } = renderHook(() =>
			useHandleWalletImporting({
				listenDevice: vi.fn(),
				importWallets: vi.fn(),
			}),
		);

		expect(result.current.handleWalletImporting).toBeDefined();
	});

	it("should call listenDevice and importWallets for each wallet", async () => {
		const mockListenDevice = vi.fn().mockResolvedValue({ id: "device-123" });
		const mockImportWallets = vi.fn().mockResolvedValue(undefined);

		const wallets = [
			{ path: "m/44'/1'/0'/0/0", address: "addr1" },
			{ path: "m/44'/1'/0'/0/1", address: "addr2" },
		];

		const { result } = renderHook(() =>
			useHandleWalletImporting({
				listenDevice: mockListenDevice,
				importWallets: mockImportWallets,
			}),
		);

		await result.current.handleWalletImporting({ wallets });

		expect(mockListenDevice).toHaveBeenCalledTimes(1);
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
		const mockListenDevice = vi.fn().mockResolvedValue({ id: undefined });
		const mockImportWallets = vi.fn();

		const wallets = [{ path: "m/44'/1'/0'/0/0", address: "addr1" }];

		const { result } = renderHook(() =>
			useHandleWalletImporting({
				listenDevice: mockListenDevice,
				importWallets: mockImportWallets,
			}),
		);

		await expect(result.current.handleWalletImporting({ wallets })).rejects.toThrow();
		expect(mockImportWallets).not.toHaveBeenCalled();
	});
});
