import { ValidateResult } from "react-hook-form";
import { MutableRefObject } from "react";
import { debounceAsync } from "@/utils/debounce";
import { Environment } from "@/app/lib/profiles";
import { Networks } from "@/app/lib/mainsail";
import { IProfile } from "@/app/lib/profiles/profile.contract";

class UsernameExistsError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UsernameExistsError";
	}
}

const validateUsername = (t: any, value: string): string | undefined => {
	if (value.length > 20) {
		return t("COMMON.VALIDATION.MAX_LENGTH", {
			field: t("COMMON.USERNAME"),
			maxLength: 20,
		});
	}

	if (value.startsWith("_")) {
		return t("COMMON.VALIDATION.LEADING_UNDERSCORE");
	}

	if (value.endsWith("_")) {
		return t("COMMON.VALIDATION.TRAILING_UNDERSCORE");
	}

	const multipleUnderscoresRegex = /.*_{2,}.*/;
	if (multipleUnderscoresRegex.test(value)) {
		return t("COMMON.VALIDATION.MULTIPLE_UNDERSCORES");
	}

	const allowedChars = /^[\d_a-z]+$/;
	if (!allowedChars.test(value)) {
		return t("COMMON.VALIDATION.USERNAME_ALLOWED_CHARS");
	}
};

export const usernameRegistration = (t: any) => ({
	username: (profile: IProfile) => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.USERNAME"),
		}),
		validate: {
			unique: debounceAsync(async (value) => {
				const error = validateUsername(t, value);

				if (error) {
					return error;
				}

				if (await profile.usernames().usernameExists(value)) {
					return t("COMMON.VALIDATION.EXISTS", { field: t("COMMON.USERNAME") });
				}

			}, 300) as () => Promise<ValidateResult>,
		},
	}),
});
