import { renderHook } from "@testing-library/react-hooks";
import { useDocumentTitle } from "@/app/hooks/use-document-title";

describe("use-document-title", () => {
	it.each([true, false])("should handle `resetOnUnmount` parameter", (resetOnUnmount) => {
		const originalTitle = "Original title";
		const newTitle = "New title";

		let documentTitle = originalTitle;
		const documentTitleGetSpy = jest.spyOn(document, "title", "get").mockReturnValue(documentTitle);
		const documentTitleSetSpy = jest.spyOn(document, "title", "set").mockImplementation((value) => {
			documentTitle = value;
		});

		const { unmount } = renderHook(() => useDocumentTitle(newTitle, resetOnUnmount));

		expect(documentTitle.startsWith(newTitle)).toBeTruthy();

		unmount();

		expect(documentTitle.startsWith(resetOnUnmount ? originalTitle : documentTitle)).toBeTruthy();

		documentTitleGetSpy.mockRestore();
		documentTitleSetSpy.mockRestore();
	});
});
