export const signMessage = (t: any) => ({
	message: () => ({
    required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.MESSAEG"),
		}),
		maxLength: {
			message: t("COMMON.VALIDATION.MAX_LENGTH", {
				field: t("COMMON.MESSAGE"),
				maxLength: 600,
			}),
			value: 600,
		},
	}),
});
