import { delegateRegistration } from "./DelegateRegistration";
import { t } from "@/utils/testing-library";

const usernames = ["existing-delegate"];

describe("DelegateRegistration validation", () => {
	const usernameValidation = delegateRegistration(t).username(usernames);

	it("should validate the `required` property", () => {
		expect(usernameValidation.required).toBe(
			t("COMMON.VALIDATION.FIELD_REQUIRED", {
				field: t("COMMON.VALIDATOR_NAME"),
			}),
		);
	});

	it("should validate the `maxLength` property", () => {
		expect(usernameValidation.maxLength.value).toBe(20);
		expect(usernameValidation.maxLength.message).toBe(
			t("COMMON.VALIDATION.MAX_LENGTH", {
				field: t("COMMON.VALIDATOR_NAME"),
				maxLength: 20,
			}),
		);
	});

	it("should return true for a valid username pattern", () => {
		expect(usernameValidation.validate.pattern("valid_delegate.123@$!")).toBe(true);
	});

	it("should return an error for invalid characters", () => {
		const invalidUsername = "INVALID-USERNAME";
		const illegalChars = "'-', 'A', 'D', 'E', 'I', 'L', 'M', 'N', 'R', 'S', 'U', 'V'";

		expect(usernameValidation.validate.pattern(invalidUsername)).toBe(
			t("COMMON.VALIDATION.ILLEGAL_CHARACTERS", {
				characters: illegalChars,
			}),
		);
	});

	it("should return true for a unique username", () => {
		expect(usernameValidation.validate.unique("new-delegate")).toBe(true);
	});

	it("should return an error for a duplicate username", () => {
		expect(usernameValidation.validate.unique("existing-delegate")).toBe(
			t("COMMON.VALIDATION.EXISTS", { field: t("COMMON.VALIDATOR_NAME") }),
		);
	});
});
