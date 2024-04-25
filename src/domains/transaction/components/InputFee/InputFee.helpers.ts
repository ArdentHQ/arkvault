import { BigNumber } from "@ardenthq/sdk-helpers";

export const useStepMath = (step: number, value: number | string) => ({
	decrement: () =>
		BigNumber.make(value)
			.minus(BigNumber.make(step))
			.toFixed(12)
			.replace(/\.?0+$/, ""),
	increment: () =>
		BigNumber.make(value)
			.plus(step)
			.toFixed(12)
			.replace(/\.?0+$/, ""),
});
