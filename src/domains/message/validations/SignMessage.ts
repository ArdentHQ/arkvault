import { validateAscii } from "@/utils/validations";

export const signMessage = (t: any) => ({
	message: (asciiOnly: boolean) => ({
		maxLength: {
			message: t("COMMON.VALIDATION.MAX_LENGTH", {
				field: t("COMMON.MESSAGE"),
				maxLength: 255,
			}),
			value: 255,
		},
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.MESSAGE"),
		}),
		validate: (message: string) => {
			if (asciiOnly) {
				return validateAscii(t, message);
			}

			return true;
		},
	}),
});
