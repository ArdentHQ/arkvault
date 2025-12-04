import { isHex } from "viem";

export const contractDeployment = (t: any) => ({
	bytecode: () => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.BYTECODE"),
		}),
		validate: (value) => {
			if (!isHex(value)) {
				return t("COMMON.VALIDATION.HEX_REQUIRED")
			}
		},
	}),
});
