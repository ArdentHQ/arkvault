import { shouldUseDarkColors } from "@/utils/theme";

describe("theme", () => {
	it.each([true, false])("should determine if should use dark colors depending on html class", (hasClass) => {
		const querySelectorSpy = vi
			.spyOn(document, "querySelector")
			.mockReturnValue({ classList: { contains: () => hasClass } });

		expect(shouldUseDarkColors()).toBe(hasClass);

		querySelectorSpy.mockRestore();
	});
});
