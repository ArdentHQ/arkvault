export const validatorRegistration = (t: any) => ({
	publicKey: () => ({
		// TODO: apply proper validation rules with key validation
		maxLength: {
			message: t("COMMON.VALIDATION.MAX_LENGTH", {
				field: t("TRANSACTION.VALIDATOR_PUBLIC_KEY"),
				maxLength: 96,
			}),
			value: 96,
		},
	}),
});
