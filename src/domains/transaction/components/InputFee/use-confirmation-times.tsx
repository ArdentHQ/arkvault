import { BigNumber } from "@/app/lib/helpers";

type ConfirmationFeeType = "Slow" | "Average" | "Fast";

const defaultBlockTime = 8000;

export function useConfirmationTimes({ blockTime }: { blockTime?: number }) {
	const blockTimeInSeconds = BigNumber.make(blockTime ?? defaultBlockTime).divide(1000);

	const confirmationTimes: Record<ConfirmationFeeType, number> = {
		Average: blockTimeInSeconds.toNumber(),
		Fast: blockTimeInSeconds.toNumber(),
		Slow: blockTimeInSeconds.times(2).toNumber(),
	};

	return {
		byFeeType(feeType: string) {
			return confirmationTimes[feeType] ?? confirmationTimes["Average"];
		},
	};
}
