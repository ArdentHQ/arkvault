export const verifyMessage = (t: any) => ({
	jsonString: () => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.JSON_STRING"),
		}),
		validate: {
			valid: (jsonString: string) => {
				const invalidError = t("COMMON.VALIDATION.FIELD_INVALID", {
					field: t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.JSON_STRING"),
				});

				try {
					const data = JSON.parse(jsonString);

					if (data.signatory === undefined || data.message === undefined || data.signature === undefined) {
						return invalidError;
					}
				} catch {
					return invalidError;
				}

				return true;
			},
		},
	}),
});
