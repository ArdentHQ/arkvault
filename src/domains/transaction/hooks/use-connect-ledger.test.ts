import { renderHook, act } from "@testing-library/react";
import { vi, expect, beforeEach, afterEach } from "vitest";
import { useConnectLedger } from "./use-connect-ledger";
import * as AppContexts from "@/app/contexts";
import { Contracts } from "@/app/lib/profiles";

const mockProfile = {
	id: () => "test-profile-id",
} as Contracts.IProfile;

const mockConnect = vi.fn();

// Mock the useLedgerContext hook
vi.mock("@/app/contexts", () => ({
	useLedgerContext: vi.fn(),
}));

describe("useConnectLedger", () => {
	const onReady = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should call onReady when ledger becomes connected after initiating connection", () => {
		let contextValue = {
			isConnected: false,
			ledgerDevice: { id: "test-device" },
			connect: mockConnect,
		};

		const contextSpy = vi.spyOn(AppContexts, "useLedgerContext").mockImplementation(() => contextValue);

		const { result, rerender } = renderHook(() =>
			useConnectLedger({
				onReady,
				profile: mockProfile,
			}),
		);

		// Start connection process
		act(() => {
			result.current.connectLedger();
		});

		// Simulate connection success
		contextValue = {
			...contextValue,
			isConnected: true,
		};
		contextSpy.mockReturnValue(contextValue);
		rerender();

		expect(onReady).toHaveBeenCalled();
	});

	it("should not call onReady when ledger model is not supported", () => {
		let contextValue = {
			isConnected: false,
			ledgerDevice: { id: "test-device" },
			connect: mockConnect,
		};

		const contextSpy = vi.spyOn(AppContexts, "useLedgerContext").mockImplementation(() => contextValue);

		const { result, rerender } = renderHook(() =>
			useConnectLedger({
				onReady,
				profile: mockProfile,
				isLedgerModelSupported: false,
			}),
		);

		// Start connection process
		act(() => {
			result.current.connectLedger();
		});

		// Simulate connection success
		contextValue = {
			...contextValue,
			isConnected: true,
		};
		contextSpy.mockReturnValue(contextValue);
		rerender();

		expect(onReady).not.toHaveBeenCalled();
	});

	it("should not call onReady without user initiating connection", () => {
		const contextValue = {
			isConnected: true,
			ledgerDevice: { id: "test-device" },
			connect: mockConnect,
		};

		vi.spyOn(AppContexts, "useLedgerContext").mockReturnValue(contextValue);

		renderHook(() =>
			useConnectLedger({
				onReady,
				profile: mockProfile,
			}),
		);

		// Don't initiate connection - onReady should not be called
		expect(onReady).not.toHaveBeenCalled();
	});
});