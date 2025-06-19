import { PublicKeyService } from "@/app/lib/mainsail/public-key.service";
import { IProfile } from "@/app/lib/profiles/profile.contract";
import { Networks } from "@/app/lib/mainsail";
import { debounceAsync } from "@/utils/debounce";
import { ValidateResult } from "react-hook-form";
import { Contracts, Helpers } from "@/app/lib/profiles";

export const validatorRegistration = (t: any) => ({
	validatorPublicKey: (profile: IProfile, network: Networks.Network) => ({
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
				const isValid = new PublicKeyService().verifyPublicKeyWithBLS(publicKey);

				if (!isValid) {
					return t("COMMON.INPUT_PUBLIC_KEY.VALIDATION.INVALID_BLS_PUBLIC_KEY");
				}

				return true;
			},
			unique: debounceAsync(async (publicKey: string) => {
				try {
					await publicKeyExists(network, profile, publicKey);
				} catch {
					return t("COMMON.INPUT_PUBLIC_KEY.VALIDATION.PUBLIC_KEY_ALREADY_EXISTS", { publicKey });
				}
			}, 300) as () => Promise<ValidateResult>,
		},
	}),
	lockedFee: (wallet: Contracts.IReadWriteWallet | undefined) => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.LOCKED_FEE"),
		}),
		validate: {
			insufficientBalance: (lockedFee: number) => {
				if (lockedFee > (wallet?.balance() ?? 0)) {
					console.log("insufficient balance");
					return t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.INSUFFICIENT_BALANCE_FOR_LOCKED_FEE", {
						lockedFee: Helpers.Currency.format(lockedFee, wallet?.currency() ?? "ARK", {
							withTicker: true,
						}),
						balance: Helpers.Currency.format(wallet?.balance() ?? 0, wallet?.currency() ?? "ARK", {
							withTicker: true,
						}),
					});
				}

				return true;
			},
		},
	}),
});

const publicKeyExists = async (network: Networks.Network, profile: IProfile, publicKey: string) => {
	if (publicKey.length === 0) {
		return;
	}

	const publicApiEndpoint = network.config().host("full", profile);
	const response = await fetch(`${publicApiEndpoint}?attributes.validatorPublicKey=${publicKey}`);

	if (response.status !== 404) {
		const data = await response.json();

		if (data.meta?.count > 0) {
			throw new Error("Public key has been used already!");
		}
	}

	return true;
};
