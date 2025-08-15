import { Networks } from "@/app/lib/mainsail";
import { TFunction } from "@/app/i18n/react-i18next.contracts";
import { calculateGasFee, getFeeMinMax } from "@/domains/transaction/components/InputFee/InputFee";
import { TransactionFees } from "@/types";
import { BigNumber } from "@/app/lib/helpers";

export const common = (t: TFunction) => ({
	fee: (balance = 0, network?: Networks.Network, fees?: TransactionFees) => ({
		validate: () => {
			console.log({ balance, fees, network });
			return true;
		},
	}),
	gasLimit: (balance = 0, getValues: () => object, network?: Networks.Network) => ({
		validate: {
			valid: (gasLimit: BigNumber | undefined) => {
				if (!network?.coin() || !gasLimit) {
					return true;
				}

				if (gasLimit.isZero()) {
					return t("COMMON.VALIDATION.FIELD_REQUIRED", {
						field: t("COMMON.GAS_LIMIT"),
					});
				}

				const { minGasLimit, maxGasLimit } = getFeeMinMax(network);

				if (gasLimit.isLessThan(minGasLimit)) {
					return t("COMMON.VALIDATION.GAS_LIMIT_IS_TOO_LOW", {
						minGasLimit,
					});
				}

				if (gasLimit.isGreaterThan(maxGasLimit)) {
					return t("COMMON.VALIDATION.GAS_LIMIT_IS_TOO_HIGH", {
						maxGasLimit,
					});
				}

				if (Math.sign(balance) <= 0) {
					return t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
						balance: 0,
						coinId: network.coin(),
					});
				}

				const { gasPrice } = getValues() as { gasPrice: BigNumber | undefined };

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
	gasPrice: (balance = 0, getValues: () => object, network?: Networks.Network) => ({
		validate: {
			valid: (gasPrice: BigNumber | undefined) => {
				if (!network?.coin() || !gasPrice) {
					return true;
				}

				if (gasPrice.isZero()) {
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

				const { minGasPrice, maxGasPrice } = getFeeMinMax(network);

				if (gasPrice.isLessThan(minGasPrice)) {
					return t("COMMON.VALIDATION.GAS_PRICE_IS_TOO_LOW", {
						minGasPrice,
					});
				}

				if (maxGasPrice.isLessThan(gasPrice)) {
					return t("COMMON.VALIDATION.GAS_PRICE_IS_TOO_HIGH", {
						maxGasPrice,
					});
				}

				const { gasLimit } = getValues() as { gasLimit: BigNumber | undefined };

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
