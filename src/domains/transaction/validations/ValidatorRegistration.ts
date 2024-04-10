import { Contracts } from "@ardenthq/sdk-profiles";

export const validatorRegistration = (t: any) => ({
	publicKey: (wallet: Contracts.IReadWriteWallet) => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("TRANSACTION.VALIDATOR_PUBLIC_KEY"),
		}),
		maxLength: {
			message: t("COMMON.VALIDATION.MAX_LENGTH", {
				field: t("TRANSACTION.VALIDATOR_PUBLIC_KEY"),
				maxLength: 96,
			}),
			value: 96,
		},
		validate: async (publicKey: string) => {
			try {
				// @TODO: need to add BLS validation here from "@mainsail/crypto-key-pair-bls12-381";
				await wallet.coin().address().fromPublicKey(publicKey);
				return true;
			} catch (error) {
				return t("COMMON.INPUT_PUBLIC_KEY.VALIDATION.INVALID_PUBLIC_KEY");
			}
		},
	}),
});
