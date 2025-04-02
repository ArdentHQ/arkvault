import { FunctionReturning } from "./types.js";

export const mapArray = <T, R>(iterable: T[], iteratee: FunctionReturning): R[] => {
	const result: R[] = Array.from({ length: iterable.length });

	for (let index = 0; index < iterable.length; index++) {
		result[index] = iteratee(iterable[index], index, iterable);
	}

	return result;
};
