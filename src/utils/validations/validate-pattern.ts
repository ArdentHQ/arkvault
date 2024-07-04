import { sortBy, uniq } from "@ardenthq/sdk-helpers";

export const validatePattern = (t: any, value: string, regexp: RegExp) => {
	let matches = "";

	const parts = value.split(regexp).filter(Boolean);
	for (const part of parts) {
		matches += part;
	}

	return matches.length > 0
		? t("COMMON.VALIDATION.ILLEGAL_CHARACTERS", {
				characters: sortBy(uniq([...matches]))
					.map((char) => `'${char}'`)
					.join(", "),
			})
		: true;
};

export const validateAscii = (t: any, value: string) => {
	const matches = value.match(/[^ -~]/g);

	if (matches && matches.length > 0) {
		return t("COMMON.VALIDATION.ILLEGAL_CHARACTERS", {
			characters: sortBy(uniq([...matches]))
				.map((char) => `'${char}'`)
				.join(", "),
		});
	}

	return true;
};
