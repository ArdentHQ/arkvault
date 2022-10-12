/* eslint-disable @typescript-eslint/require-await */
import * as haveibeenpwnedMock from "@faustbrian/node-haveibeenpwned";
import { renderHook } from "@testing-library/react-hooks";
import { usePasswordValidation, defaultState } from "./use-password-validation";
import { ValidationRule } from ".";

const validPassword = "S3cUr3!Pas#w0rd";

vi.mock("@faustbrian/node-haveibeenpwned", () => ({
	pwned: vi.fn(),
}));

describe("usePasswordValidation", () => {
	beforeEach(() => {
		haveibeenpwnedMock.pwned.mockResolvedValue(0);
	});

	describe("#validationState", () => {
		it("should return the password validation state", () => {
			const { result } = renderHook(() => usePasswordValidation());

			expect(result.current.validationState).toStrictEqual(defaultState);
		});

		it("should include 'new' rule if hook is called with true", () => {
			const { result } = renderHook(() => usePasswordValidation(true));

			expect(result.current.validationState.has(ValidationRule.New)).toBe(true);
		});
	});

	describe("#resetValidationState", () => {
		it("should reset the password state", async () => {
			const { result } = renderHook(() => usePasswordValidation());

			expect(result.current.validationState).toStrictEqual(defaultState);

			await result.current.validatePassword(validPassword);

			expect(result.current.validationState).not.toStrictEqual(defaultState);

			result.current.resetValidationState();

			expect(result.current.validationState).toStrictEqual(defaultState);
		});
	});

	describe("#validatePassword", () => {
		it("should validate lowercase rule", async () => {
			const { result } = renderHook(() => usePasswordValidation());

			expect(result.current.validationState.get(ValidationRule.LowerCase)).toBe(false);

			await result.current.validatePassword("a");

			expect(result.current.validationState.get(ValidationRule.LowerCase)).toBe(true);
		});

		it("should validate uppercase rule", async () => {
			const { result } = renderHook(() => usePasswordValidation());

			expect(result.current.validationState.get(ValidationRule.UpperCase)).toBe(false);

			await result.current.validatePassword("A");

			expect(result.current.validationState.get(ValidationRule.UpperCase)).toBe(true);
		});

		it("should validate number rule", async () => {
			const { result } = renderHook(() => usePasswordValidation());

			expect(result.current.validationState.get(ValidationRule.Number)).toBe(false);

			await result.current.validatePassword("1");

			expect(result.current.validationState.get(ValidationRule.Number)).toBe(true);
		});

		it("should validate symbol rule", async () => {
			const { result } = renderHook(() => usePasswordValidation());

			expect(result.current.validationState.get(ValidationRule.Symbol)).toBe(false);

			await result.current.validatePassword("!");

			expect(result.current.validationState.get(ValidationRule.Symbol)).toBe(true);
		});

		it("should validate length rule", async () => {
			const { result } = renderHook(() => usePasswordValidation());

			expect(result.current.validationState.get(ValidationRule.Length)).toBe(false);

			await result.current.validatePassword("password");

			expect(result.current.validationState.get(ValidationRule.Length)).toBe(true);
		});

		it("should validate uncompromised rule", async () => {
			const { result } = renderHook(() => usePasswordValidation());

			expect(result.current.validationState.get(ValidationRule.Uncompromised)).toBe(false);

			await result.current.validatePassword(validPassword);

			expect(result.current.validationState.get(ValidationRule.Uncompromised)).toBe(true);

			haveibeenpwnedMock.pwned.mockResolvedValue(1);

			await result.current.validatePassword(validPassword);

			expect(result.current.validationState.get(ValidationRule.Uncompromised)).toBe(false);
		});

		it("should validate new rule", async () => {
			const { result } = renderHook(() => usePasswordValidation(true));

			expect(result.current.validationState.get(ValidationRule.New)).toBe(false);

			await result.current.validatePassword("new-password", "old-password");

			expect(result.current.validationState.get(ValidationRule.New)).toBe(true);

			await result.current.validatePassword("new-password", "new-password");

			expect(result.current.validationState.get(ValidationRule.New)).toBe(false);
		});
	});
});
