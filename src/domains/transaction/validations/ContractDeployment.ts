export const contractDeployment = (t: any) => ({
	bytecode: () => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.BYTECODE"),
		}),
	}),
});
