import { filterArray } from "./filter-array.js";
import { filterObject } from "./filter-object.js";
import { FunctionReturning } from "./types.js";
import { isArray } from "./is-array.js";

export const filter = <T extends object>(iterable: T | T[], iteratee: FunctionReturning): T | T[] =>
	isArray(iterable) ? filterArray(iterable, iteratee) : filterObject(iterable, iteratee);
