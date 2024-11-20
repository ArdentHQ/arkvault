import { Contracts } from "@ardenthq/sdk-profiles";

export const validatorRegistration = (t: any) => ({
	publicKey: (_wallet: Contracts.IReadWriteWallet) => ({
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
		validate: async () => {
			// @TODO: need to add BLS validation here from "@mainsail/crypto-key-pair-bls12-381";
			return true;
			//return t("COMMON.INPUT_PUBLIC_KEY.VALIDATION.INVALID_BLS_PUBLIC_KEY");
		},
	}),
});
