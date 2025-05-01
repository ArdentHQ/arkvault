import { Contracts, Environment } from "@/app/lib/profiles";
import { debounceAsync } from "@/utils/debounce";
import { ValidateResult } from "react-hook-form";

export const validatorRegistration = (t: any) => ({
	validatorPublicKey: (env: Environment, wallet: Contracts.IReadWriteWallet) => ({
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

		validate: {
			pattern: async (publicKey: string) => {
				const isValid = await wallet.coin().publicKey().verifyPublicKeyWithBLS(publicKey);

				if (!isValid) {
					return t("COMMON.INPUT_PUBLIC_KEY.VALIDATION.INVALID_BLS_PUBLIC_KEY");
				}

				return true;
			},
			unique: debounceAsync(async (publicKey: string) => {
				try {
					await publicKeyExists(env, wallet, publicKey);
				} catch {
					return t("COMMON.INPUT_PUBLIC_KEY.VALIDATION.PUBLIC_KEY_ALREADY_EXISTS", { publicKey });
				}
			}, 300) as () => Promise<ValidateResult>,
		},
	}),
});

const publicKeyExists = async (env: Environment, wallet: Contracts.IReadWriteWallet, publicKey: string) => {
	if (publicKey.length === 0) {
		return;
	}

	const hostSelector = env.hostSelector(wallet.profile());

	const publicApiEndpoint = hostSelector(wallet.config(), "full").host;

	const response = await fetch(`${publicApiEndpoint}?attributes.validatorPublicKey=${publicKey}`);

	const data = await response.json();

	if (data.meta.count > 0) {
		throw new Error("Public key has been used already!");
	}
};
