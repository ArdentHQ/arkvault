import { FunctionReturning } from "./types.js";

export const uniqBy = <T>(iterable: T[], iteratee: FunctionReturning): T[] => {
	const result: T[] = [];

	const set: Set<T> = new Set<T>();
	for (const element of iterable) {
		const value: T = iteratee(element);

		if (set.has(value)) {
			continue;
		}

		set.add(value);
		result.push(element);
	}

	return result;
};
