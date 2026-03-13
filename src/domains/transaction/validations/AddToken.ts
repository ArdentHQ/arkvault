export const addToken = (t: any) => ({
	contractAddress: () => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.CONTRACT_ADDRESS"),
		}),
		validate: async (value) => {
			if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
				return t("COMMON.VALIDATION.FIELD_INVALID", {
					field: t("COMMON.CONTRACT_ADDRESS"),
				});
			}
		},
	}),
});
