export const precisionRound = (number: number, precision: number): number => {
	const factor = Math.pow(10, precision);
	return Math.round(number * factor) / factor;
};
