import { FunctionReturning } from "./types.js";

export const filterObject = <T extends object>(iterable: T, iteratee: FunctionReturning): T => {
	const keys = Object.keys(iterable);
	const length: number = keys.length;
	const result = {};

	for (let i = 0; i < length; i++) {
		const key = keys[i];

		if (iteratee(iterable[key], key, iterable)) {
			result[key] = iterable[key];
		}
	}

	return result as T;
};
