import { TFunction } from "react-i18next";

export const password = (t: TFunction) => ({
	confirmOptionalPassword: (password: string) => ({
		validate: (confirmPassword: string) => {
			if (!password && !!confirmPassword) {
				return t("COMMON.VALIDATION.FIELD_REQUIRED", {
					field: t("SETTINGS.GENERAL.PERSONAL.PASSWORD"),
				}).toString();
			}

			if (!!password && password !== confirmPassword) {
				return t("COMMON.VALIDATION.PASSWORD_MISMATCH");
			}

			return true;
		},
	}),
	confirmPassword: (password: string) => ({
		validate: (confirmPassword: string) => {
			if (password && !confirmPassword) {
				return t("COMMON.VALIDATION.FIELD_REQUIRED", {
					field: t("SETTINGS.GENERAL.PERSONAL.CONFIRM_PASSWORD"),
				}).toString();
			}

			if (password !== confirmPassword) {
				return t("COMMON.VALIDATION.PASSWORD_MISMATCH");
			}

			return true;
		},
	}),
});
