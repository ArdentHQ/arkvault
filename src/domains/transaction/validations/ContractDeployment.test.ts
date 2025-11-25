import { t } from "@/utils/testing-library";
import { contractDeployment } from "./ContractDeployment";

describe("Contract Deployment Validation", () => {
	it("should return a required message", () => {
		const { required } = contractDeployment(t).bytecode();
		expect(required).toBe(t("COMMON.VALIDATION.FIELD_REQUIRED", { field: t("COMMON.BYTECODE") }));
	});
});
