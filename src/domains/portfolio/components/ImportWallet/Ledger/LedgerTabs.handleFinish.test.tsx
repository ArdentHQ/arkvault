import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@/utils/testing-library";

import { useLedgerTabsHandleFinish } from "./LedgerTabs.blocks";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
	useNavigate: () => mockNavigate,
}));

describe("useLedgerTabsHandleFinish", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should navigate to the dashboard for the active profile", async () => {
		const { result } = renderHook(() => useLedgerTabsHandleFinish({ activeProfileId: "test-profile-id" }));

		await act(async () => {
			result.current.handleFinish();
		});

		expect(mockNavigate).toHaveBeenCalledWith("/profiles/test-profile-id/dashboard");
	});

	it("should use the correct profile ID in the path", async () => {
		const { result } = renderHook(() => useLedgerTabsHandleFinish({ activeProfileId: "another-profile" }));

		await act(async () => {
			result.current.handleFinish();
		});

		expect(mockNavigate).toHaveBeenCalledWith("/profiles/another-profile/dashboard");
	});
});
