/* eslint-disable @typescript-eslint/require-await */
import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";

import { password } from "./password";

describe("Password Validation", () => {
	it("should match password and confirm password", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const passwordValidation = password(t);
		const confirmPassword = passwordValidation.confirmPassword("password");

		expect(confirmPassword.validate("password")).toBe(true);
	});

	it("should fail on password and confirm password mismatch", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const passwordValidation = password(t);
		const confirmPassword = passwordValidation.confirmPassword("password");

		expect(confirmPassword.validate("password2")).toBe(t("COMMON.VALIDATION.PASSWORD_MISMATCH"));
	});

	it("should require password to be entered before confirm password", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const passwordValidation = password(t);
		const confirmPassword = passwordValidation.confirmOptionalPassword("");

		expect(confirmPassword.validate("password2")).toBe(
			t("COMMON.VALIDATION.FIELD_REQUIRED", {
				field: t("SETTINGS.GENERAL.PERSONAL.PASSWORD"),
			}).toString(),
		);
	});

	it("should confirm optional password", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const passwordValidation = password(t);
		const confirmPassword = passwordValidation.confirmOptionalPassword("");

		expect(confirmPassword.validate("")).toBe(true);
		expect(confirmPassword.validate("")).toBe(true);
		expect(confirmPassword.validate("password")).toBe(
			t("COMMON.VALIDATION.FIELD_REQUIRED", {
				field: t("SETTINGS.GENERAL.PERSONAL.PASSWORD"),
			}).toString(),
		);
	});

	it("should fail validation if optional password is set", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const passwordValidation = password(t);
		const confirmPassword = passwordValidation.confirmOptionalPassword("test");

		expect(confirmPassword.validate("")).toBe(t("COMMON.VALIDATION.PASSWORD_MISMATCH"));
		expect(confirmPassword.validate("test2")).toBe(t("COMMON.VALIDATION.PASSWORD_MISMATCH"));
	});
});
