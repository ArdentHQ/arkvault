import { t } from "@/utils/testing-library";
import { contractDeployment } from "./ContractDeployment";

describe("Contract Deployment Validation", () => {
	it("should return a required message", () => {
		const { required } = contractDeployment(t).bytecode();
		expect(required).toBe(t("COMMON.VALIDATION.FIELD_REQUIRED", { field: t("COMMON.BYTECODE") }));
	});

	it("should return an invalid bytecode message", () => {
		const { validate } = contractDeployment(t).bytecode();
		expect(validate("test")).toBe(t("COMMON.VALIDATION.HEX_REQUIRED"));
	});

	it("should validate", () => {
		const { validate } = contractDeployment(t).bytecode();
		expect(validate("0xabc")).toBe(undefined);
	});
});
