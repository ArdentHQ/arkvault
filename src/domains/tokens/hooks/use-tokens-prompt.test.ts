import { renderHook } from "@testing-library/react";
import { useTokensPrompt } from "./use-tokens-prompt";

describe("useTokensPrompt", () => {
	describe("shouldBlockNavigation", () => {
		it("should return false when isDirty is false", () => {
			const { result } = renderHook(() => useTokensPrompt({ isDirty: false }));

			expect(result.current.shouldBlockNavigation("/profiles/123/dashboard")).toBe(false);
		});

		it("should return false when navigating to tokens page and isDirty is true", () => {
			const { result } = renderHook(() => useTokensPrompt({ isDirty: true }));

			expect(result.current.shouldBlockNavigation("/profiles/123/tokens")).toBe(false);
		});

		it("should return false when navigating to tokens page and isDirty is false", () => {
			const { result } = renderHook(() => useTokensPrompt({ isDirty: false }));

			expect(result.current.shouldBlockNavigation("/profiles/123/tokens")).toBe(false);
		});

		it("should return true when isDirty is true and NOT navigating to tokens page", () => {
			const { result } = renderHook(() => useTokensPrompt({ isDirty: true }));

			expect(result.current.shouldBlockNavigation("/profiles/123/dashboard")).toBe(true);
		});

		it("should return false for any path when isDirty is false", () => {
			const { result } = renderHook(() => useTokensPrompt({ isDirty: false }));

			expect(result.current.shouldBlockNavigation("/profiles/123/settings")).toBe(false);
			expect(result.current.shouldBlockNavigation("/profiles/123/wallets")).toBe(false);
			expect(result.current.shouldBlockNavigation("/profiles/123/dashboard")).toBe(false);
			expect(result.current.shouldBlockNavigation("/")).toBe(false);
		});
	});
});
