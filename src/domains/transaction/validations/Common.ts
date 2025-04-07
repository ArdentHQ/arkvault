import { Networks } from "@ardenthq/sdk";
import { TFunction } from "@/app/i18n/react-i18next.contracts";
import { configManager } from "@ardenthq/sdk-mainsail";
import { calculateGasFee } from "@/domains/transaction/components/InputFee/InputFee";
import { TransactionFees } from "@/types";

import { formatUnits } from "@ardenthq/sdk-mainsail";
import { BigNumber } from "@/app/lib/helpers";

export const common = (t: TFunction) => ({
	fee: (balance = 0, network?: Networks.Network, fees?: TransactionFees) => ({
		validate: () => {
			console.log({ balance, fees, network });
			return true;
		},
	}),
	gasLimit: (balance = 0, getValues: () => object, defaultGasLimit: number, network?: Networks.Network) => ({
		validate: {
			valid: (gasLimit: number) => {
				if (gasLimit === 0) {
					return t("COMMON.VALIDATION.FIELD_REQUIRED", {
						field: t("COMMON.GAS_LIMIT"),
					});
				}

				if (gasLimit < defaultGasLimit) {
					return t("COMMON.VALIDATION.GAS_LIMIT_IS_TOO_LOW", {
						minGasLimit: defaultGasLimit,
					});
				}

				if (!network?.coin()) {
					return true;
				}

				if (Math.sign(balance) <= 0) {
					return t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
						balance: 0,
						coinId: network.coin(),
					});
				}

				const { gasPrice } = getValues() as { gasPrice: number | undefined };

				if (gasPrice === undefined) {
					return true;
				}

				const fee = calculateGasFee(gasPrice, gasLimit);

				if (+fee > balance) {
					return t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
						balance,
						coinId: network.coin(),
					});
				}

				return true;
			},
		},
	}),
	gasPrice: (balance = 0, getValues: () => object, minGasPrice: number, network?: Networks.Network) => ({
		validate: {
			valid: (gasPrice: number) => {
				if (gasPrice === 0) {
					return t("COMMON.VALIDATION.FIELD_REQUIRED", {
						field: t("COMMON.GAS_PRICE"),
					});
				}

				const minimumGasPrice = Math.max(
					formatUnits(
						BigNumber.make(configManager.getMilestone()["gas"]["minimumGasPrice"]).toString(),
						"gwei",
					).toNumber(),
					minGasPrice,
				);

				if (gasPrice < minimumGasPrice) {
					return t("COMMON.VALIDATION.GAS_PRICE_IS_TOO_LOW", {
						minGasPrice: minimumGasPrice,
					});
				}

				const maximumGasPrice = formatUnits(
					BigNumber.make(configManager.getMilestone()["gas"]["maximumGasPrice"]).toString(),
					"gwei",
				);

				if (maximumGasPrice.isLessThan(gasPrice ?? 0)) {
					return t("COMMON.VALIDATION.GAS_PRICE_IS_TOO_HIGH", {
						maxGasPrice: maximumGasPrice,
					});
				}

				if (!network?.coin()) {
					return true;
				}

				if (Math.sign(balance) <= 0) {
					return t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
						balance: 0,
						coinId: network.coin(),
					});
				}

				const { gasLimit } = getValues() as { gasLimit: number | undefined };

				if (gasLimit === undefined) {
					return true;
				}

				const fee = calculateGasFee(gasPrice, gasLimit);

				if (+fee > balance) {
					return t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
						balance,
						coinId: network.coin(),
					});
				}

				return true;
			},
		},
	}),
});
