export const cloneArray = <T>(input: T[]): T[] => {
	const sliced = Array.from({ length: input.length });

	for (const [index, element] of input.entries()) {
		sliced[index] = element;
	}

	// @ts-expect-error unknown[] not assignable to T[]
	return sliced;
};
