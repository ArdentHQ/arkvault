import { BigNumber } from "@ardenthq/sdk-helpers";

export const useStepMath = (step: number, value: number | string) => ({
	decrement: () => BigNumber.make(value).minus(step).toFixed(0),
	increment: () => BigNumber.make(value).plus(step).toFixed(0),
});
