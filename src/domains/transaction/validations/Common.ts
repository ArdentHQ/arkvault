import { Networks } from "@ardenthq/sdk";
import { TFunction } from "@/app/i18n/react-i18next.contracts";

import { TransactionFees } from "@/types";

export const common = (t: TFunction) => ({
	fee: (balance = 0, network?: Networks.Network, fees?: TransactionFees) => ({
		validate: {
			valid: (fee?: string | number) => true,
		},
	}),
});
