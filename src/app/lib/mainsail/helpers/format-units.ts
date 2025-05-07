import { BigNumber } from "@/app/lib/helpers";

import { ARK_MULTIPLIER, GWEI_MULTIPLIER, WEI_MULTIPLIER } from "@/app/lib/mainsail/crypto/constants";

export const formatUnits = (value: string, unit = "ark"): BigNumber => {
	switch (unit.toLowerCase()) {
		case "wei": {
			return BigNumber.make(value).divide(WEI_MULTIPLIER);
		}
		case "gwei": {
			return BigNumber.make(value).divide(GWEI_MULTIPLIER);
		}
		case "ark": {
			return BigNumber.make(value).divide(ARK_MULTIPLIER);
		}
		default: {
			throw new Error(`Unsupported unit: ${unit}. Supported units are 'wei', 'gwei', and 'ark'.`);
		}
	}
};
