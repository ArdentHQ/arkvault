import { vi, it, describe, beforeEach, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useServerStatus } from "./use-server-status";
import { Contracts } from "@/app/lib/profiles";
import { pingServerAddress } from "@/utils/peers";
import { pingEvmApi, pingTransactionApi } from "@/domains/setting/hooks/use-handle-servers";

vi.mock("@/utils/peers", () => ({
	getServerHeight: vi.fn().mockResolvedValue(1000),
	pingServerAddress: vi.fn(),
}));

vi.mock("@/domains/setting/hooks/use-handle-servers", () => ({
	pingEvmApi: vi.fn(),
	pingTransactionApi: vi.fn(),
}));

vi.mock("@/app/contexts", () => ({
	useConfiguration: () => ({
		getProfileConfiguration: vi.fn().mockReturnValue({ serverStatus: {} }),
		setConfiguration: vi.fn(),
	}),
}));

vi.mock("@/domains/setting/pages/Servers/hooks/use-hosts", () => ({
	useHosts: () => ({
		updateNetwork: vi.fn(),
	}),
}));

describe("useServerStatus", () => {
	let profile: Contracts.IProfile;
	const mockNetwork = {
		evmApiEndpoint: "https://evm.test.com",
		network: { id: () => "test-network" },
		publicApiEndpoint: "https://api.test.com",
		transactionApiEndpoint: "https://tx.test.com",
	};

	beforeEach(() => {
		profile = {
			id: () => "test-profile-id",
		} as Contracts.IProfile;
		vi.clearAllMocks();
	});

	it("should return status functions", () => {
		const { result } = renderHook(() => useServerStatus({ network: mockNetwork, profile }));

		expect(result.current.syncStatus).toBeDefined();

		expect(result.current.publicApiStatus).toBe(undefined);
		expect(result.current.txApiStatus).toBe(undefined);
		expect(result.current.evmApiStatus).toBe(undefined);
	});

	it("should handle error when pingServerAddress throws", async () => {
		vi.mocked(pingServerAddress).mockRejectedValueOnce(new Error("Network error"));

		const { result } = renderHook(() => useServerStatus({ network: mockNetwork, profile }));

		act(() => {
			result.current.syncStatus();
		});

		await waitFor(() => {
			expect(result.current.publicApiStatus).toBe(false);
		});
	});

	it("should handle error when pingTransactionApi throws", async () => {
		vi.mocked(pingTransactionApi).mockRejectedValueOnce(new Error("Network error"));

		const { result } = renderHook(() => useServerStatus({ network: mockNetwork, profile }));

		act(() => {
			result.current.syncStatus();
		});

		await waitFor(() => {
			expect(result.current.txApiStatus).toBe(false);
		});
	});

	it("should handle error when pingEvmApi throws", async () => {
		vi.mocked(pingEvmApi).mockRejectedValueOnce(new Error("Network error"));

		const { result } = renderHook(() => useServerStatus({ network: mockNetwork, profile }));

		act(() => {
			result.current.syncStatus();
		});

		await waitFor(() => {
			expect(result.current.evmApiStatus).toBe(false);
		});
	});
});
