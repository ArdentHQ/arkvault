import { indexOf } from "./index-of.js";

export const uniq = <T>(iterable: T[]): T[] => {
	const result: T[] = [];

	for (const value: T of iterable) {
		if (indexOf(result, value) > -1) {
			continue;
		}

		result.push(value);
	}

	return result;
};
