import dot from "dot-prop";
import { isObject } from "./is-object.js";
import { isString } from "./is-string.js";

export const unset = <T>(object: T, path: string | string[]): boolean => {
	if (!isObject(object) || !isString(path)) {
		return false;
	}

	return dot.delete(object, path);
};
