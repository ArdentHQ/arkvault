const ordinalPluralizer = new Intl.PluralRules("en", { type: "ordinal" });

const SUFFIXES = {
	few: "rd",
	many: "th",
	one: "st",
	other: "th",
	two: "nd",
	zero: "",
};

// eslint-disable-next-line testing-library/no-node-access
export const getOrdinalIndicator = (number: number) => SUFFIXES[ordinalPluralizer.select(number)];
