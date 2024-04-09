import { validatePattern } from "@/utils/validations";

export const usernameRegistration = (t: any) => ({
	username: (usernames: string[]) => ({
		maxLength: {
			message: t("COMMON.VALIDATION.MAX_LENGTH", {
				field: t("COMMON.USERNAME"),
				maxLength: 20,
			}),
			value: 20,
		},
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.USERNAME"),
		}),
		validate: {
			pattern: (value: string) => validatePattern(t, value, /[\d!$&.@_a-z]+/),
			unique: (value: string) =>
				!usernames.includes(value) || t("COMMON.VALIDATION.EXISTS", { field: t("COMMON.USERNAME") }),
		},
	}),
});
