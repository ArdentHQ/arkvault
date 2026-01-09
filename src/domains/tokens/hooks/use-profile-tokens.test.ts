import { Contracts } from "@/app/lib/profiles";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useProfileTokens } from "./use-profile-tokens";
import { env, getMainsailProfileId, act } from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("useProfileTokens", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());
	});
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render with loading state as false", async () => {
		const { result } = renderHook(() => useProfileTokens({ profile }));
		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});
	});

	it("should reload tokens", async () => {
		const syncMock = vi.spyOn(profile.tokens(), "sync").mockImplementation(vi.fn());

		const { result } = renderHook(() => useProfileTokens({ profile }));

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		await act(async () => {
			await result.current.reload();
		});

		expect(syncMock).toHaveBeenCalled();
	});
});
