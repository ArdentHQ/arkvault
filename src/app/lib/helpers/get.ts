import dot from "dot-prop";
import { isObject } from "./is-object.js";
import { isString } from "./is-string.js";

export const get = <T, V>(object: T, path: string | string[], defaultValue?: V): V => {
	if (!isObject(object) || !isString(path)) {
		return defaultValue as V;
	}

	return dot.get(object, path, defaultValue) as V;
};
