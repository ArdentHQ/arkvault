import { filter } from "./filter.js";
import { FunctionReturning } from "./types.js";

export const omitBy = <T extends object>(iterable: T, iteratee: FunctionReturning): T =>
	filter(iterable, (value) => !iteratee(value)) as T;
