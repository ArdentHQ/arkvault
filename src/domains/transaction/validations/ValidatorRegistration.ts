import { PublicKeyService } from "@/app/lib/mainsail/public-key.service";
import { IProfile } from "@/app/lib/profiles/profile.contract";
import { Networks } from "@/app/lib/mainsail";
import { debounceAsync } from "@/utils/debounce";
import { ValidateResult } from "react-hook-form";
import { Contracts, Helpers } from "@/app/lib/profiles";
import { BigNumber } from "@/app/lib/helpers";
import { deriveBlsPublicKey, UnitConverter } from "@arkecosystem/typescript-crypto";
import { BIP39 } from "@ardenthq/arkvault-crypto";

export const validatorRegistration = (t: any) => ({
	lockedFee: (wallet: Contracts.IReadWriteWallet | undefined, getValues: () => object) => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.LOCKED_FEE"),
		}),
		validate: {
			insufficientBalance: (lockedFee: string) => {
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

				if (
					BigNumber.make(lockedFee)
						.plus(fees)
						.isGreaterThan(wallet?.balance() ?? 0)
				) {
					if (fees.isZero()) {
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
							fee: Helpers.Currency.format(fees.toString(), wallet?.currency() ?? "ARK", {
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
	validatorPassphrase: (profile: IProfile, network: Networks.Network) => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("TRANSACTION.VALIDATOR_PASSPHRASE"),
		}),
		validate: {
			pattern: (validatorPassphrase: string) => {
				const isValid = BIP39.validate(validatorPassphrase)

				if (!isValid) {
					return t("COMMON.INPUT_ADDRESS.VALIDATION.NOT_VALID");
				}

				return true;
			},
			unique: debounceAsync(async (validatorPassphrase: string) => {
				const publicKey = deriveBlsPublicKey(validatorPassphrase)

				try {
					const exists = await profile.validators().publicKeyExists(publicKey, network);

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
