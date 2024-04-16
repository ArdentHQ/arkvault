import { Contracts } from "@ardenthq/sdk-profiles";

export const validatorRegistration = (t: any) => ({
	validatorPublicKey: (wallet: Contracts.IReadWriteWallet) => ({
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
		validate: async (publicKey?: string) => await wallet.coin().publicKey().verifyPublicKeyWithBLS(publicKey),
	}),
});
