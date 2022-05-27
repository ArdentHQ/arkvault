export const useStepMath = (step: number, value: number) => ({
	decrement: () => +(value - step).toFixed(12),
	increment: () => +(value + step).toFixed(12),
});
