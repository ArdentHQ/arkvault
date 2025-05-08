import { Environment } from "@/app/lib/profiles";
import { debounceAsync } from "@/utils/debounce";
import { ValidateResult } from "react-hook-form";
import { IProfile } from "@/app/lib/profiles/profile.contract";
import { Networks } from "@/app/lib/sdk";

export const validatorRegistration = (t: any) => ({
	validatorPublicKey: (env: Environment, profile: IProfile, network: Networks.Network) => ({
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
			pattern: (publicKey: string) => {
				const coin = profile.coins().get(network.coin(), network.id());
				const isValid = coin.publicKey().verifyPublicKeyWithBLS(publicKey);

				if (!isValid) {
					return t("COMMON.INPUT_PUBLIC_KEY.VALIDATION.INVALID_BLS_PUBLIC_KEY");
				}

				return true;
			},
			unique: debounceAsync(async (publicKey: string) => {
				try {
					await publicKeyExists(env, network, profile, publicKey);
				} catch {
					return t("COMMON.INPUT_PUBLIC_KEY.VALIDATION.PUBLIC_KEY_ALREADY_EXISTS", { publicKey });
				}
			}, 300) as () => Promise<ValidateResult>,
		},
	}),
});

const publicKeyExists = async (env: Environment, network: Networks.Network, profile: IProfile, publicKey: string) => {
	if (publicKey.length === 0) {
		return;
	}

	const hostSelector = env.hostSelector(profile);
	const coin = profile.coins().get(network.coin(), network.id());
	const publicApiEndpoint = hostSelector(coin.config(), "full").host;

	const response = await fetch(`${publicApiEndpoint}?attributes.validatorPublicKey=${publicKey}`);

	if (response.status !== 404) {
		const data = await response.json();

		if (data.meta?.count > 0) {
			throw new Error("Public key has been used already!");
		}
	}

	return true;
};
