export const validatorRegistration = (t: any) => ({
	validatorPublicKey: () => ({
		maxLength: {
			message: t("COMMON.VALIDATION.MAX_LENGTH", {
				field: t("TRANSACTION.VALIDATOR_PUBLIC_KEY"),
				maxLength: 96,
			}),
			value: 96,
		},
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("TRANSACTION.VALIDATOR_PUBLIC_KEY"),
		}),
		validate: () =>
			// @TODO: need to add BLS validation here from "@mainsail/crypto-key-pair-bls12-381";
			true,
		//return t("COMMON.INPUT_PUBLIC_KEY.VALIDATION.INVALID_BLS_PUBLIC_KEY");
	}),
});