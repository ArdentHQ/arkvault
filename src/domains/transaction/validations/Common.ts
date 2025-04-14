import { Networks } from "@ardenthq/sdk";
import { TFunction } from "@/app/i18n/react-i18next.contracts";
import { calculateGasFee } from "@/domains/transaction/components/InputFee/InputFee";
import { TransactionFees } from "@/types";
import { formatUnits, configManager } from "@/app/lib/mainsail";
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
				if (!network?.coin()) {
					return true;
				}

				if (gasLimit === 0) {
					return t("COMMON.VALIDATION.FIELD_REQUIRED", {
						field: t("COMMON.GAS_LIMIT"),
					});
				}

				const minimumGasLimit = Math.max(
					configManager.getMilestone()["gas"]["minimumGasLimit"],
					defaultGasLimit,
				);

				if (gasLimit < minimumGasLimit) {
					return t("COMMON.VALIDATION.GAS_LIMIT_IS_TOO_LOW", {
						minGasLimit: defaultGasLimit,
					});
				}

				const maximumGasLimit = configManager.getMilestone()["gas"]["maximumGasLimit"];

				if (gasLimit > maximumGasLimit) {
					return t("COMMON.VALIDATION.GAS_LIMIT_IS_TOO_HIGH", {
						maxGasLimit: maximumGasLimit,
					});
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
				if (!network?.coin()) {
					return true;
				}

				if (gasPrice === 0) {
					return t("COMMON.VALIDATION.FIELD_REQUIRED", {
						field: t("COMMON.GAS_PRICE"),
					});
				}

				if (Math.sign(balance) <= 0) {
					return t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
						balance: 0,
						coinId: network.coin(),
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
