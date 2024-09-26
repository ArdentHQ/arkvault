import { Networks } from "@ardenthq/sdk";
import { TFunction } from "@/app/i18n/react-i18next.contracts";

import { TransactionFees } from "@/types";

export const common = (t: TFunction) => ({
	fee: (balance = 0, network?: Networks.Network, fees?: TransactionFees) => ({
		validate: {
			valid: (fee?: string | number) => {
				if (!fee || (+fee === 0 && network && !network.chargesZeroFees())) {
					return t("COMMON.VALIDATION.FIELD_REQUIRED", {
						field: t("COMMON.FEE"),
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

				if (+fee > balance) {
					return t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
						balance,
						coinId: network.coin(),
					});
				}

				if (Math.sign(+fee) === -1) {
					return t("TRANSACTION.VALIDATION.FEE_NEGATIVE");
				}

				if (network.feeType() === "size" && fees?.min && +fee < fees.min) {
					return t("COMMON.VALIDATION.MIN", {
						field: t("COMMON.FEE"),
						min: fees.min,
					});
				}

				return true;
			},
		},
	}),
});
