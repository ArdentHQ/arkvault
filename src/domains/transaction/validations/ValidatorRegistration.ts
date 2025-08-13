import { PublicKeyService } from "@/app/lib/mainsail/public-key.service";
import { IProfile } from "@/app/lib/profiles/profile.contract";
import { Networks } from "@/app/lib/mainsail";
import { debounceAsync } from "@/utils/debounce";
import { ValidateResult } from "react-hook-form";
import { Contracts, Helpers } from "@/app/lib/profiles";
import { BigNumber } from "@/app/lib/helpers";
import { UnitConverter } from "@arkecosystem/typescript-crypto";

export const validatorRegistration = (t: any) => ({
	lockedFee: (wallet: Contracts.IReadWriteWallet | undefined, getValues: () => object) => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.LOCKED_FEE"),
		}),
		validate: {
			insufficientBalance: (lockedFee: number) => {
				// If the wallet is a validator, we can only update the public key
				// that does not require a fee.
				if (wallet?.isValidator()) {
					return true;
				}

				const { gasPrice, gasLimit } = getValues() as {
					gasPrice: BigNumber | undefined;
					gasLimit: BigNumber | undefined;
				};

				const fees = UnitConverter.formatUnits(
					(gasPrice ?? BigNumber.ZERO).times(gasLimit ?? BigNumber.ZERO).toString(),
					"gwei",
				);

				if (lockedFee + fees > (wallet?.balance() ?? 0)) {
					if (fees === 0) {
						return t(
							"TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.INSUFFICIENT_BALANCE_FOR_LOCKED_FEE",
							{
								balance: Helpers.Currency.format(wallet?.balance() ?? 0, wallet?.currency() ?? "ARK", {
									withTicker: true,
								}),
								lockedFee: Helpers.Currency.format(lockedFee, wallet?.currency() ?? "ARK", {
									withTicker: true,
								}),
							},
						);
					}

					return t(
						"TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.INSUFFICIENT_BALANCE_FOR_FEE_AND_LOCKED_FEE",
						{
							fee: Helpers.Currency.format(fees, wallet?.currency() ?? "ARK", {
								withTicker: true,
							}),
							lockedFee: Helpers.Currency.format(lockedFee, wallet?.currency() ?? "ARK", {
								withTicker: true,
							}),
						},
					);
				}

				return true;
			},
		},
	}),
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
					const exists = await profile.validators().publicKeyExists(publicKey, network)

					if (exists) {
						return t("COMMON.INPUT_PUBLIC_KEY.VALIDATION.PUBLIC_KEY_ALREADY_EXISTS", { publicKey });
					}
				} catch {
					return t("COMMON.INPUT_PUBLIC_KEY.VALIDATION.PUBLIC_KEY_ALREADY_EXISTS", { publicKey });
				}

			}, 300) as () => Promise<ValidateResult>,
		},
	}),
});
