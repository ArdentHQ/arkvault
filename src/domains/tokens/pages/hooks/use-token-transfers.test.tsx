import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useTokenTransfers } from "./use-token-transfers";
import { ConfigurationProvider, EnvironmentProvider } from "@/app/contexts";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import { expect, vi } from "vitest";
import { IProfile } from "@/app/lib/profiles/profile.contract";
import { server } from "@/tests/mocks/server";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";

const wrapper = ({ children }: any) => (
	<EnvironmentProvider env={env}>
		<ConfigurationProvider>{children}</ConfigurationProvider>
	</EnvironmentProvider>
);

describe("useTokenTransfers", () => {
	let profile: IProfile;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it("should return an empty state for no wallets", async () => {
		const { result } = renderHook(() => useTokenTransfers({ profile, wallets: [] }), { wrapper });

		await waitFor(() => expect(result.current.isLoadingTransfers).toBe(false));

		expect(result.current.transfers).toHaveLength(0);
		expect(result.current.hasEmptyResults).toBe(true);
	});

	it("should fetch transfers for selected wallets", async () => {
		const wallets = profile.wallets().values();

		const { result } = renderHook(() => useTokenTransfers({ profile, wallets }), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isLoadingTransfers).toBe(false));

		expect(result.current.transfers).toBeDefined();
		expect(Array.isArray(result.current.transfers)).toBe(true);
	});

	it("should handle fetchMore to load additional transfers", async () => {
		const wallets = profile.wallets().values();

		const mockFirstPage = {
			hasMorePages: () => true,
			items: () => [
				{
					amount: () => 5,
					from: () => wallets[0].address(),
					hash: () => "hash1",
					timestamp: () => ({ toUNIX: () => 1769010139522 }),
					to: () => "0xE3c31e486ccA6Eb2093c0F4883Df949d45B021C5",
				},
			],
		};

		const mockSecondPage = {
			hasMorePages: () => false,
			items: () => [
				{
					amount: () => 2,
					from: () => wallets[0].address(),
					hash: () => "hash2",
					timestamp: () => ({ toUNIX: () => 1768987443135 }),
					to: () => "0xE3c31e486ccA6Eb2093c0F4883Df949d45B021C5",
				},
			],
		};

		const transfersSpy = vi
			.spyOn(profile.tokens(), "transfers")
			.mockResolvedValueOnce(mockFirstPage as any)
			.mockResolvedValueOnce(mockSecondPage as any);

		const { result } = renderHook(() => useTokenTransfers({ profile, wallets }), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isLoadingTransfers).toBe(false));
		expect(result.current.transfers).toHaveLength(1);
		expect(result.current.hasMore).toBe(true);

		await act(async () => {
			await result.current.fetchMore();
		});

		await waitFor(() => expect(result.current.isLoadingMore).toBe(false));
		expect(result.current.transfers).toHaveLength(2);
		expect(result.current.hasMore).toBe(false);

		transfersSpy.mockRestore();
	});

	it("should update hasEmptyResults when no transfers are loaded", async () => {
		const wallets = profile.wallets().values();

		const transfersSpy = vi.spyOn(profile.tokens(), "transfers").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		} as any);

		const { result } = renderHook(() => useTokenTransfers({ profile, wallets }), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isLoadingTransfers).toBe(false));
		expect(result.current.transfers).toHaveLength(0);
		expect(result.current.hasEmptyResults).toBe(true);

		transfersSpy.mockRestore();
	});

	it("should set hasMore to false when there are no more pages", async () => {
		const wallets = profile.wallets().values();

		const transfersSpy = vi.spyOn(profile.tokens(), "transfers").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		} as any);

		const { result } = renderHook(() => useTokenTransfers({ profile, wallets }), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isLoadingTransfers).toBe(false));
		expect(result.current.hasMore).toBe(false);

		transfersSpy.mockRestore();
	});

	it("should handle errors during transfer fetching", async () => {
		const wallets = profile.wallets().values();

		const transfersSpy = vi.spyOn(profile.tokens(), "transfers").mockRejectedValue(new Error("Fetch error"));

		const { result } = renderHook(() => useTokenTransfers({ profile, wallets }), {
			wrapper,
		});

		expect(result.current.transfers).toHaveLength(0);

		transfersSpy.mockRestore();
	});

	it("should use custom limit when provided", async () => {
		const wallets = profile.wallets().values();
		const customLimit = 50;

		const transfersSpy = vi.spyOn(profile.tokens(), "transfers").mockResolvedValue({
			hasMorePages: () => false,
			items: () => [],
		} as any);

		renderHook(() => useTokenTransfers({ limit: customLimit, profile, wallets }), {
			wrapper,
		});

		await waitFor(() => expect(transfersSpy).toHaveBeenCalled());

		expect(transfersSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				limit: customLimit,
			}),
		);

		transfersSpy.mockRestore();
	});

	it("should check for new token transfers periodically", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const wallets = profile.wallets().values();
		let callCount = 0;

		server.use(
			http.get("https://dwallets-evm.mainsailhq.com/api/tokens/transfers", () => {
				callCount++;
				const isFirstCall = callCount === 1;

				return HttpResponse.json({
					data: isFirstCall
						? Fixtures.TokenTransfers.data.slice(0, 1)
						: Fixtures.TokenTransfers.data.slice(1, 2),
					meta: { ...Fixtures.TokenTransfers.meta, next: null },
				});
			}),
		);

		const { result } = renderHook(() => useTokenTransfers({ profile, wallets }), {
			wrapper,
		});

		await waitFor(() => {
			expect(result.current.isLoadingTransfers).toBe(false);
		});

		expect(result.current.transfers).toHaveLength(1);
		const firstTransferHash = result.current.transfers[0].hash();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(15_000);
		});

		await waitFor(() => {
			expect(result.current.transfers[0].hash()).not.toBe(firstTransferHash);
		});

		vi.useRealTimers();
	});
});
