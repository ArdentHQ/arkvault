import { isUndefined } from "./is-undefined.js";

export const isNil = (value: unknown): value is null | undefined => isUndefined(value) || value === null;
