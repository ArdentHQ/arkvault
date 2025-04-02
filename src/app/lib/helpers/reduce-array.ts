import { FunctionReturning } from "./types.js";

export const reduceArray = <T, V>(iterable: T[], iteratee: FunctionReturning, initialValue: V): V | undefined => {
	let result: V = initialValue;

	for (let index = 0; index < iterable.length; index++) {
		result = iteratee(result, iterable[index], index, iterable);
	}

	return result;
};
