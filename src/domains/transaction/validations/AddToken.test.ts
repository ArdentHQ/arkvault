import { t } from "@/utils/testing-library";
import { addToken } from "./AddToken";

describe("Add Token", () => {
	it("should return a required message", () => {
		const { required } = addToken(t).contractAddress();
		expect(required).toBe(t("COMMON.VALIDATION.FIELD_REQUIRED", { field: t("COMMON.CONTRACT_ADDRESS") }));
	});

	it("should fail if address does not start with 0x", async () => {
		const { validate } = addToken(t).contractAddress();
		await expect(validate("hello")).resolves.toBe(
			t("COMMON.VALIDATION.FIELD_INVALID", { field: t("COMMON.CONTRACT_ADDRESS") }),
		);
	});

	it("should fail if length does not match the requirement", async () => {
		const { validate } = addToken(t).contractAddress();
		await expect(validate("0xabc")).resolves.toBe(
			t("COMMON.VALIDATION.FIELD_INVALID", { field: t("COMMON.CONTRACT_ADDRESS") }),
		);
	});

	it("should fail if the address includes invalid chars", async () => {
		const { validate } = addToken(t).contractAddress();
		await expect(validate("0xsauron")).resolves.toBe(
			t("COMMON.VALIDATION.FIELD_INVALID", { field: t("COMMON.CONTRACT_ADDRESS") }),
		);
	});

	it("should pass", async () => {
		const { validate } = addToken(t).contractAddress();
		await expect(validate("0x881fff36d8dcf2221b4bcf4ab4757124172fdd80")).resolves.toBe(undefined);
	});
});
