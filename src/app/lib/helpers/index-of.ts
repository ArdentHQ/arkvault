export const indexOf = <T>(iterable: T[], value, fromIndex?: number): number => {
	const length: number = iterable.length;

	let index = 0;

	if (fromIndex) {
		index = fromIndex;

		if (index < 0) {
			index += length;

			/* istanbul ignore else */
			if (index < 0) {
				index = 0;
			}
		}
	}

	for (; index < length; index++) {
		if (iterable[index] === value) {
			return index;
		}
	}

	return -1;
};
