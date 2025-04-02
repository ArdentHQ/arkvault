/* eslint-disable unicorn/no-object-as-default-parameter */
/* eslint-disable sonarjs/no-collection-size-mischeck */

import { isLessThanOrEqual } from "./is-less-than-or-equal.js";

export const truncate = (
	value: string,
	options: {
		length?: number;
		omission?: string;
		omissionPosition?: string;
	} = {
		length: 30,
		omission: "...",
		omissionPosition: "right",
	},
): string => {
	// TODO: check why there is a need for options.length < 0
	if (options.length === 0 || options.length < 0) {
		options.length = 30;
	}

	if (!options.omission) {
		options.omission = "...";
	}

	if (!options.omissionPosition) {
		options.omissionPosition = "right";
	}

	const totalLength: number = value.length + options.omission.length;

	if (isLessThanOrEqual(totalLength, options.length)) {
		return value;
	}

	if (options.omissionPosition === "right") {
		return value.slice(0, Math.max(0, options.length - options.omission.length)) + options.omission;
	}

	if (options.omissionPosition === "middle") {
		const odd: number = options.length % 2;
		const truncationLength: number = Math.floor((options.length - 1) / 2);

		return `${value.slice(0, truncationLength - odd)}${options.omission}${value.slice(
			value.length - truncationLength + 1,
		)}`;
	}

	return options.omission + value.slice(Math.max(0, value.length - options.length + options.omission.length));
};
