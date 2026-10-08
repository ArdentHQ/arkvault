import { renderHook, waitFor } from "@testing-library/react";

import { Http } from "@/app/lib/mainsail";
import { useBlockHeight } from "./use-block-height";

const network = {
	toObject: () => ({ hosts: [{ host: "https://example.com/api" }] }),
} as any;

describe("useBlockHeight", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should not fetch without a block hash", () => {
		const getSpy = vi.spyOn(Http.HttpClient.prototype, "get");

		const { result } = renderHook(() => useBlockHeight({ network }));

		expect(getSpy).not.toHaveBeenCalled();
		expect(result.current).toEqual({ blockHeight: undefined, isLoading: false });
	});

	it("should fetch and format the block height", async () => {
		vi.spyOn(Http.HttpClient.prototype, "get").mockResolvedValue({
			json: () => ({ data: { number: 1234 } }),
		} as any);

		const { result } = renderHook(() => useBlockHeight({ blockHash: "hash", network }));

		await waitFor(() => expect(result.current).toEqual({ blockHeight: "1,234", isLoading: false }));
	});

	it("should leave the block height empty when the request fails", async () => {
		vi.spyOn(Http.HttpClient.prototype, "get").mockRejectedValue(new Error("unavailable"));

		const { result } = renderHook(() => useBlockHeight({ blockHash: "hash", network }));

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.blockHeight).toBeUndefined();
	});

	it("should ignore the response after unmount", async () => {
		let resolveRequest: (value: unknown) => void = () => {};

		vi.spyOn(Http.HttpClient.prototype, "get").mockReturnValue(
			new Promise((resolve) => {
				resolveRequest = resolve;
			}) as any,
		);

		const { result, unmount } = renderHook(() => useBlockHeight({ blockHash: "hash", network }));

		expect(result.current.isLoading).toBe(true);

		unmount();
		resolveRequest({ json: () => ({ data: { number: 1234 } }) });

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(result.current).toEqual({ blockHeight: undefined, isLoading: true });
	});
});
