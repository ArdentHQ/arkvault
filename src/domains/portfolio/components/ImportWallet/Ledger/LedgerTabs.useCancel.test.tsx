import { renderHook, act } from "@testing-library/react";
import { useCancel } from "./LedgerTabs.blocks";

describe("useCancel", () => {
	it("should not call disconnect when cancelling is false", async () => {
		const mockDisconnect = vi.fn().mockResolvedValue(undefined);
		const mockSetCancelling = vi.fn();

		const { rerender } = renderHook(
			({ cancelling }: { cancelling: boolean }) =>
				useCancel({
					cancelling,
					disconnect: mockDisconnect,
					isAwaitingConnection: false,
					isAwaitingDeviceConfirmation: false,
					isBusy: false,
					isConnected: true,
					setCancelling: mockSetCancelling,
				}),
			{ initialProps: { cancelling: false } },
		);

		await act(async () => {
			rerender({ cancelling: false });
		});

		expect(mockDisconnect).not.toHaveBeenCalled();
	});

	it("should call disconnect when cancelling is true and not busy", async () => {
		const mockDisconnect = vi.fn().mockResolvedValue(undefined);
		const mockSetCancelling = vi.fn();

		const { rerender } = renderHook(
			({ cancelling }: { cancelling: boolean }) =>
				useCancel({
					cancelling,
					disconnect: mockDisconnect,
					isAwaitingConnection: false,
					isAwaitingDeviceConfirmation: false,
					isBusy: false,
					isConnected: true,
					setCancelling: mockSetCancelling,
				}),
			{ initialProps: { cancelling: false } },
		);

		await act(async () => {
			rerender({ cancelling: true });
		});

		expect(mockSetCancelling).toHaveBeenCalledWith(false);
		expect(mockDisconnect).toHaveBeenCalledTimes(1);
	});

	it("should not call disconnect when isBusy is true", async () => {
		const mockDisconnect = vi.fn().mockResolvedValue(undefined);
		const mockSetCancelling = vi.fn();

		const { rerender } = renderHook(
			({ cancelling }: { cancelling: boolean }) =>
				useCancel({
					cancelling,
					disconnect: mockDisconnect,
					isAwaitingConnection: false,
					isAwaitingDeviceConfirmation: false,
					isBusy: true,
					isConnected: true,
					setCancelling: mockSetCancelling,
				}),
			{ initialProps: { cancelling: false } },
		);

		await act(async () => {
			rerender({ cancelling: true });
		});

		expect(mockDisconnect).not.toHaveBeenCalled();
	});
});
