import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@/utils/testing-library";

import { useLedgerTabsHandleDeviceNotAvailable } from "./LedgerTabs.blocks";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
	useNavigate: () => mockNavigate,
}));

describe("useLedgerTabsHandleDeviceNotAvailable", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should navigate to the dashboard when device is not available", async () => {
		const { result } = renderHook(() =>
			useLedgerTabsHandleDeviceNotAvailable({ activeProfileId: "device-not-available-profile" }),
		);

		await act(async () => {
			result.current.handleDeviceNotAvailable();
		});

		expect(mockNavigate).toHaveBeenCalledWith("/profiles/device-not-available-profile/dashboard");
	});

	it("should use the correct profile ID from the dependency", async () => {
		const { result } = renderHook(() => useLedgerTabsHandleDeviceNotAvailable({ activeProfileId: "xyz" }));

		await act(async () => {
			result.current.handleDeviceNotAvailable();
		});

		expect(mockNavigate).toHaveBeenCalledWith("/profiles/xyz/dashboard");
	});

	it("should produce a handler function", async () => {
		const { result } = renderHook(() => useLedgerTabsHandleDeviceNotAvailable({ activeProfileId: "test" }));

		expect(result.current.handleDeviceNotAvailable).toBeDefined();
		expect(typeof result.current.handleDeviceNotAvailable).toBe("function");
	});
});
