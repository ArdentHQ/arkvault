import { Contracts } from "@/app/lib/profiles";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useProfileTokens } from "./use-profile-tokens";
import { env, getMainsailProfileId, act } from "@/utils/testing-library";
import { WalletTokenCollection } from "@/app/lib/mainsail/wallet-token.collection";

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
		const tokensCollection = new WalletTokenCollection([], {
			last: undefined,
			next: 0,
			prev: undefined,
			self: undefined,
		});

		const selectedMock = vi.spyOn(profile.tokens(), "selected").mockReturnValue(tokensCollection);

		const { result } = renderHook(() => useProfileTokens({ profile }));

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		await act(async () => {
			await result.current.reload();
		});

		expect(selectedMock).toHaveBeenCalled();
	});
});
