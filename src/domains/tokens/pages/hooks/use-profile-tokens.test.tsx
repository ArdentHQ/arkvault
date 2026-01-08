import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";

import { useProfileTokens } from "./use-profile-tokens";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import { expect, vi } from "vitest";
import { IProfile } from "@/app/lib/profiles/profile.contract";
import * as hooksMock from "@/app/hooks";
import { server } from "@/tests/mocks/server";

const wrapper = ({ children }: any) => (
	<EnvironmentProvider env={env}>
		<ConfigurationProvider>{children}</ConfigurationProvider>
	</EnvironmentProvider>
);

describe("useProfileTokens", () => {
	let profile: IProfile;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it("should return an empty state for no wallets", async () => {
		const { result } = renderHook(() => useProfileTokens({ profile, wallets: [] }), { wrapper });

		await waitFor(() => expect(result.current.isLoadingTokens).toBe(false));

		expect(result.current.tokens).toHaveLength(0);
		expect(result.current.hasEmptyResults).toBe(true);
	});

	it("should fetch tokens for selected wallets", async () => {
		const wallets = profile.wallets().values();
		const { result } = renderHook(() => useProfileTokens({ profile, wallets }), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isLoadingTokens).toBe(false));

		console.log(result.current.tokens);
		expect(result.current.tokens).toBeDefined();
		expect(Array.isArray(result.current.tokens)).toBe(true);
	});

	it("should handle fetchMore to load additional tokens", async () => {
		const wallets = profile.wallets().values();

		// Mock tokens().selected to return paginated data
		const mockFirstPage = {
			hasMorePages: () => true,
			items: () => [
				{
					address: () => wallets[0].address(),
					balance: () => "1000",
					token: () => ({
						address: () => "0xToken1",
						decimals: () => 18,
						name: () => "Token 1",
						symbol: () => "TKN1",
					}),
				},
			],
		};

		const mockSecondPage = {
			hasMorePages: () => false,
			items: () => [
				{
					address: () => wallets[0].address(),
					balance: () => "2000",
					token: () => ({
						address: () => "0xToken2",
						decimals: () => 18,
						name: () => "Token 2",
						symbol: () => "TKN2",
					}),
				},
			],
		};

		const selectedSpy = vi
			.spyOn(profile.tokens(), "selected")
			.mockResolvedValueOnce(mockFirstPage as any)
			.mockResolvedValueOnce(mockSecondPage as any);

		const { result } = renderHook(() => useProfileTokens({ profile, wallets }), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isLoadingTokens).toBe(false));
		expect(result.current.tokens).toHaveLength(1);
		expect(result.current.hasMore).toBe(true);

		await act(async () => {
			await result.current.fetchMore();
		});

		await waitFor(() => expect(result.current.isLoadingMore).toBe(false));
		expect(result.current.tokens).toHaveLength(2);
		expect(result.current.hasMore).toBe(false);

		selectedSpy.mockRestore();
	});

	it("should update hasEmptyResults when no tokens are loaded", async () => {
		const wallets = profile.wallets().values();

		const selectedSpy = vi.spyOn(profile.tokens(), "selected").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		} as any);

		const { result } = renderHook(() => useProfileTokens({ profile, wallets }), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isLoadingTokens).toBe(false));
		expect(result.current.tokens).toHaveLength(0);
		expect(result.current.hasEmptyResults).toBe(true);

		selectedSpy.mockRestore();
	});

	it("should set hasMore to false when there are no more pages", async () => {
		const wallets = profile.wallets().values();

		const selectedSpy = vi.spyOn(profile.tokens(), "selected").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [
				{
					address: () => wallets[0].address(),
					balance: () => "1000",
					token: () => ({
						address: () => "0xToken1",
						decimals: () => 18,
						name: () => "Token 1",
						symbol: () => "TKN1",
					}),
				},
			],
		} as any);

		const { result } = renderHook(() => useProfileTokens({ profile, wallets }), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isLoadingTokens).toBe(false));
		expect(result.current.hasMore).toBe(false);

		selectedSpy.mockRestore();
	});

	it("should handle errors during token fetching", async () => {
		const wallets = profile.wallets().values();

		const selectedSpy = vi.spyOn(profile.tokens(), "selected").mockRejectedValue(new Error("Fetch error"));

		const { result } = renderHook(() => useProfileTokens({ profile, wallets }), {
			wrapper,
		});

		expect(result.current.tokens).toHaveLength(0);

		selectedSpy.mockRestore();
	});

	it("should reload tokens when wallet selection changes", async () => {
		const wallets = profile.wallets().values();
		const firstWallet = [wallets[0]];
		const secondWallet = [wallets[1]];

		const selectedSpy = vi.spyOn(profile.tokens(), "selected");

		const { result, rerender } = renderHook(({ wallets }) => useProfileTokens({ profile, wallets }), {
			initialProps: { wallets: firstWallet },
			wrapper,
		});

		await waitFor(() => expect(result.current.isLoadingTokens).toBe(false));
		const firstCallCount = selectedSpy.mock.calls.length;

		rerender({ wallets: secondWallet });

		await waitFor(() => expect(selectedSpy.mock.calls.length).toBeGreaterThan(firstCallCount));

		selectedSpy.mockRestore();
	});

	it("should use custom limit when provided", async () => {
		const wallets = profile.wallets().values();
		const customLimit = 50;

		const selectedSpy = vi.spyOn(profile.tokens(), "selected").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		} as any);

		renderHook(() => useProfileTokens({ limit: customLimit, profile, wallets }), {
			wrapper,
		});

		await waitFor(() => expect(selectedSpy).toHaveBeenCalled());

		expect(selectedSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				limit: customLimit,
			}),
		);

		selectedSpy.mockRestore();
	});

	it("should check for new tokens periodically", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const wallets = profile.wallets().values();
		const walletAddress = wallets[0].address();
		let callCount = 0;

		server.use(
			http.get("https://dwallets-evm.mainsailhq.com/api/wallets/tokens", () => {
				callCount++;

				if (callCount === 1) {
					// First call: return initial token
					return HttpResponse.json({
						data: [
							{
								addresses: {
									[walletAddress]: "1000000000000000000",
								},
								decimals: 18,
								name: "Token 1",
								supply: "10000000000000000000000",
								symbol: "TKN1",
								token: "0xToken1",
							},
						],
						meta: {
							last: "page=1",
							next: null,
							previous: null,
							self: "page=1",
						},
					});
				} else {
					// Second call (from checkNewTokens): return new token
					return HttpResponse.json({
						data: [
							{
								addresses: {
									[walletAddress]: "2000000000000000000",
								},
								decimals: 18,
								name: "Token 2",
								supply: "20000000000000000000000",
								symbol: "TKN2",
								token: "0xToken2",
							},
						],
						meta: {
							last: "page=1",
							next: null,
							previous: null,
							self: "page=1",
						},
					});
				}
			}),
		);

		const { result } = renderHook(() => useProfileTokens({ profile, wallets }), {
			wrapper,
		});

		await waitFor(() => {
			expect(result.current.isLoadingTokens).toBe(false);
		});

		// Verify that the first token is present after initial load
		expect(result.current.tokens).toHaveLength(1);
		expect(result.current.tokens[0].token().address()).toBe("0xToken1");
		expect(result.current.tokens[0].token().name()).toBe("Token 1");
		expect(result.current.tokens[0].balance()).toBe(1);

		await act(async () => {
			await vi.advanceTimersByTimeAsync(15_000);
		});

		await waitFor(() => {
			expect(result.current.tokens).toHaveLength(1);
		});

		// Verify that after checkNewTokens runs, the second token is present
		expect(result.current.tokens[0].token().address()).toBe("0xToken2");
		expect(result.current.tokens[0].token().name()).toBe("Token 2");
		expect(result.current.tokens[0].balance()).toBe(2);

		vi.useRealTimers();
	});

	it("should not check for new tokens when wallets array is empty", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		// Mock the HTTP endpoint to fail the test if called
		server.use(
			http.get("https://dwallets-evm.mainsailhq.com/api/wallets/tokens", () => {
				throw new Error("tokens endpoint should not be called when wallets array is empty");
			}),
		);

		const { result } = renderHook(() => useProfileTokens({ profile, wallets: [] }), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isLoadingTokens).toBe(false));

		// Verify initial state
		expect(result.current.tokens).toHaveLength(0);
		expect(result.current.hasEmptyResults).toBe(true);

		await act(async () => {
			await vi.advanceTimersByTimeAsync(15_000);
		});

		// Verify state remains unchanged because checkNewTokens returns early
		// If the endpoint was called, the test would have failed with the error above
		expect(result.current.tokens).toHaveLength(0);
		expect(result.current.hasEmptyResults).toBe(true);

		vi.useRealTimers();
	});
});
