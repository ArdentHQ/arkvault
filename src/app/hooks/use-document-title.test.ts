import { renderHook } from "@testing-library/react";
import { useDocumentTitle } from "@/app/hooks/use-document-title";

describe("use-document-title", () => {
	it.each([true, false])("should handle `resetOnUnmount` parameter", (resetOnUnmount) => {
		const originalTitle = "Original title";
		const newTitle = "New title";

		let documentTitle = originalTitle;
		const documentTitleGetSpy = vi.spyOn(document, "title", "get").mockReturnValue(documentTitle);
		const documentTitleSetSpy = vi.spyOn(document, "title", "set").mockImplementation((value) => {
			documentTitle = value;
		});

		const { unmount } = renderHook(() => useDocumentTitle(newTitle, resetOnUnmount));

		expect(documentTitle.startsWith(newTitle)).toBeTruthy();

		unmount();

		expect(documentTitle.startsWith(resetOnUnmount ? originalTitle : documentTitle)).toBeTruthy();

		documentTitleGetSpy.mockRestore();
		documentTitleSetSpy.mockRestore();
	});

	it("should set ark vault title if custom title is not provided", () => {
		const originalTitle = "Original title";
		const ArkVaultTitle = "ARK Vault";

		let documentTitle = originalTitle;
		const documentTitleSetSpy = vi.spyOn(document, "title", "set").mockImplementation((value) => {
			documentTitle = value;
		});

		renderHook(() => useDocumentTitle());

		expect(documentTitle).toBe(ArkVaultTitle);

		documentTitleSetSpy.mockRestore();
	});
});
