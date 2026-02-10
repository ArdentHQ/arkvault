import { Contracts } from "@/app/lib/profiles";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useProfileTokens } from "./use-profile-tokens";
import { env, getMainsailProfileId, act } from "@/utils/testing-library";
import { WalletTokenCollection } from "@/app/lib/mainsail/wallet-token.collection";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import { WalletTokenDTO } from "@/app/lib/profiles/wallet-token.dto";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";

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

	it("should not reload if already loaded", async () => {
		const fixtureData = Fixtures.ByContractAddress.data;
		const walletTokenData = Fixtures.ByWalletAddress.data[0];
		const tokensCollection = new WalletTokenCollection(
			[
				new WalletToken({
					network: profile.activeNetwork(),
					profile,
					token: new TokenDTO(fixtureData),
					walletToken: new WalletTokenDTO(walletTokenData),
				}),
			],
			{
				last: undefined,
				next: 0,
				prev: undefined,
				self: undefined,
			},
		);

		const selectedMock = vi.spyOn(profile.tokens(), "selected").mockReturnValue(tokensCollection);
		const selectedCountMock = vi.spyOn(profile.tokens(), "selectedCount").mockReturnValue(1);

		const { result } = renderHook(() => useProfileTokens({ profile }));

		expect(result.current.isLoading).toBe(false);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		await act(async () => {
			await result.current.reload();
		});

		expect(selectedCountMock).toHaveBeenCalled();
		expect(selectedMock).toHaveBeenCalled();
	});
});
